import { format } from "date-fns";

const formatRelativeDate = (
  date: Date | string | undefined,
  pattern: string = "dd MMM, yyyy",
  relative: boolean = false,
): string => {
  if (!date) {
    return "Date not available"; // Handle undefined dates
  }

  const dateObj = new Date(date);

  if (relative) {
    // Function for adding 0 to date if it is less than 10
    const addZero = (num: number) => {
      return num < 10 ? `0${num}` : num;
    };

    // Relative time logic
    const now = new Date();
    const diff = now.getTime() - dateObj.getTime();
    const day = 24 * 60 * 60 * 1000;
    const week = 7 * day;
    const month = 30 * day;

    if (diff < day) {
      return "Today";
    } else if (diff < week) {
      return `${addZero(Math.floor(diff / day))} Days Ago`;
    } else if (diff < month) {
      return `${Math.floor(diff / week)} Weeks Ago`;
    } else if (diff < month * 12) {
      return `${addZero(Math.floor(diff / month))} Months Ago`;
    } else {
      const years = Math.floor(diff / month / 12);
      if (years > 1) {
        return `Over 01 Years Ago`;
      } else {
        return `${addZero(years)} Year Ago`;
      }
    }
  } else {
    // Standard date format using date-fns
    return format(dateObj, pattern);
  }
};

export default formatRelativeDate;
