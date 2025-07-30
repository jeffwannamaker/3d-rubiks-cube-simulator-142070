/**
 * 3D Rubik's Cube Canvas Scene using React Three Fiber & Drei.
 * Handles rendering, cubelets, camera, controls, lighting, and animated turns.
 */
import React, { useRef, useEffect, useState, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { FACE_COLORS } from "./RubiksCubeEngine";
import * as THREE from "three";

// NOTE: No use of BatchedMesh. If found, remove/replace—Three.js standard bundle does not support BatchedMesh.

const BG_DARK = "#222831";

function Cubelet({ pos, size, faces, showIndices, debug, cubeSize }) {
  // Each face array: { normal: THREE.Vector3, face: "U"/etc, color: hex }
  // Cubelets are smaller than spacing to get that "beveled"/gap look.
  const N = cubeSize;
  const scale = 0.96 / N;
  const shape = [scale, scale, scale];
  const bevelEps = 0.045 / N;
  // Main body
  return (
    <group position={pos}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={shape} />
        <meshStandardMaterial color="#232323" flatShading/>
      </mesh>
      {faces.map(faceObj => (
        <mesh key={faceObj.face} position={faceObj.normal.clone().multiplyScalar((scale+bevelEps)/2)}>
          <planeGeometry args={[scale * 0.96, scale * 0.96]} />
          <meshStandardMaterial color={faceObj.color} />
        </mesh>
      ))}
      {/* Debug indices */}
      {showIndices && (
        <Html center style={{ pointerEvents: "none", color: "#f57c00", fontSize: `${0.09 + 0.12 * (2/N)}em` }}>
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

      // For MVP, skip animation and immediately "complete"
      setTimeout(() => {
        setAnimating(false);
        onMoveComplete();
      }, 200 / animationSpeed);

      // TODO: For advanced, interpolate rotation of groupRef for affected slice
    }
  }, [moveQueue, animating, animationSpeed, onMoveComplete]);

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
          if (y === N - 1)
            faces.push({
              normal: new THREE.Vector3(0, 1, 0),
              face: "U",
              color: FACE_COLORS[cubeState[0][x + z * N]],
            });
          if (y === 0)
            faces.push({
              normal: new THREE.Vector3(0, -1, 0),
              face: "D",
              color: FACE_COLORS[cubeState[3][x + (N - 1 - z) * N]],
            });
          if (x === N - 1)
            faces.push({
              normal: new THREE.Vector3(1, 0, 0),
              face: "R",
              color: FACE_COLORS[cubeState[1][y + z * N]],
            });
          if (x === 0)
            faces.push({
              normal: new THREE.Vector3(-1, 0, 0),
              face: "L",
              color: FACE_COLORS[cubeState[4][y + (N - 1 - z) * N]],
            });
          if (z === N - 1)
            faces.push({
              normal: new THREE.Vector3(0, 0, 1),
              face: "F",
              color: FACE_COLORS[cubeState[2][x + y * N]],
            });
          if (z === 0)
            faces.push({
              normal: new THREE.Vector3(0, 0, -1),
              face: "B",
              color: FACE_COLORS[cubeState[5][(N - 1 - x) + y * N]],
            });

          const pos = [
            (x - mid) * 1.03, // small spacing for gaps
            (y - mid) * 1.03,
            (z - mid) * 1.03,
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
    <Canvas shadows style={{ width: "100%", height: "100%", background: BG_DARK }}>
      <ambientLight intensity={0.7} />
      <directionalLight
        position={[10, 12, 6]}
        intensity={1.1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <group ref={groupRef} rotation={[0, 0, 0]}>
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
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        maxDistance={10 + cubeSize}
        minDistance={2 + cubeSize / 2}
      />
    </Canvas>
  );
}
