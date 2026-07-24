"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileVideo, FileAudio, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatFileSize } from "@/lib/utils/format";
import { uploadSubmissionMedia } from "@/lib/storage/upload";
import { attachSubmissionFileAction, removeSubmissionFileAction } from "@/features/submissions/actions";
import type { SubmissionFileRow } from "@/types/database";

export interface MediaUploaderProps {
  submissionId: string;
  studentProfileId: string;
  kind: "video" | "audio";
  maxMb: number;
  files: SubmissionFileRow[];
  disabled?: boolean;
}

export function MediaUploader({ submissionId, studentProfileId, kind, maxMb, files, disabled }: MediaUploaderProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const Icon = kind === "video" ? FileVideo : FileAudio;
  const label = kind === "video" ? "video" : "âm thanh";
  const accept = kind === "video" ? "video/mp4,video/webm,video/quicktime" : "audio/mpeg,audio/mp4,audio/webm";

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setProgress(5);

    const uploadResult = await uploadSubmissionMedia(file, studentProfileId, submissionId, kind, setProgress);
    if (uploadResult.error) {
      setError(uploadResult.error);
      setProgress(null);
      return;
    }

    const attachResult = await attachSubmissionFileAction({
      submissionId,
      storagePath: uploadResult.path,
      fileType: kind,
      originalFilename: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
    });

    setProgress(null);
    if (inputRef.current) inputRef.current.value = "";

    if (attachResult.error) {
      setError(attachResult.error);
      return;
    }
    router.refresh();
  }

  async function handleRemove(fileId: string, storagePath: string) {
    await removeSubmissionFileAction(fileId, storagePath);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="font-label-md text-label-md text-on-surface">
        Tải lên {label} <span className="text-on-surface-variant">(tối đa {maxMb}MB)</span>
      </p>

      {files.length > 0 && (
        <ul className="flex flex-col gap-2">
          {files.map((file) => (
            <li
              key={file.id}
              className="flex items-center justify-between gap-2 rounded-[var(--radius-control)] border border-outline-variant bg-surface-container-lowest p-2 text-sm"
            >
              <span className="flex items-center gap-2 truncate">
                <Icon className="h-4 w-4 shrink-0 text-primary" />
                <span className="truncate text-on-surface">{file.original_filename}</span>
                {file.size_bytes != null && (
                  <span className="text-xs text-on-surface-variant">{formatFileSize(file.size_bytes)}</span>
                )}
              </span>
              {!disabled && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Xóa file"
                  onClick={() => handleRemove(file.id, file.storage_path)}
                >
                  <Trash2 className="h-4 w-4 text-brand-error" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}

      {!disabled && (
        <label
          htmlFor={`upload-${kind}-${submissionId}`}
          className="flex cursor-pointer flex-col items-center gap-3 rounded-[var(--radius-card)] border-2 border-dashed border-outline-variant bg-surface-container-low px-6 py-10 text-center transition-colors hover:border-primary hover:bg-surface-container-lowest"
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
            id={`upload-${kind}-${submissionId}`}
          />
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-container-highest text-primary">
            <Upload className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <p className="font-headline-md text-headline-md text-on-surface">Kéo và thả {label} vào đây</p>
            <p className="mt-1 text-sm text-on-surface-variant">hoặc bấm để chọn file từ máy của bạn</p>
          </div>
          <Button type="button" variant="primary" asChild>
            <span>
              <Upload className="h-4 w-4" /> Chọn file {label}
            </span>
          </Button>
        </label>
      )}

      {progress != null && <Progress value={progress} label="Tiến trình tải lên" />}
      {error && <p className="text-sm text-brand-error">{error}</p>}
    </div>
  );
}

export function VideoUploader(props: Omit<MediaUploaderProps, "kind">) {
  return <MediaUploader {...props} kind="video" />;
}

export function AudioUploader(props: Omit<MediaUploaderProps, "kind">) {
  return <MediaUploader {...props} kind="audio" />;
}
