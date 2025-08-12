import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { useControls } from 'leva'

function lerpAngleDeg(current, target, t) {
    const diff = ((((target - current) % 360) + 540) % 360) - 180
    return current + diff * t
}

export default function BgGradient({ pointer }) {
    const setVar = (k, v) => document.body.style.setProperty(k, v)
    const { color1, color2, ratio, blendWidth, noiseSize, noiseOpacity } = useControls('Gradient Colors', {
        color1: '#bbd5ff',
        color2: '#ffe7dd',
        ratio: { value: 20, min: 0, max: 100 },
        blendWidth: { value: 40, min: 0, max: 100 },
        noiseSize: { value: 160, min: 32, max: 512, step: 1 },   // px，顆粒尺寸
        noiseOpacity: { value: 0.18, min: 0, max: 1, step: 0.01 } // 透明度
    })

    const angle = useRef(0)

    useFrame((state, dt) => {
        const x = Math.abs(pointer.x) < 1e-6 && Math.abs(pointer.y) < 1e-6 ? 1e-6 : pointer.x
        const y = Math.abs(pointer.x) < 1e-6 && Math.abs(pointer.y) < 1e-6 ? 0 : pointer.y

        const targetRad = Math.atan2(y, x)
        const targetDeg = (targetRad * 180) / Math.PI
        const normalized = (targetDeg + 360) % 360

        const smoothing = 0.5
        angle.current = lerpAngleDeg(angle.current, normalized, Math.min(1, dt * smoothing))

        setVar('--grad-angle', `${angle.current}deg`)
        setVar('--grad-color1', color1)
        setVar('--grad-color2', color2)
        setVar('--grad-ratio', ratio)
        setVar('--grad-blend', blendWidth)

        setVar('--noise-size', `${noiseSize}px ${noiseSize}px`)
        setVar('--noise-opacity', `${noiseOpacity}`)
    })

    return null
}
