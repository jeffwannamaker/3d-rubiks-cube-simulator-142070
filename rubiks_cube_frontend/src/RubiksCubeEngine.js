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
  // PUBLIC_INTERFACE
  getInverseMove(move) {
    if (move.endsWith("'")) return move.replace("'", "");
    if (move.endsWith("2")) return move;
    return move + "'";
  }
  
  _getInverseMove(move) {
    return this.getInverseMove(move);
  }

  /**
   * Apply move to cube state - implements actual cube rotation logic
   */
  _applyMoveToState(move, state) {
    const parsed = parseMove(move);
    if (!parsed) return;

    const { face, prime, double } = parsed;
    const rotations = double ? 2 : 1;

    for (let r = 0; r < rotations; r++) {
      this._rotateFace(face, prime, state);
    }
  }

  /**
   * Rotate a face and adjacent edges
   */
  _rotateFace(face, prime, state) {
    const size = this.size;
    
    // Face mappings: U=0, R=1, F=2, D=3, L=4, B=5
    const faceMap = { U: 0, R: 1, F: 2, D: 3, L: 4, B: 5 };
    const faceIndex = faceMap[face];
    
    if (faceIndex === undefined) return;

    // Rotate the face itself (90 degrees clockwise or counterclockwise)
    this._rotateFaceMatrix(state[faceIndex], size, prime);
    
    // Rotate adjacent edges based on the face
    this._rotateAdjacentEdges(face, prime, state, size);
  }

  /**
   * Rotate a face matrix 90 degrees
   */
  _rotateFaceMatrix(faceArray, size, prime) {
    const temp = [...faceArray];
    
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const oldIndex = i * size + j;
        let newIndex;
        
        if (prime) {
          // Counterclockwise: (i,j) -> (j, size-1-i)
          newIndex = j * size + (size - 1 - i);
        } else {
          // Clockwise: (i,j) -> (size-1-j, i)
          newIndex = (size - 1 - j) * size + i;
        }
        
        faceArray[newIndex] = temp[oldIndex];
      }
    }
  }

  /**
   * Rotate the adjacent edges when a face is turned
   */
  _rotateAdjacentEdges(face, prime, state, size) {
    // Define adjacent face cycles for each face turn
    const adjacentCycles = {
      U: [
        { face: 2, edge: 'top' },    // Front top
        { face: 1, edge: 'top' },    // Right top  
        { face: 5, edge: 'top' },    // Back top
        { face: 4, edge: 'top' }     // Left top
      ],
      D: [
        { face: 2, edge: 'bottom' }, // Front bottom
        { face: 4, edge: 'bottom' }, // Left bottom
        { face: 5, edge: 'bottom' }, // Back bottom
        { face: 1, edge: 'bottom' }  // Right bottom
      ],
      F: [
        { face: 0, edge: 'bottom' }, // Up bottom
        { face: 1, edge: 'left' },   // Right left
        { face: 3, edge: 'top' },    // Down top
        { face: 4, edge: 'right' }   // Left right
      ],
      B: [
        { face: 0, edge: 'top' },    // Up top
        { face: 4, edge: 'left' },   // Left left
        { face: 3, edge: 'bottom' }, // Down bottom
        { face: 1, edge: 'right' }   // Right right
      ],
      R: [
        { face: 0, edge: 'right' },  // Up right
        { face: 2, edge: 'right' },  // Front right
        { face: 3, edge: 'right' },  // Down right
        { face: 5, edge: 'left' }    // Back left (reversed)
      ],
      L: [
        { face: 0, edge: 'left' },   // Up left
        { face: 5, edge: 'right' },  // Back right (reversed)
        { face: 3, edge: 'left' },   // Down left
        { face: 2, edge: 'left' }    // Front left
      ]
    };

    const cycle = adjacentCycles[face];
    if (!cycle) return;

    // Extract edge data
    const edges = cycle.map(({ face: faceIdx, edge }) => 
      this._getEdge(state[faceIdx], edge, size)
    );

    // Rotate the edges
    if (prime) {
      // Counterclockwise - rotate edges backward
      for (let i = 0; i < cycle.length; i++) {
        const { face: faceIdx, edge } = cycle[i];
        const prevIndex = (i + 1) % cycle.length;
        this._setEdge(state[faceIdx], edge, edges[prevIndex], size);
      }
    } else {
      // Clockwise - rotate edges forward  
      for (let i = 0; i < cycle.length; i++) {
        const { face: faceIdx, edge } = cycle[i];
        const nextIndex = (i + cycle.length - 1) % cycle.length;
        this._setEdge(state[faceIdx], edge, edges[nextIndex], size);
      }
    }
  }

  /**
   * Get an edge from a face
   */
  _getEdge(faceArray, edge, size) {
    const result = [];
    
    switch (edge) {
      case 'top':
        for (let i = 0; i < size; i++) {
          result.push(faceArray[i]);
        }
        break;
      case 'bottom':
        for (let i = 0; i < size; i++) {
          result.push(faceArray[(size - 1) * size + i]);
        }
        break;
      case 'left':
        for (let i = 0; i < size; i++) {
          result.push(faceArray[i * size]);
        }
        break;
      case 'right':
        for (let i = 0; i < size; i++) {
          result.push(faceArray[i * size + (size - 1)]);
        }
        break;
    }
    
    return result;
  }

  /**
   * Set an edge on a face
   */
  _setEdge(faceArray, edge, edgeData, size) {
    switch (edge) {
      case 'top':
        for (let i = 0; i < size; i++) {
          faceArray[i] = edgeData[i];
        }
        break;
      case 'bottom':
        for (let i = 0; i < size; i++) {
          faceArray[(size - 1) * size + i] = edgeData[i];
        }
        break;
      case 'left':
        for (let i = 0; i < size; i++) {
          faceArray[i * size] = edgeData[i];
        }
        break;
      case 'right':
        for (let i = 0; i < size; i++) {
          faceArray[i * size + (size - 1)] = edgeData[i];
        }
        break;
    }
  }

  _initMoveMaps() {
    // For future: precompute face/layer/sticker swap arrays for move performance
  }
}

// PUBLIC_INTERFACE
export function parseMove(move) {
  // Splits move into {face, layer, prime, double, wide}
  // Examples: U, R', F2, Uw2, Rw2, U3' etc.
  const match = move.match(/^([UDFBRLME S])([w]?)([1-9]?)(2?)(\'?)$/);
  if (!match) return null;
  return {
    face: match[1],
    wide: !!match[2],
    layer: match[3] ? parseInt(match[3]) : 1,
    double: !!match[4],
    prime: !!match[5],
  };
}
