import { LANGUAGEMAPPING } from "@/app/_utils/constants";
import { isBefore, parseISO } from "date-fns";
import { v4 as uuidv4 } from "uuid";

export function generateUniqueId() {
  return uuidv4();
}

export const parseResponse = (responseText) => {
  const lines = responseText.split("\n").filter((line) => line.trim() !== "");

  if (lines.length == 0) {
    return responseText;
  }

  if (
    !lines[0].includes("**Query:**") ||
    !lines[1].includes("**Top 3 Professors:**")
  ) {
    return responseText;
  }

  const query = lines[0].replace("**Query:** ", "").replace(/(^"|"$)/g, "");

  const professors = [];
  let currentProfessor = {};

  for (let i = 2; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.match(/^\d+\./)) {
      // Push the previous professor if it exists
      if (Object.keys(currentProfessor).length > 0) {
        professors.push(currentProfessor);
      }
      // Create a new professor object
      currentProfessor = {
        name: line
          .replace(/^\d+\.\s\*\*Professor Name:\*\*\s*/, "")
          .replace(/\*\*$/, "")
          .trim(),
      };
    } else if (line.startsWith("- **Subject:**")) {
      currentProfessor.subject = line.replace("- **Subject:** ", "").trim();
    } else if (line.startsWith("- **Rating:**")) {
      currentProfessor.rating = line.replace("- **Rating:** ", "").trim();
    } else if (line.startsWith("- **Review:**")) {
      currentProfessor.review = line.replace("- **Review:** ", "").trim();
    }
  }

  // Push the last professor if any
  if (Object.keys(currentProfessor).length > 0) {
    professors.push(currentProfessor);
  }

  return { query, professors };
};

export function getLanguageCode(language) {
  return LANGUAGEMAPPING[language.toLowerCase()] || "en";
}

export const parseAndBeautifyResponse = (responseText) => {
  const entries = responseText
    .split(/\d+\.\s\*\*Movie Title:\*\*/)
    .filter(Boolean);

  if (entries.length == 0) {
    return responseText;
  }

  const introText = entries[0];
  const outroText = entries[entries.length - 1].split("\n\n")[1];

  entries.forEach((entry, index) => {
    entries[index] = entry.trim();
  });

  const movies = entries.map((entry) => {
    const titleMatch = entry.match(/Movie Title:\s*(.*?)\s*- \*\*Rating:/);
    const ratingMatch = entry.match(/Rating:\s*([\d.]+)\s*- \*\*Genres:/);
    const genresMatch = entry.match(
      /Genres:\s*([^ -]+(?:, [^ -]+)*)\s*- \*\*Description:/
    );
    const descriptionMatch = entry.match(
      /Description:\s*(.*?)\s*- \*\*Language:/
    );
    const languageMatch = entry.match(/Language:\s*([^ -]+)\s*- \*\*Keywords:/);
    const keywordsMatch = entry.match(
      /Keywords:\s*([^ -]+(?:, [^ -]+)*)\s*- \*\*Image:/
    );
    const imageMatch = entry.match(/Image:\s*!\[.*?\]\((.*?)\)/);

    return {
      title: titleMatch ? titleMatch[1] : "",
      rating: ratingMatch ? parseFloat(ratingMatch[1]) : null,
      genres: genresMatch ? genresMatch[1].split(", ") : [],
      description: descriptionMatch ? descriptionMatch[1] : "",
      language: languageMatch ? languageMatch[1] : "",
      keywords: keywordsMatch ? keywordsMatch[1].split(", ") : [],
      image: imageMatch ? imageMatch[1] : "",
    };
  });

  return movies;
};

export const isEmptyObject = (obj) => {
  return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
};

export const formatPostTime = (date) => {
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / 60000);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInMonths / 12);

  if (diffInYears > 0) return `${diffInYears}y`;
  if (diffInMonths > 0) return `${diffInMonths}m`;
  if (diffInDays > 0) return `${diffInDays}d`;
  if (diffInHours > 0) return `${diffInHours}h`;
  if (diffInMinutes > 0) return `${diffInMinutes}min`;
  return "just now";
};

export const getVideoUrl = (site, keyOrId) => {
  switch (site) {
    case "YouTube":
      return `https://www.youtube.com/watch?v=${keyOrId}`;
    case "Vimeo":
      return `https://vimeo.com/${keyOrId}`;
    case "Dailymotion":
      return `https://www.dailymotion.com/video/${keyOrId}`;
    default:
      console.warn(`Unsupported site: ${site}`);
      return null;
  }
};

export function GENREIDSTONAME(id) {
  const genres = {
    // TV show genres (not duplicated in movies)
    10759: "Action & Adventure",
    10762: "Kids",
    10763: "News",
    10764: "Reality",
    10765: "Sci-Fi & Fantasy",
    10766: "Soap",
    10767: "Talk",
    10768: "War & Politics",

    // Movie genres (removed duplicates)
    28: "Action",
    12: "Adventure",
    16: "Animation",
    35: "Comedy",
    80: "Crime",
    99: "Documentary",
    18: "Drama",
    10751: "Family",
    14: "Fantasy",
    36: "History",
    27: "Horror",
    10402: "Music",
    9648: "Mystery",
    10749: "Romance",
    878: "Science Fiction",
    10770: "TV Movie",
    53: "Thriller",
    10752: "War",
    37: "Western",
  };

  const genreName = genres[id] || "Unknown";
  return genreName;
}

export function extractVideoIdFromURL(url) {
  const regex =
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:watch\?v=|embed\/|v\/|.+\?v=)([a-zA-Z0-9_-]{11})|(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] || match[2] : null;
}

export function formatNumber(number) {
  if (number < 1000) {
    return number.toString();
  } else if (number >= 1000 && number < 1000000) {
    return (number / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  } else if (number >= 1000000 && number < 1000000000) {
    return (number / 1000000).toFixed(1).replace(/\.0$/, "") + "m";
  } else if (number >= 1000000000 && number < 1000000000000) {
    return (number / 1000000000).toFixed(1).replace(/\.0$/, "") + "b";
  } else {
    return (number / 1000000000000).toFixed(1).replace(/\.0$/, "") + "t";
  }
}

export function getChatLimitBasedOnPlan(planName) {
  switch (planName) {
    case "Premium":
      return -1;
    case "Free":
      return 15;
    default:
      return 0;
  }
}

export function getPostLimitBasedOnPlan(planName) {
  switch (planName) {
    case "Premium":
      return -1;
    case "Free":
      return 10;
    default:
      return 0;
  }
}

export function getWatchListLimitBasedOnPlan(planName) {
  switch (planName) {
    case "Premium":
      return -1;
    case "Free":
      return 10;
    default:
      return 0;
  }
}

export function getHistoryLimitBasedOnPlan(planName) {
  switch (planName) {
    case "Premium":
      return -1;
    case "Free":
      return 10;
    default:
      return 0;
  }
}

export function getScrapeLimitBasedOnPlan(planName) {
  switch (planName) {
    case "Premium":
      return -1;
    case "Free":
      return 5;
    default:
      return 0;
  }
}

export const isSubscriptionActive = (endsAt) => {
  const now = new Date();
  const endDate = parseISO(endsAt);
  return isBefore(now, endDate);
};
