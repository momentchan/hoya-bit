import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { LayerMaterial, Depth, Color } from 'lamina'
import { useControls } from 'leva'
import { useFrame } from '@react-three/fiber'
import fractal from '../r3f-gist/shader/cginc/noise/fractal.glsl'
import random from '../r3f-gist/shader/cginc/noise/random.glsl'

export default function BackgroundFullScreen({ }) {
    const matRef = useRef()
    const { colorA, colorB, frequency, speed, power } = useControls({
        colorA: { value: '#ff6d2d' },
        colorB: { value: '#ffb897' },
        frequency: { value: 4, min: 0, max: 30, step: 0.01 },
        speed: { value: 0.4, min: 0, max: 10, step: 0.01 },
        power: { value: 2, min: 0, max: 3, step: 0.01 },
    })

    const uniforms = useMemo(() => ({
        uColorA: { value: new THREE.Color() },
        uColorB: { value: new THREE.Color() },
        uFrequency: { value: frequency },
        uSpeed: { value: speed },
        uTime: { value: 0 },
        uAspect: { value: 1 },
        uPower: { value: power },
    }), [])

    const vertex = /* glsl */`
    varying vec2 vUv;
    void main(){
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `
    const fragment = /* glsl */`
    ${fractal}
    ${random}

    precision highp float;
    varying vec2 vUv;
    uniform vec3  uColorA;
    uniform vec3  uColorB;
    uniform float uFrequency; // 0..1
    uniform float uSpeed; // 0..1
    uniform float uTime;
    uniform float uAspect;
    uniform float uPower;


    void main(){
      vec2 uv = vUv;
      float n = pow(fbm2(uv * uFrequency * vec2(uAspect, 1.0), uSpeed * uTime), uPower);
      vec3 col = mix(uColorA, uColorB, n);
      col *= grainNoise(uv * vec2(uAspect, 1.0), 10000.0, vec2(0.9, 1.0));
      gl_FragColor = vec4(col, 1.0);
    }
  `

    useFrame((state) => {
        if (matRef.current) {
            matRef.current.uniforms.uTime.value = state.clock.elapsedTime
            matRef.current.uniforms.uColorA.value.set(new THREE.Color(colorA))
            matRef.current.uniforms.uColorB.value.set(new THREE.Color(colorB))
            matRef.current.uniforms.uFrequency.value = frequency
            matRef.current.uniforms.uSpeed.value = speed
            matRef.current.uniforms.uAspect.value = state.viewport.aspect
            matRef.current.uniforms.uPower.value = power
        }
    })

    return (
        <mesh scale={100}>
            <sphereGeometry args={[1, 64, 64]} />
            <shaderMaterial
                ref={matRef}
                vertexShader={vertex}
                fragmentShader={fragment}
                uniforms={uniforms}
                side={THREE.BackSide}
            />
        </mesh>
    )
}
