import { Canvas } from '@react-three/fiber'
import Utilities from "../r3f-gist/utility/Utilities";
import HoyaModel from "../components/HoyaModel";
import { Suspense, useEffect } from "react";
import { useState } from "react";
import Effect from "./Effect";
import * as THREE from 'three'
import BackgroundFullScreen from '../components/BackgroundFullScreen'
import EnvironmentSetup from './EnvironmentSetup'
import LevaWraper from '../r3f-gist/utility/LevaWraper'
import GlobalStates from '../r3f-gist/utility/GlobalStates'
import useGlobalStore from '../r3f-gist/utility/useGlobalStore'

export default function App() {
    const [pointer, setPointer] = useState({ x: 0, y: 0 })
    const { isMobile } = useGlobalStore();

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
        <LevaWraper defaultHidden={true} />

        <GlobalStates />
        <Canvas
            shadows={{ type: THREE.PCFSoftShadowMap }}
            camera={{
                fov: 45,
                near: 0.1,
                far: 200,
                position: isMobile ? [0, 0, 3] : [0, 0, 2]
            }}
            gl={{ preserveDrawingBuffer: true, antialias: true, alpha: true }} style={{ background: 'transparent' }}
        >
            <Suspense fallback={null}>
                <Utilities />
                <HoyaModel pointer={pointer} pos={isMobile ? [0, 0, 0] : [0.5, 0, 0]} />
                <EnvironmentSetup />
                <BackgroundFullScreen />
                <Effect />
            </Suspense>
        </Canvas>
    </>
}