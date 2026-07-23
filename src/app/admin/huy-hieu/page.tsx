import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { DataTable } from "@/components/shared/data-table";
import { SimpleActionForm } from "@/components/admin/simple-action-form";
import { PublishToggleButton } from "@/components/admin/publish-toggle-button";
import { AchievementBadge } from "@/components/gamification/achievement-badge";
import { createBadgeAction, toggleBadgeActiveAction } from "@/features/admin/badges/actions";
import { listBadgesAdmin } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Huy hiệu", robots: { index: false } };

export default async function AdminBadgesPage() {
  const badges = await listBadgesAdmin();

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageHeader title="Huy hiệu" breadcrumbs={[{ label: "Tổng quan", href: "/admin" }, { label: "Huy hiệu" }]} />

      <Card>
        <CardHeader>
          <CardTitle>Tạo huy hiệu mới</CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleActionForm action={createBadgeAction} submitLabel="Tạo huy hiệu">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name">Tên huy hiệu</Label>
                <Input id="name" name="name" required maxLength={150} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" name="slug" required placeholder="vi-du-huy-hieu" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="icon">Icon (tên lucide-react, viết thường)</Label>
                <Input id="icon" name="icon" defaultValue="award" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="rarity">Độ hiếm</Label>
                <Select id="rarity" name="rarity" defaultValue="common">
                  <option value="common">Common</option>
                  <option value="rare">Rare</option>
                  <option value="epic">Epic</option>
                  <option value="legendary">Legendary</option>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label htmlFor="criteriaType">Loại điều kiện</Label>
                <Select id="criteriaType" name="criteriaType" defaultValue="manual">
                  <option value="lesson_complete">Hoàn thành bài học</option>
                  <option value="quiz_score">Điểm quiz</option>
                  <option value="assignment_approved">Bài tập được duyệt</option>
                  <option value="streak">Chuỗi ngày học</option>
                  <option value="total_xp">Tổng XP</option>
                  <option value="skill_score">Điểm kỹ năng</option>
                  <option value="manual">Trao thủ công</option>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea id="description" name="description" maxLength={500} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="isActive" defaultChecked /> Kích hoạt ngay
            </label>
          </SimpleActionForm>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {badges.map((b) => (
          <div key={b.id} className="flex flex-col items-center gap-2">
            <AchievementBadge name={b.name} description={b.description ?? undefined} icon={b.icon} rarity={b.rarity} awarded={b.is_active} />
            <PublishToggleButton
              isPublished={b.is_active}
              onToggle={toggleBadgeActiveAction.bind(null, b.id)}
              onLabel="Kích hoạt"
              offLabel="Tắt"
            />
          </div>
        ))}
      </div>

      <DataTable
        columns={[
          { key: "name", header: "Tên", render: (row) => row.name },
          { key: "rarity", header: "Độ hiếm", render: (row) => row.rarity },
          { key: "criteria", header: "Loại điều kiện", render: (row) => row.criteria_type },
        ]}
        rows={badges}
        emptyTitle="Chưa có huy hiệu nào"
      />
    </div>
  );
}
