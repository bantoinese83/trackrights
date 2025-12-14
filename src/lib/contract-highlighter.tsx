import React from 'react';
import { Highlighter } from '@/components/ui/highlighter';

// Terms that should be highlighted (important legal concepts)
const HIGHLIGHT_TERMS = [
  // Financial terms
  /\b(royalty|royalties|payment|fee|fees|compensation|advance|revenue|income|profit|loss)\b/gi,
  // Rights and ownership
  /\b(copyright|ownership|rights|exclusive|non-exclusive|license|licensing)\b/gi,
  // Obligations and requirements
  /\b(must|shall|required|obligation|duty|responsible|liable)\b/gi,
  // Restrictions and prohibitions
  /\b(prohibited|restricted|forbidden|cannot|may not|shall not)\b/gi,
  // Termination and duration
  /\b(termination|expiration|duration|term|period|deadline|expires?)\b/gi,
  // Legal consequences
  /\b(breach|default|penalty|penalties|damages|lawsuit|litigation|arbitration)\b/gi,
  // Important clauses
  /\b(indemnification|warranty|guarantee|representation|disclaimer)\b/gi,
  // Time-sensitive
  /\b(immediately|promptly|within\s+\d+\s+(days?|weeks?|months?|years?))\b/gi,
];

// Terms that should be underlined (warnings/critical)
const UNDERLINE_TERMS = [
  /\b(waiver|waive|irrevocable|non-refundable|non-negotiable|binding|final)\b/gi,
  /\b(all rights reserved|sole discretion|at will|without cause)\b/gi,
  /\b(confidential|non-disclosure|non-compete|exclusive)\b/gi,
];

interface HighlightedTextProps {
  text: string;
}

export function HighlightedContractText({ text }: HighlightedTextProps) {
  // Split text into parts, preserving the original text structure
  const processText = (inputText: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    const matches: Array<{
      index: number;
      length: number;
      type: 'highlight' | 'underline';
      text: string;
    }> = [];

    // Find all highlight matches (reset regex lastIndex)
    HIGHLIGHT_TERMS.forEach((pattern) => {
      pattern.lastIndex = 0; // Reset regex
      let match;
      while ((match = pattern.exec(inputText)) !== null) {
        matches.push({
          index: match.index,
          length: match[0].length,
          type: 'highlight',
          text: match[0],
        });
      }
    });

    // Find all underline matches (reset regex lastIndex)
    UNDERLINE_TERMS.forEach((pattern) => {
      pattern.lastIndex = 0; // Reset regex
      let match;
      while ((match = pattern.exec(inputText)) !== null) {
        matches.push({
          index: match.index,
          length: match[0].length,
          type: 'underline',
          text: match[0],
        });
      }
    });

    // Sort matches by index
    matches.sort((a, b) => a.index - b.index);

    // Remove overlapping matches (prioritize underlines over highlights)
    const filteredMatches: typeof matches = [];
    for (const match of matches) {
      const overlaps = filteredMatches.some(
        (existing) =>
          (match.index >= existing.index &&
            match.index < existing.index + existing.length) ||
          (match.index + match.length > existing.index &&
            match.index + match.length <= existing.index + existing.length) ||
          (match.index <= existing.index &&
            match.index + match.length >= existing.index + existing.length)
      );
      if (!overlaps) {
        filteredMatches.push(match);
      }
    }

    // Build the parts array
    filteredMatches.forEach((match) => {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(inputText.substring(lastIndex, match.index));
      }

      // Add the highlighted/underlined match
      if (match.type === 'underline') {
        parts.push(
          <Highlighter
            key={`underline-${match.index}`}
            action="underline"
            color="#FF9800"
            strokeWidth={2}
          >
            {match.text}
          </Highlighter>
        );
      } else {
        parts.push(
          <Highlighter
            key={`highlight-${match.index}`}
            action="highlight"
            color="#FFE082"
            strokeWidth={1.5}
          >
            {match.text}
          </Highlighter>
        );
      }

      lastIndex = match.index + match.length;
    });

    // Add remaining text
    if (lastIndex < inputText.length) {
      parts.push(inputText.substring(lastIndex));
    }

    // If no matches, return original text
    if (parts.length === 0) {
      return [inputText];
    }

    return parts;
  };

  // Split by lines to preserve line breaks
  const lines = text.split('\n');
  
  return (
    <>
      {lines.map((line, lineIndex) => {
        const processedParts = processText(line);
        return (
          <React.Fragment key={lineIndex}>
            <span>
              {processedParts.map((part, partIndex) => (
                <React.Fragment key={partIndex}>{part}</React.Fragment>
              ))}
            </span>
            {lineIndex < lines.length - 1 && <br />}
          </React.Fragment>
        );
      })}
    </>
  );
}
