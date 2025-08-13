import { Canvas } from '@react-three/fiber'
import Utilities from "../r3f-gist/utility/Utilities";
import HoyaModel from "./HoyaModel";
import { useEffect } from "react";
import { useState } from "react";
import Effect from "./Effect";
import * as THREE from 'three'
import BackgroundFullScreen from './BackgroundFullScreen'
import EnvironmentSetup from './EnvironmentSetup'

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


            <Utilities />
            <HoyaModel pointer={pointer} />
            <EnvironmentSetup />    
            
            <BackgroundFullScreen />
            <Effect />
        </Canvas>
    </>
}