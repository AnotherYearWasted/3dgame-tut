import { Canvas } from "@react-three/fiber";
import { Experience } from "./components/Experience";
import { SoftShadows } from "@react-three/drei";
import { Suspense } from "react";
import { Physics } from "@react-three/rapier";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
function App() {
  return (
    <Canvas shadows camera={{ position: [0, 30, 0], fov: 30, near: 2}}>
      <color attach="background" args={["#242424"]} />
      <SoftShadows />
      <Suspense >
        <Physics>
          <Experience />
        </Physics>

      </Suspense>
      <EffectComposer>
        <Bloom luminanceThreshold={1} intensity={1.5} mipmapBlur />
      </EffectComposer>
    </Canvas>
  );
}

export default App;
