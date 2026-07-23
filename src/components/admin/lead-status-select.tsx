"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Select } from "@/components/ui/select";
import { updateLeadStatusAction } from "@/features/admin/leads/actions";
import type { LeadStatus } from "@/types/database";

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "Mới",
  contacted: "Đã liên hệ",
  consulting: "Đang tư vấn",
  registered: "Đã đăng ký",
  not_suitable: "Không phù hợp",
};

export function LeadStatusSelect({ leadId, status }: { leadId: string; status: LeadStatus }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      aria-label="Trạng thái lead"
      value={status}
      disabled={isPending}
      onChange={(e) =>
        startTransition(async () => {
          await updateLeadStatusAction(leadId, e.target.value as LeadStatus);
          router.refresh();
        })
      }
      className="w-40"
    >
      {Object.entries(STATUS_LABELS).map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </Select>
  );
}
