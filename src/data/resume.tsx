import { Icons } from "@/components/icons";
import { BriefcaseBusinessIcon, HomeIcon } from "lucide-react";
import type { ComponentType, ReactNode } from "react";

type Skill = {
  name: string;
  icon?: ComponentType<{ className?: string }>;
};

type Hackathon = {
  title: string;
  dates: string;
  location?: string;
  description?: string;
  image?: string;
  links?: {
    title: string;
    icon: ReactNode;
    href: string;
  }[];
};

export const DATA = {
  name: "Sai Charan Kalla",
  initials: "SC",
  url: "https://chery60.github.io/Myportfolio",
  location: "Hyderabad, Telangana, India",
  locationLink: "https://www.google.com/maps/place/Hyderabad",
  description:
    "Senior Product Designer crafting precise enterprise, SaaS, and AI-assisted product experiences.",
  summary:
    "I design product systems for teams that need clarity at scale: startups, enterprise companies, and service-based companies. My background in [Computer Science Engineering](#education) helps me partner closely with engineering while shaping [UX design](#skills), research, information architecture, interaction models, and design systems from first principles. Outside product work, I build [vibe-coded tools](#vibe-coding) to explore how AI, canvas interfaces, and working prototypes can help teams move faster.",
  avatarUrl: "/sai-charan.jpeg",
  skills: [
    { name: "Product Design" },
    { name: "UX Design" },
    { name: "UX Research" },
    { name: "Information Architecture" },
    { name: "Interaction Design" },
    { name: "Wireframing" },
    { name: "Prototyping" },
    { name: "Visual Design" },
    { name: "UI Design" },
    { name: "Design Systems" },
    { name: "Design Thinking" },
    { name: "User Flows" },
    { name: "Usability Testing" },
    { name: "Journey Mapping" },
    { name: "Mobile UX Design" },
    { name: "Enterprise UX" },
    { name: "SaaS Workflows" },
    { name: "Accessibility" },
  ] as Skill[],
  navbar: [
    { href: "/", icon: HomeIcon, label: "Home" },
    { href: "/blog", icon: BriefcaseBusinessIcon, label: "Projects" },
  ],
  contact: {
    email: "kc60488charan@gmail.com",
    tel: "+919494244743",
    social: {
      GitHub: {
        name: "GitHub",
        url: "https://github.com/chery60",
        icon: Icons.github,
        navbar: false,
      },

      LinkedIn: {
        name: "LinkedIn",
        url: "https://www.linkedin.com/in/sai-charan-92a8ab13b/",
        icon: Icons.linkedin,

        navbar: true,
      },
      X: {
        name: "X",
        url: "#",
        icon: Icons.x,

        navbar: false,
      },
      Youtube: {
        name: "Youtube",
        url: "#",
        icon: Icons.youtube,
        navbar: false,
      },
      email: {
        name: "Send Email",
        url: "mailto:kc60488charan@gmail.com",
        icon: Icons.email,

        navbar: true,
      },
    },
  },

  work: [
    {
      company: "Toddle",
      href: "https://www.toddleapp.com/",
      badges: [],
      location: "Bengaluru, Karnataka, India",
      title: "Senior Product Designer",
      logoUrl: "/logo-toddle.png",
      start: "April 2024",
      end: "Present",
      description:
        "Owns core learning platform experiences including planning, courses, curriculum publishing, weekly planning, and datasets. Drives end-to-end product design while scaling the design system through ownership of data grid, table, and list components.",
    },
    {
      company: "Recur Club",
      badges: [],
      href: "https://www.recur.club/",
      location: "Gurugram, Haryana, India",
      title: "Product Designer",
      logoUrl: "/logo-recur-club.png",
      start: "December 2022",
      end: "April 2024",
      description:
        "Worked on a trading platform for companies with recurring revenues. Revamped information architecture through page-visit analysis, contextual mapping, drop-off study, and navigation-flow research; interviewed 30+ investors for an equity product; built component-library support for onboarding; and contributed to AICA, an AI credit-assessment tool.",
    },
    {
      company: "Oracle",
      href: "https://www.oracle.com/",
      badges: [],
      location: "Hyderabad, Telangana, India",
      title: "User Experience Designer",
      logoUrl: "/logo-oracle.png",
      start: "December 2021",
      end: "December 2022",
      description:
        "Designed enterprise food and beverage workflows across Symphony Kiosk, Enterprise Management Console, User Management, and Launch Management. Created sitemaps, user flows, wireframes, high-fidelity prototypes, and Redwood/Alta SE design-system experiences with product owners and engineering teams.",
    },
    {
      company: "Publicis Sapient",
      href: "https://www.publicissapient.com/",
      badges: [],
      location: "Bangalore Urban, Karnataka, India",
      title: "Associate Experience Designer L2",
      logoUrl: "/logo-publicis-sapient.png",
      start: "June 2021",
      end: "December 2021",
      description:
        "Built end-to-end POS advertising flows for Albertsons, including the system used to show ads across store checkout experiences. Also explored AR/VR design as part of the experience design practice.",
    },
    {
      company: "Innominds",
      href: "https://www.innominds.com/",
      badges: [],
      location: "Hyderabad, Telangana, India",
      title: "Trainee - Design Practice",
      logoUrl: "/logo-innominds.png",
      start: "October 2020",
      end: "May 2021",
      description:
        "Designed mobile and dashboard experiences across cold-chain logistics, surgical workflow, UTC, Acevision, and Yogify projects. Worked on interaction flows, registration workflows, heuristic evaluation, and Android Auto-guideline-led mobile design.",
    },
    {
      company: "Scoar",
      href: "#",
      badges: [],
      location: "Kolkata, India",
      title: "UX Designer Intern",
      logoUrl: "",
      start: "July 2020",
      end: "September 2020",
      description:
        "Worked as a UX design intern for an e-learning product, contributing to early user experience and interface design work.",
    },
  ],
  education: [
    {
      school: "University College of Engineering Narasaraopet - JNTUK",
      href: "https://www.linkedin.com/school/university-college-of-engineering-jntuk-narasaraopet/",
      degree: "Bachelor of Technology, Computer Science and Engineering",
      logoUrl: "/logo-jntuk.png",
      start: "2016",
      end: "2020",
    },
    {
      school: "Sri Chaitanya Junior College",
      href: "https://www.linkedin.com/company/sri-chaitanya-educational-institutions/",
      degree: "Intermediate, Mathematics, Physics, Chemistry",
      logoUrl: "/logo-sri-chaitanya.png",
      start: "2014",
      end: "2016",
    },
    {
      school: "APSSDC",
      href: "https://www.linkedin.com/company/apstateskilldevelopment/",
      degree: "UI Designer Internship",
      logoUrl: "/logo-apssdc.png",
      start: "June 2018",
      end: "September 2018",
    },
  ],
  projects: [
    {
      title: "AI Unit Planning",
      href: "/blog/ai-unit-planning",
      dates: "Toddle - 2024",
      active: true,
      description:
        "Unit template customization and AI-assisted unit creation for Toddle planners. I unified planner fields, mapped dataset-backed components, redesigned the template customization workflow, and explored the minimum field context teachers need to generate meaningful unit planners with AI.",
      technologies: [
        "EdTech",
        "AI Workflow",
        "Unit Planning",
        "Template Customization",
        "Dataset Mapping",
        "Information Architecture",
      ],
      links: [
        {
          type: "Case Study",
          href: "/blog/ai-unit-planning",
          icon: <Icons.globe className="size-3" />,
        },
      ],
      image: "/project-ai-unit-planning.png",
      video: "",
    },
    {
      title: "Symphony Kiosk",
      href: "/blog/symphony-kiosk",
      dates: "Oracle FBGBU - 2024",
      active: true,
      description:
        "Guest self-ordering kiosk for QSRs, stadiums, food courts, and fast casual restaurants. I worked through problem discovery, user goals, personas, success metrics, user journeys, task flows, and handoff for an end-to-end food ordering experience.",
      technologies: [
        "Kiosk UX",
        "Enterprise",
        "User Research",
        "Task Flows",
        "Figma",
        "Oracle Redwood",
      ],
      links: [
        {
          type: "Case Study",
          href: "/blog/symphony-kiosk",
          icon: <Icons.globe className="size-3" />,
        },
      ],
      image: "/project-symphony-kiosk.png",
      video: "",
    },
    {
      title: "Companies Platform",
      href: "/blog/companies-platform",
      dates: "Recur Club - 2023",
      active: true,
      description:
        "Information architecture overhaul for a fintech platform that helps startups access recurring revenue financing. I analyzed behavior, drop-offs, user feedback, and heuristic issues to create clearer navigation and reduce product confusion.",
      technologies: [
        "Fintech",
        "Information Architecture",
        "UX Research",
        "Heuristic Review",
        "Navigation Design",
        "Individual",
      ],
      links: [
        {
          type: "Case Study",
          href: "/blog/companies-platform",
          icon: <Icons.globe className="size-3" />,
        },
      ],
      image: "/project-companies-platform.png",
      video: "",
    },
    {
      title: "User Management",
      href: "/blog/user-management",
      dates: "Oracle - 2022",
      active: true,
      description:
        "Unified user-management workflows across POS, EMC, and Back Office modules. The work covered problem framing, filtering and migration complexity, information architecture, low-fidelity wireframes, accessibility specs, and high-fidelity OJET designs.",
      technologies: [
        "Enterprise UX",
        "User Management",
        "Information Architecture",
        "Accessibility",
        "Wireframes",
        "Oracle",
      ],
      links: [
        {
          type: "Case Study",
          href: "/blog/user-management",
          icon: <Icons.globe className="size-3" />,
        },
      ],
      image: "/project-user-management.png",
      video: "",
    },
    {
      title: "Educator Platform",
      href: "/blog/educator-platform",
      dates: "Toddle - 2024",
      active: true,
      description:
        "Assignment assign-flow revamp for educators. I explored user goals, competitor patterns, data outliers, assignment states, visibility and submission rules, permission configuration, time-series behavior, and high-fidelity designs.",
      technologies: [
        "EdTech",
        "Assignment Flows",
        "Data Analysis",
        "Permissions",
        "User Journey",
        "High Fidelity",
      ],
      links: [
        {
          type: "Case Study",
          href: "/blog/educator-platform",
          icon: <Icons.globe className="size-3" />,
        },
      ],
      image: "/project-educator-platform.png",
      video: "",
    },
  ],
  hackathons: [
    {
      title: "AI Portfolio",
      dates: "2025",
      location: "Vibe coded portfolio experiment",
      description:
        "A canvas-based portfolio where recruiters can pan, zoom, explore case studies, chat with an AI assistant, and see real-time presence. Built as a meta case study about designing a portfolio inside the portfolio itself.",
      image: "/project-ai-portfolio.png",
      links: [
        {
          title: "Website",
          icon: <Icons.globe className="h-4 w-4" />,
          href: "https://chery60.github.io/Myportfolio/",
        },
      ],
    },
    {
      title: "Plukrr - Web Extractor",
      dates: "2025",
      location: "Vibe coded Chrome extension concept",
      description:
        "A pixel-perfect web extraction tool for copying elements, full pages, live edits, and multi-step UI flows, turning DOM, CSS, assets, states, and animations into AI-ready prompts or code.",
      image: "/project-engagement-panel.png",
      links: [],
    },
    {
      title: "Venture CRM - Product OS",
      dates: "2026",
      location: "Vibe coded product workspace",
      description:
        "A unified product-development OS that combines AI-assisted PRDs, Excalidraw-style brainstorming, task generation, calendar planning, and workspace isolation in one flow.",
      image: "/project-vibe-lab.png",
      links: [],
    },
  ] as Hackathon[],
} as const;
