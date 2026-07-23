import type { Metadata } from "next";
import { Award } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/utils/format";
import { getCurrentUser } from "@/lib/auth/session";
import { getStudentCertificates } from "@/lib/data/student";

export const metadata: Metadata = { title: "Chứng nhận", robots: { index: false } };

export default async function CertificatesPage() {
  const user = await getCurrentUser();
  const certificates = await getStudentCertificates(user!.id);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader title="Chứng nhận" breadcrumbs={[{ label: "Tổng quan", href: "/student" }, { label: "Chứng nhận" }]} />

      {certificates.length === 0 ? (
        <EmptyState
          icon={Award}
          title="Chưa có chứng nhận nào"
          description="Hoàn thành khóa học để nhận chứng nhận từ Royal Public Speaking Club."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {certificates.map(({ studentCertificate, certificate }) => (
            <Card key={studentCertificate.id}>
              <CardContent className="flex flex-col gap-2 p-5">
                <Award className="h-8 w-8 text-brand-gold" />
                <p className="font-heading font-semibold">{certificate?.name}</p>
                <p className="text-sm text-muted-foreground">
                  Số hiệu: {studentCertificate.certificate_number}
                </p>
                <p className="text-sm text-muted-foreground">
                  Cấp ngày: {formatDate(studentCertificate.issued_at)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
