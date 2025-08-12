import { CameraControls, useGLTF, MeshTransmissionMaterial } from "@react-three/drei";
import { Canvas } from '@react-three/fiber'
import Utilities from "../r3f-gist/utility/Utilities";
import HoyaModel from "./HoyaModel";
import { Environment } from "@react-three/drei";
import { useTexture } from '@react-three/drei'
import { Lightformer } from "@react-three/drei";
import { EffectComposer, Vignette, Bloom, ToneMapping, DepthOfField } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'


function TexturedPlane() {
    // You can replace this with your own texture path
    const texture = useTexture('/texture.png') // or any texture file you have

    return (
        <mesh position={[0, -1, 0]} rotation={[0, 0, 0]} receiveShadow>
            <planeGeometry args={[2, 1]} />
            <meshStandardMaterial map={texture} />
        </mesh>
    )
}

export default function App() {
    return <>
        <Canvas
            shadows
            camera={{
                fov: 45,
                near: 0.1,
                far: 200,
                position: [0, 0, 2]
            }}
            gl={{ preserveDrawingBuffer: true }}
        >
            {/* <color attach="background" args={['#ffffff']} /> */}
            {/* <CameraControls makeDefault /> */}
            {/* <ambientLight intensity={0.5} /> */}
            {/* <directionalLight castShadow intensity={0.6} position={[0, 0, 10]} />    */}
            <HoyaModel />
            {/* <TexturedPlane /> */}
            <Utilities />
            <ambientLight intensity={0.5} />
            <Environment resolution={256}>
                <group rotation={[-Math.PI / 2, 0, 0]}>
                    <Lightformer intensity={2} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={[10, 10, 1]} />
                    {[2, 0, 2, 0, 2, 0, 2, 0].map((x, i) => (
                        <Lightformer key={i} form="circle" intensity={4} rotation={[Math.PI / 2, 0, 0]} position={[x, 4, i * 4]} scale={[4, 1, 1]} />
                    ))}
                    <Lightformer intensity={1} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={[50, 2, 1]} />
                    <Lightformer intensity={1} rotation-y={Math.PI / 2} position={[-5, -1, -1]} scale={[50, 2, 1]} />
                    <Lightformer intensity={1} rotation-y={-Math.PI / 2} position={[10, 1, 0]} scale={[50, 2, 1]} />
                </group>
            </Environment>

            <EffectComposer>
                {/* <Vignette /> */}
                <Bloom intensity={2} threshold={0} />
                <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
                {/* <DepthOfField
                    focusDistance={0.01}
                    focalLength={0.02}
                    bokehScale={2}
                /> */}
                {/* <Bloom intensity={2} luminanceThreshold={0} luminanceSmoothing={0.1} /> */}
            </EffectComposer>

        </Canvas>
    </>
}