import logging

import requests
from bs4 import BeautifulSoup

from . import QiitaSearchQuery


logger = logging.getLogger(__name__)


def request_item_count(query: QiitaSearchQuery =None) -> int:

    response = requests.get("http://qiita.com/search", params=dict(q=query.query))

    if response.status_code != 200:
        logger.warning("status code:{}".format(response.status_code))
        raise Exception()

    soup = BeautifulSoup(response.text, "html.parser")
    total_count = int(soup.select(".searchResultContainer_navigation a > span")[0].string)

    return total_count
