"use client";

import { useCallback, useEffect, useState } from "react";
import type { Project } from "@/lib/types";
import { CalendarView } from "@/components/CalendarView";
import { DaySheet } from "@/components/DaySheet";
import { ProjectsView } from "@/components/ProjectsView";
import { TabBar } from "@/components/TabBar";

export function AppShell() {
  const now = new Date();
  const [tab, setTab] = useState<"calendar" | "projects">("calendar");
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [viewerName, setViewerName] = useState("나날");
  const [simulated, setSimulated] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadProjects = useCallback(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data: { projects?: Project[] }) => setProjects(data.projects ?? []))
      .catch(() => setProjects([]));
  }, []);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((data: { name?: string; simulated?: boolean }) => {
        if (data.name) setViewerName(data.name);
        setSimulated(Boolean(data.simulated));
      })
      .catch(() => undefined);
    loadProjects();
  }, [loadProjects]);

  function openDay(day: string) {
    setSelectedDay(day);
    setTab("calendar");
    const [y, m] = day.split("-").map(Number);
    setYear(y);
    setMonth(m);
  }

  function bump() {
    setRefreshKey((k) => k + 1);
    loadProjects();
  }

  return (
    <div className="app-shell">
      <header className="top-bar">
        <div>
          <p className="brand">나날</p>
          <p className="viewer">
            {viewerName}
            {simulated ? " · 미리보기" : ""}
          </p>
        </div>
        <button
          type="button"
          className="today-chip"
          onClick={() => {
            const d = new Date();
            setYear(d.getFullYear());
            setMonth(d.getMonth() + 1);
            setTab("calendar");
          }}
        >
          오늘
        </button>
      </header>

      <main className="main-pane">
        {tab === "calendar" ? (
          <CalendarView
            year={year}
            month={month}
            onMonthChange={(y, m) => {
              setYear(y);
              setMonth(m);
            }}
            onSelectDay={setSelectedDay}
            refreshKey={refreshKey}
          />
        ) : (
          <ProjectsView projects={projects} onRefresh={loadProjects} onOpenDay={openDay} />
        )}
      </main>

      <TabBar tab={tab} onChange={setTab} />

      {selectedDay ? (
        <DaySheet
          day={selectedDay}
          projects={projects}
          onClose={() => setSelectedDay(null)}
          onChanged={bump}
        />
      ) : null}
    </div>
  );
}
