import type { HTMLAttributes } from "react";

interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  label?: string;
}

export function Spinner({ label, className, ...rest }: SpinnerProps) {
  return (
    <div className={`loading-block ${className ?? ""}`} {...rest}>
      <span className="spinner" aria-hidden="true" />
      {label ? <span>{label}</span> : null}
    </div>
  );
}

export function FullPageSpinner() {
  return (
    <div className="full-page-loading">
      <span className="spinner" aria-hidden="true" />
      <span>Loading...</span>
    </div>
  );
}

export function InlineSpinner() {
  return <span className="spinner" aria-hidden="true" />;
}
