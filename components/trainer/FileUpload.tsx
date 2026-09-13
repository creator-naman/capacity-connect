"use client";

import { useRef, useState } from "react";
import { FileUp, CircleCheck, CircleAlert, LoaderCircle } from "lucide-react";
import type { StoredFileMeta } from "@/lib/types/domain";
import { Button } from "@/components/ui/Button";

const ACCEPTED = ".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.csv,.txt,.mp4,.mp3,.png,.jpg,.jpeg";
const MAX_BYTES = 25 * 1024 * 1024;

/**
 * File picker + uploader with real progress. The browser validates
 * extension/size first, then streams to /api/resources/upload via XHR so
 * upload progress can be shown; the server re-validates everything.
 */
export function FileUpload({
  onUploaded,
  onError,
}: {
  onUploaded: (file: StoredFileMeta) => void;
  onError?: (message: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | undefined>();

  const startUpload = (file: File) => {
    setError(undefined);

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ACCEPTED.split(",").includes(`.${ext}`)) {
      setError(`Unsupported file type ".${ext}".`);
      onError?.(error ?? "");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("File is too large — the limit is 25 MB.");
      onError?.(error ?? "");
      return;
    }

    const form = new FormData();
    form.append("file", file);

    // XHR (not fetch) for upload progress events.
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/resources/upload");
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        setProgress(Math.round((event.loaded / event.total) * 100));
      }
    });
    xhr.addEventListener("load", () => {
      setProgress(null);
      try {
        const body = JSON.parse(xhr.responseText) as { file?: StoredFileMeta; error?: string };
        if (xhr.status >= 200 && xhr.status < 300 && body.file) {
          onUploaded(body.file);
        } else {
          setError(body.error ?? "Upload failed.");
          onError?.(body.error ?? "Upload failed.");
        }
      } catch {
        setError("Upload failed — try again.");
        onError?.("Upload failed.");
      }
    });
    xhr.addEventListener("error", () => {
      setProgress(null);
      setError("Upload failed — check your connection and try again.");
      onError?.("Upload failed.");
    });
    setProgress(0);
    xhr.send(form);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        className="sr-only"
        aria-label="Resource file"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) startUpload(file);
          event.target.value = "";
        }}
      />
      <div className="flex items-center gap-2">
        <Button type="button" size="sm" variant="secondary" onClick={() => inputRef.current?.click()}>
          <FileUp size={14} strokeWidth={1.75} />
          Choose file
        </Button>
        {progress !== null ? (
          <span className="flex items-center gap-1.5 text-xs text-ink-secondary">
            <LoaderCircle size={13} className="animate-spin" />
            Uploading… {progress}%
          </span>
        ) : null}
      </div>
      {progress !== null ? (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-sunken">
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      ) : null}
      {error ? (
        <p role="alert" className="flex items-center gap-1 text-xs font-medium text-error">
          <CircleAlert size={12} strokeWidth={2} />
          {error}
        </p>
      ) : null}
      <p className="text-xs text-ink-muted">
        PDF, PPT/PPTX, DOC/DOCX, XLS/XLSX, CSV, TXT, MP4, MP3, PNG, JPG — up to 25 MB.
      </p>
    </div>
  );
}

/** Compact confirmation shown next to an uploaded file. */
export function FileUploadedChip({ file }: { file: StoredFileMeta }) {
  return (
    <span className="flex items-center gap-1 text-xs font-medium text-success">
      <CircleCheck size={12} strokeWidth={2} />
      {file.name} ({Math.max(1, Math.round(file.bytes / 1024))} KB) ready
    </span>
  );
}
