/**
 * MoveLog: Scrollable list of moves (with undo/redo/replay highlight) for sidebar.
 */
import React from "react";
import styled from "styled-components";

const LogList = styled.div`
  max-height: 150px;
  overflow-y: auto;
  font-size: 1.01em;
  background: rgba(30,30,35,0.55);
  border-radius: 6px;
  padding: 0.6em 0.6em 0.2em 0.6em;
  margin-top: 0.1em;
`;

const MoveItem = styled.div`
  display: inline-block;
  margin-right: 0.45em;
  margin-bottom: 0.39em;
  padding: 0.31em 0.56em;
  background: ${props => props.active? "#1976d2": "#434a58"};
  color: #fff;
  border-radius: 4px;
  font-size: 0.97em;
  box-shadow: 0 1px 2px rgba(0,0,0,0.075);
`;

export default function MoveLog({ moves = [], currentIndex }) {
  return (
    <LogList>
      {moves.length === 0 && <span style={{opacity: 0.65}}>No moves yet.</span>}
      {moves.map((m, i) => (
        <MoveItem key={i} active={currentIndex !== undefined && currentIndex === i}>
          {m}
        </MoveItem>
      ))}
    </LogList>
  );
}
