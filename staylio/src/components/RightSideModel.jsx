import React, { Suspense, useState, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import HotelModel from "./HotelModel";

// ⭐ AUTO ROTATE ONLY BETWEEN –45° AND +45°
function LimitedAutoRotate({ children }) {
  const ref = useRef();
  const direction = useRef(1); // 1 = right, -1 = left

  useFrame(() => {
    if (!ref.current) return;

    const speed = 0.003;

    // Apply rotation
    ref.current.rotation.y += speed * direction.current;

    // Convert current rotation to degrees
    const deg = THREE.MathUtils.radToDeg(ref.current.rotation.y);

    // Reverse at ±45°
    if (deg > 45) direction.current = -1;
    if (deg < -45) direction.current = 1;
  });

  return <group ref={ref}>{children}</group>;
}

const RightSideModel = () => {
  return (
    <div
      style={{
        width: "100%",
        height: "90%",
        position: "absolute",
        top: 100,
        left: 0,
        borderRadius: "1rem",
        overflow: "hidden",
      }}
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        {/* ZOOM OUT MORE */}
        <PerspectiveCamera
          makeDefault
          position={[55, 45, 80]}
          fov={45}
          near={0.1}
          far={6000}
        />

        {/* LIGHTING */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow />
        <hemisphereLight intensity={0.45} />

        <Environment preset="sunset" />

        {/* MODEL WITH LIMITED AUTO ROTATION */}
        <Suspense fallback={null}>
          <LimitedAutoRotate>
            <HotelModel
              scale={1.0}
              position={[0, -7.5, 0]}
              rotation={[0, Math.PI, 0]}   // 🔥 FIXED: FRONT SIDE VISIBLE
            />
          </LimitedAutoRotate>
        </Suspense>

        {/* USER ROTATION DISABLED */}
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          enableRotate={false}

          minDistance={18}
          maxDistance={110}

          minPolarAngle={Math.PI / 2}
          maxPolarAngle={Math.PI / 2}

          target={[0, 0.5, 0]}
        />
      </Canvas>
    </div>
  );
};

export default RightSideModel;
