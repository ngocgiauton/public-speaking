"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterField {
  key: string;
  label: string;
  type: "search" | "select";
  options?: FilterOption[];
  placeholder?: string;
}

/** Thanh lọc dữ liệu dùng chung cho các trang danh sách CRUD của admin/teacher. */
export function FilterBar({ fields }: { fields: FilterField[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {fields.map((field) => {
        const current = searchParams.get(field.key) ?? "";
        if (field.type === "search") {
          return (
            <Input
              key={field.key}
              defaultValue={current}
              placeholder={field.placeholder ?? field.label}
              aria-label={field.label}
              className="w-full sm:w-64"
              onChange={(e) => updateParam(field.key, e.target.value)}
            />
          );
        }
        return (
          <Select
            key={field.key}
            defaultValue={current}
            aria-label={field.label}
            className="w-full sm:w-48"
            onChange={(e) => updateParam(field.key, e.target.value)}
          >
            <option value="">{field.label}: Tất cả</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        );
      })}
    </div>
  );
}
