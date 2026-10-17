// Models sometimes add markdown and special hyphens; the UI shows plain text.
export const toPlainText = (text = '') =>
  text
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/^\s*[-*_]{3,}\s*$/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(?=\S)([^*\n]+?)(?<=\S)\*/g, '$1')
    .replace(/[\u2010\u2011]/g, '-')
    .replace(/\n{3,}/g, '\n\n')
    .trim();