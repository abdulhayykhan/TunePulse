"use client";

import Image from "next/image";
import { useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import TunePulseLogo from "@/components/TunePulseLogo";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
    }
  }, [router, status]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-bg px-4 py-6 text-zinc-200">
        <div className="mx-auto max-w-6xl">
          <div className="h-16 animate-pulse rounded-2xl bg-white/5" />
          <div className="mt-6 h-[70vh] animate-pulse rounded-[2rem] bg-white/5" />
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  const avatar = session?.user?.image;
  const name = session?.user?.name ?? "Spotify listener";

  return (
    <div className="min-h-screen bg-bg text-zinc-100">
      <header className="sticky top-0 z-20 border-b border-white/5 bg-black/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 shadow-glow">
              <TunePulseLogo className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-zinc-400">TunePulse</p>
              <p className="text-xs text-zinc-500">Your music. Decoded.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2">
              {avatar ? (
                <Image
                  src={avatar}
                  alt={name}
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-zinc-300">
                  {name.slice(0, 1).toUpperCase()}
                </div>
              )}
              <span className="max-w-40 truncate text-sm text-zinc-200">{name}</span>
            </div>

            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:border-accent/40 hover:bg-accent/10 hover:text-white"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}