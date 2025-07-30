import React, { useState, useEffect } from "react";
import "./App.css";
import Sidebar from "./Sidebar";
import { Cube3D } from "./RubiksCubeScene";
import { useCube } from "./useCube";

// PUBLIC_INTERFACE
function App() {
  // Cube state and handler hooks
  const {
    cubeSize,
    setCubeSize,
    cubeState,
    moveHistory,
    moveQueue,
    animationSpeed,
    setAnimationSpeed,
    debugMode,
    setDebugMode,
    isScrambling,
    isSolving,
    onUndo,
    onRedo,
    onReplay,
    onReset,
    onScramble,
    onSolve,
    handleMoveComplete,
  } = useCube(3);

  // Theme
  const [theme, setTheme] = useState("dark");
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Responsive sidebar placement: right for wide, bottom for mobile
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 900);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  // Layout: Sidebar (right/bottom), main Cube3D in center
  return (
    <div className="App" style={{ display: "flex", flexDirection: isMobile ? "column" : "row" }}>
      {/* Sidebar */}
      <div style={{
        order: isMobile ? 2 : 1,
        width: isMobile ? "100vw" : undefined,
        minHeight: isMobile ? "210px" : "100vh",
        zIndex: 2
      }}>
        <Sidebar
          cubeSize={cubeSize}
          setCubeSize={setCubeSize}
          moveHistory={moveHistory}
          onUndo={onUndo}
          onRedo={onRedo}
          onReplay={onReplay}
          animationSpeed={animationSpeed}
          setAnimationSpeed={setAnimationSpeed}
          onReset={onReset}
          onScramble={onScramble}
          onSolve={onSolve}
          debugMode={debugMode}
          setDebugMode={setDebugMode}
          isScrambling={isScrambling}
          isSolving={isSolving}
          isAnimating={moveQueue.length > 0}
        />
      </div>
      {/* Main 3D Cube Area */}
      <div style={{
        order: isMobile ? 1 : 2,
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: isMobile ? "60vw" : "100vh",
        minHeight: isMobile ? "320px" : "100vh",
        background: "radial-gradient(circle at 70% 40%, #191d24 60%, #151922 100%)"
      }}>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? "🌙 Dark" : "☀️ Light"}
        </button>
        <div style={{
          width: "min(88vw,66vh)",
          height: "min(75vw,90vh)",
          minWidth: 320,
          minHeight: 320,
          background: "#13171d",
          borderRadius: "18px",
          boxShadow: "0px 0px 24px #111a2d77",
          overflow: "hidden",
          position: "relative"
        }}>
          <Cube3D
            cubeState={cubeState}
            cubeSize={cubeSize}
            moveQueue={moveQueue}
            onMoveComplete={handleMoveComplete}
            animationSpeed={animationSpeed}
            showIndices={debugMode}
            debugMode={debugMode}
            isScrambling={isScrambling}
            isSolving={isSolving}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
