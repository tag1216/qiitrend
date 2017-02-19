import copy
import re
from typing import List


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

    @classmethod
    def parse(cls, query_string: str):
        query = query_string.lower().strip()
        elements = sorted(map(cls._split_and, re.split(" or ", query)))
        return QiitaSearchQuery(elements)

    @classmethod
    def _split_and(cls, x: str) -> List[str]:
        return sorted(re.split("[\s]+", x.strip()))