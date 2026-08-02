"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { loginAction, type LoginState } from "../_actions/authAction";
import { Label } from "@/components/ui/input";

const inputClass =
  "w-full rounded-none border-2 border-ink/70 bg-ticket px-3 py-2.5 font-mono text-sm text-ink placeholder:text-steel/60 focus:border-safety focus:outline-none";

const labelClass =
  "mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-steel";

const initialState: LoginState = { success: true, message: null };

export default function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [state, formAction, pending] = useActionState(
    loginAction.bind(null, redirectTo),
    initialState
  );

  useEffect(() => {
    if (state.message) {
      toast.error(state.message);
    }
  }, [state]);

  const error = state.success ? null : state.message;

  return (
    <form action={formAction} className="space-y-5 px-5 py-6 sm:px-6">
      <div>
        <Label htmlFor="email" className={labelClass}>
          Email
        </Label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          className={inputClass}
        />
      </div>

      <div>
        <Label htmlFor="password" className={labelClass}>
          Password
        </Label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
          className={inputClass}
        />
      </div>

      {error && (
        <p
          role="alert"
          className="flex items-start gap-2 border-2 border-dashed border-safety bg-ticket px-3 py-2.5"
        >
          <span
            aria-hidden
            className="font-mono text-sm font-bold text-safety"
          >
            {"\u2717"}
          </span>
          <span className="text-sm leading-relaxed text-ink">{error}</span>
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-none border-2 border-ink bg-ink px-4 py-3 font-display text-base font-bold text-bone transition-colors hover:bg-safety hover:text-ink disabled:pointer-events-none disabled:opacity-60"
      >
        {pending && (
          <span
            aria-hidden
            className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
        )}
        {pending ? "Signing in\u2026" : "Sign in"}
      </button>
    </form>
  );
}
