"use client";

import { THEMES, type ThemeId } from "@/lib/theme";

export function ThemePicker({
  value,
  onChange,
  onClose,
}: {
  value: ThemeId;
  onChange: (id: ThemeId) => void;
  onClose: () => void;
}) {
  return (
    <div className="sheet-backdrop" role="presentation" onClick={onClose}>
      <div
        className="sheet theme-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="테마 색"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-handle" />
        <header className="sheet-header">
          <div>
            <p className="sheet-kicker">화면</p>
            <h3>테마 색</h3>
          </div>
          <button type="button" className="ghost-btn" onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </header>
        <p className="theme-help">캘린더 분위기와 강조색을 바꿉니다. 기기에 저장됩니다.</p>
        <ul className="theme-grid">
          {THEMES.map((theme) => {
            const active = theme.id === value;
            return (
              <li key={theme.id}>
                <button
                  type="button"
                  className={active ? "theme-option active" : "theme-option"}
                  onClick={() => onChange(theme.id)}
                  aria-pressed={active}
                >
                  <span
                    className="theme-preview"
                    style={{
                      background: `linear-gradient(135deg, ${theme.mist}, ${theme.paper})`,
                    }}
                  >
                    <i style={{ background: theme.accent }} />
                  </span>
                  <strong>{theme.label}</strong>
                  {active ? <em>사용 중</em> : <em>선택</em>}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
