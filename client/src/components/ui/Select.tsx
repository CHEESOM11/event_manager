import type { SelectHTMLAttributes } from "react";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Select({
  label,
  error,
  hint,
  className,
  id,
  children,
  ...rest
}: SelectProps) {
  const selectId = id ?? rest.name;

  return (
    <div className="field">
      {label ? (
        <label className="label" htmlFor={selectId}>
          {label}
        </label>
      ) : null}
      <select id={selectId} className={`select ${className ?? ""}`} {...rest}>
        {children}
      </select>
      {hint ? <span className="field-hint">{hint}</span> : null}
      {error ? <span className="field-error">{error}</span> : null}
    </div>
  );
}
