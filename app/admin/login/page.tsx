import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { login } from "./actions";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function AdminLoginPage({
  searchParams,
}: LoginPageProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: adminUser } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (adminUser) {
      redirect("/admin");
    }
  }

  const params = await searchParams;

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-brand">
          POND<span>STUFF</span>
        </div>

        <p className="admin-login-label">ADMINISTRATION</p>

        <h1>Welcome back.</h1>

        <p className="admin-login-intro">
          Sign in to manage PondStuff.
        </p>

        {params.error && (
          <div className="admin-login-error">
            {params.error}
          </div>
        )}

        <form action={login} className="admin-login-form">
          <label>
            <span>Email address</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
            />
          </label>

          <label>
            <span>Password</span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
            />
          </label>

          <button type="submit">
            Sign in
          </button>
        </form>

        <a href="/" className="admin-login-home">
          ← Back to PondStuff
        </a>
      </div>
    </div>
  );
}
