// Application Volume Over Time (Section 2 - Doom Loop)
export const applicationVolumeData = [
  { period: "2021 Q4", appsPerJob: 74 },
  { period: "2022 Q2", appsPerJob: 95 },
  { period: "2022 Q4", appsPerJob: 110 },
  { period: "2023 Q2", appsPerJob: 130 },
  { period: "2023 Q4", appsPerJob: 155 },
  { period: "2024 Q1", appsPerJob: 222 },
  { period: "2024 Q4", appsPerJob: 260 },
  { period: "2025 Q2", appsPerJob: 310 },
];

// Human Cost Stats (Section 2 - Doom Loop)
export const humanCostData = [
  { label: "Job search affects mental health", value: 72, suffix: "%" },
  { label: "Job seekers ghosted after interview", value: 61, suffix: "% (+9pp YoY)" },
  { label: "Recruiters experiencing burnout", value: 53, suffix: "%" },
  { label: "Ghost job postings", value: 27, suffix: "%" },
];

// CS Graduate Unemployment Comparison (Section 2)
export const csGradData = [
  { major: "CS Graduates", rate: 6.1 },
  { major: "National Average", rate: 4.3 },
  { major: "Philosophy", rate: 3.2 },
  { major: "Art History", rate: 3.0 },
];

// Emerging Roles Growth (Section 5)
export const roleGrowthData = [
  { role: "Agentic AI Engineer", growth: 985, salaryRange: "$120K–$400K+" },
  { role: "Chief AI Officer", growth: 200, salaryRange: "$200K–$643K+" },
  { role: "AI Ethics/Governance", growth: 150, salaryRange: "$120K–$280K" },
  { role: "AI/ML Engineer", growth: 143, salaryRange: "$100K–$350K+" },
  { role: "Prompt Engineer", growth: 136, salaryRange: "$100K–$270K+" },
];

// Salary Range Data (Section 5)
export const salaryRangeData = [
  { role: "Agentic AI Engineer", min: 120, max: 400 },
  { role: "AI/ML Engineer", min: 100, max: 350 },
  { role: "Prompt Engineer", min: 100, max: 270 },
  { role: "Chief AI Officer", min: 200, max: 643 },
  { role: "AI Ethics/Governance", min: 120, max: 280 },
  { role: "Cybersecurity Engineer", min: 118, max: 191 },
  { role: "DevOps Engineer", min: 118, max: 174 },
];

// Entry-Level Squeeze (Section 5)
export const entryLevelSqueezeData = [
  { label: "Entry-level hiring rates", change: -73 },
  { label: "U.S. programmer employment", change: -27.5 },
  { label: "All-level hiring rates", change: -7 },
  { label: "Software developer employment", change: -0.3 },
];

// Skills Radar Data (Section 6)
export const skillsRadarData = [
  { skill: "Python", employer: 90, avgGrad: 70 },
  { skill: "AI/ML", employer: 85, avgGrad: 40 },
  { skill: "Cloud (AWS)", employer: 75, avgGrad: 30 },
  { skill: "System Design", employer: 80, avgGrad: 35 },
  { skill: "Communication", employer: 92, avgGrad: 55 },
  { skill: "Problem Solving", employer: 88, avgGrad: 60 },
];

// Pipeline Stage Data (Section 1)
export const pipelineStages = [
  {
    id: "resume",
    title: "Résumé Screen",
    icon: "FileText",
    aiPercent: 82,
    detail: "0.3s to reject. 75% eliminated before human review. 95% parsing accuracy.",
  },
  {
    id: "chatbot",
    title: "Chatbot Screen",
    icon: "Bot",
    aiPercent: 73,
    detail: "Response time dropped from 7 days to <24 hours. 90% of tasks automated.",
  },
  {
    id: "assessment",
    title: "Tech Assessment",
    icon: "Code",
    aiPercent: 97,
    detail: "97% of developers use AI tools. AI-assisted IDE environments now standard.",
  },
  {
    id: "interview",
    title: "AI Interview",
    icon: "Video",
    aiPercent: 34,
    detail: "20M assessments in Q1 2024. 15x faster than human reviewers. 94% consistency.",
  },
  {
    id: "decision",
    title: "Human Decision",
    icon: "User",
    aiPercent: 15,
    detail: "Final stage — for now. 85% time savings and 78% cost savings with AI assistance.",
  },
];

