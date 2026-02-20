import { RRule, rrulestr } from 'rrule';

export function generateOccurrences(
  rruleString: string,
  startDate: Date,
  rangeStart: Date,
  rangeEnd: Date
): Date[] {
  try {
    const rule = rrulestr(rruleString, { dtstart: startDate });
    return rule.between(rangeStart, rangeEnd, true);
  } catch {
    return [];
  }
}

export function buildRRuleString(config: {
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  interval: number;
  byWeekday?: number[];
  byMonthDay?: number;
  endType: 'never' | 'until' | 'count';
  until?: Date;
  count?: number;
}): string {
  const freqMap = { DAILY: RRule.DAILY, WEEKLY: RRule.WEEKLY, MONTHLY: RRule.MONTHLY, YEARLY: RRule.YEARLY };
  const weekdays = [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR, RRule.SA, RRule.SU];

  const options: Partial<RRule.Options> = {
    freq: freqMap[config.frequency],
    interval: config.interval,
  };

  if (config.byWeekday?.length) {
    options.byweekday = config.byWeekday.map((d) => weekdays[d]);
  }

  if (config.byMonthDay) {
    options.bymonthday = config.byMonthDay;
  }

  if (config.endType === 'until' && config.until) {
    options.until = config.until;
  } else if (config.endType === 'count' && config.count) {
    options.count = config.count;
  }

  return new RRule(options).toString();
}

export function describeRRule(rruleString: string): string {
  try {
    const rule = rrulestr(rruleString);
    return rule.toText();
  } catch {
    return 'Powtarzające się';
  }
}
