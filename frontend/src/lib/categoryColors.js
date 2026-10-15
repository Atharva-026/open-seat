const COLORS = {
  language: '#4F8EF7',
  framework: '#E39A00',
  database: '#2FB67C',
  frontend: '#C264F0',
  backend: '#F0647A',
  ai: '#21B8D4',
  tooling: '#8A94B8',
  data: '#7CC04A',
  topic: '#B08D57',
};

export const categoryColor = (category) => COLORS[category] ?? '#8A94B8';