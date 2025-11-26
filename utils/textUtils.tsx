import React from "react";

/**
 * Converts email addresses in text to clickable mailto links
 * @param text - The text content that may contain email addresses
 * @returns An array of React nodes with email addresses as clickable links
 */
export function renderTextWithEmailLinks(text: string): React.ReactNode {
  const emailRegex = /(\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b)/gi;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let keyCounter = 0;

  while ((match = emailRegex.exec(text)) !== null) {
    // Add text before the email (whitespace-pre-line will handle newlines)
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    // Add the email as a clickable link (normalize to lowercase for mailto)
    const email = match[0];
    parts.push(
      <a
        key={`email-${keyCounter++}`}
        href={`mailto:${email.toLowerCase()}`}
        className="underline hover:text-brand-purple transition-colors"
      >
        {email}
      </a>
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after the last email
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  // If no emails were found, return the original text
  if (parts.length === 0) {
    return text;
  }

  return <>{parts}</>;
}

