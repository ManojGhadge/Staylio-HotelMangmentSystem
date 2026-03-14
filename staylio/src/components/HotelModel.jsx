import { useEffect } from "react";
import { useGLTF } from "@react-three/drei";

export default function HotelModel(props) {
  const { scene } = useGLTF("/models/hotel2.glb");
  
  useEffect(() => {
    if (scene) {
      console.log("Hotel2 model loaded successfully:", scene);
      // Traverse the scene to ensure all materials are visible
      scene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }
  }, [scene]);
  
  return <primitive object={scene} {...props} />;
}

// Preload the model
useGLTF.preload("/models/hotel2.glb");
