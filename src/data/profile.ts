/**
 * Single source of truth for every piece of content on the site.
 * Only verified facts live here — edit this file to update the portfolio.
 */

export const profile = {
  name: 'Satyam Shukla',
  firstName: 'Satyam',
  lastName: 'Shukla',
  roles: ['Full-Stack Developer', 'Laravel Specialist', 'Cloud & Mobile Developer'],
  headline: 'Building scalable digital experiences from backend to cloud.',
  intro:
    'I build complete web products — Laravel APIs and CRM systems, the interfaces people use every day, and the Linux servers they run on. Nearly four years of shipping business software end to end.',
  email: 'shuklasatyam23056@gmail.com',
  phone: '+91-6393805011',
  phoneHref: 'tel:+916393805011',
  linkedin: 'https://www.linkedin.com/in/satyam-shukla-46925021b',
  linkedinLabel: 'linkedin.com/in/satyam-shukla-46925021b',
  resume: '/Satyam-Shukla-Resume.pdf',
  availability: 'Open to full-time roles & freelance projects',
  experienceYears: '3.8',
  company: 'Digicrome Pvt Ltd',
} as const

export const heroKeywords = ['Laravel', 'REST APIs', 'CRM Systems', 'MySQL', 'AWS', 'Nginx', 'React', 'Flutter']

export const about = {
  lead: 'I’m a backend-first full-stack developer. I care about the parts users never see — clean data models, predictable APIs, permissions that hold up — and the parts they do.',
  paragraphs: [
    'For about 3.8 years at Digicrome Pvt Ltd I’ve built and maintained Laravel applications that teams depend on daily: CRM and lead-management systems, internal business workflows, public websites and the APIs behind them.',
    'The work rarely stops at the code. I deploy what I build to Linux servers, configure Nginx, domains and SSL, and troubleshoot production when something misbehaves. That full loop — requirement to running system — is where I do my best work.',
    'Lately I’ve been extending that reach to the client side with React and Next.js, and to mobile with Flutter apps that talk to Laravel backends.',
  ],
  principles: [
    { title: 'Model the business first', body: 'Good software starts from the workflow — stages, roles, edge cases — before a single migration is written.' },
    { title: 'Boring, reliable backends', body: 'Validation at the edge, policies for access, queues for slow work. Predictable beats clever.' },
    { title: 'Ship, then measure', body: 'Get it into production, watch logs and queries, and optimise where it actually matters.' },
  ],
}

export const experience = {
  role: 'Software Developer',
  company: 'Digicrome Pvt Ltd',
  duration: '~3.8 years · Present',
  summary: 'Laravel / full-stack developer owning features from database schema to deployment.',
  // Areas of ownership in the role (not dated milestones).
  tracks: [
    {
      title: 'CRM & lead management',
      body: 'Lead capture, assignment and tracking with stages, comments, activity history, role-based permissions and reporting dashboards.',
      tags: ['Laravel', 'MySQL', 'RBAC', 'Dashboards'],
    },
    {
      title: 'Business workflows',
      body: 'CRM, HRMS and ERP-style modules — approval flows, scheduled jobs, queued notifications and admin panels.',
      tags: ['Queues', 'Scheduler', 'Eloquent'],
    },
    {
      title: 'APIs & integrations',
      body: 'RESTful APIs for web and mobile clients, third-party API integrations, webhooks and automation between systems.',
      tags: ['REST', 'Webhooks', 'Auth'],
    },
    {
      title: 'Websites & landing pages',
      body: 'Responsive Laravel + Blade websites with lead-generation forms, SEO fundamentals and performance tuning.',
      tags: ['Blade', 'Bootstrap 5', 'jQuery / AJAX'],
    },
    {
      title: 'Deployment & production',
      body: 'Linux / Ubuntu servers, Nginx and Apache, domains, DNS and SSL, AWS EC2 / S3 / IAM, and production troubleshooting.',
      tags: ['AWS', 'Nginx', 'Linux'],
    },
  ],
}

export type Level = 'Core' | 'Strong' | 'Working' | 'Growing'

export const levelInfo: Record<Level, { label: string; note: string; dots: number }> = {
  Core: { label: 'Core', note: 'Daily, production-grade', dots: 4 },
  Strong: { label: 'Strong', note: 'Regular use in shipped work', dots: 3 },
  Working: { label: 'Working', note: 'Used in real projects', dots: 2 },
  Growing: { label: 'Growing', note: 'Actively building depth', dots: 1 },
}

export type SkillGroup = {
  id: string
  title: string
  kicker: string
  description: string
  accent: 'ember' | 'volt' | 'aqua' | 'mist'
  items: { name: string; level: Level }[]
}

