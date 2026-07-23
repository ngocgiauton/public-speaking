"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/features/auth/actions";

export function PublishToggleButton({
  isPublished,
  onToggle,
  onLabel = "Xuất bản",
  offLabel = "Ẩn",
}: {
  isPublished: boolean;
  onToggle: (nextValue: boolean) => Promise<ActionState>;
  onLabel?: string;
  offLabel?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      variant={isPublished ? "outline" : "primary"}
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await onToggle(!isPublished);
          router.refresh();
        })
      }
    >
      {isPublished ? offLabel : onLabel}
    </Button>
  );
}
