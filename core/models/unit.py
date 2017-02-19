from datetime import date
from enum import Enum

from dateutil import rrule
from dateutil.relativedelta import relativedelta


class Unit(Enum):
    yearly = (rrule.YEARLY, "Y", "%Y", "%Y",
              lambda d: date(d.year, 1, 1),
              lambda d: d.years,
              lambda d: relativedelta(years=int(d)),)
    monthly = (rrule.MONTHLY, "M", "%Y%m", "%Y-%m",
               lambda d: date(d.year, d.month, 1),
               lambda d: d.years * 12 + d.months,
               lambda d: relativedelta(months=int(d)),)

    def __init__(self, rrule_unit, short_name, short_format_pattern, format_pattern,
                 truncate_func, delta_func, relativedelta):
        self.rrule_unit = rrule_unit
        self.short_name = short_name
        self.short_format_pattern = short_format_pattern
        self.truncate_func = truncate_func
        self.format_pattern = format_pattern
        self.delta_func = delta_func
        self.relativedelta = relativedelta

    def format(self, d: date) -> str:
        return d.strftime(self.format_pattern)

    def short_format(self, d: date) -> str:
        return d.strftime(self.short_format_pattern)

    def truncate(self, d: date) -> date:
        return self.truncate_func(d)

    def delta(self, d1: date, d2: date) -> int:
        delta = relativedelta(d1, d2)
        return self.delta_func(delta)

    def iterate(self, first: date, last: date):
        for dt in rrule.rrule(freq=self.rrule_unit,
                              dtstart=self.truncate(first),
                              until=self.truncate(last)):
            yield dt.date()

    @classmethod
    def choices(cls):
        return [(m.name, m.name) for m in cls]