export const skillGroups: SkillGroup[] = [
  {
    id: 'backend',
    title: 'Backend',
    kicker: 'Primary strength',
    description: 'Laravel applications with clean architecture, solid data models and secure access control.',
    accent: 'ember',
    items: [
      { name: 'PHP', level: 'Core' },
      { name: 'Laravel', level: 'Core' },
      { name: 'RESTful API Development', level: 'Core' },
      { name: 'Authentication & Authorization', level: 'Core' },
      { name: 'MVC Architecture', level: 'Core' },
      { name: 'Eloquent ORM', level: 'Core' },
      { name: 'MySQL', level: 'Core' },
      { name: 'Database Design & Query Optimization', level: 'Strong' },
      { name: 'Queue Jobs & Scheduled Tasks', level: 'Strong' },
      { name: 'Role-Based Access Control', level: 'Core' },
      { name: 'CRM, HRMS & ERP Workflows', level: 'Core' },
      { name: 'Third-Party API Integrations', level: 'Strong' },
      { name: 'Webhooks & Automation', level: 'Strong' },
      { name: 'Secure, Maintainable Architecture', level: 'Strong' },
    ],
  },
  {
    id: 'frontend',
    title: 'Frontend',
    kicker: 'Interfaces',
    description: 'Responsive, accessible UIs — from Blade + Bootstrap to modern React component architecture.',
    accent: 'volt',
    items: [
      { name: 'HTML5', level: 'Core' },
      { name: 'CSS3', level: 'Core' },
      { name: 'JavaScript', level: 'Strong' },
      { name: 'Blade Templates', level: 'Core' },
      { name: 'Bootstrap 5', level: 'Core' },
      { name: 'Responsive Web Design', level: 'Core' },
      { name: 'jQuery', level: 'Strong' },
      { name: 'AJAX', level: 'Strong' },
      { name: 'UI/UX Implementation', level: 'Strong' },
      { name: 'React.js', level: 'Working' },
      { name: 'Next.js', level: 'Growing' },
      { name: 'Modern Animations & Interactive UI', level: 'Working' },
    ],
  },
  {
    id: 'cloud',
    title: 'Cloud & DevOps',
    kicker: 'Production',
    description: 'Getting applications onto servers and keeping them healthy, secure and fast.',
    accent: 'aqua',
    items: [
      { name: 'Linux & Ubuntu', level: 'Strong' },
      { name: 'Nginx', level: 'Strong' },
      { name: 'Apache', level: 'Strong' },
      { name: 'Git & GitHub', level: 'Core' },
      { name: 'Cloud Deployment', level: 'Strong' },
      { name: 'Server Configuration', level: 'Strong' },
      { name: 'Domain & DNS Configuration', level: 'Strong' },
      { name: 'SSL & HTTPS', level: 'Strong' },
      { name: 'Production Troubleshooting', level: 'Strong' },
      { name: 'Performance Optimization', level: 'Strong' },
      { name: 'AWS (EC2, S3, IAM)', level: 'Working' },
      { name: 'CI/CD Fundamentals', level: 'Growing' },
    ],
  },
  {
    id: 'mobile',
    title: 'Mobile',
    kicker: 'Cross-platform',
    description: 'Flutter apps backed by Laravel APIs — authentication, sessions and real data flows.',
    accent: 'mist',
    items: [
      { name: 'Flutter', level: 'Growing' },
      { name: 'Dart', level: 'Growing' },
      { name: 'Cross-Platform App Development', level: 'Growing' },
      { name: 'REST API Integration', level: 'Working' },
      { name: 'Auth & Session Management', level: 'Working' },
      { name: 'Mobile UI Development', level: 'Growing' },
      { name: 'Backend Integration with Laravel', level: 'Strong' },
      { name: 'Push Notifications', level: 'Growing' },
    ],
  },
]

export const tools = ['Git', 'GitHub', 'Postman', 'Composer', 'npm', 'MySQL', 'phpMyAdmin', 'cPanel', 'Linux CLI', 'AI-Assisted Dev Tools']

export type Project = {
  id: string
  index: string
  title: string
  category: string
  summary: string
  features: string[]
  stack: string[]
  status: string
  /** Opens an in-browser interactive demo with sample data. */
  demo?: 'crm'
  links?: { label: string; href: string }[]
  palette: [string, string]
}

/**
 * Client/company work is private, so no public URLs are listed.
 * Add real `links` here as public repos or live demos become available.
 */
