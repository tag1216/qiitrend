import http
import json
import logging
import re
from datetime import date, datetime
from operator import attrgetter

import requests
from django.conf import settings
from django.contrib import auth
from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.urls import reverse
from rest_framework import permissions
from rest_framework.decorators import api_view
from rest_framework.exceptions import APIException, NotFound, ParseError, NotAuthenticated
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle
from rest_framework.views import APIView
from social_django.models import UserSocialAuth

from core.models import QiitaSearchQuery, Unit
from core.models.item_count import ItemCountCacheClient

logger = logging.getLogger(__name__)


def index(request):
    return render(request, 'core/index.html')


@api_view(["GET", "POST"])
def not_found(request):
    raise NotFound()


class LoginView(APIView):
    throttle_classes = (AnonRateThrottle, UserRateThrottle,)

    def get(self, request):
        redirect_url = reverse("social:begin", args=("qiita",))
        return redirect(redirect_url)


class LogoutView(APIView):

    def get(self, request):
        try:
            auth.logout(request)
            return redirect("/")
        except APIException as e:
            raise e
        except Exception as e:
            logger.exception(e)
            raise APIException("System Error")


class ProfileView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        try:
            social_user = UserSocialAuth.objects.get(user=request.user)
            access_token = social_user.extra_data["access_token"]
            headers = dict(Authorization="Bearer {}".format(access_token))
            response = requests.get("https://qiita.com/api/v2/authenticated_user/", headers=headers)
            if response.status_code != http.HTTPStatus.OK:
                raise Exception()
            json_content = json.dumps(response.json())

            return HttpResponse(json_content, content_type="application/json")
        except APIException as e:
            raise e
        except UserSocialAuth.DoesNotExist:
            raise NotAuthenticated()
        except Exception as e:
            logger.exception(e)
            raise APIException("System Error")


class ItemCountsView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):

        try:
            unit = request.GET.get("unit")
            if unit is None:
                raise ParseError("parameter unit is required.")
            if not hasattr(Unit, unit):
                raise ParseError("parameter unit is not valid.")
            unit = Unit[unit]

            today = date.today()
            last = unit.truncate(today)

            period = request.GET.get("period")
            if period and not re.match(r"[0-9]+", period):
                raise ParseError("parameter period is not valid.")
            if period:
                first = last - unit.relativedelta(int(period) - 1)
            else:
                first = unit.truncate(settings.QIITA_MIN_DATE)

            item_counts = []

            queries = request.GET.getlist("query")
            for query_raw in queries:

                query = QiitaSearchQuery.parse(query_raw)

                for d in unit.iterate(first, last):
                    query_with_date = query + ("created:" + unit.format(d))
                    item_count = ItemCountCacheClient().get(query, unit, d)

                    item_counts.append(dict(query_raw=query_raw,
                                            query=query_with_date.query,
                                            date=unit.format(item_count.date),
                                            count=item_count.count))

            return HttpResponse(json.dumps(item_counts),
                                content_type="application/json")

        except APIException as e:
            raise e
        except Exception as e:
            logger.exception(e)
            raise APIException("System Error")


class ItemCountListView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, query, unit):
        try:
            unit = Unit[unit]
            period = request.GET.get("period")

            today = date.today()
            last = unit.truncate(today)

            if period:
                first = last - unit.relativedelta(int(period) - 1)
            else:
                first = unit.truncate(settings.QIITA_MIN_DATE)

            query = QiitaSearchQuery.parse(query)

            item_counts = {}

            for d in unit.iterate(first, last):
                query_with_date = query + ("created:" + unit.format(d))

                item_count = ItemCountCacheClient().get(query, unit, d)

                item_counts[d] = item_count

            item_counts = sorted(item_counts.values(),
                                 key=attrgetter("date"),
                                 reverse=True)

            json_content = json.dumps([
                dict(query=c.query.query,
                     date=unit.format(c.date),
                     count=c.count)
                for c in reversed(item_counts)
            ])

            return HttpResponse(json_content, content_type="application/json")

        except APIException as e:
            raise e
        except Exception as e:
            logger.exception(e)
            raise APIException("System Error")


class ItemCountView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, query, unit, d):
        try:
            unit = Unit[unit]
            d = datetime.strptime(d, unit.format_pattern)

            item_count = ItemCountCacheClient().get(query, unit, d)

            json_content = json.dumps(
                dict(query=item_count.query.query,
                     date=item_count.unit.format(item_count.date),
                     count=item_count.count)
            )

            return HttpResponse(json_content, content_type="application/json")

        except APIException as e:
            raise e
        except Exception as e:
            logger.exception(e)
            raise APIException("System Error")
