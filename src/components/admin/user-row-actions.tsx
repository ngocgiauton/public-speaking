"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { toggleUserStatusAction, updateUserRoleAction } from "@/features/admin/users/actions";
import type { UserRole } from "@/types/database";

export function UserRowActions({ userId, role, status }: { userId: string; role: UserRole; status: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleRoleChange(newRole: UserRole) {
    startTransition(async () => {
      await updateUserRoleAction(userId, newRole);
      router.refresh();
    });
  }

  function handleToggleStatus() {
    startTransition(async () => {
      await toggleUserStatusAction(userId, status === "active" ? "locked" : "active");
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        aria-label="Vai trò"
        value={role}
        disabled={isPending}
        onChange={(e) => handleRoleChange(e.target.value as UserRole)}
        className="w-32"
      >
        <option value="student">Học viên</option>
        <option value="parent">Phụ huynh</option>
        <option value="teacher">Giáo viên</option>
        <option value="admin">Quản trị viên</option>
      </Select>
      <Button size="sm" variant={status === "active" ? "outline" : "primary"} disabled={isPending} onClick={handleToggleStatus}>
        {status === "active" ? "Khóa" : "Kích hoạt"}
      </Button>
    </div>
  );
}
