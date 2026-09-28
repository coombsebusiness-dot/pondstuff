import Link from "next/link";

const adminNav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/articles", label: "Articles" },
  { href: "/admin/plants", label: "Plants" },
  { href: "/admin/fish", label: "Fish" },
];

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link href="/admin" className="admin-brand">
          <span>
            POND<strong>STUFF</strong>
          </span>
          <small>ADMIN</small>
        </Link>

        <nav className="admin-nav" aria-label="Admin navigation">
          {adminNav.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <Link href="/" className="admin-view-site">
          ← View PondStuff
        </Link>
      </aside>

      <div className="admin-main">
        {children}
      </div>
    </div>
  );
}
