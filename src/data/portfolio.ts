export type AppId =
  | "about"
  | "projects"
  | "experience"
  | "contact"
  | "browser"
  | "qrcode"
  | "dino"
  | "minesweeper"
  | "trash";

export const GAME_APP_IDS: AppId[] = ["dino", "minesweeper"];
export const UTILITY_APP_IDS: AppId[] = ["qrcode"];

export const profile = {
  name: "Tran Linh",
  fullName: "Tran Quoc Linh",
  role: "Fullstack Software Engineer",
  careerStartYear: 2020,
  bio: "Fullstack engineer building AI-assisted products and polished web platforms end to end — from architecture and APIs to responsive UIs. Currently shipping production AI workflows at Amaris Consulting, with prior experience across startups and large tech (Clickal, VNG, KamiMind, Manabie, and more).",
  education: {
    degree: "Bachelor's Degree in Computer Science",
    school: "Ton Duc Thang University",
    location: "Ho Chi Minh City",
    year: "2021",
  },
  languages: [
    { name: "English", level: "Good" },
    { name: "Vietnamese", level: "Mother Tongue" },
  ],
  skills: {
    languages: ["JavaScript", "TypeScript", "Python", "HTML", "CSS"],
    frontend: [
      "React.js",
      "Next.js",
      "Angular",
      "Electron",
      "Tailwind CSS",
      "Ant Design",
      "ShadCN UI",
      "Material UI",
    ],
    backend: ["Node.js", "REST APIs", "Prisma", "GraphQL", "Apollo"],
    databases: ["PostgreSQL", "MongoDB", "Firebase", "Redis"],
    testing: ["Jest", "React Testing Library", "Cypress", "Cucumber BDD"],
    devops: ["Git", "Docker", "Jenkins"],
    other: [
      "Chrome Extension Development",
      "Electron multi-platform apps",
      "PostHog",
      "OpenObserve",
      "Strapi CMS",
    ],
  },
  contact: {
    email: "tranquoclinh247@gmail.com",
    linkedin: "https://www.linkedin.com/in/tql247/",
    github: "https://github.com/7inh",
    location: "Ho Chi Minh City, Vietnam",
  },
} as const;

export function getYearsOfExperience(
  now: Date = new Date(),
  startYear: number = profile.careerStartYear
) {
  return Math.max(1, now.getFullYear() - startYear);
}

export type ExperienceItem = {
  company: string;
  period: string;
  role: string;
  project: string;
  teamSize?: number;
  context?: string;
  functions?: string[];
  responsibilities: string[];
  technologies: string[];
};

export const experience: ExperienceItem[] = [
  {
    company: "Amaris Consulting",
    period: "10/2025 – Now",
    role: "Software Developer",
    project: "BOSCH — TARA Copilot",
    context:
      "A production-ready, AI-driven workflow management platform for Threat Analysis and Risk Assessment (TARA). Helps organizations build, manage, and validate complex assessment workflows using customizable templates and AI assistance. Supports privacy impact assessments, risk identification, and alignment with standards such as ISO/SAE 21434.",
    functions: [
      "Create new TARA projects with step-by-step AI guidance",
      "AI chat that understands project templates and provides contextual support",
      "Manage workflows: track progress, validate steps, export results to Excel",
      "Integrate with external tools via REST APIs and webhooks",
    ],
    responsibilities: [
      "Built the entire platform independently from the ground up",
      "Full-stack development: architecture design, core features, and end-to-end delivery",
    ],
    technologies: [
      "React",
      "Next.js",
      "TypeScript",
      "CSS Modules",
      "Node.js",
      "Prisma",
      "REST APIs",
      "PostgreSQL",
    ],
  },
  {
    company: "Clickal JSC",
    period: "2024 – 2025",
    role: "Software Developer",
    project: "ClickAI Web and Chrome Extension",
    teamSize: 5,
    responsibilities: [
      "Built AI community platform including AI Chat, AI Creative (image/video/audio), AI Courses, and Community features",
      "Developed Chrome Extension for AI tools access inside the browser",
      "Optimized SEO, performance, and responsiveness across desktop, mobile, and extension",
    ],
    technologies: [
      "React",
      "Next.js",
      "TypeScript",
      "ShadcnUI",
      "Ant Design",
      "TailwindCSS",
      "PostgreSQL",
    ],
  },
  {
    company: "VNG Corporation",
    period: "2024",
    role: "Software Engineer",
    project: "Digital Business Landing Pages & Internal Apps",
    teamSize: 6,
    responsibilities: [
      "Developed high-performance landing pages with Next.js and Angular",
      "Integrated observability tools (PostHog, OpenObserve) and Strapi CMS",
      "Built Electron apps for multi-platform deployment",
    ],
    technologies: [
      "Next.js",
      "Angular",
      "Electron",
      "Strapi CMS",
      "PostHog",
      "OpenObserve",
    ],
  },
  {
    company: "KamiMind",
    period: "2023 – 2024",
    role: "Software Engineer",
    project: "KamiMind AI Chat SaaS",
    teamSize: 4,
    responsibilities: [
      "Built entire AI Chat Platform from scratch",
      "Improved platform performance by 15% via caching",
    ],
    technologies: ["React", "Next.js", "Node.js", "PostgreSQL", "Redis"],
  },
  {
    company: "Manabie",
    period: "2022 – 2023",
    role: "Software Engineer",
    project: "Education Platform Calendar",
    teamSize: 8,
    responsibilities: [
      "Led development of calendar feature in LMS",
      "Maintained 70%+ unit and E2E test coverage",
    ],
    technologies: ["React", "GraphQL", "Apollo", "Jest", "Cypress"],
  },
  {
    company: "Yedda AI",
    period: "2020 – 2022",
    role: "Software Developer",
    project: "AI Automation Tools",
    teamSize: 6,
    responsibilities: [
      "Built internal automation tools increasing efficiency by 40%",
      "Delivered full-stack solutions across web, mobile, and desktop",
    ],
    technologies: ["React Native", "Node.js", "Electron", "MongoDB"],
  },
  {
    company: "Dai Phat Solutions",
    period: "2020",
    role: "AI Engineer",
    project: "AI Forecasting & Chatbot",
    teamSize: 3,
    responsibilities: [
      "Researched and implemented ML models: NLP & Time Series",
      "Developed AI-driven web/desktop apps",
    ],
    technologies: [
      "Python",
      "TensorFlow",
      "scikit-learn",
      "React",
      "Electron",
    ],
  },
];

