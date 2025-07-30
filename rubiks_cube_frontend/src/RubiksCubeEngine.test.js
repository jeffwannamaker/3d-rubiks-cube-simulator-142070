/**
 * Unit tests for move validation and cube audit.
 */
import { RubiksCube, createSolvedCube, generateValidMoves } from "./RubiksCubeEngine";

describe("RubiksCube move validation & audit", () => {
  test("solved cube is solved and audit matches", () => {
    let cube = new RubiksCube(3);
    expect(cube.isSolved()).toBeTruthy();
    let audit = cube.auditState();
    expect(Object.keys(audit)).toHaveLength(6);
    for (const face in audit) {
      // All colors on face equal
      expect(Object.values(audit[face])).toHaveLength(1);
      expect(Object.values(audit[face])[0]).toBe(9);
    }
  });

  test("move validation: valid/invalid moves", () => {
    let cube = new RubiksCube(3);
    expect(cube.makeMove("R").valid).toBe(true);
    expect(cube.makeMove("R'").valid).toBe(true);
    expect(cube.makeMove("F2").valid).toBe(true);
    expect(cube.makeMove("Z").valid).toBe(false);
    expect(cube.makeMove("Uw2").valid).toBe(false); // 3x3: no wide moves
    let cube4 = new RubiksCube(4);
    expect(generateValidMoves(4).some(m => m === "Rw2")).toBe(true);
    expect(cube4.makeMove("Rw2").valid).toBe(true);
  });

  test("undo/redo updates state properly", () => {
    let cube = new RubiksCube(3);
    cube.makeMove("R");
    cube.makeMove("U");
    let state1 = JSON.stringify(cube.getState());
    cube.undo();
    let state2 = JSON.stringify(cube.getState());
    expect(state1).not.toEqual(state2);
    cube.redo();
    expect(JSON.stringify(cube.getState())).toEqual(state1);
  });
});
