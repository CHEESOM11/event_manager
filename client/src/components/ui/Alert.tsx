import type { ReactNode } from "react";

export type AlertVariant = "error" | "success" | "warning" | "info";

interface AlertProps {
  variant?: AlertVariant;
  children: ReactNode;
}

export function Alert({ variant = "info", children }: AlertProps) {
  return <div className={`alert alert--${variant}`}>{children}</div>;
}
