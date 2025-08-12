
import { useMemo } from 'react'
import * as THREE from 'three'
import { LayerMaterial, Depth, Color } from 'lamina'

export default function BackgroundFullScreen({
    colorA = '#ffffff',
    colorB = '#ffe7dd',
    ratio = 0.7,     // 0..1
    blend = 0.2,     // 0..1
    angle = 0.0      // radians
}) {
    const uniforms = useMemo(() => ({
        uColorA: { value: new THREE.Color(colorA) },
        uColorB: { value: new THREE.Color(colorB) },
        uRatio: { value: ratio },
        uBlend: { value: blend },
        uAngle: { value: angle },
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [])

    // 如果需要動態更新參數（來自 props / Leva），同步到 uniforms
    uniforms.uColorA.value.set(colorA)
    uniforms.uColorB.value.set(colorB)
    uniforms.uRatio.value = ratio
    uniforms.uBlend.value = blend
    uniforms.uAngle.value = angle

    const vertex = /* glsl */`
    varying vec2 vUv;
    void main(){
      vUv = uv;
      // 直接輸出 NDC，不經過投影 → 永遠鋪滿視窗
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `
    const fragment = /* glsl */`
    precision highp float;
    varying vec2 vUv;
    uniform vec3  uColorA;
    uniform vec3  uColorB;
    uniform float uRatio; // 0..1
    uniform float uBlend; // 0..1
    uniform float uAngle;

    vec2 rot(vec2 p, float a){
      float c = cos(a), s = sin(a);
      return mat2(c,-s,s,c)*(p-0.5)+0.5;
    }

    void main(){
      vec2 uv = rot(vUv, uAngle);
      float e1 = clamp(uRatio - uBlend*0.5, 0.0, 1.0);
      float e2 = clamp(uRatio + uBlend*0.5, 0.0, 1.0);
      float t  = smoothstep(e1, e2, uv.x);
      vec3 col = mix(uColorA, uColorB, t);
      gl_FragColor = vec4(col, 1.0);
    }
  `

    return (
        <mesh scale={100}>
            <sphereGeometry args={[1, 64, 64]} />
            <LayerMaterial side={THREE.BackSide}>
                {/* <Color color="#444" alpha={1} mode="normal" /> */}
                <Depth colorA="#f27d4c" colorB="#126dff" alpha={1} mode="normal" near={100} far={300} origin={[100, 100, 100]} />
            </LayerMaterial>
        </mesh>
    )
}
