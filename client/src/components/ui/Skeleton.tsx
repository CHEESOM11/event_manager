import type { CSSProperties } from "react";

export function SkeletonCard({ style }: { style?: CSSProperties }) {
  return (
    <div className="card">
      <div className="skeleton event-card-banner" />
      <div className="card-body" style={style}>
        <div className="skeleton" style={{ height: 20, marginBottom: 12 }} />
        <div
          className="skeleton"
          style={{ height: 14, marginBottom: 8, width: "70%" }}
        />
        <div className="skeleton" style={{ height: 14, width: "50%" }} />
      </div>
    </div>
  );
}
