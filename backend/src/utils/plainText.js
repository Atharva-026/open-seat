// Models sometimes add markdown and special hyphens; the UI shows plain text.
export const toPlainText = (text = '') =>
  text.replace(/\*\*(.+?)\*\*/g, '$1').replace(/[\u2010\u2011]/g, '-');