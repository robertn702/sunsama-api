/**
 * Date and timezone utilities
 */

/**
 * Converts a day string (YYYY-MM-DD) to Sunsama's panel date format
 *
 * @param day - Day in YYYY-MM-DD format
 * @param timezone - User's timezone (e.g., 'America/New_York')
 * @returns ISO date string for the start of day (midnight) in the given timezone
 *
 * @example
 * ```typescript
 * // Midnight in New York on Jan 17, 2025
 * dayToPanelDate('2025-01-17', 'America/New_York')
 * // Returns: '2025-01-17T05:00:00.000Z' (midnight EST = 5am UTC)
 * ```
 */
export function dayToPanelDate(day: string, timezone: string): string {
  // Parse the day components
  const [year, month, dayOfMonth] = day.split('-').map(Number);

  // Create a date at midnight UTC for this day
  const midnightUtc = new Date(Date.UTC(year!, month! - 1, dayOfMonth!, 0, 0, 0));

  // Get the offset at MIDNIGHT in the target timezone (not noon!)
  // This is critical for DST transition days where midnight and noon have different offsets
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    timeZoneName: 'longOffset',
  });

  // Format midnight UTC and extract the offset string (e.g., "GMT-05:00")
  const parts = formatter.formatToParts(midnightUtc);
  const offsetPart = parts.find(p => p.type === 'timeZoneName')?.value || 'GMT+00:00';

  // Parse the offset string (e.g., "GMT-05:00" -> -5 hours)
  const match = offsetPart.match(/GMT([+-])(\d{2}):(\d{2})/);
  let offsetMs = 0;
  if (match) {
    const sign = match[1] === '+' ? 1 : -1;
    const hours = parseInt(match[2]!, 10);
    const minutes = parseInt(match[3]!, 10);
    offsetMs = sign * (hours * 60 + minutes) * 60 * 1000;
  }

  // Midnight in the target timezone = midnight UTC minus the offset
  // If timezone is UTC-5, midnight local = 5am UTC (subtract -5 hours = add 5 hours)
  const panelDate = new Date(midnightUtc.getTime() - offsetMs);

  return panelDate.toISOString();
}
