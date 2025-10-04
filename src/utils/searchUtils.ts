// Advanced search utilities for site-wide content search

import { contentIndex, ContentItem } from "@/data/contentIndex";

export interface SearchResult {
  title: string;
  path: string;
  snippet: string;
  category: string;
  relevanceScore: number;
}

/**
 * Performs intelligent full-text search across all indexed content
 * @param query - Search query string
 * @returns Array of search results sorted by relevance
 */
export function searchSiteContent(query: string): SearchResult[] {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const normalizedQuery = query.toLowerCase().trim();
  const queryWords = normalizedQuery.split(/\s+/);

  const results: SearchResult[] = [];

  for (const item of contentIndex) {
    const score = calculateRelevanceScore(item, normalizedQuery, queryWords);
    
    if (score > 0) {
      const snippet = generateSnippet(item, normalizedQuery);
      
      results.push({
        title: item.title,
        path: item.path,
        snippet,
        category: item.category,
        relevanceScore: score,
      });
    }
  }

  // Sort by relevance score (highest first)
  return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

/**
 * Calculates relevance score based on multiple factors
 */
function calculateRelevanceScore(
  item: ContentItem,
  query: string,
  queryWords: string[]
): number {
  const titleLower = item.title.toLowerCase();
  const contentLower = item.content.toLowerCase();
  let score = 0;

  // Exact phrase match in title (highest priority)
  if (titleLower.includes(query)) {
    score += 100 * item.priority;
  }

  // Exact phrase match in content
  if (contentLower.includes(query)) {
    score += 50 * item.priority;
  }

  // Individual word matches in title
  for (const word of queryWords) {
    if (titleLower.includes(word)) {
      score += 30 * item.priority;
    }
  }

  // Individual word matches in content
  for (const word of queryWords) {
    if (contentLower.includes(word)) {
      score += 10 * item.priority;
    }
  }

  // Partial word matches (for words like "travel" matching "traveling")
  for (const word of queryWords) {
    const contentWords = contentLower.split(/\s+/);
    for (const contentWord of contentWords) {
      if (contentWord.startsWith(word) && contentWord !== word) {
        score += 5 * item.priority;
      }
    }
  }

  return score;
}

/**
 * Generates a relevant snippet showing where the match was found
 */
function generateSnippet(item: ContentItem, query: string): string {
  const content = item.content;
  const lowerContent = content.toLowerCase();
  const queryLower = query.toLowerCase();
  
  // Try to find the query in the content
  const index = lowerContent.indexOf(queryLower);
  
  if (index !== -1) {
    // Extract context around the match
    const start = Math.max(0, index - 30);
    const end = Math.min(content.length, index + query.length + 50);
    const snippet = content.substring(start, end);
    
    return (start > 0 ? "..." : "") + snippet + (end < content.length ? "..." : "");
  }
  
  // If exact query not found, show beginning of content
  return content.substring(0, 80) + (content.length > 80 ? "..." : "");
}

/**
 * Get top N results
 */
export function getTopResults(results: SearchResult[], count: number): SearchResult[] {
  return results.slice(0, count);
}

/**
 * Group results by category
 */
export function groupByCategory(results: SearchResult[]): Record<string, SearchResult[]> {
  const grouped: Record<string, SearchResult[]> = {};
  
  for (const result of results) {
    if (!grouped[result.category]) {
      grouped[result.category] = [];
    }
    grouped[result.category].push(result);
  }
  
  return grouped;
}
