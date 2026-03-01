import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL ?? "" });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const SLUG = "harness-engineering-with-claude-code";

const CONTENT = `
<h2>The Question Everyone Asks</h2>

<p>In my mentorship sessions, one question comes up more than any other: "What does my day-to-day actually look like when I work with AI agents?"</p>

<p>It's a fair question. The hype cycle is loud. Every week there's a new demo of an agent building a to-do app from scratch. But nobody talks about the mundane reality. The daily rhythm, the habits, the discipline that makes agent-driven development actually work on real codebases over weeks and months.</p>

<p>A few weeks ago, OpenAI published <a href="https://openai.com/index/harness-engineering/" target="_blank" rel="noopener noreferrer">Harness Engineering: Leveraging Codex in an Agent-First World</a>. Their team shipped a product with zero lines of manually-written code. They described a new role for the software engineer: not someone who writes code, but someone who designs environments, specifies intent, and builds feedback loops.</p>

<p>That post crystallized something I'd been practicing for months. Not the building part. The workflow part. The daily practices that make this sustainable.</p>

<p>This guide walks you through those practices. Whether you use Claude Code, Codex, Cursor, or any other AI coding tool, the principles are the same. I've also built a <a href="https://github.com/haripery/harness-engineering" target="_blank" rel="noopener noreferrer">reference implementation</a>, a full-stack TypeScript app where every line was agent-generated, so you can see these patterns in action. Clone it, explore it, steal what's useful.</p>

<p>But the demo app isn't the point. The workflow is.</p>

<h2>The Mental Model Shift</h2>

<p>Before anything else, you need to internalize one thing: <strong>your job changes.</strong></p>

<p>You stop writing code. You start designing environments. Your value isn't in typing <code>const user = await db.query(...)</code>. It's in:</p>

<ul>
  <li><strong>Specifying what</strong> the system should do (product specs, task descriptions)</li>
  <li><strong>Designing how</strong> the system should be structured (architecture, rules, constraints)</li>
  <li><strong>Building feedback loops</strong> that catch mistakes and compound improvements</li>
  <li><strong>Verifying</strong> that the output is correct</li>
</ul>

<p>Think of yourself as a staff engineer working with a very fast, very literal junior developer who has perfect recall but no judgment. Your job is to give that developer the context, guardrails, and verification tools they need to produce correct output consistently.</p>

<p>That's harness engineering. You build the harness. The agent does the work.</p>

<h2>Start with a Map, Not a Manual</h2>

<p>The first thing you need is an entry point, a file that tells the agent where everything is and what the rules are.</p>

<p>If you're using Claude Code, this is <code>CLAUDE.md</code>. For Codex, it's <code>AGENTS.md</code>. For other tools, it might be a system prompt or a project-level config. The name doesn't matter. What matters is how you write it.</p>

<p><strong>Keep it short.</strong> Your entry point should be roughly 100 to 150 lines. It's a table of contents, not an encyclopedia. It points to deeper sources of truth:</p>

<pre><code>CLAUDE.md                    # Map, ~100 lines, always in context
ARCHITECTURE.md              # Domain map and layering rules
docs/
├── design-docs/             # Catalogued design decisions
├── exec-plans/              # Active and completed plans
├── product-specs/           # Product requirements
└── QUALITY_SCORE.md         # Quality grades by domain
.claude/
├── rules/                   # File-scoped rules
└── skills/                  # Step-by-step playbooks</code></pre>

<p>The OpenAI team calls this <strong>progressive disclosure</strong>. You give the agent a small, stable starting point. It looks deeper only when it needs to. This prevents context pollution because the agent doesn't waste tokens on architecture docs when it's fixing a typo.</p>

<p><strong>Use file-scoped rules.</strong> Most AI coding tools support rules that activate only for certain file patterns. When the agent edits a test file, it sees testing rules. When it edits a domain file, it sees domain rules. This keeps each task's context focused and relevant.</p>

<p><strong>Make the repository the system of record.</strong> Design decisions, product specs, execution plans, quality scores: put them all in the repo. If the agent can't find it in the repository, it doesn't exist. External wikis and Notion pages are invisible to your agent.</p>

<h2>Design Your Architecture for Agents</h2>

<p>Agents thrive in rigid, predictable structures. The more consistent your codebase, the more accurately the agent can reason about it.</p>

<p>The single best architectural pattern for agent-driven development is a <strong>layered domain model</strong> with forward-only dependencies:</p>

<pre><code>types.ts        → (no imports, leaf node)
config.ts       → types only
repo.ts         → types, config
service.ts      → types, config, repo
runtime.ts      → types, config, repo, service
ui/routes.ts    → types, config, service, runtime</code></pre>

<p>Each business domain follows the same structure. The agent learns the pattern once and applies it everywhere. When it needs to add a new feature, it knows exactly where each piece goes.</p>

<p>Cross-cutting concerns like authentication, database connections, logging, and feature flags enter through a <code>providers/</code> layer. Domain code never imports infrastructure directly. This boundary gives you a clean seam for mocking in tests and swapping implementations.</p>

<p><strong>Parse at boundaries, trust interiors.</strong> Validate all external input (HTTP requests, environment variables, database results) at the boundary using a schema library like Zod. Once data crosses the boundary, interior code operates on typed, validated data without re-validation. This gives the agent a reliable contract: if data reaches a service function, it's already clean.</p>

<p><strong>Use the Result pattern over thrown exceptions.</strong> Return <code>{ ok: true, data }</code> or <code>{ ok: false, error }</code> from every domain function. This forces callers to handle errors explicitly. The compiler won't let them forget. Agents are much more reliable when error handling is in the type system rather than implicit try/catch blocks.</p>

<pre><code>// Without Result: caller might forget try/catch
const user = await findUser(id); // throws on not found?

// With Result: compiler enforces handling
const result = await findUser(id);
if (!result.ok) {
  return err({ code: 'NOT_FOUND', message: result.error.message });
}
// TypeScript knows result.data is User here</code></pre>

<h2>Your Daily Workflow: The Eight Pillars</h2>

<p>This is the section people are really asking about. Here's what a typical day looks like, codified into eight practices.</p>

<h3>1. Always plan first</h3>

<p>Enter plan mode for every task. Not just big features. Everything. The agent reads the relevant files, designs an approach, and presents it to you before writing a single line of code.</p>

<p>This feels slow at first. It's not. Planning catches misunderstandings before they become 200 lines of wrong code. When something goes sideways mid-task, stop and re-plan immediately. Don't keep pushing.</p>

<h3>2. Manage your context window</h3>

<p>Your agent has a finite working memory. Treat context like RAM. Files are persistent storage, context is working memory. You wouldn't keep every variable in registers.</p>

<p>The discipline is simple: <strong>save state to disk after every meaningful step.</strong> Keep a <code>tasks/todo.md</code> that tracks current progress. After a significant step, update it. If you need to compact the conversation or start a new session, you lose nothing because the state is on disk.</p>

<p>After about 20 turns of conversation, compact or start fresh. Long sessions lose coherence.</p>

<h3>3. Use subagents strategically</h3>

<p>When you need to research something (find all usages of a function, understand how a library works, explore a new area of the codebase), spawn a subagent. Let it explore and bring back the answer.</p>

<p>Never bloat your main context with 10+ file reads for research. One task per subagent. The main context stays clean and focused on execution.</p>

<h3>4. Build a self-improvement loop</h3>

<p>This is probably the highest-leverage practice. When the agent makes a mistake and you correct it, <strong>log the correction as a lesson.</strong> Keep a <code>tasks/lessons.md</code> file:</p>

<pre><code>### Always validate env vars with Zod

**Trigger**: Used Number(x) || undefined which treats 0 as undefined
**Pattern**: Using || with numeric coercion loses falsy values
**Rule**: Use Zod schemas for all env var parsing
**Recurrence**: 0 (never happened again)</code></pre>

<p>The agent reads lessons at the start of every session. If a lesson keeps coming up, promote it to a linter rule or structural test. Every correction compounds into a permanent fix.</p>

<h3>5. Verify before marking done</h3>

<p>"It compiles" is not verification. "Tests pass" is not sufficient either. A CSS regression can pass every test while the page looks completely broken.</p>

<p>Your verification checklist should include:</p>

<ul>
  <li>Type-checking passes</li>
  <li>All linters pass</li>
  <li>Unit, structural, and E2E tests pass</li>
  <li><strong>Visual inspection</strong>: actually look at what the agent built, ideally through automated screenshots</li>
  <li>Full validation pipeline passes</li>
</ul>

<p>If you have access to Browser MCP servers (Playwright MCP, Chrome DevTools MCP), use them for automated visual verification. Take screenshots at desktop and mobile viewports. Compare results. This catches layout bugs, missing styles, and visual regressions that tests miss.</p>

<h3>6. Demand elegance (selectively)</h3>

<p>For non-trivial changes, pause and ask: "Is there a cleaner way to do this?" The agent will often produce working but clunky code on the first pass. A moment of reflection leads to better abstractions.</p>

<p>Skip this for simple, obvious fixes. Don't over-engineer a one-line bug fix.</p>

<h3>7. Fix bugs autonomously</h3>

<p>When the agent encounters a bug, it should just fix it. The workflow: reproduce, trace the cause, classify (logic error, missing validation, wrong assumption), fix, add a test that would have caught it, prevent recurrence through a rule or lesson.</p>

<p>No back-and-forth. No "what should I do about this error?" Just investigate and resolve.</p>

<h3>8. Fresh context for fresh work</h3>

<p>When you switch to a different kind of task, save state and start clean. Don't carry debugging context from a CSS fix into a backend API change. Stale context leads to confused output.</p>

<h2>Enforce Quality Mechanically</h2>

<p>Here's a hard truth: <strong>documentation rules decay.</strong> You can write the clearest, most detailed instructions in your entry point file, and the agent will eventually ignore them. Not because it's broken, but because documentation is a suggestion. Code is a constraint.</p>

<p>I learned this through direct experience. I wrote a rule: "Always run visual verification before marking a task done." The agent ignored it. I added the rule to three more files. The agent acknowledged it and then forgot. Three times it declared tasks complete without verifying.</p>

<p>So I stopped writing rules and started writing code.</p>

<h3>The escalation ladder</h3>

<p>When a pattern of mistakes emerges, escalate through these levels:</p>

<ol>
  <li><strong>Lesson</strong>: Log it in your lessons file. This catches most things.</li>
  <li><strong>Documentation</strong>: Add it to your entry point or scoped rules. This catches some more.</li>
  <li><strong>Linter</strong>: Write a custom linter that detects the violation. Now it fails the build.</li>
  <li><strong>Git hook</strong>: Add a pre-commit or pre-push hook. Now it blocks the commit.</li>
  <li><strong>Session hook</strong>: Block the agent from ending a session with the violation unresolved.</li>
</ol>

<p>Each level catches failures the previous level missed. Invest in mechanical enforcement early. It pays for itself immediately.</p>

<h3>Custom linters as agent prompts</h3>

<p>Here's an insight from the OpenAI post that changed how I think about linters: <strong>linter error messages are prompts.</strong> When your linter detects a violation, don't just say "illegal import." Print remediation instructions:</p>

<pre><code>VIOLATION: src/domains/auth/repo.ts imports from service layer
  → repo can only import: types, config
  → Move this logic to the service layer, or extract shared types to types.ts</code></pre>

<p>That remediation instruction goes directly into the agent's context. The linter error becomes a fix instruction. The agent reads it, understands the constraint, and fixes the violation, usually on the first try.</p>

<p>Write every linter message as if it's a prompt for the agent that will read it. This one change makes your linters dramatically more effective.</p>

<h3>Git hooks as enforcement gates</h3>

<p>Your pre-commit hook should run: formatting, type-checking, all custom linters, and any verification gate you need. Your pre-push hook should run the full validation pipeline including tests.</p>

<p>If verification matters (and it does), add a verification gate. A script that checks a checklist file before allowing commits. If the checklist isn't complete, the commit is blocked. The environment prevents the mistake.</p>

<pre><code># .husky/pre-commit
npx lint-staged                    # Prettier on staged files
npm run typecheck                  # TypeScript type checking
npm run lint                       # All custom linters
bash scripts/check-verification.sh # Verification gate</code></pre>

<h2>Make Your Application Visible to the Agent</h2>

<p>One of the biggest unlocks in agent-driven development is giving the agent <strong>eyes</strong>. When the agent can see what it built, it catches problems that tests miss.</p>

<h3>Browser MCP servers</h3>

<p>If your AI coding tool supports MCP (Model Context Protocol), configure Browser MCP servers. These give the agent live access to your running application. It can navigate pages, take screenshots, inspect the DOM, and verify visual output.</p>

<p>Two popular options:</p>

<ul>
  <li><strong>Playwright MCP</strong> (<code>@playwright/mcp</code>): browser automation through Playwright</li>
  <li><strong>Chrome DevTools MCP</strong> (<code>chrome-devtools-mcp</code>): direct Chrome DevTools Protocol access</li>
</ul>

<p>Using both gives you independent verification from two different browser inspection tools. Discrepancies between them flag real issues.</p>

<h3>The verification workflow</h3>

<p>After implementing a change:</p>

<ol>
  <li>The agent navigates to every affected page using the Browser MCP</li>
  <li>It takes screenshots at desktop (1440px) and mobile (375px) viewports</li>
  <li>It reads the screenshots (multimodal models can analyze images) and checks for layout issues, missing elements, visual regressions</li>
  <li>It runs E2E tests for interactive behavior</li>
  <li>It runs the full validation pipeline</li>
</ol>

<p><strong>Why both visual and E2E?</strong> A CSS regression can pass every E2E test while the page looks completely wrong. A backend API change can break page rendering while all unit tests pass. Visual inspection and automated tests catch different classes of bugs. Neither replaces the other.</p>

<h3>Making the app bootable</h3>

<p>For the agent to see your app, it needs to be running locally. Keep your dev setup simple and fast:</p>

<ul>
  <li>One command to start the backend</li>
  <li>One command to start the frontend</li>
  <li>Database in Docker with a setup script</li>
  <li>Seed data for testing</li>
</ul>

<p>The easier it is to boot the app, the more likely verification actually happens.</p>

<h2>The Self-Improvement Loop in Practice</h2>

<p>The self-improvement loop is the mechanism that makes your harness smarter over time. Every session is better than the last, not because the agent improves, but because the environment does.</p>

<h3>How corrections compound</h3>

<p>Early in my experience with harness engineering, the agent used <code>Number(process.env.PORT) || 3000</code> for parsing environment variables. Looks reasonable. But <code>Number("0")</code> is falsy, so this silently falls back to <code>3000</code>. The agent made this mistake twice. After the second correction, I logged a lesson: "Always validate env vars with Zod." That mistake never happened again.</p>

<p>Small correction, permanent fix. Multiply this across dozens of lessons and your codebase becomes remarkably resilient.</p>

<h3>When documentation fails, promote to code</h3>

<p>The verification rule is the clearest example. I wrote "always verify before marking done" in five different files. The agent ignored it three times. So I built a pre-commit hook that blocks commits without a completed verification checklist, and a session hook that prevents the agent from ending a session with unverified changes.</p>

<p>Now the environment prevents the mistake. The agent can't skip verification because the system won't let it.</p>

<p>This escalation (lesson, then rule, then mechanical hook) is the self-improvement loop's most powerful pattern. Every time documentation fails, you have an opportunity to make the system mechanically correct.</p>

<h3>Skills as playbooks</h3>

<p>For recurring complex tasks (verifying changes, investigating bugs, scaffolding a new domain), write step-by-step playbooks. Store them as markdown files the agent reads before starting work:</p>

<pre><code>.claude/skills/
├── verify-change/SKILL.md      # 7-step verification checklist
├── drive-app/SKILL.md          # Browser MCP workflow
├── investigate-failure/SKILL.md # Bug reproduction and fix
├── self-improve/SKILL.md       # Learn from corrections
├── add-domain/SKILL.md         # Scaffold new domain
└── manage-context/SKILL.md     # Context window management</code></pre>

<p>Skills encode your team's standards into repeatable checklists. The agent reads the skill, follows the steps, and produces consistent output. Over time, you accumulate a library of skills that represent your team's best practices.</p>

<h2>Common Mistakes When Starting Out</h2>

<p>These are the patterns I see most often in mentorship sessions. If you're just getting started, watch out for:</p>

<h3>Giving the agent too much context upfront</h3>

<p>A monolithic 500-line instructions file doesn't work. The agent drowns in context. Start with a concise entry point (~100 lines) and use progressive disclosure. Point to deeper docs, don't dump everything.</p>

<h3>Skipping verification because "tests pass"</h3>

<p>Tests validate behavior. They don't validate appearance, layout, responsiveness, or the dozen things that can go wrong visually. Build visual verification into your workflow. If you can't use Browser MCPs, at minimum open the page yourself before approving.</p>

<h3>Not saving state to disk</h3>

<p>When you compact a conversation or start a new session, anything only in context is gone. Save progress to a task file after every meaningful step. This one habit prevents more wasted work than any other.</p>

<h3>Over-engineering the scaffolding before you have a real task</h3>

<p>Don't spend three days building the perfect harness before writing any application code. Start with the basics: an entry point file, a simple architecture rule, one linter, and iterate. The best harness emerges from real tasks, not theoretical planning.</p>

<h3>Treating the agent like autocomplete</h3>

<p>Autocomplete suggests the next line. An agent executes a task. If you're prompting line by line ("now add a try/catch here"), you're using the agent wrong. Describe what you want at the task level ("add error handling to the registration flow using the Result pattern") and let the agent figure out the implementation.</p>

<h3>Not building a self-improvement loop</h3>

<p>If you correct the agent and don't log the lesson, the same mistake will happen again next session. The correction is worth nothing unless it compounds. Log every correction. Review lessons at session start.</p>

<h2>Getting Started</h2>

<p>You don't need to adopt everything at once. Start small, iterate, and let the harness grow organically.</p>

<h3>Week 1: The basics</h3>

<ol>
  <li><strong>Pick one codebase</strong> you're actively working on</li>
  <li><strong>Write an entry point file</strong> (~50 to 100 lines): project description, key directories, main rules</li>
  <li><strong>Start a lessons file</strong>: empty, ready to capture corrections</li>
  <li><strong>Do one real task</strong> with the agent and capture what you learn</li>
</ol>

<h3>Week 2: Add structure</h3>

<ol start="5">
  <li><strong>Add file-scoped rules</strong> for your most-edited file types (frontend, tests, backend)</li>
  <li><strong>Write your first custom linter</strong> for a rule you've corrected more than twice</li>
  <li><strong>Add a task tracker file</strong> to save state between sessions</li>
  <li><strong>Practice context management</strong>: compact after 15 to 20 turns, use subagents for research</li>
</ol>

<h3>Week 3: Build verification</h3>

<ol start="9">
  <li><strong>Set up dev servers</strong> so the agent can see the running app</li>
  <li><strong>Configure Browser MCPs</strong> if your tool supports them</li>
  <li><strong>Add a pre-commit hook</strong> with type-checking and linting</li>
  <li><strong>Write your first E2E test</strong> for a critical user flow</li>
</ol>

<h3>Ongoing: Let it compound</h3>

<ol start="13">
  <li><strong>Log every correction</strong> as a lesson</li>
  <li><strong>Promote recurring lessons</strong> into rules, then into linters or hooks</li>
  <li><strong>Write skill playbooks</strong> for complex recurring tasks</li>
  <li><strong>Review and prune</strong>: remove outdated lessons, update stale docs</li>
</ol>

<h3>Explore the demo</h3>

<p>The entire reference implementation is open source. Clone it and explore how these patterns look in practice:</p>

<pre><code>git clone https://github.com/haripery/harness-engineering.git
cd harness-engineering
npm install</code></pre>

<p>Key files to study:</p>

<ul>
  <li><code>CLAUDE.md</code>: the agent entry point (~100 lines)</li>
  <li><code>ARCHITECTURE.md</code>: the layered domain model</li>
  <li><code>tasks/lessons.md</code>: the self-improvement loop in action</li>
  <li><code>.claude/skills/</code>: nine agent skill playbooks</li>
  <li><code>linters/</code>: four custom architecture linters</li>
  <li><code>scripts/check-verification.sh</code>: the verification gate</li>
</ul>

<p>See <a href="https://github.com/haripery/harness-engineering/blob/main/docs/GETTING_STARTED.md" target="_blank" rel="noopener noreferrer">docs/GETTING_STARTED.md</a> for full setup instructions including database, test credentials, and MCP configuration.</p>

<h2>The Shift</h2>

<p>The discipline didn't go away. It moved from the code to the scaffolding. You spend your time writing specs, designing constraints, capturing lessons, and verifying outcomes. The agent writes everything else.</p>

<p>OpenAI's post ends with a line worth remembering: "building software still demands discipline, but the discipline shows up more in the scaffolding rather than the code."</p>

<p>Whether you use Claude Code, Codex, or something else, the principles are the same:</p>

<ul>
  <li>Start with a map, not a manual</li>
  <li>Design your architecture for agent predictability</li>
  <li>Enforce rules with linters and hooks, not documentation</li>
  <li>Build a self-improvement loop that compounds every session</li>
  <li>Make your application visible to the agent</li>
  <li>Verify before declaring done</li>
  <li>Save state to disk, always</li>
  <li>Treat context like memory and manage it actively</li>
</ul>

<p>The question isn't whether agents can write your code. They can. The question is whether you've built the harness that lets them do it well.</p>

<h2>What's Next: Packaging the Harness as a Plugin</h2>

<p>Everything in this guide (the skills, verification hooks, MCP configurations, self-improvement loop) lives inside the repository's <code>.claude/</code> directory. That works when you're building from scratch or cloning the demo. But what if you want to apply these practices to an existing codebase without copying files around?</p>

<p>That's where <strong>Claude Code plugins</strong> come in. A plugin is a self-contained package that bundles skills, hooks, MCP configs, and agents into a single installable unit. Instead of manually setting up verification workflows, self-improvement loops, and Browser MCP servers in every project, you'd run <code>/plugin install harness-engineering</code> and get the entire methodology wired up instantly.</p>

<p>The next post will walk through packaging this harness as a distributable plugin, turning a project-specific workflow into a portable methodology that anyone can install with one command.</p>

<p><em>This guide is based on practices developed using Claude Code and Opus 4.6. The <a href="https://github.com/haripery/harness-engineering" target="_blank" rel="noopener noreferrer">reference implementation</a> demonstrates every pattern described here.</em></p>
`.trim();

