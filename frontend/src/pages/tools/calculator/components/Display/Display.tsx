import React from "react";
import styles from "./Display.module.css";

interface DisplayProps {
  readonly value: string;
  readonly equation?: string;
  readonly isOn: boolean;
}

export default function Display({
  value,
  equation,
  isOn,
}: DisplayProps): React.JSX.Element {
  const displayValue = isOn ? value : "";
  const displayEquation = isOn && equation ? equation : "";
  return (
    <div
      className={styles["display"]}
      role="status"
      aria-live="polite"
      aria-label={`Calculator display: ${displayValue || "off"}`}
    >
      <div className={styles["displayContent"]}>
        {displayEquation !== "" && (
          <div className={styles["equation"]}>{displayEquation}</div>
        )}
        <div className={styles["value"]}>{displayValue}</div>
      </div>
    </div>
  );
}

