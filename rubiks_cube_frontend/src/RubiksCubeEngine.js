/**
 * Rubik's Cube engine, model, and move logic for various NxNxN sizes.
 * Handles cube state (face arrays), move logic, scramble/solve, undo/redo stack.
 * Also provides notations, validation, and debug utilities.
 */

import { randomInt } from "./utils";

// Standard Rubik's Cube face colors (U, R, F, D, L, B)
// white, red, green, yellow, orange, blue (common WCA order)
export const FACE_COLORS = [
  "#FFF", // U (up/white)
  "#E53935", // R (red)
  "#43A047", // F (green)
  "#FFD600", // D (yellow)
  "#FB8C00", // L (orange)
  "#1976D2"  // B (blue)
];
export const FACE_NAMES = ["U", "R", "F", "D", "L", "B"];

// Helper: Create solved cube state for NxNxN
export function createSolvedCube(size = 3) {
  // Each face is an array of size*size elements with a color index (0-5)
  return FACE_NAMES.map((_, i) =>
    Array(size * size).fill(i)
  );
}

// Cube move notations: Basic faces, slices, wide moves, inverse/prime, double, etc.
export const BASIC_MOVES = ["U", "D", "F", "B", "R", "L"];
export function generateValidMoves(size = 3) {
  let moves = [];
  for (let face of BASIC_MOVES) {
    // Standard face
    moves.push(face);
    moves.push(face + "'"); // Inverse
    moves.push(face + "2"); // Double
    // Wide moves and slice moves for bigger cubes (size >= 4)
    if (size > 3) {
      for (let layer = 2; layer <= Math.floor(size / 2); ++layer) {
        moves.push(face + "w" + layer);
        moves.push(face + "w" + layer + "'");
        moves.push(face + "w" + layer + "2");
      }
    }
  }
  // Middle (M, E, S) slice moves (if size >=4)
  if (size > 3) {
    const slices = ["M", "E", "S"];
    for (let s of slices) {
      moves.push(s, s + "'", s + "2");
    }
  }
  return moves;
}

/**
 * Class for maintaining cube state and move operations, history stack, undo/redo, scramble/solve.
 */
export class RubiksCube {
  // PUBLIC_INTERFACE
  constructor(size = 3) {
    this.size = size;
    this.state = createSolvedCube(size); // 6 faces
    this.moveHistory = []; // {move, layer, axis, prime} list
    this.undoStack = [];
    this._initMoveMaps();
  }

  /**
   * PUBLIC_INTERFACE
   * Returns a deep copy of the cube state.
   */
  getState() {
    // Returns array of arrays (face colors by indices)
    return this.state.map(face => [...face]);
  }
  // PUBLIC_INTERFACE
  setState(newState) {
    this.state = newState.map(face => [...face]);
  }
  /**
   * PUBLIC_INTERFACE
   * Makes a move (string notation), updates state/history.
   * Returns {move, valid, message}
   */
  makeMove(move) {
    if (!this._isValidMove(move)) {
      return { move, valid: false, message: "Invalid move" };
    }
    this._applyMoveToState(move, this.state);
    this.moveHistory.push(move);
    this.undoStack = [];
    return { move, valid: true };
  }
  // PUBLIC_INTERFACE
  undo() {
    if (this.moveHistory.length === 0) return false;
    const lastMove = this.moveHistory.pop();
    const inverse = this._getInverseMove(lastMove);
    this._applyMoveToState(inverse, this.state);
    this.undoStack.push(lastMove);
    return true;
  }
  // PUBLIC_INTERFACE
  redo() {
    if (this.undoStack.length === 0) return false;
    const move = this.undoStack.pop();
    this._applyMoveToState(move, this.state);
    this.moveHistory.push(move);
    return true;
  }
  // PUBLIC_INTERFACE
  reset() {
    this.state = createSolvedCube(this.size);
    this.moveHistory = [];
    this.undoStack = [];
  }
  // PUBLIC_INTERFACE
  scramble(moveCount = 30) {
    let moves = generateValidMoves(this.size);
    for (let i = 0; i < moveCount; ++i) {
      const m = moves[randomInt(0, moves.length - 1)];
      this.makeMove(m);
    }
  }
  /**
   * PUBLIC_INTERFACE
   * Solve cube (beginner method minimum), returns move sequence. Solves cube in-place.
   * (For demo: simple reverse of moves. For AI: replace with an actual solver)
   */
  solve() {
    // For MVP, simply undo all moves. Replace with real solver for advanced.
    let solution = [];
    while (this.moveHistory.length) {
      const lastMove = this.moveHistory.pop();
      const inv = this._getInverseMove(lastMove);
      this._applyMoveToState(inv, this.state);
      solution.push(inv);
    }
    this.undoStack = [];
    return solution; // Actual solver can be plugged in here.
  }
  /**
   * PUBLIC_INTERFACE
   * Validate cube state (e.g. cubie/color positions vs solved)
   */
  isSolved() {
    return this.state.every(face => face.every(sticker => sticker === face[0]));
  }
  // Returns an audit object: color counts, parity checks, etc.
  auditState() {
    let audit = {};
    for (let i = 0; i < 6; ++i) {
      audit[FACE_NAMES[i]] = {};
      this.state[i].forEach(color => {
        audit[FACE_NAMES[i]][color] = (audit[FACE_NAMES[i]][color] || 0) + 1;
      });
    }
    return audit;
  }
  // Debug info: sticker indices, orientation, etc.
  debugInfo() {
    return {
      faces: FACE_NAMES.slice(),
      size: this.size,
      moveHistory: [...this.moveHistory],
      audit: this.auditState(),
    };
  }

  // Move parsing & helpers
  _isValidMove(move) {
    const validMoves = generateValidMoves(this.size);
    return validMoves.includes(move) || /^[UDFBRLMES]w?[1-9]?'?2?$/.test(move);
  }
  _getInverseMove(move) {
    if (move.endsWith("'")) return move.replace("'", "");
    if (move.endsWith("2")) return move;
    return move + "'";
  }
  // TODO: Implement actual cube sticker mutation by face/layer/axis.
  /**
   * Real implementation must rotate pieces in the cube array by move.
   * For MVP, this is a stub that does not mutate stickers.
   */
  _applyMoveToState(move, state) {
    // Placeholder for full move logic (needed for replay/animation/MV)
    // For now: fudge by shuffling a random color on each face. Replace with proper logic.
    // Real version will rotate stickers between faces based on the move and size.
    // (can be left as stub for now for non-visual test, see Three.js for visual move)
    // No-op for placeholder.
  }

  _initMoveMaps() {
    // For future: precompute face/layer/sticker swap arrays for move performance
  }
}

// PUBLIC_INTERFACE
export function parseMove(move) {
  // Splits move into {face, layer, prime, double, wide}
  // Examples: U, R', F2, Uw2, Rw2, U3' etc.
  const match = move.match(/^([UDFBRLME S])([w]?)([1-9]?)(2?)('?)/);
  if (!match) return null;
  return {
    face: match[1],
    wide: !!match[2],
    layer: match[3] ? parseInt(match[3]) : 1,
    double: !!match[4],
    prime: !!match[5],
  };
}
