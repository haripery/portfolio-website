export type Level = "new-grad" | "senior" | "staff";

export type ResourceType =
  | "platform"
  | "youtube"
  | "github"
  | "book"
  | "course"
  | "guide"
  | "list"
  | "tool"
  | "community"
  | "blog"
  | "official"
  | "tutorial";

export interface Resource {
  name: string;
  url: string;
  type: ResourceType;
}

export interface Stage {
  step: number;
  emoji: string;
  name: string;
  duration: string;
  optional?: boolean;
  description: string;
  resources: Resource[];
}

export interface Pipeline {
  level: Level;
  timeline: string;
  stages: Stage[];
}

export const LEVEL_LABELS: Record<Level, string> = {
  "new-grad": "New Grad / SDE-I",
  senior: "Senior Engineer",
  staff: "Staff Engineer",
};

export const RESOURCE_COLORS: Record<ResourceType, string> = {
  platform:
    "bg-purple-500/10 text-purple-700 dark:bg-purple-400/15 dark:text-purple-300 border-purple-500/20",
  youtube:
    "bg-red-500/10 text-red-700 dark:bg-red-400/15 dark:text-red-300 border-red-500/20",
  github:
    "bg-ink/5 text-ink/70 dark:bg-ink/10 dark:text-ink/60 border-ink/15",
  book: "bg-pink-500/10 text-pink-700 dark:bg-pink-400/15 dark:text-pink-300 border-pink-500/20",
  course:
    "bg-indigo-500/10 text-indigo-700 dark:bg-indigo-400/15 dark:text-indigo-300 border-indigo-500/20",
  guide:
    "bg-green-500/10 text-green-700 dark:bg-green-400/15 dark:text-green-300 border-green-500/20",
  list: "bg-amber-500/10 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300 border-amber-500/20",
  tool: "bg-teal-500/10 text-teal-700 dark:bg-teal-400/15 dark:text-teal-300 border-teal-500/20",
  community:
    "bg-orange-500/10 text-orange-700 dark:bg-orange-400/15 dark:text-orange-300 border-orange-500/20",
  blog: "bg-violet-500/10 text-violet-700 dark:bg-violet-400/15 dark:text-violet-300 border-violet-500/20",
  official:
    "bg-blue-500/10 text-blue-700 dark:bg-blue-400/15 dark:text-blue-300 border-blue-500/20",
  tutorial:
    "bg-cyan-500/10 text-cyan-700 dark:bg-cyan-400/15 dark:text-cyan-300 border-cyan-500/20",
};

