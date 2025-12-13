/**
 * Contract Optimizer
 * Utilities to reduce token usage and optimize contract processing
 */

/**
 * Creates a simple hash of the contract text for cache keys
 * This is more efficient than storing full contract text in cache keys
 */
export function hashContract(contractText: string): string {
  // Simple hash function for cache keys (not cryptographically secure, but fast)
  let hash = 0;
  const str = contractText.substring(0, 1000); // Use first 1000 chars for hash
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Intelligently truncates contract text while preserving important information
 * Prioritizes:
 * 1. Beginning (title, parties, key terms)
 * 2. Financial terms (royalties, payments)
 * 3. Rights and obligations
 * 4. Termination clauses
 */
export function optimizeContractText(
  contractText: string,
  maxLength = 8000
): string {
  if (contractText.length <= maxLength) {
    return contractText;
  }

  // Split into sections
  const lines = contractText.split('\n');
  const importantKeywords = [
    'royalty',
    'royalties',
    'payment',
    'advance',
    'term',
    'duration',
    'exclusive',
    'exclusivity',
    'rights',
    'ownership',
    'copyright',
    'termination',
    'renewal',
    'percentage',
    '%',
  ];

  // Score lines by importance
  const scoredLines = lines.map((line, index) => {
    const lowerLine = line.toLowerCase();
    let score = 0;

    // Beginning of contract is important
    if (index < 50) score += 10;

    // Lines with important keywords
    importantKeywords.forEach((keyword) => {
      if (lowerLine.includes(keyword)) {
        score += 5;
      }
    });

    // Headers/sections
    if (line.match(/^#{1,3}\s|^[A-Z][A-Z\s]{10,}$/)) {
      score += 3;
    }

    // Numbered items (likely important clauses)
    if (line.match(/^\d+[\.\)]/)) {
      score += 2;
    }

    return { line, score, index };
  });

  // Sort by score and take top lines
  scoredLines.sort((a, b) => b.score - a.score);

  // Build optimized contract
  const selectedIndices = new Set<number>();
  let optimizedLength = 0;
  const optimizedLines: string[] = [];

  // Always include first 20 lines (title, parties, etc.)
  for (let i = 0; i < Math.min(20, lines.length); i++) {
    const line = lines[i];
    if (!line) continue;
    selectedIndices.add(i);
    optimizedLines.push(line);
    optimizedLength += line.length + 1;
  }

  // Add high-scoring lines until we reach maxLength
  for (const { line, index } of scoredLines) {
    if (selectedIndices.has(index)) continue;
    if (optimizedLength + line.length + 1 > maxLength) break;

    optimizedLines.push(line);
    selectedIndices.add(index);
    optimizedLength += line.length + 1;
  }

  // Fill remaining space with other lines in order
  for (let i = 0; i < lines.length && optimizedLength < maxLength; i++) {
    if (selectedIndices.has(i)) continue;
    const line = lines[i];
    if (!line) continue;
    if (optimizedLength + line.length + 1 > maxLength) break;

    optimizedLines.push(line);
    optimizedLength += line.length + 1;
  }

  return optimizedLines.join('\n') + '\n\n[... Additional contract content truncated for optimization ...]';
}

/**
 * Extracts key terms from contract for faster processing
 */
export function extractKeyTerms(contractText: string): {
  royalties?: string;
  term?: string;
  exclusivity?: string;
  rights?: string;
} {
  const lowerText = contractText.toLowerCase();
  const keyTerms: {
    royalties?: string;
    term?: string;
    exclusivity?: string;
    rights?: string;
  } = {};

  // Extract royalty information
  const royaltyMatch = contractText.match(
    /royalt(?:y|ies)[\s:]*(\d+(?:\.\d+)?%?)/i
  );
  if (royaltyMatch) {
    keyTerms.royalties = royaltyMatch[1];
  }

  // Extract term/duration
  const termMatch = contractText.match(
    /(?:term|duration)[\s:]*(\d+[\s]*(?:year|month|day)s?)/i
  );
  if (termMatch) {
    keyTerms.term = termMatch[1];
  }

  // Check for exclusivity
  if (lowerText.includes('exclusive') || lowerText.includes('exclusivity')) {
    keyTerms.exclusivity = lowerText.includes('non-exclusive')
      ? 'non-exclusive'
      : 'exclusive';
  }

  return keyTerms;
}
