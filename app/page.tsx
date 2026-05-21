"use client";

import { useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import TunePulseLogo from "@/components/TunePulseLogo";

export default function HomePage() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [router, status]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(29,185,84,0.16),transparent_28%),radial-gradient(circle_at_top,rgba(29,185,84,0.08),transparent_40%)]" />
      <div className="absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-3xl" />

      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/5 shadow-glow">
          <TunePulseLogo className="h-10 w-10" />
        </div>
        <p className="mb-4 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.4em] text-zinc-400">
          TunePulse
        </p>
        <h1 className="text-6xl font-black tracking-tight text-white sm:text-8xl">
          TunePulse
        </h1>
        <p className="mt-4 text-lg text-zinc-400 sm:text-xl">Your music. Decoded.</p>

        <button
          type="button"
          onClick={() => signIn("spotify")}
          className="mt-10 inline-flex items-center justify-center rounded-full bg-accent px-8 py-4 text-sm font-semibold text-black transition hover:scale-[1.02] hover:bg-[#22c55e]"
        >
          Connect Spotify
        </button>
      </div>
    </main>
  );
}