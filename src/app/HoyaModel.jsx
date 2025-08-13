import { useGLTF, MeshTransmissionMaterial, ContactShadows } from '@react-three/drei'
import { Float } from '@react-three/drei'
import { useControls } from 'leva'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { MathUtils } from 'three'
import { useState, useRef, useEffect } from 'react'

// Utility functions
const smooth5 = (x) => x * x * x * (x * (x * 6 - 15) + 10)

const lerpAngle = (a, b, t) => {
  const diff = ((((b - a) % Math.PI * 2) + 3 * Math.PI) % Math.PI * 2) - Math.PI
  const smoothT = smooth5(t)
  return a + diff * smoothT
}

// Custom hook for glass material configuration
const useGlassConfig = () => {
  return useControls('Glass', {
    samples: { value: 16, min: 1, max: 32, step: 1 },
    resolution: { value: 512, min: 64, max: 2048, step: 64 },
    transmission: { value: 1, min: 0, max: 1 },
    roughness: { value: 0.15, min: 0, max: 1, step: 0.01 },
    clearcoat: { value: 0.1, min: 0, max: 1, step: 0.01 },
    clearcoatRoughness: { value: 0.1, min: 0, max: 1, step: 0.01 },
    thickness: { value: 200, min: 0, max: 200, step: 0.01 },
    backsideThickness: { value: 200, min: 0, max: 200, step: 0.01 },
    ior: { value: 1.5, min: 1, max: 5, step: 0.01 },
    chromaticAberration: { value: 1, min: 0, max: 1 },
    anisotropy: { value: 1, min: 0, max: 10, step: 0.01 },
    distortion: { value: 0.7, min: 0, max: 1, step: 0.01 },
    distortionScale: { value: 1, min: 0.01, max: 1, step: 0.01 },
    temporalDistortion: { value: 0.1, min: 0, max: 1, step: 0.01 },
    attenuationDistance: { value: 0.5, min: 0, max: 10, step: 0.01 },
    attenuationColor: '#ffffff',
    color: '#ffffff',
  })
}

// Custom hook for model rotation logic
const useModelRotation = (pointer) => {
  const meshRef = useRef()
  const spinAngleZ = useRef(0)
  const [backsideOn, setBacksideOn] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setBacksideOn(true))
    return () => cancelAnimationFrame(id)
  }, [])

  useFrame((state, delta) => {
    if (!meshRef.current) return

    const ptrX = pointer.y
    const ptrY = 0
    const ptrZ = pointer.x * Math.PI * 0.25

    const totalSpinAngle = Math.PI * 2
    const spinSpeed = Math.PI * 4
    const fadeAngle = Math.PI * 2

    if (Math.abs(spinAngleZ.current) < totalSpinAngle) {
      // Initial spin phase
      const remaining = totalSpinAngle - Math.abs(spinAngleZ.current)
      const progress = 1 - remaining / totalSpinAngle
      const ease = Math.max(0.05, 1 - Math.pow(progress, 1.5))

      spinAngleZ.current -= spinSpeed * delta * ease

      let w = 0
      if (spinAngleZ.current > totalSpinAngle - fadeAngle) {
        const start = totalSpinAngle - fadeAngle
        const norm = (spinAngleZ.current - start) / fadeAngle
        w = smooth5(Math.min(Math.max(norm, 0), 1))
      }

      const zFromSpin = spinAngleZ.current
      const zBlended = lerpAngle(zFromSpin, ptrZ, w)
      meshRef.current.rotation.z = zBlended

      meshRef.current.rotation.x = THREE.MathUtils.damp(
        meshRef.current.rotation.x, ptrX, 4, delta * (0.5 + w * 0.5)
      )
      meshRef.current.rotation.y = THREE.MathUtils.damp(
        meshRef.current.rotation.y, ptrY, 4, delta * (0.5 + w * 0.5)
      )
    } else {
      // Normal pointer following phase
      meshRef.current.rotation.x = THREE.MathUtils.damp(
        meshRef.current.rotation.x, ptrX, 6, delta
      )
      meshRef.current.rotation.y = THREE.MathUtils.damp(
        meshRef.current.rotation.y, ptrY, 6, delta
      )
      
      const shortestTarget = meshRef.current.rotation.z +
        ((((ptrZ - meshRef.current.rotation.z) % (Math.PI * 2)) + 3 * Math.PI) % (Math.PI * 2) - Math.PI)

      meshRef.current.rotation.z = THREE.MathUtils.damp(
        meshRef.current.rotation.z, shortestTarget, 6, delta
      )
    }
  })

  return { meshRef, backsideOn }
}

// Component for the shadow plane
const ShadowPlane = () => (
  <mesh rotation={[-Math.PI * 0.5, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
    <planeGeometry args={[10, 10]} />
    <shadowMaterial transparent opacity={0.1} />
  </mesh>
)

// Component for individual mesh with glass material
const GlassMesh = ({ mesh, config, backsideOn, meshRef }) => (
  <Float floatIntensity={0} rotationIntensity={0}>
    <mesh
      ref={meshRef}
      geometry={mesh.geometry}
      position={mesh.position}
      scale={mesh.scale}
      castShadow
      receiveShadow
    >
      <MeshTransmissionMaterial 
        {...config}
        toneMapped={false}
        backside={backsideOn}
      />
    </mesh>
  </Float>
)

export default function HoyaModel({ props, pointer }) {
  const { scene } = useGLTF('/Hoya.gltf')
  const glassConfig = useGlassConfig()
  const { meshRef, backsideOn } = useModelRotation(pointer)

  // Extract meshes from the loaded scene
  const meshes = []
  scene.traverse((child) => {
    if (child.isMesh) {
      meshes.push(child)
    }
  })

  return (
    <>
      <Float floatIntensity={1} rotationIntensity={0} speed={2}>
        <group {...props} rotation={[Math.PI / 2, 0, 0]} position={[0.5, 1, 0]}>
          {meshes.map((mesh, i) => (
            <GlassMesh
              key={i}
              mesh={mesh}
              config={glassConfig}
              backsideOn={backsideOn}
              meshRef={meshRef}
            />
          ))}
        </group>
      </Float>
      <ShadowPlane />
    </>
  )
}
