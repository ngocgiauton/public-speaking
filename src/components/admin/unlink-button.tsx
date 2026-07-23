"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { unlinkParentStudentAction } from "@/features/admin/users/actions";

export function UnlinkButton({ linkId }: { linkId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      aria-label="Hủy liên kết"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await unlinkParentStudentAction(linkId);
          router.refresh();
        })
      }
      className="text-muted-foreground hover:text-brand-error"
    >
      <X className="h-3 w-3" />
    </button>
  );
}
