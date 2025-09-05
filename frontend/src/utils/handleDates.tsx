import { format, addDays, subDays } from "date-fns";

/**
 * Returns the previous date string (yyyy-MM-dd) given a current date string.
 */
export const getPreviousDate = (current: string): string => {
  const newDate = format(subDays(new Date(current), 1), "yyyy-MM-dd");
  sessionStorage.setItem("visitor_filter_date", newDate);
  return newDate;
};

/**
 * Returns the next date string (yyyy-MM-dd) given a current date string.
 */
export const getNextDate = (current: string): string => {
  const newDate = format(addDays(new Date(current), 1), "yyyy-MM-dd");
  sessionStorage.setItem("visitor_filter_date", newDate);
  return newDate;
};

export function parseTimeString(timeStr: string): Date {
  const [time, meridian] = timeStr.trim().split(/[\s]+/); // e.g., ['9:00', 'A.M.']
  let [hours, minutes] = time.split(":").map(Number);
  if (meridian.toUpperCase().startsWith("P") && hours !== 12) hours += 12;
  if (meridian.toUpperCase().startsWith("A") && hours === 12) hours = 0;

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}