async function main() {
  console.log("Seeding harness engineering blog post...");

  const existing = await prisma.blogPost.findUnique({
    where: { slug: SLUG },
  });

  if (existing) {
    console.log(`Blog post with slug "${SLUG}" already exists. Updating...`);
    await prisma.blogPost.update({
      where: { slug: SLUG },
      data: {
        title:
          "A Practical Guide to Harness Engineering: How to Work with AI Agents Every Day",
        excerpt:
          "The daily rhythm, habits, and discipline that make agent-driven development actually work. A practical guide with eight pillars, common mistakes, and a week-by-week getting started plan.",
        content: CONTENT,
        contentJson: "{}",
        readTime: "18 min read",
      },
    });
    console.log("Blog post updated.");
    return;
  }

  const post = await prisma.blogPost.create({
    data: {
      title:
        "A Practical Guide to Harness Engineering: How to Work with AI Agents Every Day",
      slug: SLUG,
      excerpt:
        "The daily rhythm, habits, and discipline that make agent-driven development actually work. A practical guide with eight pillars, common mistakes, and a week-by-week getting started plan.",
      content: CONTENT,
      contentJson: "{}",
      category: "AI",
      published: true,
      featured: true,
      readTime: "18 min read",
      publishedAt: new Date("2026-02-26"),
      tags: {
        create: [
          { label: "Claude Code" },
          { label: "AI Agents" },
          { label: "Harness Engineering" },
          { label: "TypeScript" },
          { label: "Developer Workflow" },
          { label: "Open Source" },
        ],
      },
    },
  });

  console.log(`✓ Blog post created: "${post.title}" (${post.slug})`);
  console.log(`  ID: ${post.id}`);
  console.log(`  Published: ${post.published}`);
  console.log(`  Category: ${post.category}`);
  console.log("\n✅ Harness engineering blog post seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
