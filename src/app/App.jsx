import { Canvas } from '@react-three/fiber'
import Utilities from "../r3f-gist/utility/Utilities";
import HoyaModel from "./HoyaModel";
import { CameraControls, Environment } from "@react-three/drei";
import { useTexture } from '@react-three/drei'
import { Lightformer } from "@react-three/drei";
import BgGradient from "./BgGradient";
import { useEffect } from "react";
import { useState } from "react";
import Effect from "./Effect";
import * as THREE from 'three'
import BackgroundFullScreen from './BackgroundFullScreen'

const Background = () => {
    const backgroundTexture = useTexture('/bgcolor.jpg')
    return <primitive attach="background" object={backgroundTexture} />
}

export default function App() {
    const [pointer, setPointer] = useState({ x: 0, y: 0 })

    useEffect(() => {
        const handleMove = (e) => {
            const nx = (e.clientX / window.innerWidth) * 2 - 1
            const ny = -(e.clientY / window.innerHeight) * 2 + 1
            setPointer({ x: nx, y: ny })
        }
        window.addEventListener('pointermove', handleMove)
        return () => window.removeEventListener('pointermove', handleMove)
    }, [])



    return <>
        <Canvas
            shadows={{ type: THREE.PCFSoftShadowMap }}
            camera={{
                fov: 45,
                near: 0.1,
                far: 200,
                position: [0, 0, 2]
            }}
            gl={{ preserveDrawingBuffer: true, antialias: true, alpha: true }} style={{ background: 'transparent' }}
        >
            {/* <color attach="background" args={['#ff0000']} /> */}
            {/* <CameraControls /> */}
            {/* <BgGradient pointer={pointer} /> */}
            <BackgroundFullScreen />

            <directionalLight
                castShadow position={[-0.5, 0.5, 0.5]} intensity={0}
                shadow-mapSize-width={2048} // 提高解析度
                shadow-mapSize-height={2048}
                shadow-radius={0.5}           // 陰影模糊半徑
                shadow-bias={-0.0001}       // 修正陰影接縫

            />
            <HoyaModel pointer={pointer} />
            <Utilities />
            <ambientLight intensity={0.25} />
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


            <Effect />

        </Canvas>

        <Canvas
            camera={{
                fov: 45,
                near: 0.1,
                far: 200,
                position: [0, 0, 2]
            }}
            className="canvas-bg" gl={{ alpha: false }} style={{ zIndex: -1 }}>
            <mesh>
                <planeGeometry args={[10, 10]} />
                <meshBasicMaterial color="red" />
            </mesh>

        </Canvas>
    </>
}