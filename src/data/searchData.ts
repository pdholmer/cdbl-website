import { searchSiteContent, getTopResults } from "@/utils/searchUtils";

export interface SearchPage {
  title: string;
  path: string;
  description: string;
  keywords: string[];
}

export interface CommonTopic {
  title: string;
  path: string;
  category: string;
}

export interface FAQ {
  question: string;
  answer: string;
  link: string;
}

export const searchPages: SearchPage[] = [
  {
    title: "Registration",
    path: "/registration",
    description: "Sign up for the baseball season",
    keywords: ["register", "sign up", "join", "enroll", "season"]
  },
  {
    title: "Schedule",
    path: "/schedule",
    description: "View game schedules and dates",
    keywords: ["games", "dates", "calendar", "when", "time"]
  },
  {
    title: "Teams",
    path: "/teams",
    description: "Find your team and roster information",
    keywords: ["roster", "players", "team list", "division"]
  },
  {
    title: "Fields",
    path: "/fields",
    description: "Field locations and maps",
    keywords: ["location", "where", "map", "directions", "address"]
  },
  {
    title: "Rules",
    path: "/rules",
    description: "League rules and regulations",
    keywords: ["regulations", "guidelines", "policy", "how to play"]
  },
  {
    title: "Events",
    path: "/events",
    description: "Upcoming events and activities",
    keywords: ["tournament", "activities", "special", "celebration"]
  },
  {
    title: "About CDBL",
    path: "/about",
    description: "Learn about Chapel Hill-Durham Baseball League",
    keywords: ["history", "mission", "information", "who we are"]
  },
  {
    title: "Board Members",
    path: "/board",
    description: "Meet our board and leadership team",
    keywords: ["leadership", "directors", "officers", "executives"]
  },
  {
    title: "Sponsors",
    path: "/sponsors",
    description: "Our league sponsors and partners",
    keywords: ["partners", "supporters", "donors", "companies"]
  },
  {
    title: "Volunteer",
    path: "/volunteer",
    description: "Get involved and volunteer opportunities",
    keywords: ["help", "donate", "participate", "coach", "assist"]
  },
  {
    title: "Contact",
    path: "/contact",
    description: "Get in touch with us",
    keywords: ["email", "phone", "message", "reach", "ask"]
  },
  {
    title: "New to CDBL",
    path: "/new-to-cdbl",
    description: "Information for new families",
    keywords: ["beginner", "first time", "getting started", "intro"]
  },
  {
    title: "Shop",
    path: "/shop",
    description: "Spirit wear and merchandise",
    keywords: ["store", "buy", "merchandise", "apparel", "gear"]
  }
];

export const commonTopics: CommonTopic[] = [
  { title: "Registration", path: "/registration", category: "Getting Started" },
  { title: "New to CDBL?", path: "/new-to-cdbl", category: "Getting Started" },
  { title: "Find My Team", path: "/teams", category: "Season Info" },
  { title: "Game Schedule", path: "/schedule", category: "Season Info" },
  { title: "Field Locations", path: "/fields", category: "Season Info" },
  { title: "League Rules", path: "/rules", category: "Information" },
  { title: "Volunteer", path: "/volunteer", category: "Get Involved" },
  { title: "Contact Us", path: "/contact", category: "Get Involved" }
];

export const faqs: FAQ[] = [
  {
    question: "When does registration open?",
    answer: "Registration typically opens in January for the spring season.",
    link: "/registration"
  },
  {
    question: "How do I find my team?",
    answer: "Visit the Teams page to find your roster and division.",
    link: "/teams"
  },
  {
    question: "Where are the fields located?",
    answer: "View all field locations and maps on the Fields page.",
    link: "/fields"
  },
  {
    question: "What are the league rules?",
    answer: "Complete rules and regulations are available on the Rules page.",
    link: "/rules"
  },
  {
    question: "How can I volunteer?",
    answer: "We always need volunteers! Check out volunteer opportunities.",
    link: "/volunteer"
  },
  {
    question: "Who can I contact for help?",
    answer: "Reach out to us through the Contact page.",
    link: "/contact"
  }
];

export function searchContent(query: string): {
  pages: SearchPage[];
  topics: CommonTopic[];
  faqs: FAQ[];
} {
  if (!query || query.trim().length === 0) {
    // Return default results when no query
    return {
      pages: searchPages.slice(0, 6),
      topics: commonTopics,
      faqs: faqs,
    };
  }

  const normalizedQuery = query.toLowerCase().trim();

  // Use the new site-wide content search
  const siteResults = searchSiteContent(query);
  const topResults = getTopResults(siteResults, 10);

  // Convert site search results to SearchPage format
  const pagesFromSiteSearch: SearchPage[] = topResults.map((result) => ({
    title: result.title,
    path: result.path,
    description: result.snippet,
    keywords: [result.category],
  }));

  // Also search through our predefined pages for additional context
  const filteredPages = searchPages.filter((page) => {
    return (
      page.title.toLowerCase().includes(normalizedQuery) ||
      page.description.toLowerCase().includes(normalizedQuery) ||
      page.keywords.some((keyword) =>
        keyword.toLowerCase().includes(normalizedQuery)
      )
    );
  });

  // Merge results, prioritizing site search results
  const mergedPages = [...pagesFromSiteSearch];
  for (const page of filteredPages) {
    if (!mergedPages.find((p) => p.path === page.path)) {
      mergedPages.push(page);
    }
  }

  // Search topics
  const filteredTopics = commonTopics.filter((topic) =>
    topic.title.toLowerCase().includes(normalizedQuery)
  );

  // Search FAQs
  const filteredFAQs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(normalizedQuery) ||
      faq.answer.toLowerCase().includes(normalizedQuery)
  );

  return {
    pages: mergedPages.slice(0, 12), // Limit to top 12 results
    topics: filteredTopics,
    faqs: filteredFAQs,
  };
}