export const projects: Project[] = [
  {
    id: 'crm',
    index: '01',
    title: 'CRM & Lead Management System',
    category: 'Business software · Laravel',
    summary:
      'A lead pipeline for sales teams: capture leads from forms and integrations, assign them to agents, move them through stages and keep a full activity trail.',
    features: ['Lead assignment & tracking', 'Roles & permissions', 'Stages, comments & activity history', 'Reporting dashboards', 'Third-party integrations'],
    stack: ['Laravel', 'PHP', 'MySQL', 'Blade', 'jQuery / AJAX', 'Bootstrap 5'],
    status: 'Production · company work (private)',
    demo: 'crm',
    palette: ['#ff7a1a', '#6d6cf7'],
  },
  {
    id: 'web',
    index: '02',
    title: 'Business Websites & Landing Pages',
    category: 'Marketing sites · Laravel + Blade',
    summary:
      'Responsive company websites and campaign landing pages built to convert — fast pages, clean markup and lead forms wired straight into the CRM.',
    features: ['Laravel & Blade development', 'Responsive UI', 'Lead-generation forms', 'SEO & performance optimization'],
    stack: ['Laravel', 'Blade', 'Bootstrap 5', 'JavaScript', 'MySQL'],
    status: 'Production · company work (private)',
    palette: ['#6d6cf7', '#5cc8ff'],
  },
  {
    id: 'cloud',
    index: '03',
    title: 'Cloud-Hosted Web Applications',
    category: 'Infrastructure · Linux',
    summary:
      'Taking Laravel applications from repository to running service: provisioning Ubuntu servers, configuring Nginx and PHP-FPM, SSL, DNS and keeping things healthy.',
    features: ['Linux server deployment', 'Nginx configuration', 'Domains, DNS & SSL', 'Hosting & troubleshooting'],
    stack: ['Ubuntu', 'Nginx', 'Apache', 'AWS EC2 / S3', 'Git'],
    status: 'Ongoing responsibility',
    palette: ['#5cc8ff', '#ff7a1a'],
  },
  {
    id: 'react',
    index: '04',
    title: 'React & Next.js Interfaces',
    category: 'Frontend · Growing practice',
    summary:
      'Component-driven frontends that consume Laravel APIs — reusable UI, responsive layouts and typed data fetching. This portfolio is one of them.',
    features: ['Modern frontend architecture', 'Responsive interfaces', 'API integration'],
    stack: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
    status: 'Active learning & side projects',
    palette: ['#8b8cff', '#ff9447'],
  },
  {
    id: 'flutter',
    index: '05',
    title: 'Flutter Mobile Applications',
    category: 'Mobile · Cross-platform',
    summary:
      'Cross-platform apps with login, sessions and API-connected screens backed by Laravel — one codebase for Android and iOS.',
    features: ['Cross-platform UI development', 'API-connected workflows', 'Auth & session handling'],
    stack: ['Flutter', 'Dart', 'Laravel API', 'REST'],
    status: 'In development · growing skill',
    palette: ['#5cc8ff', '#8b8cff'],
  },
]

export const expertise = [
  { title: 'Backend architecture & API design', body: 'Resourceful REST endpoints, form requests for validation, service classes for business logic, consistent JSON responses.' },
  { title: 'Database structure & optimization', body: 'Normalised schemas, proper indexes, eager loading to kill N+1 queries, and reading query plans when pages slow down.' },
  { title: 'Authentication & access control', body: 'Session and token auth, gates, policies and role-based permissions that decide who sees and edits what.' },
  { title: 'Frontend ↔ backend integration', body: 'Blade, AJAX or React clients talking to the same well-defined API, with sensible error and loading states.' },
  { title: 'Third-party services & automation', body: 'Webhooks in, API calls out, queued jobs and schedulers so slow or repetitive work never blocks a user.' },
  { title: 'Deployment & production', body: 'Ubuntu, Nginx, PHP-FPM, SSL and DNS — plus the log-reading and debugging when production needs attention.' },
]

export const workflow = [
  { step: 'Discover', body: 'Sit with the people who will use it. Map the real workflow, the roles involved and what “done” means.' },
  { step: 'Plan', body: 'Break it into entities, relationships and endpoints. Decide what is synchronous and what belongs in a queue.' },
  { step: 'Design', body: 'Database schema, API contracts and UI flows — reviewed before code, so surprises surface early.' },
  { step: 'Develop', body: 'Small, reviewable increments in Laravel and the frontend, with validation and permissions built in from the start.' },
  { step: 'Test', body: 'Exercise APIs in Postman, walk every role through the UI and try the edge cases on purpose.' },
  { step: 'Deploy', body: 'Ship to a Linux server behind Nginx with SSL, environment config and migrations handled carefully.' },
  { step: 'Optimize', body: 'Watch logs and slow queries in production, add indexes and caching, and iterate on real feedback.' },
]

export const navLinks = [
  { href: '#about', label: 'About' },
  { href: '#skills', label: 'Skills' },
  { href: '#work', label: 'Work' },
  { href: '#architecture', label: 'Architecture' },
  { href: '#process', label: 'Process' },
  { href: '#contact', label: 'Contact' },
]
