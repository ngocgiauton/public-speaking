"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatDate } from "@/lib/utils/format";

export function ProgressLineChart({
  data,
  dataKey,
  label,
  color = "var(--color-tertiary)",
}: {
  data: Record<string, string | number>[];
  dataKey: string;
  label: string;
  color?: string;
}) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="date" tickFormatter={(v) => formatDate(v)} tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip labelFormatter={(v) => formatDate(v as string)} />
          <Line type="monotone" dataKey={dataKey} name={label} stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
