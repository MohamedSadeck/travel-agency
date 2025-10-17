import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import dayjs from "dayjs";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (dateString: string): string => {
  return dayjs(dateString).format("MMMM DD, YYYY");
};

export function parseMarkdownToJson(markdownText: string): unknown | null {
  // Try to find JSON in markdown code blocks with 'json' identifier
  let regex = /```json\s*\n([\s\S]+?)\n```/;
  let match = markdownText.match(regex);

  // Try to find JSON in markdown code blocks without 'json' identifier
  if (!match) {
    regex = /```\s*\n([\s\S]+?)\n```/;
    match = markdownText.match(regex);
  }

  // If found in code blocks, try to parse it
  if (match && match[1]) {
    try {
      return JSON.parse(match[1].trim());
    } catch (error) {
      console.error("Error parsing JSON from code block:", error);
    }
  }

  // If no code blocks found or parsing failed, try to parse the entire text as JSON
  // First, try to find a JSON object in the text
  const jsonObjectRegex = /(\{[\s\S]*\})/;
  const jsonMatch = markdownText.match(jsonObjectRegex);
  
  if (jsonMatch && jsonMatch[1]) {
    try {
      return JSON.parse(jsonMatch[1].trim());
    } catch (error) {
      console.error("Error parsing JSON from text:", error);
    }
  }

  console.error("No valid JSON found in markdown text.");
  return null;
}

export function parseTripData(jsonString: string): Trip | null {
  try {
    const data: Trip = JSON.parse(jsonString);

    return data;
  } catch (error) {
    console.error("Failed to parse trip data:", error);
    return null;
  }
}

export function getFirstWord(input: string = ""): string {
  return input.trim().split(/\s+/)[0] || "";
}

export const calculateTrendPercentage = (
  countOfThisMonth: number,
  countOfLastMonth: number
): TrendResult => {
  if (countOfLastMonth === 0) {
    return countOfThisMonth === 0
      ? { trend: "no change", percentage: 0 }
      : { trend: "increment", percentage: 100 };
  }

  const change = countOfThisMonth - countOfLastMonth;
  const percentage = Math.abs((change / countOfLastMonth) * 100);

  if (change > 0) {
    return { trend: "increment", percentage };
  } else if (change < 0) {
    return { trend: "decrement", percentage };
  } else {
    return { trend: "no change", percentage: 0 };
  }
};

export const formatKey = (key: keyof TripFormData) => {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());
};
