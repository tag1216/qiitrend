import re


pattern = re.compile("^([0-9]+)(.+)$")

unit_to_second = dict(s=1,
                      sec=1,
                      second=1,
                      seconds=1,
                      m=60,
                      min=60,
                      minute=60,
                      minutes=60,
                      h=60*60,
                      hour=60*60,
                      hours=60*60,
                      d=24*60*60,
                      day=24*60*60,
                      days=24*60*60)


def duration_to_second(times):

    m = pattern.match(times)
    if not m:
        raise ValueError(times)

    num = int(m.group(1))
    unit = m.group(2)

    if unit not in unit_to_second:
        raise ValueError(unit)

    return unit_to_second[unit] * num
