import { COUNTRIES_DATA } from '../data/countriesData';

export function getTimezoneForCountry(countryNameOrCode?: string, fallbackTimezone?: string): string {
  if (fallbackTimezone && fallbackTimezone !== 'UTC') return fallbackTimezone;
  if (!countryNameOrCode) return 'America/New_York';

  const query = countryNameOrCode.toLowerCase().trim();
  const match = COUNTRIES_DATA.find(
    (c) =>
      c.code.toLowerCase() === query ||
      c.name.toLowerCase() === query ||
      c.timezone.toLowerCase().includes(query)
  );

  return match ? match.timezone : (fallbackTimezone || 'America/New_York');
}

export function formatCountryDate(date: Date, countryNameOrCode?: string, fallbackTimezone?: string): string {
  const tz = getTimezoneForCountry(countryNameOrCode, fallbackTimezone);
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  } catch (e) {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }
}

export function formatCountryTime(date: Date, countryNameOrCode?: string, fallbackTimezone?: string): string {
  const tz = getTimezoneForCountry(countryNameOrCode, fallbackTimezone);
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(date);
  } catch (e) {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }
}

export function getCountryHour(date: Date, countryNameOrCode?: string, fallbackTimezone?: string): number {
  const tz = getTimezoneForCountry(countryNameOrCode, fallbackTimezone);
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour: 'numeric',
      hour12: false,
    }).formatToParts(date);
    const hourPart = parts.find((p) => p.type === 'hour');
    return hourPart ? parseInt(hourPart.value, 10) : date.getHours();
  } catch (e) {
    return date.getHours();
  }
}

export function getCountryTimeOfDayGreeting(
  userName: string,
  countryNameOrCode?: string,
  fallbackTimezone?: string,
  date: Date = new Date()
): string {
  const hour = getCountryHour(date, countryNameOrCode, fallbackTimezone);
  let greeting = 'Good morning';
  if (hour >= 12 && hour < 17) {
    greeting = 'Good afternoon';
  } else if (hour >= 17 || hour < 5) {
    greeting = 'Good evening';
  }
  return `${greeting}, ${userName || 'Founder'} 👋`;
}
