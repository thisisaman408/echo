"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <button
      onClick={logout}
      className="text-sm text-slate-400 hover:text-rose-400"
    >
      Sign out
    </button>
  );
}
