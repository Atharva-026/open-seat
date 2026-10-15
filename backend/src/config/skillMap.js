// Maps package names to the skill they demonstrate. Extend freely.
export const NODE_PACKAGES = {
  react: ['React', 'framework'],
  next: ['Next.js', 'framework'],
  vue: ['Vue', 'framework'],
  express: ['Express', 'framework'],
  mongoose: ['MongoDB', 'database'],
  mongodb: ['MongoDB', 'database'],
  pg: ['PostgreSQL', 'database'],
  prisma: ['Prisma', 'database'],
  falkordb: ['FalkorDB', 'database'],
  tailwindcss: ['Tailwind CSS', 'frontend'],
  three: ['Three.js', 'frontend'],
  gsap: ['GSAP', 'frontend'],
  'framer-motion': ['Framer Motion', 'frontend'],
  vite: ['Vite', 'tooling'],
  typescript: ['TypeScript', 'language'],
  'socket.io': ['WebSockets', 'backend'],
  razorpay: ['Payments', 'backend'],
  'groq-sdk': ['LLM APIs', 'ai'],
  openai: ['LLM APIs', 'ai'],
  langchain: ['LangChain', 'ai'],
};

export const PYTHON_PACKAGES = {
  torch: ['PyTorch', 'ai'],
  tensorflow: ['TensorFlow', 'ai'],
  'opencv-python': ['Computer Vision', 'ai'],
  ultralytics: ['Computer Vision', 'ai'],
  transformers: ['Hugging Face', 'ai'],
  numpy: ['NumPy', 'data'],
  pandas: ['Pandas', 'data'],
  'scikit-learn': ['scikit-learn', 'ai'],
  flask: ['Flask', 'framework'],
  django: ['Django', 'framework'],
  fastapi: ['FastAPI', 'framework'],
};

// Where to look inside a repo (covers simple monorepos).
export const NODE_MANIFESTS = [
  'package.json', 'backend/package.json', 'frontend/package.json',
  'client/package.json', 'server/package.json',
];
export const PYTHON_MANIFESTS = ['requirements.txt', 'backend/requirements.txt'];