# Near the Singularity — Portfolio & Blog

A personal portfolio and blog built with Next.js, Prisma, and Tailwind CSS. Features an admin dashboard for managing content, AI-assisted blog editing, and a responsive public-facing site.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org) (App Router)
- **Database**: PostgreSQL via [Neon](https://neon.tech) + [Prisma](https://www.prisma.io)
- **Auth**: [NextAuth.js v5](https://authjs.dev)
- **Styling**: [Tailwind CSS](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
- **Storage**: Cloudflare R2 (images/assets)
- **AI**: Anthropic Claude via [Vercel AI SDK](https://sdk.vercel.ai)
- **Editor**: Tiptap rich text editor
- **Deployment**: [Vercel](https://vercel.com)

## Getting Started

### Prerequisites

- Node.js 18+
- A PostgreSQL database (e.g., [Neon](https://neon.tech))
- Cloudflare R2 bucket (for image uploads)
- Anthropic API key (for AI features)

### Setup

1. **Clone the repo**

   ```bash
   git clone https://github.com/haripery/portfolio-website.git
   cd portfolio-website
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Fill in your values in `.env.local` — see the comments in `.env.example` for guidance.

4. **Set up the database**

   ```bash
   npx prisma migrate dev
   ```

5. **Seed the database** (creates an admin user)

   ```bash
   npm run db:seed
   ```

6. **Run the dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to see the site.

## Project Structure

```
src/
├── app/
│   ├── admin/       # Admin dashboard (protected)
│   ├── api/         # API routes
│   ├── archive/     # Archive pages
│   ├── blog/        # Public blog pages
│   ├── layout.tsx   # Root layout
│   └── page.tsx     # Home page
├── components/      # React components
└── ...
prisma/
├── schema.prisma    # Database schema
└── seed.ts          # Database seed script
```

## License

[MIT](LICENSE)
