export const stripHtmlTags = (text: string) => text.replace(/<[^>]*>/g, '');

export const decodeHtmlEntities = (text: string) =>
  text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
