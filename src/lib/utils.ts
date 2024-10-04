import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * This function is auto generated by shadcn cli tool.
 * 
 * Combines class names into a single string, merging any conflicting Tailwind CSS classes.
 * This function utilizes the `clsx` library to conditionally join class names and 
 * the `twMerge` function to ensure that the final class string has the correct 
 * Tailwind CSS classes applied, resolving any conflicts.
 *
 * @param {...ClassValue[]} inputs - The class names to be combined.
 * @returns {string} - The merged class name string.
 * 
 */

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


/**
 * Formats a date string into a more readable format.
 * 
 * This function takes a date string as input and converts it into a localized date format,
 * displaying the year, month, and day, along with the time in hours and minutes.
 * 
 * @param {string} dateString - The date string to be formatted.
 * @returns {string} - A formatted string representing the date and time.
 * 
 */

export function formatDateString(dateString: string) {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  const date = new Date(dateString);
  const formattedDate = date.toLocaleDateString("en-US", options);

  const time = date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  return `${formattedDate} at ${time}`;
}

/**
 * multiFormatDateString takes a timestamp string and returns a human-readable 
 * representation of the time difference between the current time and the 
 * provided timestamp. It formats the output based on the elapsed time:
 * - If the timestamp is older than 30 days, it returns a formatted date string.
 * - If the timestamp is 1 day old, it returns "1 day ago".
 * - If the timestamp is between 2 and 29 days old, it returns the number of days ago.
 * - If the timestamp is 1 hour old or more, it returns the number of hours ago.
 * - If the timestamp is 1 minute old or more, it returns the number of minutes ago.
 * - If the timestamp is less than a minute old, it returns "Just now".
 * 
 * @param {string} timestamp - The timestamp string to be formatted.
 * @returns {string} - A human-readable string representing the time difference.
 * 
 */

export const multiFormatDateString = (timestamp: string = ""): string => {
  const timestampNum = Math.round(new Date(timestamp).getTime() / 1000);
  const date: Date = new Date(timestampNum * 1000);
  const now: Date = new Date();

  const diff: number = now.getTime() - date.getTime();
  const diffInSeconds: number = diff / 1000;
  const diffInMinutes: number = diffInSeconds / 60;
  const diffInHours: number = diffInMinutes / 60;
  const diffInDays: number = diffInHours / 24;

  switch (true) {
    case Math.floor(diffInDays) >= 30:
      return formatDateString(timestamp);
    case Math.floor(diffInDays) === 1:
      return `${Math.floor(diffInDays)} day ago`;
    case Math.floor(diffInDays) > 1 && diffInDays < 30:
      return `${Math.floor(diffInDays)} days ago`;
    case Math.floor(diffInHours) >= 1:
      return `${Math.floor(diffInHours)} hours ago`;
    case Math.floor(diffInMinutes) >= 1:
      return `${Math.floor(diffInMinutes)} minutes ago`;
    default:
      return "Just now";
  }
};

/**
 * checkIsLiked checks if a specific user has liked a post.
 * 
 * @param {string[]} likes - An array of user IDs who have liked the post.
 * @param {string} userId - The user ID to check for.
 * @returns {boolean} - Returns true if the user has liked the post, otherwise false.
 * 
 */

export function checkIsLiked(likes: string[], userId: string) {
  return likes.includes(userId);
}