// ---------------------------------------------------------------------------
// NEW GRAD / SDE-I
// ---------------------------------------------------------------------------
const newGradPipeline: Pipeline = {
  level: "new-grad",
  timeline: "1-6 weeks",
  stages: [
    {
      step: 1,
      emoji: "📝",
      name: "Online Assessment (OA)",
      duration: "60-180 min",
      optional: true,
      description:
        "Take-home or timed coding challenge, typically 2-3 problems at LeetCode Easy to Medium difficulty. Some companies include MCQs on aptitude and CS fundamentals. A few companies skip this entirely.",
      resources: [
        { name: "LeetCode", url: "https://leetcode.com", type: "platform" },
        {
          name: "HackerRank",
          url: "https://hackerrank.com",
          type: "platform",
        },
        {
          name: "CodeSignal",
          url: "https://codesignal.com",
          type: "platform",
        },
        {
          name: "HackerEarth",
          url: "https://hackerearth.com",
          type: "platform",
        },
        {
          name: "GeeksforGeeks",
          url: "https://geeksforgeeks.org",
          type: "platform",
        },
        {
          name: "2025 Tech OA Repo",
          url: "https://github.com/perixtar/2025-Tech-OA-by-FastPrep",
          type: "github",
        },
        {
          name: "Amazon OA Prep",
          url: "https://amazon.jobs/content/en/how-we-hire/university/sde-oa",
          type: "official",
        },
        { name: "PrepInsta", url: "https://prepinsta.com", type: "platform" },
      ],
    },
    {
      step: 2,
      emoji: "📞",
      name: "Phone Screen: DSA",
      duration: "45-60 min",
      description:
        "1 round. Solve a DSA problem live (LeetCode Easy to Medium). Interviewer evaluates problem-solving approach, communication, and ability to translate thought process into code.",
      resources: [
        {
          name: "NeetCode 150",
          url: "https://neetcode.io/practice/practice/neetcode150",
          type: "platform",
        },
        {
          name: "Blind 75",
          url: "https://neetcode.io/practice/practice/blind75",
          type: "list",
        },
        {
          name: "Grind 75",
          url: "https://www.techinterviewhandbook.org/grind75/",
          type: "tool",
        },
        {
          name: "NeetCode YouTube",
          url: "https://youtube.com/@NeetCode",
          type: "youtube",
        },
        {
          name: "Cracking the Coding Interview",
          url: "https://crackingthecodinginterview.com/",
          type: "book",
        },
        {
          name: "Striver's SDE Sheet",
          url: "https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems",
          type: "list",
        },
        {
          name: "Striver's A2Z DSA Course",
          url: "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/",
          type: "course",
        },
      ],
    },
    {
      step: 3,
      emoji: "🧠",
      name: "Technical Deep-Dive: DSA + CS Fundamentals",
      duration: "45-60 min",
      optional: true,
      description:
        "Harder DSA problems, sometimes on a whiteboard or paper. May include CS fundamentals like OS, DBMS, Computer Networks, and OOP basics. The depth depends on the company.",
      resources: [
        {
          name: "InterviewBit",
          url: "https://interviewbit.com",
          type: "platform",
        },
        {
          name: "Gate Smashers (OS/DBMS/CN)",
          url: "https://youtube.com/@GateSmashers",
          type: "youtube",
        },
        {
          name: "Love Babbar",
          url: "https://youtube.com/@CodeHelp",
          type: "youtube",
        },
        {
          name: "GFG CS Subjects",
          url: "https://geeksforgeeks.org/computer-science-subjects-interview-questions/",
          type: "guide",
        },
        {
          name: "Neso Academy",
          url: "https://youtube.com/@nesoacademy",
          type: "youtube",
        },
        {
          name: "NeetCode Roadmap",
          url: "https://neetcode.io/roadmap",
          type: "guide",
        },
        {
          name: "take U forward YouTube",
          url: "https://youtube.com/@takeUforward",
          type: "youtube",
        },
      ],
    },
    {
      step: 4,
      emoji: "💻",
      name: "Onsite Coding Loop",
      duration: "3-4 hrs total",
      description:
        "2-3 coding rounds focused on DSA. Expect LeetCode Medium difficulty. Clean code, edge case handling, and time/space complexity analysis matter. Some companies test this virtually.",
      resources: [
        {
          name: "LeetCode Top Interview 150",
          url: "https://leetcode.com/studyplan/top-interview-150/",
          type: "list",
        },
        {
          name: "AlgoExpert",
          url: "https://algoexpert.io",
          type: "platform",
        },
        {
          name: "Sean Prashad Patterns",
          url: "https://seanprashad.com/leetcode-patterns/",
          type: "guide",
        },
        {
          name: "Tech Interview Handbook",
          url: "https://techinterviewhandbook.org",
          type: "guide",
        },
        {
          name: "Abdul Bari: Algorithms",
          url: "https://youtube.com/@abdul_bari",
          type: "youtube",
        },
        {
          name: "VisuAlgo",
          url: "https://visualgo.net",
          type: "tool",
        },
      ],
    },
    {
      step: 5,
      emoji: "🤝",
      name: "Behavioral / Culture Fit",
      duration: "30-45 min",
      description:
        "STAR format covering teamwork, conflict, and leadership principles. Some companies (Amazon) have 2+ behavioral rounds even for new grads. Covers 'why this company', cultural fit, and salary expectations.",
      resources: [
        {
          name: "Tech Interview Handbook: Behavioral",
          url: "https://techinterviewhandbook.org/behavioral-interview/",
          type: "guide",
        },
        {
          name: "Dan Croitor (Amazon LPs)",
          url: "https://youtube.com/@DanCroitor",
          type: "youtube",
        },
        {
          name: "Jeff H Sipe (Google)",
          url: "https://youtube.com/@JeffHSipe",
          type: "youtube",
        },
        {
          name: "awesome-behavioral-interviews",
          url: "https://github.com/ashishps1/awesome-behavioral-interviews",
          type: "github",
        },
        {
          name: "AmbitionBox",
          url: "https://ambitionbox.com",
          type: "tool",
        },
        {
          name: "Glassdoor",
          url: "https://glassdoor.com",
          type: "tool",
        },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// SENIOR ENGINEER
// ---------------------------------------------------------------------------
const seniorPipeline: Pipeline = {
  level: "senior",
  timeline: "3-8 weeks",
  stages: [
    {
      step: 1,
      emoji: "📋",
      name: "Recruiter Screen",
      duration: "30 min",
      description:
        "Role fit, compensation expectations, team matching. Know your target total compensation range before this call. May include a brief technical check.",
      resources: [
        { name: "Levels.fyi", url: "https://levels.fyi", type: "tool" },
        { name: "Blind", url: "https://teamblind.com", type: "community" },
        {
          name: "Candor Salary Guide",
          url: "https://candor.co/guides/salary-negotiation",
          type: "guide",
        },
        {
          name: "AmbitionBox",
          url: "https://ambitionbox.com",
          type: "tool",
        },
        { name: "Glassdoor", url: "https://glassdoor.com", type: "tool" },
      ],
    },
    {
      step: 2,
      emoji: "📞",
      name: "Technical Phone Screen",
      duration: "60 min",
      description:
        "1 DSA problem (LeetCode Medium to Hard) or a mini system design. Tests problem-solving speed, communication, and ability to work through ambiguity.",
      resources: [
        {
          name: "LeetCode Top Interview 150",
          url: "https://leetcode.com/studyplan/top-interview-150/",
          type: "list",
        },
        {
          name: "NeetCode 150",
          url: "https://neetcode.io/practice/practice/neetcode150",
          type: "platform",
        },
        {
          name: "AlgoMonster",
          url: "https://algomonster.io",
          type: "platform",
        },
        {
          name: "Grokking Coding Interview",
          url: "https://educative.io/courses/grokking-the-coding-interview",
          type: "course",
        },
        {
          name: "Striver's SDE Sheet",
          url: "https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems",
          type: "list",
        },
      ],
    },
    {
      step: 3,
      emoji: "💻",
      name: "Onsite Coding Rounds",
      duration: "45-60 min each",
      description:
        "2 coding rounds at LeetCode Medium to Hard. Clean, production-quality code with tests. Edge case handling is critical. Expect follow-up questions pushing for better complexity.",
      resources: [
        { name: "LeetCode", url: "https://leetcode.com", type: "platform" },
        {
          name: "NeetCode YouTube",
          url: "https://youtube.com/@NeetCode",
          type: "youtube",
        },
        {
          name: "Elements of Programming Interviews",
          url: "https://elementsofprogramminginterviews.com/",
          type: "book",
        },
        {
          name: "AlgoExpert",
          url: "https://algoexpert.io",
          type: "platform",
        },
        {
          name: "InterviewBit",
          url: "https://interviewbit.com",
          type: "platform",
        },
      ],
    },
    {
      step: 4,
      emoji: "🏗️",
      name: "System Design (HLD)",
      duration: "45-60 min",
      description:
        "Design Twitter, Uber, or a URL shortener. Evaluate scalability, trade-offs, database choices, caching strategies. Tests ability to think at scale about distributed systems.",
      resources: [
        {
          name: "ByteByteGo",
          url: "https://bytebytego.com",
          type: "platform",
        },
        {
          name: "System Design Primer",
          url: "https://github.com/donnemartin/system-design-primer",
          type: "github",
        },
        {
          name: "HelloInterview",
          url: "https://hellointerview.com",
          type: "platform",
        },
        {
          name: "Grokking System Design",
          url: "https://educative.io/courses/grokking-the-system-design-interview",
          type: "course",
        },
        {
          name: "ByteByteGo YouTube",
          url: "https://youtube.com/@ByteByteGo",
          type: "youtube",
        },
        {
          name: "DDIA Book",
          url: "https://dataintensive.net/",
          type: "book",
        },
        { name: "Codemia", url: "https://codemia.io", type: "platform" },
        {
          name: "Gaurav Sen YouTube",
          url: "https://youtube.com/@gkcs",
          type: "youtube",
        },
        {
          name: "Arpit Bhayani",
          url: "https://youtube.com/c/ArpitBhayani",
          type: "youtube",
        },
      ],
    },
    {
      step: 5,
      emoji: "🧩",
      name: "Low-Level Design (LLD)",
      duration: "60-90 min",
      description:
        "OOP, SOLID principles, and design patterns. Design a parking lot, elevator, or BookMyShow. Some companies include a machine coding round (90 min timed). Increasingly common across companies.",
      resources: [
        {
          name: "Refactoring Guru",
          url: "https://refactoring.guru/design-patterns",
          type: "guide",
        },
        {
          name: "awesome-low-level-design",
          url: "https://github.com/ashishps1/awesome-low-level-design",
          type: "github",
        },
        {
          name: "Concept && Coding (Shreyansh)",
          url: "https://youtube.com/@ConceptandCoding",
          type: "youtube",
        },
        {
          name: "Grokking LLD on Educative",
          url: "https://educative.io/courses/grokking-the-low-level-design-interview-using-ood-principles",
          type: "course",
        },
        {
          name: "kumaransg/LLD Repo",
          url: "https://github.com/kumaransg/LLD",
          type: "github",
        },
        { name: "Codezym", url: "https://codezym.com/roadmap", type: "platform" },
      ],
    },
    {
      step: 6,
      emoji: "🤝",
      name: "Hiring Manager Behavioral",
      duration: "45 min",
      description:
        "STAR behavioral covering impact stories, mentorship, conflict resolution, and technical decision-making. Some companies add a 'bar raiser' round (Amazon, DoorDash).",
      resources: [
        {
          name: "Exponent Behavioral",
          url: "https://tryexponent.com/courses/behavioral",
          type: "course",
        },
        {
          name: "Amazon LP Guide",
          url: "https://interviewing.io/guides/amazon-leadership-principles",
          type: "guide",
        },
        {
          name: "Tech Interview Handbook",
          url: "https://techinterviewhandbook.org/behavioral-interview/",
          type: "guide",
        },
        {
          name: "Jeff H Sipe (Google)",
          url: "https://youtube.com/@JeffHSipe",
          type: "youtube",
        },
        {
          name: "awesome-behavioral-interviews",
          url: "https://github.com/ashishps1/awesome-behavioral-interviews",
          type: "github",
        },
      ],
    },
    {
      step: 7,
      emoji: "🔧",
      name: "Job-Specific / Debugging",
      duration: "60-90 min",
      optional: true,
      description:
        "Frontend: build a component. Stripe: debug a codebase. Some companies add domain-specific rounds for specialized roles. Format varies widely.",
      resources: [
        {
          name: "GreatFrontEnd",
          url: "https://greatfrontend.com",
          type: "platform",
        },
        {
          name: "BigFrontEnd.dev",
          url: "https://bigfrontend.dev",
          type: "platform",
        },
        {
          name: "Stripe Debugging Guide",
          url: "https://medium.com/tech-pulse/navigating-the-debugging-interview-insights-from-stripe-and-retool-697cead7c4db",
          type: "guide",
        },
        {
          name: "Frontend Interview Handbook",
          url: "https://frontendinterviewhandbook.com",
          type: "guide",
        },
        {
          name: "Lydia Hallie JS Questions",
          url: "https://github.com/lydiahallie/javascript-questions",
          type: "github",
        },
        {
          name: "JavaScript.info",
          url: "https://javascript.info",
          type: "tutorial",
        },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// STAFF ENGINEER
// ---------------------------------------------------------------------------
const staffPipeline: Pipeline = {
  level: "staff",
  timeline: "4-12 weeks",
  stages: [
    {
      step: 1,
      emoji: "📋",
      name: "Recruiter + Team Matching",
      duration: "1-3 calls",
      description:
        "Extensive team-matching and scope alignment. Multiple calls to find the right org. Leveling discussions happen early. Know your target compensation bands.",
      resources: [
        {
          name: "StaffEng.com",
          url: "https://staffeng.com",
          type: "guide",
        },
        { name: "Levels.fyi", url: "https://levels.fyi", type: "tool" },
        { name: "Blind", url: "https://teamblind.com", type: "community" },
        {
          name: "Levels.fyi Negotiation Guide",
          url: "https://levels.fyi/blog/ultimate-negotiation-guide.html",
          type: "guide",
        },
        {
          name: "AmbitionBox",
          url: "https://ambitionbox.com",
          type: "tool",
        },
      ],
    },
    {
      step: 2,
      emoji: "💻",
      name: "Coding (Yes, Still)",
      duration: "45-60 min each",
      description:
        "1-2 rounds at LeetCode Medium to Hard. Clean code with emphasis on design decisions within the code itself. At Staff level, interviewers also evaluate code quality and design thinking.",
      resources: [
        { name: "LeetCode", url: "https://leetcode.com", type: "platform" },
        {
          name: "NeetCode 150",
          url: "https://neetcode.io/practice/practice/neetcode150",
          type: "platform",
        },
        {
          name: "AlgoExpert",
          url: "https://algoexpert.io",
          type: "platform",
        },
        {
          name: "Striver's SDE Sheet",
          url: "https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems",
          type: "list",
        },
      ],
    },
    {
      step: 3,
      emoji: "🏗️",
      name: "System Design (Deep)",
      duration: "60 min",
      description:
        "Ambiguous and open-ended. Design Slack, an ad platform, or a real-time collaboration system. 'What would you build first?' Tests prioritization, depth, and ability to navigate trade-offs.",
      resources: [
        {
          name: "ByteByteGo",
          url: "https://bytebytego.com",
          type: "platform",
        },
        {
          name: "HelloInterview",
          url: "https://hellointerview.com",
          type: "platform",
        },
        {
          name: "DDIA Book",
          url: "https://dataintensive.net/",
          type: "book",
        },
        {
          name: "Engineering Blogs Repo",
          url: "https://github.com/kilimchoi/engineering-blogs",
          type: "github",
        },
        {
          name: "Engineering.fyi",
          url: "https://engineering.fyi",
          type: "tool",
        },
        {
          name: "High Scalability",
          url: "https://highscalability.com",
          type: "blog",
        },
        {
          name: "Jordan Has No Life YT",
          url: "https://youtube.com/@jordanhasnolife5163",
          type: "youtube",
        },
        {
          name: "Gaurav Sen YouTube",
          url: "https://youtube.com/@gkcs",
          type: "youtube",
        },
        {
          name: "Arpit Bhayani",
          url: "https://youtube.com/c/ArpitBhayani",
          type: "youtube",
        },
        {
          name: "Refactoring Guru",
          url: "https://refactoring.guru/design-patterns",
          type: "guide",
        },
        {
          name: "awesome-low-level-design",
          url: "https://github.com/ashishps1/awesome-low-level-design",
          type: "github",
        },
      ],
    },
    {
      step: 4,
      emoji: "🔬",
      name: "Architecture / Domain Deep-Dive",
      duration: "60 min",
      description:
        "Present past work, defend technical decisions, discuss trade-offs at scale. Some companies do a 'presentation round'. Focus on real production systems you've built.",
      resources: [
        {
          name: "awesome-scalability",
          url: "https://github.com/binhnguyennus/awesome-scalability",
          type: "github",
        },
        {
          name: "Netflix Tech Blog",
          url: "https://netflixtechblog.com",
          type: "blog",
        },
        {
          name: "Uber Engineering",
          url: "https://uber.com/blog/engineering/",
          type: "blog",
        },
        {
          name: "Stripe Engineering",
          url: "https://stripe.com/blog/engineering",
          type: "blog",
        },
        {
          name: "Engineering Blogs Repo",
          url: "https://github.com/kilimchoi/engineering-blogs",
          type: "github",
        },
        {
          name: "High Scalability",
          url: "https://highscalability.com",
          type: "blog",
        },
        {
          name: "Interviewing at Staff+ Level",
          url: "https://medium.com/@manuelvicnt/interviewing-at-staff-level-7a31836285e6",
          type: "guide",
        },
      ],
    },
    {
      step: 5,
      emoji: "👥",
      name: "Cross-functional / Leadership",
      duration: "45-60 min",
      description:
        "Influence without authority, driving alignment across teams, org-level impact. Tests 'force multiplier' potential including mentorship track record and strategic thinking.",
      resources: [
        {
          name: "The Staff Engineer's Path",
          url: "https://oreilly.com/library/view/the-staff-engineers/9781098118723/",
          type: "book",
        },
        {
          name: "Staff Engineer (Will Larson)",
          url: "https://staffeng.com/book",
          type: "book",
        },
        {
          name: "Exponent Behavioral",
          url: "https://tryexponent.com/courses/behavioral",
          type: "course",
        },
        {
          name: "Amazon LP Guide",
          url: "https://interviewing.io/guides/amazon-leadership-principles",
          type: "guide",
        },
        {
          name: "awesome-behavioral-interviews",
          url: "https://github.com/ashishps1/awesome-behavioral-interviews",
          type: "github",
        },
      ],
    },
    {
      step: 6,
      emoji: "🎯",
      name: "Bar Raiser / VP Chat",
      duration: "30-45 min",
      optional: true,
      description:
        "Senior leadership gut-check on culture, vision, and strategic thinking. Evaluates long-term fit and potential. Startups may replace this with a founder round.",
      resources: [
        {
          name: "Scarlet Ink (Amazon BR)",
          url: "https://scarletink.com/p/interviewing-at-amazon-leadership-principles",
          type: "guide",
        },
        {
          name: "Fearless Salary Negotiation",
          url: "https://fearlesssalarynegotiation.com",
          type: "guide",
        },
        {
          name: "StaffEng.com",
          url: "https://staffeng.com",
          type: "guide",
        },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------
export const pipelines: Record<Level, Pipeline> = {
  "new-grad": newGradPipeline,
  senior: seniorPipeline,
  staff: staffPipeline,
};
