import { render, screen } from '@testing-library/react';
import App from './App';
import { RubiksCube } from "./RubiksCubeEngine";

test('renders main sidebar controls', () => {
  render(<App />);
  // Cube Size slider should appear
  expect(screen.getByText(/Cube Size/i)).toBeInTheDocument();
});

test('cube logic: solved and audit', () => {
  let cube = new RubiksCube(3);
  expect(cube.isSolved()).toBe(true);
  let audit = cube.auditState();
  expect(Object.keys(audit)).toHaveLength(6);
});

test('move validation works (no crash)', () => {
  let cube = new RubiksCube(4);
  expect(cube.makeMove("R2").valid).toBe(true);
  expect(typeof cube.auditState()).toBe("object");
});
