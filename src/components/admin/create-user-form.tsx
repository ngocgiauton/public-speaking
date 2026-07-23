"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { createUserAction } from "@/features/admin/users/actions";
import type { ActionState } from "@/features/auth/actions";

const initialState: ActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Đang tạo..." : "Tạo tài khoản"}
    </Button>
  );
}

export function CreateUserForm() {
  const [state, formAction] = useActionState(createUserAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      {state.error && (
        <p role="alert" className="rounded-[var(--radius-control)] bg-brand-error/10 p-3 text-sm text-brand-error">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="rounded-[var(--radius-control)] bg-brand-success/10 p-3 text-sm text-brand-success">
          {state.success}
        </p>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fullName">Họ tên</Label>
          <Input id="fullName" name="fullName" required maxLength={100} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="role">Vai trò</Label>
          <Select id="role" name="role" defaultValue="student">
            <option value="student">Học viên</option>
            <option value="parent">Phụ huynh</option>
            <option value="teacher">Giáo viên</option>
            <option value="admin">Quản trị viên</option>
          </Select>
        </div>
      </div>
      <div>
        <SubmitButton />
      </div>
    </form>
  );
}
