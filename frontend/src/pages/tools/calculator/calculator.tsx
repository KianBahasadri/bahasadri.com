import React, { useState, useEffect, useRef, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { calculateExpression } from "../../../lib/api";
import Display from "./components/Display/Display";
import ButtonGrid from "./components/ButtonGrid/ButtonGrid";
import styles from "./calculator.module.css";

function mapOperatorToSymbol(op: string): string {
  const mapping: Record<string, string> = {
    "+": "+",
    "-": "-",
    "×": "*",
    "÷": "/",
  };
  return mapping[op] ?? op;
}

export default function Calculator(): React.JSX.Element {
  const [isOn, setIsOn] = useState<boolean>(false);
  const [display, setDisplay] = useState<string>("0");
  const [currentInput, setCurrentInput] = useState<string>("");
  const [operator, setOperator] = useState<string | null>(null);
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState<boolean>(false);

  // Refs to access latest state in keyboard handler
  const stateRef = useRef({
    isOn,
    currentInput,
    operator,
    previousValue,
    waitingForOperand,
  });

  // Update refs when state changes
  useEffect(() => {
    stateRef.current = {
      isOn,
      currentInput,
      operator,
      previousValue,
      waitingForOperand,
    };
  }, [isOn, currentInput, operator, previousValue, waitingForOperand]);

  const calculateMutation = useMutation({
    mutationFn: calculateExpression,
    onSuccess: (data) => {
      setDisplay(data.result.toString());
      setCurrentInput(data.result.toString());
      setPreviousValue(null);
      setOperator(null);
      setWaitingForOperand(true);
    },
    onError: (error: Error) => {
      const errorMessage = error.message;
      if (errorMessage.includes("divide by zero")) {
        setDisplay("Cannot divide by zero");
      } else if (errorMessage.includes("Invalid")) {
        setDisplay("Invalid input");
      } else {
        setDisplay("Error");
      }
      setPreviousValue(null);
      setOperator(null);
      setWaitingForOperand(true);
      setCurrentInput("");
    },
  });

  const handlePowerToggle = useCallback((): void => {
    setIsOn((prev) => {
      const newPowerState = !prev;
      // Reset everything regardless of state
      setDisplay("0");
      setCurrentInput("");
      setOperator(null);
      setPreviousValue(null);
      setWaitingForOperand(false);
      return newPowerState;
    });
  }, []);

  const handleNumberClick = useCallback(
    (digit: string): void => {
      if (!isOn) return;

      if (waitingForOperand) {
        setCurrentInput(digit);
        setDisplay(digit);
        setWaitingForOperand(false);
      } else {
        const newInput = currentInput === "0" ? digit : currentInput + digit;
        setCurrentInput(newInput);
        setDisplay(newInput);
      }
    },
    [isOn, waitingForOperand, currentInput]
  );

  const handleDecimalClick = useCallback((): void => {
    if (!isOn) return;

    if (waitingForOperand) {
      setCurrentInput("0.");
      setDisplay("0.");
      setWaitingForOperand(false);
    } else if (!currentInput.includes(".")) {
      const newInput = currentInput === "" ? "0." : currentInput + ".";
      setCurrentInput(newInput);
      setDisplay(newInput);
    }
  }, [isOn, waitingForOperand, currentInput]);

  const handleOperatorClick = useCallback(
    (op: string): void => {
      if (!isOn) return;

      const inputValue = Number.parseFloat(currentInput || "0");

      if (previousValue === null) {
        setPreviousValue(inputValue);
        setOperator(op);
        setWaitingForOperand(true);
      } else if (operator && !waitingForOperand) {
        // Chain operations - calculate previous operation first
        const expression = `${String(previousValue)} ${mapOperatorToSymbol(operator)} ${String(inputValue)}`;
        calculateMutation.mutate(expression);
        setOperator(op);
        setWaitingForOperand(true);
      } else {
        // Just update the operator
        setOperator(op);
      }
    },
    [isOn, currentInput, previousValue, operator, waitingForOperand, calculateMutation]
  );

  const handleEqualsClick = useCallback((): void => {
    if (!isOn || !operator || previousValue === null) return;

    const inputValue = Number.parseFloat(currentInput || "0");
    const expression = `${String(previousValue)} ${mapOperatorToSymbol(operator)} ${String(inputValue)}`;
    calculateMutation.mutate(expression);
  }, [isOn, operator, previousValue, currentInput, calculateMutation]);

  const handleClearClick = useCallback((): void => {
    if (!isOn) return;

    setDisplay("0");
    setCurrentInput("");
    setOperator(null);
    setPreviousValue(null);
    setWaitingForOperand(false);
  }, [isOn]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      const state = stateRef.current;
      if (!state.isOn && event.key !== "p" && event.key !== "P") return;

      switch (event.key) {
        case "0":
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9": {
          handleNumberClick(event.key);
          break;
        }
        case ".": {
          handleDecimalClick();
          break;
        }
        case "+": {
          handleOperatorClick("+");
          break;
        }
        case "-": {
          handleOperatorClick("-");
          break;
        }
        case "*": {
          handleOperatorClick("×");
          break;
        }
        case "/": {
          event.preventDefault();
          handleOperatorClick("÷");
          break;
        }
        case "=":
        case "Enter": {
          event.preventDefault();
          handleEqualsClick();
          break;
        }
        case "Escape":
        case "c":
        case "C": {
          handleClearClick();
          break;
        }
        case "p":
        case "P": {
          handlePowerToggle();
          break;
        }
      }
    };

    globalThis.addEventListener("keydown", handleKeyDown);
    return (): void => {
      globalThis.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleNumberClick, handleDecimalClick, handleOperatorClick, handleEqualsClick, handleClearClick, handlePowerToggle]);

  return (
    <div className={styles["calculator"]}>
      {/* Terminal Scanline Background */}
      <div className={styles.bgTerminal} />
      <div className={styles.scanlines} />

      {/* Particle System */}
      <div className={styles.particles}>
        {Array.from({ length: 20 }).map((_, i) => (
          <span key={i} className={styles.particle}>
            {["♡", "💊", "🩹", "✨", "💕", "💉", "🔪", "💖"][i % 8]}
          </span>
        ))}
      </div>

      {/* Screen Border Glow */}
      <div className={styles.screenBorder} />

      <div className={styles["container"]}>
        <Display value={display} isOn={isOn} />
        <ButtonGrid
          isOn={isOn}
          onNumberClick={handleNumberClick}
          onOperatorClick={handleOperatorClick}
          onEqualsClick={handleEqualsClick}
          onClearClick={handleClearClick}
          onDecimalClick={handleDecimalClick}
          onPowerClick={handlePowerToggle}
        />
      </div>
    </div>
  );
}

