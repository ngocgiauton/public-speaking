"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { submitConsultationLeadAction } from "@/features/leads/actions";
import type { ActionState } from "@/features/auth/actions";

const initialState: ActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="gold" size="lg" disabled={pending} className="w-full sm:w-auto">
      {pending ? "Đang gửi..." : "Gửi đăng ký tư vấn"}
    </Button>
  );
}

export function ConsultationForm() {
  const [state, formAction] = useActionState(submitConsultationLeadAction, initialState);

  if (state.success) {
    return (
      <div
        role="status"
        className="rounded-[var(--radius-card)] border border-brand-success/30 bg-brand-success/5 p-6 text-center"
      >
        <p className="font-heading font-semibold text-brand-success">Đã gửi thành công!</p>
        <p className="mt-1 text-sm text-muted-foreground">{state.success}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      {state.error && (
        <p role="alert" className="rounded-[var(--radius-control)] bg-brand-error/10 p-3 text-sm text-brand-error">
          {state.error}
        </p>
      )}

      <fieldset className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <legend className="sr-only">Thông tin học viên</legend>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="student_full_name">Họ tên học viên *</Label>
          <Input id="student_full_name" name="student_full_name" required maxLength={100} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="student_date_of_birth">Ngày sinh</Label>
          <Input id="student_date_of_birth" name="student_date_of_birth" type="date" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="school">Trường học</Label>
          <Input id="school" name="school" maxLength={150} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="english_level">Trình độ tiếng Anh</Label>
          <Select id="english_level" name="english_level" defaultValue="">
            <option value="">Chọn trình độ</option>
            <option value="chua_biet">Chưa biết</option>
            <option value="co_ban">Cơ bản</option>
            <option value="trung_binh">Trung bình</option>
            <option value="kha_tot">Khá tốt</option>
          </Select>
        </div>
      </fieldset>

      <fieldset className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <legend className="sr-only">Thông tin phụ huynh</legend>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="parent_full_name">Họ tên phụ huynh *</Label>
          <Input id="parent_full_name" name="parent_full_name" required maxLength={100} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone">Số điện thoại *</Label>
          <Input id="phone" name="phone" type="tel" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="preferred_format">Hình thức học mong muốn</Label>
          <Select id="preferred_format" name="preferred_format" defaultValue="">
            <option value="">Chọn hình thức</option>
            <option value="online">Trực tuyến (Online)</option>
            <option value="offline">Trực tiếp (Offline)</option>
            <option value="either">Cả hai đều được</option>
          </Select>
        </div>
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="learning_goal">Mục tiêu học tập</Label>
        <Textarea id="learning_goal" name="learning_goal" maxLength={500} placeholder="Ví dụ: con muốn tự tin hơn khi phát biểu trước lớp" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="preferred_schedule">Khung giờ phù hợp</Label>
        <Input id="preferred_schedule" name="preferred_schedule" placeholder="Ví dụ: tối các ngày trong tuần" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="note">Ghi chú</Label>
        <Textarea id="note" name="note" maxLength={1000} />
      </div>

      <div className="flex items-start gap-2">
        <input id="consent" name="consent" type="checkbox" required className="mt-1 h-4 w-4" />
        <Label htmlFor="consent" className="font-normal">
          Tôi đồng ý với{" "}
          <a href="/bao-mat" className="text-brand-royal underline">
            Chính sách bảo mật
          </a>{" "}
          của Royal Public Speaking Club. *
        </Label>
      </div>

      <SubmitButton />
    </form>
  );
}
