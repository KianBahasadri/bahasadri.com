import React from "react";
import styles from "./CalculatorButton.module.css";

interface CalculatorButtonProps {
  readonly label: string;
  readonly onClick: () => void;
  readonly disabled?: boolean;
  readonly variant?: "number" | "operator" | "equals" | "clear" | "power";
  readonly className?: string | undefined;
}

export default function CalculatorButton({
  label,
  onClick,
  disabled = false,
  variant = "number",
  className = "",
}: CalculatorButtonProps): React.JSX.Element {
  const variantClass = styles[variant] ?? "";
  const parts = [styles["button"], variantClass];
  if (className) {
    parts.push(className);
  }
  const combinedClassName = parts.join(" ").trim();

  return (
    <button
      type="button"
      className={combinedClassName}
      onClick={onClick}
      disabled={disabled}
      aria-label={getAriaLabel(label, variant)}
    >
      {label}
    </button>
  );
}

function getAriaLabel(
  label: string,
  variant: CalculatorButtonProps["variant"]
): string {
  if (variant === "number") return `Number ${label}`;
  if (variant === "operator") {
    const operatorLabels: Record<string, string> = {
      "+": "Add",
      "-": "Subtract",
      "×": "Multiply",
      "÷": "Divide",
    };
    return operatorLabels[label] ?? `Operator ${label}`;
  }
  if (variant === "equals") return "Calculate";
  if (variant === "clear") return "Clear";
  if (variant === "power") return "Power";
  return label;
}

