import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "../login/actions";

const adminNav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/articles", label: "Articles" },
  { href: "/admin/plants", label: "Plants" },
  { href: "/admin/equipment", label: "Equipment" },
  { href: "/admin/affiliate-products", label: "Affiliate Products" },
  { href: "/admin/fish", label: "Fish" },
];

export default async function CmsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!adminUser) {
    await supabase.auth.signOut();
    redirect("/admin/login?error=You%20do%20not%20have%20admin%20access");
  }

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

        <div className="admin-sidebar-bottom">
          <Link href="/" className="admin-view-site">
            ← View PondStuff
          </Link>

          <form action={logout}>
            <button type="submit" className="admin-logout">
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="admin-main">
        {children}
      </div>
    </div>
  );
}
