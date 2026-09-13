"use client";

import { useEffect, useState } from "react";
import {
  FolderOpen,
  Plus,
  Trash2,
  MonitorPlay,
  Presentation,
  FileText,
  Database,
  BookMarked,
  Globe,
  Link2,
  Link2Off,
} from "lucide-react";
import type { LibraryItem, ResourceKind, StoredFileMeta } from "@/lib/types/domain";
import { useTrainerStore } from "@/lib/store/trainer-store";
import { readSharedCatalog, type PublishedResource } from "@/lib/store/shared-catalog";
import { FileUpload, FileUploadedChip } from "./FileUpload";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonClassName } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate, formatMinutes } from "@/lib/format";

const kindIcon = {
  "recorded-lecture": MonitorPlay,
  presentation: Presentation,
  "study-material": FileText,
  dataset: Database,
  reference: BookMarked,
} as const;

const kindLabel: Record<ResourceKind, string> = {
  "recorded-lecture": "Recorded lecture",
  presentation: "Presentation",
  "study-material": "Study material",
  dataset: "Dataset",
  reference: "Reference",
};

/**
 * Trainer library: reusable recorded lectures, decks, readings, and datasets.
 * In demo mode items are descriptive records; a real deployment attaches
 * uploaded media from object storage.
 */
