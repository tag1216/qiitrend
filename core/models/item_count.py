import threading
from concurrent.futures import ThreadPoolExecutor
from datetime import date

import redis
from django.conf import settings

from . import QiitaSearchQuery, Unit
from .request import request_item_count


class ItemCount:

    def __init__(self, query: QiitaSearchQuery, unit: Unit, d: date, count: int):
        self.query = query
        self.unit = unit
        self.date = d
        self.count = count


class ItemCountCacheClient:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        self.cache = redis.from_url(settings.REDIS_URL, settings.REDIS_DB_ITEM_COUNT)
        self.request_queue = redis.from_url(settings.REDIS_URL, settings.REDIS_DB_REQUEST_QUEUE)
        self.executor = ThreadPoolExecutor(max_workers=10)

    def get(self, query: QiitaSearchQuery, unit: Unit, d: date) -> ItemCount:
        key = self.make_key(query, unit, d)
        value = self.cache.get(key)
        cnt = int(value) if value is not None else None

        if cnt is None:
            key = self.make_key(query, unit, d)
            if not self.request_queue.exists(key):
                self.request_queue.set(key, "")
                self.executor.submit(_async_request, key, query, unit, d)

        return ItemCount(query, unit, d, cnt)

    @classmethod
    def make_key(cls, query: QiitaSearchQuery, unit: Unit, d: date) -> str:
        return "count:{}{}:{}".format(
            unit.short_name,
            unit.short_format(d),
            query.query
        )


def _async_request(key: str, query: QiitaSearchQuery, unit: Unit, d: date):

    query_with_date = query + ("created:" + unit.format(d))
    cnt = request_item_count(query_with_date)
    if unit.delta(date.today(), d) != 0:
        expire = settings.COUNT_CACHE_EXPIRE
    else:
        expire = settings.LAST_COUNT_CACHE_EXPIRE

    cache_client = ItemCountCacheClient()
    cache_client.cache.setex(key, cnt, expire)
    cache_client.request_queue.delete(key)