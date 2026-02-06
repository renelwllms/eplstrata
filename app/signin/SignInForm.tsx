"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignInForm({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl
    });

    setLoading(false);

    if (result?.error) {
      setError("Sign in failed. Check the details you provided are correct.");
      return;
    }

    router.push(result?.url ?? callbackUrl);
  };

  return (
    <div className="min-h-screen app-shell-bg">
      <div className="mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-6 py-16">
        <div className="card-surface w-full max-w-md p-10">
          <div className="mb-8 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-ink-700">STRATA</p>
            <h1 className="font-display text-3xl">Sign in</h1>
            <p className="text-sm text-ink-700">by EdgePoint</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm font-semibold text-ink-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-sm outline-none focus:border-ocean-500"
                placeholder="owner@demo.local"
                required
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-ink-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-sm outline-none focus:border-ocean-500"
                placeholder="Enter your password"
                required
              />
            </div>

            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-ink-900 px-4 py-3 text-sm font-semibold text-sand-50 transition hover:bg-ink-700 disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-ink-600">
            Use: owner@demo.local / Strata123!
          </div>
        </div>
      </div>
    </div>
  );
}
