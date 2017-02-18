import copy
import http
import json
import logging
import re
from concurrent.futures.thread import ThreadPoolExecutor
from datetime import date, datetime
from operator import itemgetter
from typing import List, Dict

import redis
import requests
from bs4 import BeautifulSoup
from dateutil.rrule import YEARLY, MONTHLY, rrule
from django.conf import settings
from django.contrib import auth
from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.urls import reverse
from rest_framework import permissions
from rest_framework.status import HTTP_202_ACCEPTED
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle
from rest_framework.views import APIView
from social_django.models import UserSocialAuth

from core.models import Unit

logger = logging.getLogger(__name__)


def index(request):
    return render(request, 'core/index.html')


class LoginView(APIView):
    throttle_classes = (AnonRateThrottle, UserRateThrottle,)

    def get(self, request):
        redirect_url = reverse("social:begin", args=("qiita",))
        return redirect(redirect_url)


class LogoutView(APIView):

    def get(self, request):
        auth.logout(request)
        return redirect("/")


class ProfileView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        social_user = UserSocialAuth.objects.get(user=request.user)
        access_token = social_user.extra_data["access_token"]
        headers = dict(Authorization="Bearer {}".format(access_token))
        response = requests.get("https://qiita.com/api/v2/authenticated_user/", headers=headers)
        if response.status_code != http.HTTPStatus.OK:
            raise Exception()
        json_content = json.dumps(response.json())

        return HttpResponse(json_content, content_type="application/json")


class TestView(APIView):
    def get(self, request):
        return HttpResponse(json.dumps({}), status=HTTP_202_ACCEPTED)


class ItemCountsView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, query, unit):
        unit = Unit[unit]
        period = request.GET.get("period")

        today = date.today()
        last = unit.truncate(today)

        if period:
            first = last - unit.relativedelta(int(period) - 1)
        else:
            first = unit.truncate(settings.QIITA_MIN_DATE)

        counts = get_item_counts(query, unit, first, last)

        json_content = json.dumps([
            dict(query=c["query"].query, date=unit.format(c["date"]), count=c["item_count"])
            for c in reversed(counts)
        ])

        return HttpResponse(json_content, content_type="application/json")


class ItemCountView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, query, unit, d):
        unit = Unit[unit]
        d = datetime.strptime(d, unit.format_pattern)
        counts = get_item_counts(query, unit, d, d)

        json_content = json.dumps([
            dict(query=c["query"].query, date=unit.format(c["date"]), count=c["item_count"])
            for c in reversed(counts)
        ])

        return HttpResponse(json_content, content_type="application/json")


class QiitaSearchQuery:

    def __init__(self, elements):
        self.elements = elements

    def __add__(self, query_string: str):
        elements = copy.deepcopy(self.elements)
        for e in elements:
            e.append(query_string)
        return QiitaSearchQuery(elements)

    @property
    def query(self):
        return " or ".join(map(lambda x: " ".join(x), self.elements))


def parse_query(query_string: str) -> QiitaSearchQuery:
    query = query_string.lower().strip()
    elements = sorted(map(_split_and, re.split(" or ", query)))
    return QiitaSearchQuery(elements)


def _split_and(x: str) -> List[str]:
    return sorted(re.split("[\s]+", x.strip()))


executor = ThreadPoolExecutor(max_workers=10)


def get_item_counts(query: str, unit: Unit, first: date, last: date) -> List[Dict]:

    query = parse_query(query)

    redis_client = redis.from_url(settings.REDIS_URL, settings.REDIS_DB_ITEM_COUNT)

    counts = {}

    for dt in rrule(freq=MONTHLY if unit == unit.monthly else YEARLY, dtstart=first, until=last):

        d = dt.date()
        query_with_date = query + ("created:" + unit.format(d))

        key = make_key(query, unit, d)

        cnt = redis_client.get(key)
        cnt = int(cnt) if cnt is not None else None

        if cnt is None:
            request_queue_db = redis.from_url(settings.REDIS_URL, settings.REDIS_DB_REQUEST_QUEUE)
            if not request_queue_db.exists(key):
                request_queue_db.set(key, "")
                executor.submit(async_request, query, unit, d)

        item_count = dict(query=query_with_date,
                          unit=unit.name,
                          date=d,
                          item_count=cnt)

        counts[d] = item_count

    counts = sorted(counts.values(),
                    key=itemgetter("date"),
                    reverse=True)

    return counts


def async_request(query: QiitaSearchQuery, unit: Unit, d: date):

    key = make_key(query, unit, d)

    query_with_date = query + ("created:" + unit.format(d))
    cnt = request_item_count(query_with_date)
    if unit.delta(date.today(), d) != 0:
        expire = settings.COUNT_CACHE_EXPIRE
    else:
        expire = settings.LAST_COUNT_CACHE_EXPIRE

    item_count_db = redis.from_url(settings.REDIS_URL, settings.REDIS_DB_ITEM_COUNT)
    item_count_db.setex(key, cnt, expire)

    request_queue_db = redis.from_url(settings.REDIS_URL, settings.REDIS_DB_REQUEST_QUEUE)
    request_queue_db.delete(key)


def request_item_count(query: QiitaSearchQuery=None) -> int:

    logger.info("request: q={}".format(query.query))
    response = requests.get("http://qiita.com/search", params=dict(q=query.query))

    if response.status_code != 200:
        raise Exception()

    soup = BeautifulSoup(response.text, "html.parser")
    total_count = int(soup.select(".searchResultContainer_navigation a > span")[0].string)

    return total_count


def make_key(query: QiitaSearchQuery, unit: Unit, d: date):
    return "count:{}{}:{}".format(
        unit.short_name,
        unit.short_format(d),
        query.query
    )