export type ProjectItem = {
  name: string;
  period: string;
  kind: "featured" | "side";
  company?: string;
  description: string;
  technologies: string[];
};

export const projects: ProjectItem[] = [
  {
    name: "TARA Copilot",
    period: "10/2025 – Now",
    kind: "featured",
    company: "Amaris / BOSCH",
    description:
      "AI-driven TARA workflow platform — templates, guided project creation, contextual AI chat, Excel export, and REST/webhook integrations.",
    technologies: ["Next.js", "TypeScript", "Node.js", "Prisma", "PostgreSQL"],
  },
  {
    name: "ClickAI",
    period: "2024 – 2025",
    kind: "featured",
    company: "Clickal JSC",
    description:
      "AI community platform with chat, creative tools, courses, and a Chrome Extension for in-browser AI access.",
    technologies: ["Next.js", "TypeScript", "ShadcnUI", "TailwindCSS", "PostgreSQL"],
  },
  {
    name: "DORI",
    period: "2024",
    kind: "side",
    description:
      "Image annotation tool for object detection, text detection, data extraction, classification, rectification, table structure recognition, and key/relation extraction.",
    technologies: ["React", "Next.js", "TypeScript", "FabricJS"],
  },
  {
    name: "Smart Farm",
    period: "2022",
    kind: "side",
    description:
      "Complete IoT solution for automatic plant care — web, mobile, and ESP8266 hardware.",
    technologies: [
      "React",
      "Node.js",
      "React Native",
      "ESP8266",
      "PostgreSQL",
      "Firebase",
    ],
  },
];

export const apps: {
  id: AppId;
  title: string;
  label: string;
  defaultSize: { width: number; height: number };
}[] = [
  {
    id: "about",
    title: "About — Tran Linh",
    label: "About",
    defaultSize: { width: 520, height: 560 },
  },
  {
    id: "projects",
    title: "Projects",
    label: "Projects",
    defaultSize: { width: 580, height: 520 },
  },
  {
    id: "experience",
    title: "Experience",
    label: "Experience",
    defaultSize: { width: 620, height: 560 },
  },
  {
    id: "contact",
    title: "Contact",
    label: "Contact",
    defaultSize: { width: 420, height: 420 },
  },
  {
    id: "browser",
    title: "Browser",
    label: "Browser",
    defaultSize: { width: 760, height: 560 },
  },
  {
    id: "qrcode",
    title: "QR Code Generator",
    label: "QR Code",
    defaultSize: { width: 380, height: 480 },
  },
  {
    id: "dino",
    title: "Dinosaur Game",
    label: "Dinosaur Game",
    defaultSize: { width: 720, height: 420 },
  },
  {
    id: "minesweeper",
    title: "Minesweeper",
    label: "Minesweeper",
    defaultSize: { width: 420, height: 500 },
  },
  {
    id: "trash",
    title: "Trash",
    label: "Trash",
    defaultSize: { width: 640, height: 440 },
  },
];

export type TrashItem = {
  name: string;
  kind: string;
  dateDeleted: string;
  size: string;
  href: string;
  embedUrl: string;
};

export const trashItems: TrashItem[] = [
  {
    name: "spicy.mov",
    kind: "Movie",
    dateDeleted: "Today",
    size: "4.2 MB",
    href: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1",
  },
];
