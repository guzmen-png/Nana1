"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import type { Photo, Project } from "@/lib/types";
import { compressImageFile, formatDayLabel } from "@/lib/image";
import { pickPhotoForNanal } from "@/lib/native-photo";

type Entry = {
  id: string | null;
  day: string;
  memo: string;
  project_id: string | null;
};

export function DaySheet({
  day,
  projects,
  onClose,
  onChanged,
}: {
  day: string;
  projects: Project[];
  onClose: () => void;
  onChanged: () => void;
}) {
  const [entry, setEntry] = useState<Entry>({ id: null, day, memo: "", project_id: null });
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [permError, setPermError] = useState<string | null>(null);
  const [viewer, setViewer] = useState<Photo | null>(null);
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/day?day=${day}`)
      .then((r) => r.json())
      .then((data: { entry: Entry; photos: Photo[] }) => {
        if (cancelled) return;
        setEntry(data.entry);
        setPhotos(data.photos ?? []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [day]);

  async function saveEntry(next: Partial<Entry>) {
    const payload = {
      day,
      memo: next.memo ?? entry.memo,
      project_id: next.project_id === undefined ? entry.project_id : next.project_id,
    };
    setSaving(true);
    try {
      const res = await fetch("/api/day", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as Entry;
      setEntry(data);
      onChanged();
    } finally {
      setSaving(false);
    }
  }

  async function uploadDataUrl(dataUrl: string) {
    const res = await fetch("/api/photos", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ day, data_url: dataUrl }),
    });
    if (!res.ok) return;
    const photo = (await res.json()) as Photo;
    setPhotos((prev) => [photo, ...prev]);
    onChanged();
  }

  async function onPickFile(file: File | null) {
    if (!file) return;
    setUploading(true);
    setPermError(null);
    try {
      await uploadDataUrl(await compressImageFile(file));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function onAddPhoto() {
    setPermError(null);
    setUploading(true);
    try {
      const picked = await pickPhotoForNanal(fileRef.current);
      if (picked?.dataUrl) {
        await uploadDataUrl(picked.dataUrl);
      }
    } catch (error) {
      if (error instanceof Error && error.message === "photo_permission_denied") {
        setPermError(
          "사진 접근이 거부되었습니다. iPhone 설정 → 나날 → 사진/카메라 접근을 허용해 주세요.",
        );
      } else {
        setPermError("사진을 불러오지 못했습니다. 다시 시도해 주세요.");
      }
    } finally {
      setUploading(false);
    }
  }

  async function deletePhoto(id: string) {
    await fetch(`/api/photos?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    setViewer(null);
    onChanged();
  }

  return (
    <div className="sheet-backdrop" role="presentation" onClick={onClose}>
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-label={formatDayLabel(day)}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-handle" />
        <header className="sheet-header">
          <div>
            <p className="sheet-kicker">그날의 기록</p>
            <h3>{formatDayLabel(day)}</h3>
          </div>
          <button type="button" className="ghost-btn" onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </header>

        {loading ? (
          <p className="muted pad">불러오는 중…</p>
        ) : (
          <>
            <div className="photo-rail">
              <button
                type="button"
                className="add-photo"
                disabled={uploading || photos.length >= 12}
                onClick={() => void onAddPhoto()}
              >
                {uploading ? "올리는 중" : "+ 사진"}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*,image/heic,image/heif"
                hidden
                onChange={(e) => void onPickFile(e.target.files?.[0] ?? null)}
              />
              {photos.map((photo) => (
                <button
                  key={photo.id}
                  type="button"
                  className="photo-thumb"
                  onClick={() => setViewer(photo)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.data_url} alt={photo.caption || "사진"} />
                </button>
              ))}
            </div>

            <label className="field">
              <span>프로젝트</span>
              <select
                value={entry.project_id ?? ""}
                disabled={saving || pending}
                onChange={(e) => {
                  const project_id = e.target.value || null;
                  startTransition(() => {
                    void saveEntry({ project_id });
                  });
                }}
              >
                <option value="">없음</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>메모</span>
              <textarea
                value={entry.memo}
                rows={3}
                placeholder="오늘을 한 줄로"
                onChange={(e) => setEntry((prev) => ({ ...prev, memo: e.target.value }))}
                onBlur={() => void saveEntry({ memo: entry.memo })}
              />
            </label>
            {permError ? <p className="perm-error">{permError}</p> : null}
            <p className="save-hint">{saving ? "저장 중…" : "변경 사항은 자동 저장됩니다"}</p>
          </>
        )}

        {viewer ? (
          <div className="viewer" onClick={() => setViewer(null)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={viewer.data_url} alt="" onClick={(e) => e.stopPropagation()} />
            <button
              type="button"
              className="danger-btn"
              onClick={(e) => {
                e.stopPropagation();
                void deletePhoto(viewer.id);
              }}
            >
              사진 삭제
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
