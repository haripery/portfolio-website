// Force all admin pages to be dynamically rendered at request time.
// Admin pages require authentication and live DB data — never statically pre-render.
export const dynamic = "force-dynamic";

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
