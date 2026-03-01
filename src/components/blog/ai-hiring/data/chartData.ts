// Table of Contents sections
export const tocSections = [
  { id: "hero", label: "Introduction" },
  { id: "canva", label: "Canva" },
  { id: "shopify", label: "Shopify" },
  { id: "mercor", label: "Mercor" },
  { id: "duolingo", label: "Duolingo" },
  { id: "banning-ai", label: "Banning AI" },
  { id: "what-this-means", label: "What This Means" },
  { id: "sources", label: "Sources" },
];

// Canva interview rounds
export const canvaInterviewRounds = [
  {
    name: "AI-Assisted Programming (AIP)",
    duration: "60 minutes",
    aiAllowed: true,
    description:
      "Open-ended engineering problems. Candidates share their screen with their preferred AI tools ready. Problems are deliberately ambiguous — designing systems, not implementing algorithms.",
    tests: "Decomposing ambiguous requirements, architectural trade-offs, critically reviewing AI-generated code, debugging AI output.",
  },
  {
    name: "System Design & Architecture (SDA)",
    duration: "45 minutes",
    aiAllowed: false,
    description:
      "Whiteboarding session where candidates design scalable solutions from their own understanding. No AI tools permitted.",
    tests: "Fundamental CS knowledge, system design depth, ability to reason without AI assistance.",
  },
];

// Shopify key metrics
export const shopifyMetrics = [
  { label: "Revenue growth Q1", value: "+25%", trend: "up" as const },
  { label: "Q1 Revenue", value: "$1.51B", trend: "up" as const },
];

// Mercor growth timeline
export const mercorTimeline = [
  { date: "Feb 2025", event: "Raised $100M at $2B valuation", value: "$2B" },
  { date: "Oct 2025", event: "Series C: $350M at $10B valuation", value: "$10B" },
  { date: "~11 months", event: "Hit $100M annual recurring revenue", value: "$100M ARR" },
];

// Companies banning AI in interviews
export const banningCompanies = [
  { name: "Amazon", action: "Explicitly bans AI tools during interviews; disqualifies candidates caught cheating" },
  { name: "Google", action: "Reinstated in-person technical interviews for engineering roles" },
  { name: "Goldman Sachs", action: "Told students to stop using ChatGPT" },
  { name: "Anthropic", action: "Asks candidates to demonstrate personal interest without AI mediation" },
  { name: "Meta", action: "Made cheating prevention a company-wide priority" },
  { name: "Deloitte", action: "Returned to face-to-face interviews for UK graduate program" },
];

// Three camps comparison
export const threeCamps = [
  {
    camp: "AI-Required",
    color: "mint" as const,
    companies: "Canva, many startups",
    whatTheyTest: "Judgment with AI tools. Knowing when to prompt, when to override, when AI output needs correction.",
    howToPrepare: "Practice with Copilot, Cursor, or Claude on open-ended engineering problems. Focus on AI collaboration, not LeetCode drills.",
  },
  {
    camp: "AI-Banned",
    color: "coral" as const,
    companies: "Amazon, Google, Goldman Sachs, Meta",
    whatTheyTest: "Unassisted technical ability. Harder questions than previous years, designed to be beyond what AI can trivially solve.",
    howToPrepare: "Traditional data structures, algorithms, and system design. Practice whiteboard communication and thinking out loud. In-person interviews are back.",
  },
  {
    camp: "AI-as-Culture",
    color: "gold" as const,
    companies: "Shopify, Duolingo",
    whatTheyTest: "AI fluency permeates the company culture and factors into performance reviews. Think through an AI-augmented lens.",
    howToPrepare: "Demonstrate where automation fits and where human judgment is irreplaceable. Build projects that show thoughtful AI integration.",
  },
];

