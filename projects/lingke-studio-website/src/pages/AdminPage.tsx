import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { AdminDashboard } from "../components/admin/AdminDashboard";
import { AdminLogin } from "../components/admin/AdminLogin";
import { adminApi } from "../lib/adminApi";

export function AdminPage() {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    adminApi
      .me()
      .then((me) => {
        if (!cancelled) setAuthed(me.authenticated);
      })
      .catch(() => {
        if (!cancelled) setAuthed(false);
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function logout() {
    try {
      await adminApi.logout();
    } catch {
      /* ignore */
    }
    setAuthed(false);
  }

  let content;
  if (!ready) {
    content = (
      <div className="flex min-h-dvh items-center justify-center bg-[#ebebeb]">
        <Loader2 className="animate-spin text-zinc-400" size={28} />
      </div>
    );
  } else if (!authed) {
    content = <AdminLogin onSuccess={() => setAuthed(true)} />;
  } else {
    content = <AdminDashboard onLogout={() => void logout()} />;
  }

  return (
    <>
      <Helmet>
        <title>灵壳 · 管理后台</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      {content}
    </>
  );
}
