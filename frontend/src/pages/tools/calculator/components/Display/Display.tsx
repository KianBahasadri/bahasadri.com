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
  const displayEquation = isOn && equation && equation !== "" ? equation : "";
  const showContent = displayEquation !== "" ? displayEquation : displayValue;
  return (
    <div
      className={styles["display"]}
      role="status"
      aria-live="polite"
      aria-label={`Calculator display: ${showContent || "off"}`}
    >
      {showContent}
    </div>
  );
}

