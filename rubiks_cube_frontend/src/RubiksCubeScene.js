/**
 * 3D Rubik's Cube Canvas Scene using React Three Fiber & Drei.
 * Handles rendering, cubelets, camera, controls, lighting, and animated turns.
 */
import React, { useRef, useEffect, useState, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { FACE_COLORS } from "./RubiksCubeEngine";
import * as THREE from "three";

const BG_DARK = "#222831";

function Cubelet({ pos, size, faces, showIndices, debug, cubeSize }) {
  // Each face array: { normal: THREE.Vector3, face: "U"/etc, color: hex }
  // Cubelets are smaller than spacing to get that "beveled"/gap look.
  const N = cubeSize;
  const scale = 0.95;
  const shape = [scale, scale, scale];
  
  return (
    <group position={pos}>
      {/* Main cubelet body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={shape} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      
      {/* Colored face stickers */}
      {faces.map(faceObj => {
        // Calculate proper rotation for each face
        const rotation = new THREE.Euler();
        const normal = faceObj.normal;
        
        if (normal.equals(new THREE.Vector3(0, 1, 0))) {
          // Top face (U) - rotate -90 degrees around X
          rotation.set(-Math.PI / 2, 0, 0);
        } else if (normal.equals(new THREE.Vector3(0, -1, 0))) {
          // Bottom face (D) - rotate 90 degrees around X
          rotation.set(Math.PI / 2, 0, 0);
        } else if (normal.equals(new THREE.Vector3(1, 0, 0))) {
          // Right face (R) - rotate 90 degrees around Y
          rotation.set(0, Math.PI / 2, 0);
        } else if (normal.equals(new THREE.Vector3(-1, 0, 0))) {
          // Left face (L) - rotate -90 degrees around Y
          rotation.set(0, -Math.PI / 2, 0);
        } else if (normal.equals(new THREE.Vector3(0, 0, 1))) {
          // Front face (F) - no rotation needed
          rotation.set(0, 0, 0);
        } else if (normal.equals(new THREE.Vector3(0, 0, -1))) {
          // Back face (B) - rotate 180 degrees around Y
          rotation.set(0, Math.PI, 0);
        }
        
        const position = normal.clone().multiplyScalar(scale / 2 + 0.01);
        
        return (
          <mesh 
            key={faceObj.face} 
            position={position}
            rotation={rotation}
          >
            <planeGeometry args={[scale * 0.9, scale * 0.9]} />
            <meshStandardMaterial 
              color={faceObj.color} 
              side={THREE.FrontSide}
            />
          </mesh>
        );
      })}
      
      {/* Debug indices */}
      {showIndices && (
        <Html center style={{ pointerEvents: "none", color: "#f57c00", fontSize: "12px" }}>
          {debug}
        </Html>
      )}
    </group>
  );
}

/**
 * Cube3D visual, interactive orbit controls, animates planes on move.
 * Public props: cubeState (6 face arrays), cubeSize, moveQueue, onMoveComplete, animationSpeed, showIndices, debugMode
 */
export function Cube3D({
  cubeState,
  cubeSize,
  moveQueue = [],
  onMoveComplete = () => {},
  animationSpeed = 1.2,
  showIndices = false,
  debugMode = false,
  isScrambling = false,
  isSolving = false,
}) {
  // Animation: When moveQueue receives new move, animate corresponding plane/slice
  const [animating, setAnimating] = useState(false);
  const groupRef = useRef();
  const latestStateRef = useRef(cubeState);

  // Internal cube model for animation; if moveQueue is non-empty and !animating, start anim on moveQueue[0]
  useEffect(() => {
    latestStateRef.current = cubeState;
  }, [cubeState]);

  // Animate move if moveQueue has a move and not currently animating
  useEffect(() => {
    if (!animating && moveQueue.length > 0) {
      setAnimating(true);

      // Animation duration based on speed - longer for visibility during scramble
      const duration = isScrambling || isSolving ? 300 / animationSpeed : 500 / animationSpeed;
      
      setTimeout(() => {
        setAnimating(false);
        onMoveComplete();
      }, duration);

      // TODO: For advanced, interpolate rotation of groupRef for affected slice
    }
  }, [moveQueue, animating, animationSpeed, onMoveComplete, isScrambling, isSolving]);

  // Generate cubelets positions and face colors
  const cubelets = useMemo(() => {
    // cubeState: 6 faces, each face an array of N*N colors
    // Map faces and indices to cubelet stickers
    const N = cubeSize;
    const mid = (N - 1) / 2;
    let cubelets = [];
    
    for (let x = 0; x < N; ++x) {
      for (let y = 0; y < N; ++y) {
        for (let z = 0; z < N; ++z) {
          // For each cubelet, find which stickers it has (on faces)
          let faces = [];
          
          // Map cube indices to facelet index for each face (U,R,F,D,L,B)
          // Top face (U) - y = N-1
          if (y === N - 1) {
            faces.push({
              normal: new THREE.Vector3(0, 1, 0),
              face: "U",
              color: FACE_COLORS[cubeState[0][x + z * N]],
            });
          }
          
          // Bottom face (D) - y = 0
          if (y === 0) {
            faces.push({
              normal: new THREE.Vector3(0, -1, 0),
              face: "D",
              color: FACE_COLORS[cubeState[3][x + (N - 1 - z) * N]],
            });
          }
          
          // Right face (R) - x = N-1
          if (x === N - 1) {
            faces.push({
              normal: new THREE.Vector3(1, 0, 0),
              face: "R",
              color: FACE_COLORS[cubeState[1][z + (N - 1 - y) * N]],
            });
          }
          
          // Left face (L) - x = 0
          if (x === 0) {
            faces.push({
              normal: new THREE.Vector3(-1, 0, 0),
              face: "L",
              color: FACE_COLORS[cubeState[4][(N - 1 - z) + (N - 1 - y) * N]],
            });
          }
          
          // Front face (F) - z = N-1
          if (z === N - 1) {
            faces.push({
              normal: new THREE.Vector3(0, 0, 1),
              face: "F",
              color: FACE_COLORS[cubeState[2][x + (N - 1 - y) * N]],
            });
          }
          
          // Back face (B) - z = 0
          if (z === 0) {
            faces.push({
              normal: new THREE.Vector3(0, 0, -1),
              face: "B",
              color: FACE_COLORS[cubeState[5][(N - 1 - x) + (N - 1 - y) * N]],
            });
          }

          const pos = [
            (x - mid) * 1.05, // spacing for gaps between cubelets
            (y - mid) * 1.05,
            (z - mid) * 1.05,
          ];
          
          const idxStr =
            `(${x},${y},${z})` +
            (showIndices
              ? faces.map((f) => ":" + f.face).join("")
              : "");

          cubelets.push({
            pos,
            faces,
            key: `cubie-${x}-${y}-${z}`,
            debug: idxStr,
          });
        }
      }
    }
    return cubelets;
  }, [cubeState, cubeSize, showIndices]);

  return (
    <Canvas 
      shadows 
      style={{ width: "100%", height: "100%", background: BG_DARK }}
      camera={{
        position: [4, 4, 4],
        fov: 60,
        near: 0.1,
        far: 1000
      }}
    >
      {/* Lighting setup */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <pointLight position={[-10, -10, -5]} intensity={0.3} />
      
      {/* Cube group */}
      <group 
        ref={groupRef} 
        rotation={[0.2, -0.3, 0]} // Initial rotation to show 3D perspective
      >
        {cubelets.map((c) => (
          <Cubelet
            key={c.key}
            pos={c.pos}
            size={cubeSize}
            faces={c.faces}
            showIndices={showIndices || debugMode}
            debug={c.debug}
            cubeSize={cubeSize}
          />
        ))}
      </group>
      
      {/* Camera controls */}
      <OrbitControls
        enablePan={false}
        enableZoom={!isScrambling && !isSolving}
        enableRotate={!isScrambling && !isSolving}
        maxDistance={15 + cubeSize * 2}
        minDistance={3 + cubeSize}
        enableDamping={true}
        dampingFactor={0.05}
        autoRotate={false}
      />
    </Canvas>
  );
}
