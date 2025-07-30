/**
 * Sidebar UI: Cube controls, size selector, move log, animation speed, actions, debug.
 * Responsive: shows right on desktop, bottom on mobile.
 */
import React from "react";
import styled from "styled-components";
import MoveLog from "./MoveLog";
import CubeControls from "./CubeControls";
import { FACE_COLORS, FACE_NAMES } from "./RubiksCubeEngine";

const colors = {
  primary: "#1976d2",
  accent: "#388e3c",
  secondary: "#f57c00"
};

const SidebarContainer = styled.div`
  background: rgba(24,26,30,0.98);
  color: #f5f5f5;
  box-shadow: -2px 0 24px rgba(0,0,0,0.13);
  width: 350px;
  min-width: 260px;
  max-width: 100vw;
  z-index: 2;
  flex-shrink: 0;
  border-left: 2px solid #242f34;
  display: flex;
  flex-direction: column;
  padding: 1.1rem 1.2rem;
  @media (max-width: 900px) {
    width: 100vw;
    min-width: unset;
    border-left: none;
    border-top: 2px solid #282d3c;
    padding: 0.65rem 0.7rem;
    box-shadow: 0 -2px 12px rgba(0,0,0,0.17);
  }
`;

const Section = styled.div`
  margin-bottom: 1.1rem;
`;
const Label = styled.div`
  font-size: 1.05rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  margin-bottom: 0.25rem;
`;
const ColorSwatches = styled.div`
  display: flex;
  gap: 0.22em;
  margin-bottom: 0.3em;
`;
const Swatch = styled.div`
  width: 19px;
  height: 19px;
  border-radius: 4px;
  background: ${props => props.color};
  border: 1px solid #333;
`;

function Sidebar({
  cubeSize,
  setCubeSize,
  moveHistory,
  onUndo,
  onRedo,
  onReplay,
  animationSpeed,
  setAnimationSpeed,
  onReset,
  onScramble,
  onSolve,
  debugMode,
  setDebugMode,
}) {
  return (
    <SidebarContainer>
      <Section>
        <Label>Cube Size</Label>
        <input
          type="range"
          min={3}
          max={10}
          value={cubeSize}
          onChange={e => setCubeSize(Number(e.target.value))}
          style={{ width: "100%" }}
        />
        <div style={{ fontWeight: 600, marginTop: 2 }}>{cubeSize} x {cubeSize} x {cubeSize}</div>
      </Section>
      <Section>
        <Label>Face Colors</Label>
        <ColorSwatches>
          {FACE_COLORS.map((clr, i) => (
            <Swatch key={i} color={clr} title={FACE_NAMES[i]} />
          ))}
        </ColorSwatches>
      </Section>
      <Section>
        <Label>Cube Controls</Label>
        <CubeControls
          onUndo={onUndo}
          onRedo={onRedo}
          onReplay={onReplay}
          onReset={onReset}
          onScramble={onScramble}
          onSolve={onSolve}
          debugMode={debugMode}
          setDebugMode={setDebugMode}
        />
      </Section>
      <Section>
        <Label>Animation Speed</Label>
        <input
          type="range"
          min={0.4}
          max={3}
          step={0.05}
          value={animationSpeed}
          onChange={e => setAnimationSpeed(Number(e.target.value))}
          style={{ width: "100%" }}
        />
        <div style={{ fontSize: "0.93em", marginTop: 3 }}>
          {Number(animationSpeed).toFixed(2)}x
        </div>
      </Section>
      <Section>
        <Label>Move History</Label>
        <MoveLog moves={moveHistory}/>
      </Section>
    </SidebarContainer>
  );
}

export default Sidebar;
