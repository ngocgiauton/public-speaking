"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { signInAction, type ActionState } from "@/features/auth/actions";

const initialState: ActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" size="lg" disabled={pending}>
      {pending ? "Đang đăng nhập..." : "Đăng nhập"}
    </Button>
  );
}

export function LoginForm({ redirectTo, initialError }: { redirectTo?: string; initialError?: string }) {
  const [state, formAction] = useActionState(signInAction, initialError ? { error: initialError } : initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="redirectTo" value={redirectTo ?? ""} />

      {state.error && (
        <p role="alert" className="rounded-[var(--radius-control)] bg-brand-error/10 p-3 text-sm text-brand-error">
          {state.error}
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Mật khẩu</Label>
        <Input id="password" name="password" type="password" required autoComplete="current-password" />
      </div>

      <div className="flex justify-end">
        <Link href="/quen-mat-khau" className="text-sm text-brand-royal hover:underline">
          Quên mật khẩu?
        </Link>
      </div>

      <SubmitButton />
    </form>
  );
}
