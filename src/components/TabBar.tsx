"use client";

type Tab = "calendar" | "projects";

export function TabBar({
  tab,
  onChange,
}: {
  tab: Tab;
  onChange: (tab: Tab) => void;
}) {
  return (
    <nav className="tab-bar" aria-label="주요 탭">
      <button
        type="button"
        className={tab === "calendar" ? "tab active" : "tab"}
        onClick={() => onChange("calendar")}
      >
        <span className="tab-icon" aria-hidden>
          <CalendarIcon />
        </span>
        캘린더
      </button>
      <button
        type="button"
        className={tab === "projects" ? "tab active" : "tab"}
        onClick={() => onChange("projects")}
      >
        <span className="tab-icon" aria-hidden>
          <ProjectsIcon />
        </span>
        프로젝트
      </button>
    </nav>
  );
}

function CalendarIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 3.5V6.5M16 3.5V6.5M3.5 9.5H20.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="8.5" cy="14" r="1.1" fill="currentColor" />
      <circle cx="12" cy="14" r="1.1" fill="currentColor" />
      <circle cx="15.5" cy="14" r="1.1" fill="currentColor" />
    </svg>
  );
}

function ProjectsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M4.5 7.5L12 3.5L19.5 7.5V16.5L12 20.5L4.5 16.5V7.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M12 12L19.5 7.5M12 12V20.5M12 12L4.5 7.5" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}
