import React from "react";
import styles from "./Display.module.css";

interface DisplayProps {
  readonly value: string;
  readonly isOn: boolean;
}

export default function Display({
  value,
  isOn,
}: DisplayProps): React.JSX.Element {
  const displayValue = isOn ? value : "";
  return (
    <div
      className={styles["display"]}
      role="status"
      aria-live="polite"
      aria-label={`Calculator display: ${displayValue || "off"}`}
    >
      {displayValue}
    </div>
  );
}

