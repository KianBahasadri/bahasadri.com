import React from "react";
import CalculatorButton from "../CalculatorButton/CalculatorButton";
import styles from "./ButtonGrid.module.css";

interface ButtonGridProps {
  readonly isOn: boolean;
  readonly onNumberClick: (digit: string) => void;
  readonly onOperatorClick: (operator: string) => void;
  readonly onEqualsClick: () => void;
  readonly onClearClick: () => void;
  readonly onDecimalClick: () => void;
  readonly onPowerClick: () => void;
}

export default function ButtonGrid({
  isOn,
  onNumberClick,
  onOperatorClick,
  onEqualsClick,
  onClearClick,
  onDecimalClick,
  onPowerClick,
}: ButtonGridProps): React.JSX.Element {
  return (
    <div className={styles["grid"]}>
      <CalculatorButton
        label="ON/OFF"
        onClick={onPowerClick}
        variant="power"
        className={styles["powerButton"]}
      />
      <CalculatorButton
        label="C"
        onClick={onClearClick}
        variant="clear"
        disabled={!isOn}
      />
      <CalculatorButton
        label="÷"
        onClick={() => {
          onOperatorClick("÷");
        }}
        variant="operator"
        disabled={!isOn}
      />
      <CalculatorButton
        label="×"
        onClick={() => {
          onOperatorClick("×");
        }}
        variant="operator"
        disabled={!isOn}
      />
      <CalculatorButton
        label="7"
        onClick={() => {
          onNumberClick("7");
        }}
        variant="number"
        disabled={!isOn}
      />
      <CalculatorButton
        label="8"
        onClick={() => {
          onNumberClick("8");
        }}
        variant="number"
        disabled={!isOn}
      />
      <CalculatorButton
        label="9"
        onClick={() => {
          onNumberClick("9");
        }}
        variant="number"
        disabled={!isOn}
      />
      <CalculatorButton
        label="-"
        onClick={() => {
          onOperatorClick("-");
        }}
        variant="operator"
        disabled={!isOn}
      />
      <CalculatorButton
        label="4"
        onClick={() => {
          onNumberClick("4");
        }}
        variant="number"
        disabled={!isOn}
      />
      <CalculatorButton
        label="5"
        onClick={() => {
          onNumberClick("5");
        }}
        variant="number"
        disabled={!isOn}
      />
      <CalculatorButton
        label="6"
        onClick={() => {
          onNumberClick("6");
        }}
        variant="number"
        disabled={!isOn}
      />
      <CalculatorButton
        label="+"
        onClick={() => {
          onOperatorClick("+");
        }}
        variant="operator"
        disabled={!isOn}
      />
      <CalculatorButton
        label="1"
        onClick={() => {
          onNumberClick("1");
        }}
        variant="number"
        disabled={!isOn}
      />
      <CalculatorButton
        label="2"
        onClick={() => {
          onNumberClick("2");
        }}
        variant="number"
        disabled={!isOn}
      />
      <CalculatorButton
        label="3"
        onClick={() => {
          onNumberClick("3");
        }}
        variant="number"
        disabled={!isOn}
      />
      <CalculatorButton
        label="="
        onClick={onEqualsClick}
        variant="equals"
        disabled={!isOn}
      />
      <CalculatorButton
        label="0"
        onClick={() => {
          onNumberClick("0");
        }}
        variant="number"
        disabled={!isOn}
        className={styles["zeroButton"]}
      />
      <CalculatorButton
        label="."
        onClick={onDecimalClick}
        variant="number"
        disabled={!isOn}
      />
    </div>
  );
}

