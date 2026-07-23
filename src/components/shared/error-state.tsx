import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ErrorState({
  title = "Đã có lỗi xảy ra",
  description = "Vui lòng thử lại sau. Nếu lỗi tiếp tục xảy ra, hãy liên hệ quản trị viên.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-3 rounded-[var(--radius-card)] border border-brand-error/30 bg-brand-error/5 p-10 text-center"
    >
      <AlertTriangle className="h-10 w-10 text-brand-error" aria-hidden="true" />
      <div>
        <p className="font-heading font-semibold text-brand-error">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Thử lại
        </Button>
      )}
    </div>
  );
}

export function UnauthorizedState() {
  return (
    <ErrorState
      title="Bạn không có quyền truy cập"
      description="Nội dung này chỉ dành cho vai trò phù hợp. Vui lòng đăng nhập đúng tài khoản hoặc liên hệ quản trị viên."
    />
  );
}
