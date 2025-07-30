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

  test("undoing all scramble moves returns cube to solved state", () => {
    let cube = new RubiksCube(3);
    
    // Verify cube starts solved
    expect(cube.isSolved()).toBe(true);
    const initialState = JSON.stringify(cube.getState());
    
    // Make a series of moves (simulating scramble)
    const moves = ["R", "U", "R'", "F", "U'", "D", "L", "B", "F'", "D'"];
    moves.forEach(move => {
      cube.makeMove(move);
    });
    
    // Verify cube is not solved after moves
    expect(cube.isSolved()).toBe(false);
    expect(cube.moveHistory).toHaveLength(moves.length);
    
    // Undo all moves
    let undoCount = 0;
    while (cube.moveHistory.length > 0) {
      const undoResult = cube.undo();
      expect(undoResult).toBe(true);
      undoCount++;
    }
    
    // Verify all moves were undone
    expect(undoCount).toBe(moves.length);
    expect(cube.moveHistory).toHaveLength(0);
    
    // Verify cube is back to solved state
    expect(cube.isSolved()).toBe(true);
    const finalState = JSON.stringify(cube.getState());
    expect(finalState).toEqual(initialState);
  });

  test("scramble method and undo all moves returns to solved state", () => {
    let cube = new RubiksCube(3);
    
    // Verify cube starts solved
    expect(cube.isSolved()).toBe(true);
    const initialState = JSON.stringify(cube.getState());
    
    // Use the scramble method
    cube.scramble(20); // 20 random moves
    
    // Verify cube is scrambled
    expect(cube.isSolved()).toBe(false);
    expect(cube.moveHistory.length).toBe(20);
    
    // Undo all scramble moves
    let undoCount = 0;
    while (cube.moveHistory.length > 0) {
      const undoResult = cube.undo();
      expect(undoResult).toBe(true);
      undoCount++;
    }
    
    // Verify all moves were undone
    expect(undoCount).toBe(20);
    expect(cube.moveHistory).toHaveLength(0);
    
    // Verify cube is back to solved state
    expect(cube.isSolved()).toBe(true);
    const finalState = JSON.stringify(cube.getState());
    expect(finalState).toEqual(initialState);
  });

  test("inverse move calculation is correct", () => {
    let cube = new RubiksCube(3);
    
    // Test basic moves
    expect(cube.getInverseMove("R")).toBe("R'");
    expect(cube.getInverseMove("R'")).toBe("R");
    expect(cube.getInverseMove("R2")).toBe("R2");
    expect(cube.getInverseMove("U")).toBe("U'");
    expect(cube.getInverseMove("U'")).toBe("U");
    expect(cube.getInverseMove("F2")).toBe("F2");
    
    // Test that applying a move and its inverse returns to original state
    const originalState = JSON.stringify(cube.getState());
    cube.makeMove("R");
    cube.makeMove("R'");
    expect(JSON.stringify(cube.getState())).toEqual(originalState);
    
    cube.makeMove("U2");
    cube.makeMove("U2");
    expect(JSON.stringify(cube.getState())).toEqual(originalState);
  });
});
