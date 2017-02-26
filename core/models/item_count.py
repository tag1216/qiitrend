import logging
import threading
import time
from concurrent.futures import ThreadPoolExecutor
from datetime import date

import redis
from django.conf import settings

from core.utils import duration_to_second
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
        if not hasattr(self, "_initialized"):
            self.cache = redis.from_url(settings.REDIS_URL, settings.REDIS_DB_ITEM_COUNT)
            self._initialized = True

    def get(self, query: QiitaSearchQuery, unit: Unit, d: date) -> ItemCount:
        key = make_key(query, unit, d)
        value = self.cache.get(key)
        cnt = int(value) if value is not None else None

        if cnt is None:
            RequestQueue().request(key, query, unit, d)

        return ItemCount(query, unit, d, cnt)


class RequestQueue:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        if not hasattr(self, "_initialized"):
            self.request_queue = redis.from_url(settings.REDIS_URL, settings.REDIS_DB_REQUEST_QUEUE)
            self.executor = ThreadPoolExecutor(max_workers=settings.QIITA_REQUEST_THREADS)
            self.flush()
            self._initialized = True

    def flush(self):
        self.request_queue.flushdb()

    def request(self, key, query, unit, d):
        if not self.exists(key):
            if self.is_full():
                logger.info("request queue is full.")
            else:
                self.add(key)
                self.executor.submit(_async_request, key, query, unit, d)

    def is_full(self) -> bool:
        return settings.QIITA_REQUEST_QUEUE_SIZE <= self.request_queue.dbsize()

    def exists(self, key: str) -> bool:
        return self.request_queue.exists(key)

    def add(self, key: str):
        self.request_queue.set(key, "")

    def remove(self, key: str):
        self.request_queue.delete(key)

    def _async_request(self, key, query, unit, d):
        _async_request(key, query, unit, d)
        try:
            self.request_queue.delete(key)
        except:
            logger.exception("request queue error")


RequestQueue().flush()


def make_key(query: QiitaSearchQuery, unit: Unit, d: date) -> str:
    return "count:{}{}:{}".format(
        unit.short_name,
        unit.short_format(d),
        query.query
    )


def _async_request(key: str, query: QiitaSearchQuery, unit: Unit, d: date):

    try:
        start = time.time()

        query_with_date = query + ("created:" + unit.format(d))

        cnt = request_item_count(query_with_date)

        response_time = time.time() - start
        logger.info("q:[{}] response time:{:.3f}"
                    .format(query_with_date.query, response_time))

        if ((d + unit.relativedelta(1)) - date.today()).days >= 0:
            expire = duration_to_second(settings.COUNT_CACHE_EXPIRE_LAST)
        elif "stocks:" in query.query:
            expire = duration_to_second(settings.COUNT_CACHE_EXPIRE_STOCKS)
        else:
            expire = duration_to_second(settings.COUNT_CACHE_EXPIRE_DEFAULT)

        cache_client = ItemCountCacheClient()
        cache_client.cache.setex(key, cnt, expire)

    except Exception:
        logger.exception("qiita request failed.")

    finally:
        try:
            elapsed_time = time.time() - start
            time_per_request = 1.0 / settings.QIITA_REQUEST_PER_SECOND
            if elapsed_time < time_per_request:
                time.sleep(time_per_request - elapsed_time)
        except Exception:
            logger.exception("_async_request failed.")
