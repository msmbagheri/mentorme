"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/admin";

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [captcha, setCaptcha] = React.useState<{ token: string; image: string } | null>(null);
  const [captchaAnswer, setCaptchaAnswer] = React.useState("");

  const loadCaptcha = React.useCallback(async () => {
    setCaptchaAnswer("");
    try {
      const res = await fetch("/api/auth/captcha", { cache: "no-store" });
      const json = await res.json();
      setCaptcha({ token: json.token, image: json.image });
    } catch {
      setCaptcha(null);
    }
  }, []);

  React.useEffect(() => {
    loadCaptcha();
  }, [loadCaptcha]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      captchaToken: captcha?.token ?? "",
      captchaAnswer,
      redirect: false,
    });
    setLoading(false);
    if (!res || res.error) {
      setError("Invalid email, password, or captcha. Please try again.");
      // The token may be spent/expired — always issue a fresh challenge.
      loadCaptcha();
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="items-center text-center">
        <span className="text-h3 font-bold text-gradient-logo">MentorMe</span>
        <CardTitle className="mt-2">Admin sign in</CardTitle>
        <CardDescription>Sign in to manage content, leads, and settings.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
          {error ? (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-error-soft)] px-4 py-3 text-small text-[var(--color-error)]"
            >
              <AlertCircle className="size-5 shrink-0" aria-hidden />
              {error}
            </div>
          ) : null}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="captcha">Enter the code shown</Label>
            <div className="flex items-center gap-2">
              {captcha ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={captcha.image}
                  alt="Captcha challenge"
                  width={160}
                  height={52}
                  className="h-[52px] w-[160px] shrink-0 rounded-[var(--radius-md)] border border-[var(--color-border)]"
                />
              ) : (
                <div className="h-[52px] w-[160px] shrink-0 animate-pulse rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-alt)]" />
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Refresh captcha"
                onClick={loadCaptcha}
              >
                <RefreshCw className="size-5" aria-hidden />
              </Button>
            </div>
            <Input
              id="captcha"
              name="captcha"
              autoComplete="off"
              inputMode="text"
              required
              value={captchaAnswer}
              onChange={(e) => setCaptchaAnswer(e.target.value)}
              placeholder="Code"
            />
          </div>

          <Button type="submit" variant="cta" size="lg" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="size-5 animate-spin" aria-hidden />
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </Button>

          <p className="text-center text-caption text-[var(--color-text-muted)]">
            Seeded admin: <span className="font-medium">admin@example.com</span> /{" "}
            <span className="font-medium">Admin12345!</span>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
