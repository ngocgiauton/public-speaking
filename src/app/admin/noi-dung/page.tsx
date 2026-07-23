import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DataTable } from "@/components/shared/data-table";
import { SimpleActionForm } from "@/components/admin/simple-action-form";
import { PublishToggleButton } from "@/components/admin/publish-toggle-button";
import {
  createFaqItemAction,
  toggleFaqPublishAction,
  createTestimonialAction,
  toggleTestimonialPublishAction,
  updateSiteSettingAction,
} from "@/features/admin/content/actions";
import { getSiteSettingsAdmin, listFaqItemsAdmin, listTestimonialsAdmin } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Nội dung website", robots: { index: false } };

export default async function AdminContentPage() {
  const [faqItems, testimonials, siteSettings] = await Promise.all([
    listFaqItemsAdmin(),
    listTestimonialsAdmin(),
    getSiteSettingsAdmin(),
  ]);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageHeader title="Nội dung website" breadcrumbs={[{ label: "Tổng quan", href: "/admin" }, { label: "Nội dung" }]} />

      <Tabs defaultValue="faq">
        <TabsList>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="testimonials">Phản hồi</TabsTrigger>
          <TabsTrigger value="settings">Cài đặt nội dung</TabsTrigger>
        </TabsList>

        <TabsContent value="faq">
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Thêm câu hỏi FAQ</CardTitle>
              </CardHeader>
              <CardContent>
                <SimpleActionForm action={createFaqItemAction} submitLabel="Thêm FAQ">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="question">Câu hỏi</Label>
                    <Input id="question" name="question" required maxLength={300} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="answer">Câu trả lời</Label>
                    <Textarea id="answer" name="answer" required maxLength={2000} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="orderIndex">Thứ tự</Label>
                    <Input id="orderIndex" name="orderIndex" type="number" min={0} defaultValue={faqItems.length} />
                  </div>
                </SimpleActionForm>
              </CardContent>
            </Card>

            <DataTable
              columns={[
                { key: "question", header: "Câu hỏi", render: (row) => row.question },
                {
                  key: "status",
                  header: "Trạng thái",
                  render: (row) => <Badge variant={row.is_published ? "success" : "neutral"}>{row.is_published ? "Hiển thị" : "Ẩn"}</Badge>,
                },
                {
                  key: "actions",
                  header: "Thao tác",
                  render: (row) => (
                    <PublishToggleButton
                      isPublished={row.is_published}
                      onToggle={toggleFaqPublishAction.bind(null, row.id)}
                      onLabel="Hiển thị"
                    />
                  ),
                },
              ]}
              rows={faqItems}
              emptyTitle="Chưa có câu hỏi FAQ nào"
            />
          </div>
        </TabsContent>

        <TabsContent value="testimonials">
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Thêm phản hồi</CardTitle>
              </CardHeader>
              <CardContent>
                <SimpleActionForm action={createTestimonialAction} submitLabel="Thêm phản hồi">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="authorName">Tên người phản hồi</Label>
                      <Input id="authorName" name="authorName" required maxLength={150} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="authorRole">Vai trò (VD: Phụ huynh)</Label>
                      <Input id="authorRole" name="authorRole" maxLength={100} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="content">Nội dung</Label>
                    <Textarea id="content" name="content" required maxLength={1000} />
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="isPlaceholder" defaultChecked />
                    Đây là nội dung minh họa (chưa phải phản hồi thực tế)
                  </label>
                </SimpleActionForm>
              </CardContent>
            </Card>

            <DataTable
              columns={[
                { key: "author", header: "Người phản hồi", render: (row) => row.author_name },
                { key: "content", header: "Nội dung", render: (row) => row.content },
                {
                  key: "placeholder",
                  header: "Loại",
                  render: (row) => <Badge variant={row.is_placeholder ? "warning" : "success"}>{row.is_placeholder ? "Minh họa" : "Thực tế"}</Badge>,
                },
                {
                  key: "actions",
                  header: "Thao tác",
                  render: (row) => (
                    <PublishToggleButton
                      isPublished={row.is_published}
                      onToggle={toggleTestimonialPublishAction.bind(null, row.id)}
                      onLabel="Hiển thị"
                    />
                  ),
                },
              ]}
              rows={testimonials}
              emptyTitle="Chưa có phản hồi nào"
            />
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Cập nhật nội dung placeholder</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                Cập nhật ghi chú cho các nội dung đang ở trạng thái placeholder (tiểu sử chủ nhiệm, độ tuổi,
                học phí, thông tin liên hệ...).
              </p>
              {siteSettings.map((setting) => (
                <SimpleActionForm key={setting.key} action={updateSiteSettingAction} submitLabel="Lưu">
                  <input type="hidden" name="key" value={setting.key} />
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={`value-${setting.key}`}>{setting.key}</Label>
                    <Textarea
                      id={`value-${setting.key}`}
                      name="value"
                      defaultValue={
                        typeof setting.value === "object" && setting.value && "note" in setting.value
                          ? String((setting.value as { note: unknown }).note)
                          : ""
                      }
                      maxLength={2000}
                    />
                  </div>
                </SimpleActionForm>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
