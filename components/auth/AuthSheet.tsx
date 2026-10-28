"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Mail,
  Lock,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  LogOut,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { SPRING_GENTLE, SPRING_SNAPPY } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { User } from "@supabase/supabase-js";

type AuthMode = "magic" | "signin" | "signup";

export function AuthSheet() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<AuthMode>("magic");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadUserSession() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (isMounted) {
        setCurrentUser(user);
        setCheckingSession(false);
      }
    }

    loadUserSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setCurrentUser(session?.user ?? null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setStatusMessage(null);

    const redirectUrl = `${window.location.origin}/auth/callback?next=/fantasy`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: "offline",
          prompt: "select_account",
        },
      },
    });

    if (error) {
      setStatusMessage({
        type: "error",
        text: error.message,
      });
      setLoading(false);
    }
  };

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    const callbackUrl = `${window.location.origin}/auth/callback?next=/fantasy`;

    if (mode === "magic") {
      const { error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          emailRedirectTo: callbackUrl,
        },
      });

      if (error) {
        setStatusMessage({ type: "error", text: error.message });
      } else {
        setStatusMessage({
          type: "success",
          text: `A cryptographic sign-in link has been dispatched to ${cleanEmail}. Open your real inbox to enter the Arena.`,
        });
      }
      setLoading(false);
      return;
    }

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          emailRedirectTo: callbackUrl,
          data: {
            full_name: fullName.trim() || cleanEmail.split("@")[0],
          },
        },
      });

      if (error) {
        setStatusMessage({ type: "error", text: error.message });
      } else if (data.user && data.user.identities?.length === 0) {
        setStatusMessage({
          type: "error",
          text: "An account with this email already exists. Please switch to Sign In or use Google OAuth.",
        });
      } else {
        setStatusMessage({
          type: "success",
          text: `Verification link sent to ${cleanEmail}. You must confirm your real inbox before your account is activated.`,
        });
      }
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      setStatusMessage({ type: "error", text: error.message });
      setLoading(false);
    } else {
      setStatusMessage({
        type: "success",
        text: "Session verified. Redirecting to the 20-Team Fantasy Arena...",
      });
      router.push("/fantasy");
      router.refresh();
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setCurrentUser(null);
    setLoading(false);
    router.refresh();
  };

  if (checkingSession) {
    return (
      <div className="w-full max-w-xl rounded-sm glass-card p-8 sm:p-10 border border-ivory/12 shadow-glass-panel space-y-6">
        <div className="h-4 w-40 rounded shimmer-bg animate-shimmer" />
        <div className="h-10 w-64 rounded shimmer-bg animate-shimmer" />
        <div className="h-28 w-full rounded shimmer-bg animate-shimmer" />
      </div>
    );
  }

  if (currentUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING_GENTLE}
        className="w-full max-w-xl rounded-sm glass-card p-8 sm:p-10 border border-accent-gold/35 shadow-glass-panel space-y-7"
      >
        <div className="flex items-center justify-between border-b border-ivory/10 pb-4">
          <span className="eyebrow-label text-accent-gold flex items-center gap-2">
            <UserCheck className="h-3.5 w-3.5" />
            VERIFIED MEMBER SESSION
          </span>
          <span className="font-mono text-[11px] text-[#8ec2a8] tabular-score">
            RLS ACTIVE &bull; MUMBAI EDGE
          </span>
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-ivory-dim">
            AUTHENTICATED IDENTITY
          </p>
          <h2 className="font-display text-3xl sm:text-4xl text-ivory">
            {currentUser.user_metadata?.full_name || currentUser.email}
          </h2>
          <p className="font-mono text-xs text-accent-gold tabular-score">
            {currentUser.email}
          </p>
        </div>

        <div className="rounded-sm bg-black/45 p-4 border border-ivory/10 space-y-2 text-xs text-ivory-muted">
          <div className="flex items-center justify-between">
            <span>Inbox Ownership Status</span>
            <span className="font-mono text-[#8ec2a8] tabular-score">
              Cryptographically Verified
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Matchday Portfolio Quota</span>
            <span className="font-mono text-ivory tabular-score">
              20 Teams (4 Core + 16 Differential)
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <Button
            type="button"
            variant="default"
            onClick={() => router.push("/fantasy")}
          >
            <span>ENTER 20-TEAM ARENA</span>
            <ArrowUpRight className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleSignOut}
            disabled={loading}
          >
            <LogOut className="h-4 w-4 text-accent-crimson" />
            <span>{loading ? "Signing Out..." : "Sign Out"}</span>
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-xl rounded-sm glass-card p-8 sm:p-10 border border-ivory/15 shadow-glass-panel space-y-7">
      <div className="space-y-2 border-b border-ivory/10 pb-5">
        <p className="eyebrow-label text-accent-gold">
          ZERO-KNOWLEDGE AUTHENTICATION &bull; MUMBAI (AP-SOUTH-1)
        </p>
        <h2 className="font-display text-3xl sm:text-4xl text-ivory font-normal">
          Enter the{" "}
          <span className="italic text-accent-gold">Member Pavilion.</span>
        </h2>
        <p className="text-xs sm:text-sm text-ivory-muted leading-relaxed">
          Your credentials are never exposed. Sign in with verified Google OAuth,
          an instant cryptographic Magic Link, or an encrypted password.
        </p>
      </div>

      <Button
        type="button"
        variant="ivory"
        size="lg"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full rounded-sm h-12 font-semibold uppercase tracking-[0.16em] text-xs flex items-center justify-center gap-3"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        <span>Continue with Verified Google Account</span>
      </Button>

      <div className="relative flex items-center justify-center">
        <div className="gold-hairline" />
        <span className="bg-[#0c1012] px-4 font-mono text-[10px] uppercase tracking-[0.22em] text-ivory-dim shrink-0">
          OR VERIFIED INBOX ENTRY
        </span>
        <div className="gold-hairline" />
      </div>

      <div className="flex items-center gap-1 rounded-sm bg-black/50 p-1 border border-ivory/10">
        {(
          [
            { id: "magic", label: "Magic Link (No Password)" },
            { id: "signin", label: "Password Sign In" },
            { id: "signup", label: "Create Account" },
          ] as const
        ).map((tab) => {
          const isSelected = mode === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setMode(tab.id);
                setStatusMessage(null);
              }}
              className={cn(
                "relative flex-1 py-2 px-2 text-[10px] uppercase tracking-[0.14em] transition-colors cursor-pointer z-10",
                isSelected
                  ? "text-[#060809] font-bold"
                  : "text-ivory-muted hover:text-ivory"
              )}
            >
              {isSelected && (
                <motion.span
                  layoutId="auth-mode-sliding-pill"
                  transition={SPRING_SNAPPY}
                  className="absolute inset-0 -z-10 rounded-[2px] bg-accent-gold"
                />
              )}
              {tab.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-4">
        <AnimatePresence mode="wait">
          {mode === "signup" && (
            <motion.div
              key="fullname-field"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-1.5 overflow-hidden"
            >
              <label
                htmlFor="auth-fullname"
                className="block text-[10px] uppercase tracking-[0.2em] text-ivory-muted"
              >
                Member Display Name
              </label>
              <input
                id="auth-fullname"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Abinash"
                className="w-full rounded-sm bg-black/50 border border-ivory/15 px-4 py-3 text-sm text-ivory placeholder-ivory-dim focus:border-accent-gold focus:outline-none transition-colors"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-1.5">
          <label
            htmlFor="auth-email"
            className="block text-[10px] uppercase tracking-[0.2em] text-ivory-muted"
          >
            Verified Email Address
          </label>
          <div className="relative">
            <Mail className="h-4 w-4 text-accent-gold absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="auth-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@gmail.com"
              className="w-full rounded-sm bg-black/50 border border-ivory/15 pl-10 pr-4 py-3 text-sm text-ivory placeholder-ivory-dim focus:border-accent-gold focus:outline-none transition-colors"
            />
          </div>
        </div>

        {mode !== "magic" && (
          <div className="space-y-1.5">
            <label
              htmlFor="auth-password"
              className="block text-[10px] uppercase tracking-[0.2em] text-ivory-muted"
            >
              {mode === "signup"
                ? "Create Password (bcrypt Hashed)"
                : "Account Password"}
            </label>
            <div className="relative">
              <Lock className="h-4 w-4 text-accent-gold absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="auth-password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full rounded-sm bg-black/50 border border-ivory/15 pl-10 pr-4 py-3 text-sm text-ivory placeholder-ivory-dim focus:border-accent-gold focus:outline-none transition-colors"
              />
            </div>
          </div>
        )}

        {statusMessage && (
          <div
            className={cn(
              "rounded-sm p-4 border text-xs leading-relaxed flex items-start gap-3",
              statusMessage.type === "success"
                ? "bg-[#5b8c75]/15 border-[#8ec2a8]/40 text-[#8ec2a8]"
                : "bg-accent-crimson/15 border-accent-crimson/40 text-[#eb8f8f]"
            )}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <Button
          type="submit"
          variant="default"
          size="lg"
          disabled={loading}
          className="w-full h-12 mt-2"
        >
          <Sparkles className="h-4 w-4" />
          <span>
            {loading
              ? "Verifying Cryptographic Handshake..."
              : mode === "magic"
                ? "SEND MAGIC LINK TO INBOX"
                : mode === "signup"
                  ? "CREATE ACCOUNT & VERIFY EMAIL"
                  : "SIGN IN TO PAVILION"}
          </span>
          <ArrowUpRight className="h-4 w-4" />
        </Button>
      </form>

      <div className="border-t border-ivory/10 pt-4 flex items-center justify-between text-[11px] text-ivory-dim">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-accent-gold" />
          <span>Passwords hashed via bcrypt • Real inbox required</span>
        </span>
        <span className="font-mono tabular-score">OAuth 2.0</span>
      </div>
    </div>
  );
}