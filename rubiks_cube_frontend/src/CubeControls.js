/**
 * CubeControls: Cube action buttons, debug mode toggle, undo/redo/replay
 */
import React from "react";
import styled from "styled-components";
import { FaUndo, FaRedo, FaPlay, FaBug, FaRandom, FaStepBackward, FaCheckCircle, FaSync } from "react-icons/fa";

const ButtonBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.67em 0.6em;
  margin-top: 0.2em;
`;

const Btn = styled.button`
  background: ${({ kind }) =>
    kind === "accent" ? "#388e3c"
    : kind === "warn" ? "#da5910"
    : kind === "primary" ? "#1976d2"
    : "#31384a" };
  color: #fff;
  font-weight: 600;
  border: none;
  border-radius: 5px;
  padding: 0.46em 0.75em;
  font-size: 1em;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.37em;
  box-shadow: 0 1px 6px rgba(40,50,60,0.16);
  transition: all 0.15s;
  &:active {
    transform: scale(0.95);
    opacity: 0.82;
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
  setDebugMode
}) {
  return (
    <ButtonBar>
      <Btn kind="primary" onClick={onUndo}><FaUndo/>Undo</Btn>
      <Btn kind="primary" onClick={onRedo}><FaRedo/>Redo</Btn>
      <Btn kind="accent" onClick={onReplay}><FaPlay/>Replay</Btn>
      <Btn kind="warn" onClick={onReset}><FaSync/>Reset</Btn>
      <Btn kind="accent" onClick={onScramble}><FaRandom/>Scramble</Btn>
      <Btn kind="primary" onClick={onSolve}><FaCheckCircle/>Solve</Btn>
      <Btn kind="accent" onClick={() => setDebugMode(v=>!v)}>{debugMode?<FaBug/>:""}Debug</Btn>
    </ButtonBar>
  );
}
