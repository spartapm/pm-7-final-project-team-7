"use client";

import type { ReactNode } from "react";

export function PrimaryButton({
  children,
  onClick,
  disabled,
  type = "button",
  icon,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  icon?: ReactNode;
}) {
  return (
    <button type={type} className={`primary-btn${icon ? " has-icon" : ""}`} onClick={onClick} disabled={disabled}>
      {children}
      {icon}
    </button>
  );
}