// Threat Dashboard Data (Section 3)
export const threatData = [
  { label: "Deepfake voice increase (YoY)", value: "756%", color: "coral" as const },
  { label: "Fake applicants (Pindrop study)", value: "12.5%", color: "coral" as const },
  { label: "Workers using AI secretly in interviews", value: "20%", color: "gold" as const },
  { label: "Time to create synthetic identity", value: "70 min", color: "gold" as const },
  { label: "Companies hired NK operatives", value: "300+", color: "coral" as const },
];

// Company Response Timeline (Section 3)
export const companyTimelineData = [
  { date: "2024 Q4", event: "HireVue drops facial analysis permanently", type: "ban" as const },
  { date: "2025 Feb", event: "Google CEO suggests return to in-person interviews", type: "analog" as const },
  { date: "2025 Q1", event: "Amazon bans AI tools during interviews", type: "ban" as const },
  { date: "2025 Jun", event: "Goldman Sachs tells students to stop using ChatGPT", type: "ban" as const },
  { date: "2025 Jun", event: "DOJ indicts 14 North Korean IT worker operatives", type: "enforcement" as const },
  { date: "2025 Q3", event: "Deloitte UK returns to face-to-face graduate interviews", type: "analog" as const },
  { date: "2025 Q4", event: "Google reinstates in-person engineering interviews", type: "analog" as const },
  { date: "2026 Q1", event: "Gartner: 75% of hiring will test AI proficiency by 2027", type: "standard" as const },
];

// Platform Data (Section 4)
export const platformData = [
  {
    name: "HireVue",
    category: "AI Video Interview",
    metric: "20M assessments/quarter",
    clients: "Goldman Sachs, Unilever, IKEA, Vodafone",
    measures: "Verbal content, communication clarity, structured response quality",
    prep: "Practice STAR method responses. Look into camera. Keep answers under 90 seconds.",
  },
  {
    name: "Paradox (Olivia)",
    category: "Conversational AI",
    metric: "100+ languages, 24/7",
    clients: "McDonald's, GM, Chipotle, Nestlé, 7-Eleven",
    measures: "Response time, qualification matching, scheduling efficiency",
    prep: "Respond promptly to chatbot messages. Be concise and direct with answers.",
  },
  {
    name: "Mercor",
    category: "AI Recruiting Marketplace",
    metric: "$10B valuation",
    clients: "OpenAI, Anthropic, AI labs",
    measures: "20-min AI interviews evaluating technical + soft skills",
    prep: "Prepare for conversational AI interviews testing both coding and communication.",
  },
  {
    name: "HackerRank",
    category: "Technical Assessment",
    metric: "300K+ candidates assessed",
    clients: "Adobe, Netflix, Spotify",
    measures: "AI-assisted IDE coding, problem-solving approach, code quality",
    prep: "Practice with AI copilots. Focus on problem decomposition, not memorized algorithms.",
  },
  {
    name: "Eightfold AI",
    category: "Talent Intelligence",
    metric: "$2B+ valuation",
    clients: "Enterprise companies",
    measures: "Career trajectory prediction, skill inference from experience",
    prep: "Keep LinkedIn updated. Highlight transferable skills and growth trajectory.",
  },
  {
    name: "Workday",
    category: "ATS + AI Agent",
    metric: "Enterprise standard",
    clients: "Fortune 500 companies",
    measures: "Keyword matching, qualification fit, application completeness",
    prep: "Use exact keywords from job descriptions. Quantify achievements with numbers.",
  },
];

// Unilever Case Study (Section 4)
export const unileverStats = [
  { label: "Applications/year processed", value: "1.8M" },
  { label: "Reduction in time-to-hire", value: "90%" },
  { label: "Hours saved in 18 months", value: "50K+" },
  { label: "Annual cost savings", value: "£1M+" },
  { label: "Increase in diversity of hires", value: "16%" },
  { label: "AI-screened passed human interviews", value: "53.12%" },
];

// Table of Contents sections
export const tocSections = [
  { id: "hero", label: "Introduction" },
  { id: "pipeline", label: "The AI Pipeline" },
  { id: "doom-loop", label: "The Doom Loop" },
  { id: "trust-crisis", label: "Trust Crisis" },
  { id: "platforms", label: "Platforms" },
  { id: "emerging-roles", label: "Emerging Roles" },
  { id: "skills", label: "Skills" },
  { id: "playbook", label: "Playbook" },
  { id: "conclusion", label: "Conclusion" },
];
