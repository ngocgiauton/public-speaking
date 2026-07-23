"use client";

import { useActionState, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { uploadAvatar } from "@/lib/storage/upload";
import { updateProfileAction, updateAvatarAction } from "@/features/profile/actions";
import type { ActionState } from "@/features/auth/actions";

const initialState: ActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Đang lưu..." : "Lưu thay đổi"}
    </Button>
  );
}

export function ProfileForm({
  profileId,
  fullName,
  phone,
  avatarUrl,
  email,
}: {
  profileId: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  email: string | null;
}) {
  const [state, formAction] = useActionState(updateProfileAction, initialState);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await uploadAvatar(file, profileId);
    if (!result.error) {
      await updateAvatarAction(result.path);
      window.location.reload();
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Avatar name={fullName} src={avatarUrl} size={64} />
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleAvatarChange}
          />
          <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            Đổi ảnh đại diện
          </Button>
        </div>
      </div>

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

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={email ?? ""} disabled />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="full_name">Họ và tên</Label>
          <Input id="full_name" name="full_name" defaultValue={fullName} required maxLength={100} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone">Số điện thoại</Label>
          <Input id="phone" name="phone" defaultValue={phone ?? ""} type="tel" />
        </div>
        <SubmitButton />
      </form>
    </div>
  );
}