// Sources
export const sources: { id: number; text: string; url?: string }[] = [
  { id: 1, text: 'SHRM, "AI in Hiring 2025\u20132026 Survey," Society for Human Resource Management, 2025.' },
  { id: 2, text: 'Resume Builder, "1 in 3 Companies Say AI Will Run Hiring by 2026," ResumeBuilder.com, 2025.' },
  { id: 3, text: 'Simon Newton, "Yes, You Can Use AI in Our Interviews. In Fact, We Insist," Canva Engineering Blog, June 11, 2025.', url: "https://www.canva.dev/blog/engineering/yes-you-can-use-ai-in-our-interviews/" },
  { id: 4, text: 'Scroll Media, "Canva Requires Engineers to Use AI in Interviews," June 18, 2025.', url: "https://scroll.media/en/2025/06/16/canva-requires-engineers-to-use-ai-in-interviews/" },
  { id: 5, text: 'Canva Careers, "How We Hire," Canva.', url: "https://www.lifeatcanva.com/en/how-we-hire/" },
  { id: 6, text: 'The Register, "Canva now requires use of AI during developer job interviews," June 11, 2025.', url: "https://www.theregister.com/2025/06/11/canva_coding_assistant_job_interviews/" },
  { id: 7, text: 'SmartCompany, "Why Canva wants you to use AI during job interviews," June 16, 2025.', url: "https://www.smartcompany.com.au/artificial-intelligence/canva-wants-ai-artificial-intelligence-interview-expectation/" },
  { id: 8, text: "Tobi L\u00FCtke, internal memo posted on X, April 8, 2025. Reported by Tom's Guide.", url: "https://www.tomsguide.com/ai/no-new-hires-if-ai-can-do-the-job-says-shopify-ceo-in-leaked-memo" },
  { id: 9, text: 'HR Grapevine, "Shopify CEO to staff: Prove AI can\'t do the job before hiring humans," May 13, 2025.', url: "https://www.hrgrapevine.com/content/article/2025-04-08-shopify-ceo-tells-company-prove-work-cant-be-done-by-ai-before-hiring-humans" },
  { id: 10, text: 'Upskillist, "Shopify Hiring AI Over Humans: Bold Strategy Decoded 2025," July 2, 2025.', url: "https://www.upskillist.com/blog/hiring-ai-over-humans-decoding-shopifys-bold-new-strategy/" },
  { id: 11, text: 'Glassdoor, "Shopify Interview Experience & Questions (2026)."', url: "https://www.glassdoor.com/Interview/Shopify-Interview-Questions-E675933.htm" },
  { id: 12, text: 'Final Round AI, "How to Crack the Shopify Interview Process," 2025.', url: "https://www.finalroundai.com/blog/shopify-interview-process" },
  { id: 13, text: 'Mercor, "How Mercor Uses AI and Data," Mercor Talent Documentation.', url: "https://talent.docs.mercor.com/policies/data-ai-usage" },
  { id: 14, text: 'TechCrunch, "Mercor raises $100M at $2B valuation," February 20, 2025.' },
  { id: 15, text: "DelMorgan & Co., \"Mercor's Emerging Role in the Future of Work,\" November 5, 2025.", url: "https://delmorganco.com/mercor-ai-role/" },
  { id: 16, text: 'Skywork AI, "Mercor Review 2025: AI Recruiting Platform Explained," December 22, 2025.', url: "https://skywork.ai/blog/mercor-review-2025-ai-hiring-talent-marketplace/" },
  { id: 17, text: 'Information Age / ACS, "Duolingo bans new hires in favour of AI," 2025.', url: "https://ia.acs.org.au/article/2025/duolingo-bans-new-hires-in-favour-of-ai.html" },
  { id: 18, text: 'Staffing Industry Analysts, "Duolingo pulls back on plans to shift from contractors to AI," May 28, 2025.', url: "https://www.staffingindustry.com/news/global-daily-news/duolingo-pulls-back-on-plans-to-shift-from-contractors-to-ai" },
  { id: 19, text: 'TechCrunch, "Is Duolingo the face of an AI jobs crisis?" May 4, 2025.', url: "https://techcrunch.com/2025/05/04/is-duolingo-the-face-of-an-ai-jobs-crisis/" },
  { id: 20, text: 'The HR Digest, "Duolingo Faces Backlash Over AI Strategy," May 28, 2025.', url: "https://www.thehrdigest.com/duolingo-faces-backlash-over-ai-strategy-pivots-to-retract-its-statement/" },
  { id: 21, text: 'The HR Digest, "Duolingo CEO Defends Its AI-First Strategy," August 19, 2025.', url: "https://www.thehrdigest.com/duolingo-ceo-defends-its-ai-first-strategy-against-backlash-once-more/" },
  { id: 22, text: "HireMinds, \"Shopify's AI Mandate Just Changed the Hiring Conversation,\" April 8, 2025.", url: "https://www.hireminds.com/shopify-ai-hiring-strategy/" },
  { id: 23, text: 'Fonzi AI / Medium, "How AI is Transforming Tech Interviews in 2025," October 13, 2025.', url: "https://medium.com/fonzi-ai/how-ai-is-transforming-tech-interviews-in-2025-b591de563b5d" },
];
