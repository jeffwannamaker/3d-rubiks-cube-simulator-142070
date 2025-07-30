/**
 * useCube: State management for cube, moves, animation, UI controls.
 */
import { useState, useCallback } from "react";
import { RubiksCube } from "./RubiksCubeEngine";

// PUBLIC_INTERFACE
export function useCube(initialSize = 3) {
  const [cubeSize, setCubeSize] = useState(initialSize);
  const [cube] = useState(() => new RubiksCube(initialSize));
  const [cubeState, setCubeState] = useState(cube.getState());
  const [moveHistory, setMoveHistory] = useState([]);
  const [moveQueue, setMoveQueue] = useState([]);
  const [animationSpeed, setAnimationSpeed] = useState(1.2);
  const [debugMode, setDebugMode] = useState(false);

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
      cube.makeMove(nextMove);
      setMoveQueue((q) => q.slice(1));
      setCubeState(cube.getState());
      setMoveHistory([...cube.moveHistory]);
    }
  }, [cube, moveQueue]);

  const onUndo = () => {
    cube.undo();
    setCubeState(cube.getState());
    setMoveHistory([...cube.moveHistory]);
  };
  const onRedo = () => {
    cube.redo();
    setCubeState(cube.getState());
    setMoveHistory([...cube.moveHistory]);
  };
  const onReplay = () => {
    // Replay all cubes from scratch!
    cube.reset();
    setCubeState(cube.getState());
    setMoveHistory([]);
    // Optionally: enqueue moves for animation rather than jump.
  };
  const onReset = () => {
    cube.reset();
    setCubeState(cube.getState());
    setMoveHistory([]);
  };
  const onScramble = () => {
    cube.reset();
    cube.scramble();
    setCubeState(cube.getState());
    setMoveHistory([...cube.moveHistory]);
  };
  const onSolve = () => {
    const solution = cube.solve();
    setCubeState(cube.getState());
    setMoveHistory([...cube.moveHistory]);
    // Optionally animate the solve moves
  };

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
