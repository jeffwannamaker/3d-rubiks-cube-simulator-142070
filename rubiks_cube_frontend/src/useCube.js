/**
 * useCube: State management for cube, moves, animation, UI controls.
 */
import { useState, useCallback } from "react";
import { RubiksCube, generateValidMoves } from "./RubiksCubeEngine";
import { randomInt } from "./utils";

// PUBLIC_INTERFACE
export function useCube(initialSize = 3) {
  const [cubeSize, setCubeSize] = useState(initialSize);
  const [cube] = useState(() => new RubiksCube(initialSize));
  const [cubeState, setCubeState] = useState(cube.getState());
  const [moveHistory, setMoveHistory] = useState([]);
  const [moveQueue, setMoveQueue] = useState([]);
  const [animationSpeed, setAnimationSpeed] = useState(1.2);
  const [debugMode, setDebugMode] = useState(false);
  const [isScrambling, setIsScrambling] = useState(false);
  const [isSolving, setIsSolving] = useState(false);

  // Reset cube size (makes new cube)
  const changeCubeSize = useCallback((size) => {
    cube.size = size;
    cube.reset();
    setCubeSize(size);
    setCubeState(cube.getState());
    setMoveHistory([]);
  }, [cube]);

  // Handle cube moves, push to moveQueue for animation.
  const doMove = useCallback((move) => {
    setMoveQueue(queue => [...queue, move]);
  }, []);

  // Actually apply the move after animation (in the engine)
  const handleMoveComplete = useCallback(() => {
    if (moveQueue.length > 0) {
      const nextMove = moveQueue[0];
      
      if (isSolving) {
        // For solving, we need to apply the inverse move and update history
        cube.undo();
      } else {
        // For regular moves and scrambling, make the move normally
        cube.makeMove(nextMove);
      }
      
      setMoveQueue((q) => q.slice(1));
      setCubeState(cube.getState());
      setMoveHistory([...cube.moveHistory]);
    }
    
    // Check if we've finished scrambling or solving
    if (moveQueue.length === 1) { // Will be 0 after this move completes
      if (isScrambling) {
        setIsScrambling(false);
      }
      if (isSolving) {
        setIsSolving(false);
      }
    }
  }, [cube, moveQueue, isScrambling, isSolving]);

  const onUndo = useCallback(() => {
    if (isScrambling || isSolving || moveQueue.length > 0) return;
    cube.undo();
    setCubeState(cube.getState());
    setMoveHistory([...cube.moveHistory]);
  }, [cube, isScrambling, isSolving, moveQueue.length]);
  
  const onRedo = useCallback(() => {
    if (isScrambling || isSolving || moveQueue.length > 0) return;
    cube.redo();
    setCubeState(cube.getState());
    setMoveHistory([...cube.moveHistory]);
  }, [cube, isScrambling, isSolving, moveQueue.length]);
  
  const onReplay = useCallback(() => {
    if (isScrambling || isSolving || moveQueue.length > 0) return;
    // Reset and replay all moves with animation
    const movesToReplay = [...cube.moveHistory];
    cube.reset();
    setCubeState(cube.getState());
    setMoveHistory([]);
    
    if (movesToReplay.length > 0) {
      setMoveQueue(movesToReplay);
    }
  }, [cube, isScrambling, isSolving, moveQueue.length]);
  
  const onReset = useCallback(() => {
    if (isScrambling || isSolving || moveQueue.length > 0) return;
    cube.reset();
    setCubeState(cube.getState());
    setMoveHistory([]);
    setMoveQueue([]);
  }, [cube, isScrambling, isSolving, moveQueue.length]);
  const onScramble = useCallback(() => {
    if (isScrambling || isSolving || moveQueue.length > 0) return;
    
    // Reset cube to solved state
    cube.reset();
    setCubeState(cube.getState());
    setMoveHistory([]);
    setIsScrambling(true);
    
    // Generate scramble moves (30 moves by default)
    const validMoves = generateValidMoves(cubeSize);
    const scrambleMoves = [];
    for (let i = 0; i < 30; i++) {
      const randomMove = validMoves[randomInt(0, validMoves.length - 1)];
      scrambleMoves.push(randomMove);
    }
    
    // Queue all scramble moves for animation
    setMoveQueue(scrambleMoves);
  }, [cube, cubeSize, isScrambling, isSolving, moveQueue.length]);
  const onSolve = useCallback(() => {
    if (isScrambling || isSolving || moveQueue.length > 0) return;
    
    setIsSolving(true);
    
    // Generate solution moves (reverse of current move history)
    const solutionMoves = [];
    for (let i = cube.moveHistory.length - 1; i >= 0; i--) {
      const move = cube.moveHistory[i];
      const inverseMove = cube.getInverseMove(move);
      solutionMoves.push(inverseMove);
    }
    
    // Queue all solution moves for animation
    setMoveQueue(solutionMoves);
  }, [cube, isScrambling, isSolving, moveQueue.length]);

  return {
    cubeSize,
    setCubeSize: changeCubeSize,
    cubeState,
    moveHistory,
    moveQueue,
    animationSpeed,
    setAnimationSpeed,
    debugMode,
    setDebugMode,
    isScrambling,
    isSolving,
    doMove,
    onUndo,
    onRedo,
    onReplay,
    onReset,
    onScramble,
    onSolve,
    handleMoveComplete,
  };
}