export function LibraryView() {
  const { state, hydrated, addLibraryItem, removeLibraryItem, updateLibraryItemFile, publishResource, unpublishResource } = useTrainerStore();
  const [kindFilter, setKindFilter] = useState<"all" | ResourceKind>("all");
  const [addOpen, setAddOpen] = useState(false);
  const [attaching, setAttaching] = useState<LibraryItem | null>(null);
  const [replacing, setReplacing] = useState<LibraryItem | null>(null);
  // Published attachments live in the shared catalog; mirror it locally so
  // statuses update right after a publish/unpublish.
  const [published, setPublished] = useState<PublishedResource[]>([]);

  useEffect(() => {
    const refresh = () => setPublished(readSharedCatalog().resources);
    refresh();
    window.addEventListener("cc-catalog-changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("cc-catalog-changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const filtered = state.library.filter((item) => kindFilter === "all" || item.kind === kindFilter);

  /** Deleting an item also deletes its stored file, when it has one. */
  const removeItem = async (item: LibraryItem) => {
    if (item.file) {
      await fetch(`/api/resources/file?path=${encodeURIComponent(item.file.path)}`, {
        method: "DELETE",
      }).catch(() => undefined); // file deletion is best-effort; metadata removal proceeds
    }
    removeLibraryItem(item.id);
  };

  if (!hydrated) return <PageSkeleton withStats={false} />;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Library"
        lead="Your reusable lectures, decks, readings, and datasets."
        actions={
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus size={14} strokeWidth={2} />
            Add item
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-1.5">
        <Chip label="All items" active={kindFilter === "all"} onClick={() => setKindFilter("all")} />
        {(Object.keys(kindLabel) as ResourceKind[]).map((kind) => (
          <Chip key={kind} label={kindLabel[kind]} active={kindFilter === kind} onClick={() => setKindFilter(kind)} />
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title={state.library.length === 0 ? "Library is empty" : "Nothing in this category"}
          description="Add lectures, slide decks, readings, or datasets you reuse across cohorts."
          action={
            <button type="button" className={buttonClassName("primary", "sm")} onClick={() => setAddOpen(true)}>
              Add your first item
            </button>
          }
        />
      ) : (
        <Card className="divide-y divide-[var(--color-border)]">
          {filtered.map((item) => {
            const Icon = kindIcon[item.kind];
            const attachment = published.find((r) => r.id === item.id);
            const attachedCourse = attachment
              ? state.courses.find((c) => c.id === attachment.courseId)
              : undefined;
            const attachedModuleIndex = attachment && attachedCourse
              ? attachedCourse.modules.findIndex((m) => m.id === attachment.moduleId) + 1
              : 0;
            return (
              <div key={item.id} className="flex items-start gap-3.5 px-5 py-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-primary-soft text-primary">
                  <Icon size={18} strokeWidth={1.75} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">{item.title}</p>
                  <p className="mt-0.5 line-clamp-1 text-xs text-ink-secondary">{item.description}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink-muted">
                    <Badge tone="neutral">{item.format}</Badge>
                    {item.minutes ? <span className="font-mono tabular-nums">{formatMinutes(item.minutes)}</span> : null}
                    <span>Added {formatDate(item.addedAt)}</span>
                    {item.file ? (
                      <span className="font-mono tabular-nums">{Math.max(1, Math.round(item.file.bytes / 1024))} KB file</span>
                    ) : null}
                    {attachment && attachedCourse ? (
                      <Badge tone="success">
                        <Globe size={10} strokeWidth={2} className="mr-1" />
                        Published · {attachedCourse.code} · Module {attachedModuleIndex}
                      </Badge>
                    ) : (
                      <Badge tone="neutral">In library only</Badge>
                    )}
                  </p>
                  {item.file ? <FileUploadedChip file={item.file} /> : null}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <div className="flex items-center gap-1.5">
                    {attachment ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => unpublishResource(item.id)}
                        title="Withdraw from the module"
                      >
                        <Link2Off size={14} strokeWidth={1.75} />
                        Unpublish
                      </Button>
                    ) : (
                      <Button size="sm" variant="secondary" onClick={() => setAttaching(item)}>
                        <Link2 size={14} strokeWidth={1.75} />
                        Publish to module
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {item.file ? (
                      <Button size="sm" variant="ghost" onClick={() => setReplacing(item)} title="Upload a replacement file">
                        Replace file
                      </Button>
                    ) : null}
                    <button
                      type="button"
                      aria-label={`Remove ${item.title}`}
                      title="Remove from library"
                      onClick={() => removeItem(item)}
                      className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-ink-muted transition-colors hover:bg-error-soft hover:text-error"
                    >
                      <Trash2 size={15} strokeWidth={1.75} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </Card>
      )}

      <AddItemModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={(item) => {
          addLibraryItem(item);
          setAddOpen(false);
        }}
      />

      <AttachModal
        item={attaching}
        courses={state.courses}
        onClose={() => setAttaching(null)}
        onAttach={(courseId, moduleId) => {
          if (attaching) publishResource(attaching.id, courseId, moduleId);
          setAttaching(null);
        }}
      />

      <ReplaceModal
        item={replacing}
        onClose={() => setReplacing(null)}
        onReplaced={(oldFile, newFile) => {
          if (replacing) {
            updateLibraryItemFile(replacing.id, newFile);
            if (oldFile) {
              fetch(`/api/resources/file?path=${encodeURIComponent(oldFile.path)}`, {
                method: "DELETE",
              }).catch(() => undefined);
            }
          }
          setReplacing(null);
        }}
      />
    </div>
  );
}

/** Swap the stored file behind a library item, keeping its metadata. */
function ReplaceModal({
  item,
  onClose,
  onReplaced,
}: {
  item: LibraryItem | null;
  onClose: () => void;
  onReplaced: (oldFile: StoredFileMeta | undefined, newFile: StoredFileMeta) => void;
}) {
  return (
    <Modal
      open={Boolean(item)}
      onClose={onClose}
      title={item ? `Replace file — ${item.title}` : "Replace file"}
    >
      {item ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm leading-relaxed text-ink-secondary">
            Upload a new file for this resource. The previous file is removed once the
            replacement is stored.
          </p>
          <FileUpload
            onUploaded={(file) => onReplaced(item.file, file)}
          />
        </div>
      ) : null}
    </Modal>
  );
}

/** Choose the course + module a library item is published to. */
function AttachModal({
  item,
  courses,
  onClose,
  onAttach,
}: {
  item: LibraryItem | null;
  courses: { id: string; code: string; title: string; modules: { id: string; title: string }[] }[];
  onClose: () => void;
  onAttach: (courseId: string, moduleId: string) => void;
}) {
  const [courseId, setCourseId] = useState("");
  const [moduleId, setModuleId] = useState("");
  const selectedCourse = courses.find((c) => c.id === courseId);

  const reset = () => {
    setCourseId("");
    setModuleId("");
  };

  return (
    <Modal
      open={Boolean(item)}
      onClose={() => {
        reset();
        onClose();
      }}
      title={item ? `Publish "${item.title}"` : "Publish to module"}
      footer={
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              reset();
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!courseId || !moduleId}
            onClick={() => {
              if (courseId && moduleId) {
                onAttach(courseId, moduleId);
                reset();
              }
            }}
          >
            Publish
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm leading-relaxed text-ink-secondary">
          Trainees enrolled in the course will see this item under the chosen module, marked
          &ldquo;Added by trainer&rdquo;.
        </p>
        <Select
          label="Course"
          value={courseId}
          placeholder="Select a course"
          options={courses.map((c) => ({ value: c.id, label: `${c.code} — ${c.title}` }))}
          onChange={(event) => {
            setCourseId(event.target.value);
            setModuleId("");
          }}
          required
        />
        <Select
          label="Module"
          value={moduleId}
          placeholder={courseId ? "Select a module" : "Choose a course first"}
          options={(selectedCourse?.modules ?? []).map((m, i) => ({
            value: m.id,
            label: `${i + 1}. ${m.title}`,
          }))}
          onChange={(event) => setModuleId(event.target.value)}
          required
        />
        {!selectedCourse?.modules.length ? (
          <p className="text-xs text-ink-muted">This course has no modules yet.</p>
        ) : null}
      </div>
    </Modal>
  );
}

function AddItemModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (item: LibraryItem) => void;
}) {
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<ResourceKind>("study-material");
  const [format, setFormat] = useState("PDF");
  const [minutes, setMinutes] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<StoredFileMeta | undefined>();
  const [error, setError] = useState<string | undefined>();

  const submit = () => {
    if (title.trim().length < 4) {
      setError("Give the item a descriptive title.");
      return;
    }
    if (format.trim().length < 2) {
      setError("Enter the file format, e.g. PDF, MP4, PPTX.");
      return;
    }
    setError(undefined);
    onAdd({
      id: `lib-${Math.random().toString(36).slice(2, 8)}`,
      title: title.trim(),
      kind,
      format: format.trim().toUpperCase(),
      minutes: minutes ? Number(minutes) : undefined,
      description: description.trim() || "No description provided.",
      addedAt: new Date().toISOString().slice(0, 10),
      file,
    });
    setTitle("");
    setMinutes("");
    setDescription("");
    setFile(undefined);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add library item"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={submit}>
            Add to library
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input
          label="Title"
          value={title}
          placeholder="e.g. Lecture: Reading skew-T diagrams"
          onChange={(event) => setTitle(event.target.value)}
          required
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <Select
            label="Kind"
            value={kind}
            options={(Object.keys(kindLabel) as ResourceKind[]).map((k) => ({ value: k, label: kindLabel[k] }))}
            onChange={(event) => setKind(event.target.value as ResourceKind)}
            required
          />
          <Input
            label="Format"
            value={format}
            placeholder="PDF / MP4 / PPTX"
            onChange={(event) => setFormat(event.target.value)}
            required
          />
          <Input
            label="Minutes"
            type="number"
            min={1}
            value={minutes}
            placeholder="Watchable media only"
            onChange={(event) => setMinutes(event.target.value)}
          />
        </div>
        <Textarea
          label="Description"
          rows={2}
          value={description}
          placeholder="What the item covers and which cohorts it serves."
          onChange={(event) => setDescription(event.target.value)}
        />
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-ink">File</p>
          {file ? (
            <FileUploadedChip file={file} />
          ) : (
            <FileUpload onUploaded={setFile} onError={setError} />
          )}
        </div>
        {error ? (
          <p role="alert" className="rounded-[var(--radius-sm)] bg-error-soft px-3 py-2 text-sm font-medium text-error">
            {error}
          </p>
        ) : null}
        <p className="text-xs text-ink-muted">
          Without a file the item is a descriptive placeholder. Uploaded files are stored
          server-side and become downloadable once published to a module.
        </p>
      </div>
    </Modal>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={
        "h-8 rounded-full border px-3.5 text-xs font-medium transition-colors duration-150 " +
        (active
          ? "border-primary bg-primary-soft text-primary"
          : "border-border-strong text-ink-secondary hover:border-ink-muted hover:text-ink")
      }
    >
      {label}
    </button>
  );
}
