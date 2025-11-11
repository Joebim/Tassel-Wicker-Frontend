/**
 * Truncates text to a specified maximum length and adds ellipsis if truncated
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation (default: 47)
 * @returns Truncated text with ellipsis if needed
 */
export const truncateText = (text: string, maxLength: number = 47): string => {
    if (text.length <= maxLength) {
        return text;
    }
    return text.slice(0, maxLength) + '...';
};

