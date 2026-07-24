import type { Metadata } from "next";
import { Award } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/utils/format";
import { getCurrentUser } from "@/lib/auth/session";
import { getStudentCertificates } from "@/lib/data/student";

export const metadata: Metadata = { title: "Chứng nhận", robots: { index: false } };

export default async function CertificatesPage() {
  const user = await getCurrentUser();
  const certificates = await getStudentCertificates(user!.id);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageHeader
        title="Chứng nhận"
        description="Ghi nhận chính thức cho những khóa học bạn đã hoàn thành."
        breadcrumbs={[{ label: "Tổng quan", href: "/student" }, { label: "Chứng nhận" }]}
      />

      {certificates.length === 0 ? (
        <EmptyState
          icon={Award}
          title="Chưa có chứng nhận nào"
          description="Hoàn thành khóa học để nhận chứng nhận từ Royal Public Speaking Club."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {certificates.map(({ studentCertificate, certificate }) => (
            <Card key={studentCertificate.id} className="flex flex-col gap-4 p-6">
              <div className="flex h-32 w-full items-center justify-center rounded-[var(--radius-control)] bg-gradient-to-br from-primary-container via-tertiary-container to-secondary-container">
                <Award className="h-12 w-12 text-on-primary-container/80" aria-hidden="true" />
              </div>
              <div>
                <Badge variant="gold">Chứng nhận</Badge>
                <p className="mt-2 font-headline-md text-headline-md text-on-surface">{certificate?.name}</p>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Số hiệu: {studentCertificate.certificate_number}
                </p>
                <p className="text-sm text-on-surface-variant">Cấp ngày: {formatDate(studentCertificate.issued_at)}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
