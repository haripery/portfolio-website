import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
    title: {
      default: "Near the Singularity",
      template: "%s | Near the Singularity",
    },
    description: "Frontend developer portfolio and blog",
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen antialiased">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#1e293b",
              color: "#e2e8f0",
              border: "1px solid rgba(148, 163, 184, 0.12)",
            },
            success: {
              iconTheme: {
                primary: "#5eead4",
                secondary: "#0f172a",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
