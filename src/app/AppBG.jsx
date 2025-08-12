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

export default function App() {
    return <>
        <Canvas
            camera={{
                fov: 45,
                near: 0.1,
                far: 200,
                position: [0, 0, 2]
            }}
            className="canvas-bg" gl={{ alpha: false }} style={{ zIndex: -1 }}>
            <BackgroundFullScreen />
        </Canvas>
    </>
}