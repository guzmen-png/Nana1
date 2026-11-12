"use client";

import { useEffect, useMemo, useState } from "react";
import type { CalendarDaySummary } from "@/lib/types";
import { toDayKey } from "@/lib/image";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export function CalendarView({
  year,
  month,
  onMonthChange,
  onSelectDay,
  refreshKey,
}: {
  year: number;
  month: number;
  onMonthChange: (year: number, month: number) => void;
  onSelectDay: (day: string) => void;
  refreshKey: number;
}) {
  const [days, setDays] = useState<CalendarDaySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const today = toDayKey(new Date());

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/calendar?year=${year}&month=${month}`)
      .then((r) => r.json())
      .then((data: { days?: CalendarDaySummary[] }) => {
        if (!cancelled) setDays(data.days ?? []);
      })
      .catch(() => {
        if (!cancelled) setDays([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [year, month, refreshKey]);

  const byDay = useMemo(() => {
    const map = new Map<string, CalendarDaySummary>();
    for (const d of days) map.set(d.day, d);
    return map;
  }, [days]);

  const cells = useMemo(() => {
    const first = new Date(year, month - 1, 1);
    const startPad = first.getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const items: Array<{ key: string; day?: string; label?: number }> = [];
    for (let i = 0; i < startPad; i++) items.push({ key: `pad-${i}` });
    for (let d = 1; d <= daysInMonth; d++) {
      const day = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      items.push({ key: day, day, label: d });
    }
    while (items.length % 7 !== 0) items.push({ key: `end-${items.length}` });
    return items;
  }, [year, month]);

  function shiftMonth(delta: number) {
    const date = new Date(year, month - 1 + delta, 1);
    onMonthChange(date.getFullYear(), date.getMonth() + 1);
  }

  return (
    <section className="calendar-panel">
      <header className="month-header">
        <button type="button" className="ghost-btn" onClick={() => shiftMonth(-1)} aria-label="이전 달">
          ‹
        </button>
        <div className="month-title">
          <p className="month-eyebrow">{year}</p>
          <h2>{month}월</h2>
        </div>
        <button type="button" className="ghost-btn" onClick={() => shiftMonth(1)} aria-label="다음 달">
          ›
        </button>
      </header>

      <div className="weekday-row" aria-hidden>
        {WEEKDAYS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>

      <div className={`calendar-grid ${loading ? "is-loading" : ""}`}>
        {cells.map((cell) => {
          if (!cell.day) return <div key={cell.key} className="day-cell empty" />;
          const summary = byDay.get(cell.day);
          const isToday = cell.day === today;
          return (
            <button
              key={cell.key}
              type="button"
              className={`day-cell ${isToday ? "today" : ""} ${summary?.cover_url ? "has-photo" : ""}`}
              onClick={() => onSelectDay(cell.day!)}
            >
              {summary?.cover_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={summary.cover_url} alt="" className="day-cover" />
              ) : null}
              <span className="day-num">{cell.label}</span>
              <span className="day-meta">
                {summary?.project_color ? (
                  <i className="project-dot" style={{ background: summary.project_color }} />
                ) : null}
                {summary && summary.photo_count > 0 ? (
                  <em>{summary.photo_count}</em>
                ) : summary?.has_memo ? (
                  <em className="memo-dot">·</em>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>

      <p className="calendar-hint">날짜를 눌러 그날의 사진을 남기세요</p>
    </section>
  );
}
