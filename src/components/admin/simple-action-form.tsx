"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/features/auth/actions";

const initialState: ActionState = {};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? "Đang xử lý..." : label}
    </Button>
  );
}

/** Form dùng chung cho các thao tác admin đơn giản (chọn + submit qua server action). */
export function SimpleActionForm({
  action,
  submitLabel,
  children,
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  submitLabel: string;
  children: React.ReactNode;
}) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3" noValidate>
      {state.error && <p className="text-sm text-brand-error">{state.error}</p>}
      {state.success && <p className="text-sm text-brand-success">{state.success}</p>}
      {children}
      <div>
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
