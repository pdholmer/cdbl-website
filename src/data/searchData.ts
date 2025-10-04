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
  },
  // Travel-specific FAQs
  {
    question: "How do I know if my child is ready for travel baseball?",
    answer: "Travel baseball is best for players with multiple seasons of experience, strong fundamental skills, genuine passion for the game, and families who can commit to weekend tournaments and additional practice schedules.",
    link: "/travel#readiness"
  },
  {
    question: "What's the time commitment for travel teams?",
    answer: "Travel teams require 2-3 practices per week, 2-3 games per week, and 8-15 weekend tournaments per season running March through August.",
    link: "/travel#commitment"
  },
  {
    question: "How much does travel baseball cost?",
    answer: "Travel baseball costs approximately $600 registration plus $1,500-2,500 in tournament fees, totaling $2,500-3,500 per season plus travel expenses.",
    link: "/travel#costs"
  },
  {
    question: "When are travel team tryouts?",
    answer: "Travel team tryouts are held March 8-9, 2026, with callback sessions on March 9. Team announcements will be made on March 10.",
    link: "/travel#tryouts"
  },
  {
    question: "Can my child play both in-house and travel?",
    answer: "Players typically choose one program due to scheduling conflicts, but policies may vary by division. Contact your division coordinator for specific guidance.",
    link: "/registration#dual-participation"
  },
  {
    question: "What's the difference between travel and in-house teams?",
    answer: "Travel teams are competitive with tryouts, 50+ games, extensive tournament schedules, and higher costs. In-house is recreational, all skill levels welcome, local games only, and more affordable.",
    link: "/registration#comparison"
  },
  {
    question: "Do travel players get college exposure?",
    answer: "Our program focuses on skill development and competition. 14U teams attend showcase tournaments where college scouts are present.",
    link: "/travel#college-prep"
  },
  {
    question: "What makes CDBL Rockets competitive?",
    answer: "CDBL Rockets have experienced coaching staff, state tournament appearances, regional championships, and a strong player development pipeline to Burlington Central High School.",
    link: "/travel#competitive-edge"
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
