import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/ThemeProvider";
import { PostHogProvider } from "@/components/PostHogProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  // Dynamically fetch settings — fallback if DB not connected
  try {
    const { prisma } = await import("@/lib/prisma");
    const settings = await prisma.siteSettings.findUnique({
      where: { id: "main" },
    });
    if (settings) {
      return {
        metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
        title: {
          default: settings.siteTitle,
          template: `%s | ${settings.siteTitle}`,
        },
        description: settings.siteDescription,
        openGraph: {
          type: "website",
          title: settings.siteTitle,
          description: settings.siteDescription,
          images: settings.ogImage ? [settings.ogImage] : [],
        },
        twitter: {
          card: "summary_large_image",
          title: settings.siteTitle,
          description: settings.siteDescription,
          images: settings.ogImage ? [settings.ogImage] : [],
        },
      };
    }
  } catch {
    // DB not configured yet — use defaults
  }

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
    title: {
      default: "Near the Singularity",
      template: "%s | Near the Singularity",
    },
    description: "Frontend developer portfolio and blog",
  };
}

const themeScript = `
(function(){
  try {
    var t = localStorage.getItem('theme');
    var d = t === 'dark' || (t !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (d) document.documentElement.classList.add('dark');
  } catch(e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="RSS Feed"
          href="/feed.xml"
        />
      </head>
      <body className="min-h-screen antialiased">
        <ThemeProvider>
          <PostHogProvider>
            {children}
          </PostHogProvider>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "var(--card)",
                color: "var(--forest)",
                border: "1px solid var(--border)",
              },
              success: {
                iconTheme: {
                  primary: "#9EFFBF",
                  secondary: "var(--forest)",
                },
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
