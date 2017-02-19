import logging
import threading
from concurrent.futures import ThreadPoolExecutor
from datetime import date

import redis
import time
from django.conf import settings

from . import QiitaSearchQuery, Unit
from .request import request_item_count


logger = logging.getLogger(__name__)


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
        if not hasattr(self, "executor"):
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

    start = time.time()

    try:
        query_with_date = query + ("created:" + unit.format(d))

        cnt = request_item_count(query_with_date)

        response_time = time.time() - start
        logger.info("q:{} response time:{:.3f}"
                    .format(query_with_date.query, response_time))

        if unit.delta(date.today(), d) != 0:
            expire = settings.COUNT_CACHE_EXPIRE
        else:
            expire = settings.LAST_COUNT_CACHE_EXPIRE

        cache_client = ItemCountCacheClient()
        cache_client.cache.setex(key, cnt, expire)
        cache_client.request_queue.delete(key)

    except Exception:
        logger.exception("qiita request failed.")

    elapsed_time = time.time() - start
    time_per_request = 1.0 / settings.QIITA_REQUEST_PER_SECOND
    if elapsed_time < time_per_request:
        time.sleep(time_per_request - elapsed_time)