"use client";

import { useEffect, useState } from "react";
import type { Project } from "@/lib/types";
import { formatDayLabel } from "@/lib/image";

const COLORS = ["#0F6B5C", "#1F4E79", "#8B4513", "#B45309", "#7C2D12", "#334155"];

type ProjectDay = {
  day: string;
  memo: string;
  photo_count: number;
  cover_url: string | null;
};

export function ProjectsView({
  projects,
  onRefresh,
  onOpenDay,
}: {
  projects: Project[];
  onRefresh: () => void;
  onOpenDay: (day: string) => void;
}) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState<Project | null>(null);
  const [days, setDays] = useState<ProjectDay[]>([]);
  const [loadingDays, setLoadingDays] = useState(false);

  useEffect(() => {
    if (!selected) return;
    let cancelled = false;
    setLoadingDays(true);
    fetch(`/api/projects/${selected.id}/days`)
      .then((r) => r.json())
      .then((data: { days?: ProjectDay[] }) => {
        if (!cancelled) setDays(data.days ?? []);
      })
      .finally(() => {
        if (!cancelled) setLoadingDays(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selected]);

  async function createProject() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setCreating(true);
    try {
      await fetch("/api/projects", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: trimmed, color }),
      });
      setName("");
      onRefresh();
    } finally {
      setCreating(false);
    }
  }

  async function removeProject(id: string) {
    await fetch(`/api/projects?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (selected?.id === id) setSelected(null);
    onRefresh();
  }

  if (selected) {
    return (
      <section className="projects-panel">
        <button type="button" className="text-link" onClick={() => setSelected(null)}>
          ← 모든 프로젝트
        </button>
        <header className="project-hero">
          <i className="project-swatch" style={{ background: selected.color }} />
          <div>
            <h2>{selected.name}</h2>
            <p>{selected.note || "날짜와 사진을 이 프로젝트에 묶어 보세요"}</p>
          </div>
        </header>

        {loadingDays ? (
          <p className="muted">불러오는 중…</p>
        ) : days.length === 0 ? (
          <div className="empty-block">
            <p>아직 연결된 날이 없습니다</p>
            <span>캘린더에서 날짜를 열고 프로젝트를 선택하세요</span>
          </div>
        ) : (
          <ul className="project-days">
            {days.map((d) => (
              <li key={d.day}>
                <button type="button" className="project-day" onClick={() => onOpenDay(d.day)}>
                  {d.cover_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={d.cover_url} alt="" />
                  ) : (
                    <span className="placeholder" style={{ background: selected.color }} />
                  )}
                  <div>
                    <strong>{formatDayLabel(d.day)}</strong>
                    <em>
                      {d.photo_count > 0 ? `사진 ${d.photo_count}` : "사진 없음"}
                      {d.memo ? ` · ${d.memo}` : ""}
                    </em>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}

        <button type="button" className="danger-btn ghost" onClick={() => void removeProject(selected.id)}>
          프로젝트 삭제
        </button>
      </section>
    );
  }

  return (
    <section className="projects-panel">
      <header className="projects-intro">
        <h2>프로젝트</h2>
        <p>여행, 작업, 루틴처럼 날짜를 묶는 흐름을 만듭니다</p>
      </header>

      <div className="create-project">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="새 프로젝트 이름"
          maxLength={80}
          onKeyDown={(e) => {
            if (e.key === "Enter") void createProject();
          }}
        />
        <div className="color-row" role="listbox" aria-label="색상">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={color === c ? "swatch active" : "swatch"}
              style={{ background: c }}
              aria-label={c}
              onClick={() => setColor(c)}
            />
          ))}
        </div>
        <button type="button" className="primary-btn" disabled={creating || !name.trim()} onClick={() => void createProject()}>
          {creating ? "만드는 중…" : "프로젝트 추가"}
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="empty-block">
          <p>아직 프로젝트가 없습니다</p>
          <span>첫 프로젝트를 만들어 날짜별 사진을 묶어 보세요</span>
        </div>
      ) : (
        <ul className="project-list">
          {projects.map((p) => (
            <li key={p.id}>
              <button type="button" className="project-card-btn" onClick={() => setSelected(p)}>
                <i className="project-swatch" style={{ background: p.color }} />
                <div>
                  <strong>{p.name}</strong>
                  <em>
                    {p.day_count ?? 0}일 · 사진 {p.photo_count ?? 0}
                  </em>
                </div>
                <span aria-hidden>›</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
