// Skill names match the ones extracted from GitHub so demo and real people connect.
export const SKILLS = {
  JavaScript: 'language', TypeScript: 'language', Python: 'language', Java: 'language', Dart: 'language',
  React: 'framework', 'Next.js': 'framework', Vue: 'framework', Express: 'framework',
  Flask: 'framework', Django: 'framework', FastAPI: 'framework', 'React Native': 'framework', Flutter: 'framework',
  MongoDB: 'database', PostgreSQL: 'database', Prisma: 'database', FalkorDB: 'database',
  'Tailwind CSS': 'frontend', 'Three.js': 'frontend', GSAP: 'frontend', 'Framer Motion': 'frontend',
  'UI/UX Design': 'design', Figma: 'design', 'Product Pitching': 'communication', 'Technical Writing': 'communication',
  WebSockets: 'backend', Payments: 'backend', Docker: 'devops', CI_CD: 'devops', Testing: 'devops',
  'LLM APIs': 'ai', LangChain: 'ai', PyTorch: 'ai', TensorFlow: 'ai', 'Computer Vision': 'ai',
  'Hugging Face': 'ai', 'scikit-learn': 'ai', NumPy: 'data', Pandas: 'data', 'Data Visualization': 'data',
};

export const ARCHETYPES = [
  { key: 'backend', core: ['Express', 'MongoDB', 'JavaScript'], extra: ['PostgreSQL', 'WebSockets', 'Docker', 'Testing', 'Payments'] },
  { key: 'frontend', core: ['React', 'Tailwind CSS', 'JavaScript'], extra: ['Framer Motion', 'GSAP', 'Three.js', 'TypeScript', 'Next.js'] },
  { key: 'fullstack', core: ['React', 'Express', 'MongoDB'], extra: ['TypeScript', 'LLM APIs', 'Docker', 'Prisma'] },
  { key: 'ml', core: ['Python', 'PyTorch', 'scikit-learn'], extra: ['NumPy', 'Pandas', 'Hugging Face', 'FastAPI', 'LLM APIs'] },
  { key: 'vision', core: ['Python', 'Computer Vision', 'TensorFlow'], extra: ['PyTorch', 'NumPy', 'Flask', 'Docker'] },
  { key: 'designer', core: ['UI/UX Design', 'Figma'], extra: ['Tailwind CSS', 'React', 'Framer Motion', 'Product Pitching'] },
  { key: 'devops', core: ['Docker', 'CI_CD', 'Testing'], extra: ['Python', 'PostgreSQL', 'Express', 'FastAPI'] },
  { key: 'pitch', core: ['Product Pitching', 'Technical Writing'], extra: ['Figma', 'Data Visualization', 'UI/UX Design'] },
  { key: 'data', core: ['Python', 'Pandas', 'Data Visualization'], extra: ['NumPy', 'scikit-learn', 'PostgreSQL', 'Flask'] },
  { key: 'mobile', core: ['React Native', 'JavaScript', 'TypeScript'], extra: ['Flutter', 'Dart', 'Express'] },
];

export const REPO_NAMES = [
  'campus-connect', 'budget-tracker', 'chat-app', 'portfolio-v2', 'api-gateway', 'study-planner',
  'recipe-finder', 'health-log', 'bus-tracker', 'ml-pipeline', 'image-classifier', 'dashboard-kit',
  'inventory-api', 'event-board', 'quiz-arena', 'notes-sync', 'crop-advisor', 'ticket-desk',
];

export const FIRST_NAMES = [
  'Aarav', 'Diya', 'Kabir', 'Meera', 'Rohan', 'Ananya', 'Vihaan', 'Ishita', 'Arjun', 'Naina',
  'Yash', 'Tara', 'Dev', 'Riya', 'Neel', 'Sana', 'Karan', 'Pooja', 'Aditya', 'Lina',
  'Omar', 'Chloe', 'Mateo', 'Priya', 'Leo', 'Zara', 'Samir', 'Hana', 'Ethan', 'Mira',
  'Tomas', 'Ayesha', 'Noah', 'Kavya', 'Ravi', 'Elena', 'Jai', 'Sofia', 'Imran', 'Nisha',
];

export const TIMEZONES = ['UTC+5:30', 'UTC+5:30', 'UTC+5:30', 'UTC+0', 'UTC+1', 'UTC-5', 'UTC+8'];
export const AVAILABILITY = ['full-time', 'evenings', 'weekends'];
export const NOTES = [
  'shipped on time', 'great communicator', 'strong on polish', 'carried the backend',
  'went quiet mid-event', 'great at demos', 'solid under pressure', 'missed the deadline',
];