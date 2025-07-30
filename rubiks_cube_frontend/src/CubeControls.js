/**
 * CubeControls: Cube action buttons, debug mode toggle, undo/redo/replay
 */
import React from "react";
import styled from "styled-components";
import { FaUndo, FaRedo, FaPlay, FaBug, FaRandom, FaCheckCircle, FaSync } from "react-icons/fa";

const ButtonBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.67em 0.6em;
  margin-top: 0.2em;
`;

const Btn = styled.button`
  background: ${({ kind, disabled }) =>
    disabled ? "#555" :
    kind === "accent" ? "#388e3c"
    : kind === "warn" ? "#da5910"
    : kind === "primary" ? "#1976d2"
    : "#31384a" };
  color: ${({ disabled }) => disabled ? "#888" : "#fff"};
  font-weight: 600;
  border: none;
  border-radius: 5px;
  padding: 0.46em 0.75em;
  font-size: 1em;
  cursor: ${({ disabled }) => disabled ? "not-allowed" : "pointer"};
  display: flex;
  align-items: center;
  gap: 0.37em;
  box-shadow: 0 1px 6px rgba(40,50,60,0.16);
  transition: all 0.15s;
  opacity: ${({ disabled }) => disabled ? 0.5 : 1};
  &:active {
    transform: ${({ disabled }) => disabled ? "none" : "scale(0.95)"};
    opacity: ${({ disabled }) => disabled ? 0.5 : 0.82};
  }
`;

export default function CubeControls({
  onUndo,
  onRedo,
  onReplay,
  onReset,
  onScramble,
  onSolve,
  debugMode,
  setDebugMode,
  isScrambling = false,
  isSolving = false,
  isAnimating = false
}) {
  const isDisabled = isScrambling || isSolving || isAnimating;
  return (
    <ButtonBar>
      <Btn kind="primary" disabled={isDisabled} onClick={isDisabled ? undefined : onUndo}>
        <FaUndo/>Undo
      </Btn>
      <Btn kind="primary" disabled={isDisabled} onClick={isDisabled ? undefined : onRedo}>
        <FaRedo/>Redo
      </Btn>
      <Btn kind="accent" disabled={isDisabled} onClick={isDisabled ? undefined : onReplay}>
        <FaPlay/>Replay
      </Btn>
      <Btn kind="warn" disabled={isDisabled} onClick={isDisabled ? undefined : onReset}>
        <FaSync/>Reset
      </Btn>
      <Btn kind="accent" disabled={isDisabled} onClick={isDisabled ? undefined : onScramble}>
        <FaRandom/>{isScrambling ? "Scrambling..." : "Scramble"}
      </Btn>
      <Btn kind="primary" disabled={isDisabled} onClick={isDisabled ? undefined : onSolve}>
        <FaCheckCircle/>{isSolving ? "Solving..." : "Solve"}
      </Btn>
      <Btn kind="accent" disabled={isDisabled} onClick={isDisabled ? undefined : () => setDebugMode(v=>!v)}>
        {debugMode?<FaBug/>:""}Debug
      </Btn>
    </ButtonBar>
  );
}
