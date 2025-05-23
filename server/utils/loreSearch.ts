import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

interface LoreEntry {
  id: string;
  title: string;
  summary: string;
  keywords?: string[];
  passage?: string;
  source?: string;
}

interface LoreData {
  entries: LoreEntry[];
}

/**
 * Load lore data from the JSON file
 */
function loadLoreData(): LoreData {
  try {
    // Get the directory path in ES modules
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    // First try to load from the new location in the root directory
    try {
      const rootFilePath = path.join(__dirname, '../../../oracle_knowledge.json');
      const rootData = fs.readFileSync(rootFilePath, 'utf8');
      return JSON.parse(rootData);
    } catch (rootError) {
      // Try the old keeper_lore.json if oracle_knowledge.json doesn't exist yet
      try {
        console.log('Trying keeper_lore.json as fallback');
        const keeperFilePath = path.join(__dirname, '../../../keeper_lore.json');
        const keeperData = fs.readFileSync(keeperFilePath, 'utf8');
        return JSON.parse(keeperData);
      } catch (keeperError) {
        console.log('Falling back to legacy lore file location');
        
        // Fall back to the original location
        const filePath = path.join(__dirname, '../config/lore.json');
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
      }
    }
  } catch (error) {
    console.error('Error loading lore data:', error);
    return { entries: [] };
  }
}

/**
 * Find lore entries that match the given search terms
 * 
 * @param message The user message to extract search terms from
 * @returns An array of matching lore entries
 */
export function findRelevantLore(message: string): LoreEntry[] {
  const loreData = loadLoreData();
  
  // If no lore data is available, return empty array
  if (!loreData.entries || loreData.entries.length === 0) {
    return [];
  }
  
  // Normalize the message to lowercase for case-insensitive matching
  const normalizedMessage = message.toLowerCase();
  
  // Score each entry based on keyword matches
  const scoredEntries = loreData.entries.map(entry => {
    // Start with a score of 0
    let score = 0;
    
    // Check for title match (highest priority)
    if (normalizedMessage.includes(entry.title.toLowerCase())) {
      score += 10;
    }
    
    // Check for keywords match if the entry has keywords
    if (entry.keywords && Array.isArray(entry.keywords)) {
      // Process each keyword
      for (const keyword of entry.keywords) {
        if (normalizedMessage.includes(keyword.toLowerCase())) {
          score += 5;
        }
        
        // Additional partial matching for longer phrases
        const words = keyword.toLowerCase().split(' ');
        if (words.length > 1) {
          // For multi-word keywords, check if at least half the words match
          const matchCount = words.filter(word => 
            normalizedMessage.includes(word) && word.length > 3
          ).length;
          
          if (matchCount >= Math.ceil(words.length / 2)) {
            score += 3;
          }
        }
      }
    }
    
    // Extract words from summary for additional matching
    const summaryWords = entry.summary.toLowerCase().split(/\s+/);
    const significantWords = summaryWords.filter(word => word.length > 4);
    
    // Count matching significant words from the summary
    significantWords.forEach(word => {
      if (normalizedMessage.includes(word)) {
        score += 1;
      }
    });
    
    return { entry, score };
  });
  
  // Filter entries with a score above threshold and sort by score (descending)
  const relevantEntries = scoredEntries
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.entry);
  
  // Return top 3 entries at most, to avoid crowding the context
  return relevantEntries.slice(0, 3);
}

/**
 * Format relevant lore entries into a string for inclusion in the prompt
 * 
 * @param entries Array of relevant lore entries
 * @returns Formatted string with lore information
 */
export function formatLoreContext(entries: LoreEntry[]): string {
  if (entries.length === 0) {
    return '';
  }
  
  let context = 'Reference the following Archive entries when formulating your response:\n\n';
  
  entries.forEach((entry, index) => {
    context += `ENTRY ${index + 1}: ${entry.title}\n`;
    if (entry.passage) {
      context += `${entry.passage}\n\n`;
    } else {
      context += `${entry.summary}\n\n`;
    }
  });
  
  return context;
}

/**
 * Check if there's any relevant lore for the user's message
 * 
 * @param message The user's message
 * @returns Formatted lore context or empty string if no relevant lore
 */
export function getLoreContext(message: string): string {
  const relevantEntries = findRelevantLore(message);
  return formatLoreContext(relevantEntries);
}