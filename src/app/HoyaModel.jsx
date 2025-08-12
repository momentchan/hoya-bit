import { useGLTF, MeshTransmissionMaterial } from '@react-three/drei'
import { Float } from '@react-three/drei'
import { useControls } from 'leva'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { MathUtils } from 'three'
import { useState, useRef, useEffect, use } from 'react'
import { useLoader } from '@react-three/fiber'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'

export default function HoyaModel(props) {
  const texture = useLoader(RGBELoader, 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/aerodynamics_workshop_1k.hdr')

  const { scene } = useGLTF('/Hoya.gltf')
  const [pointer, setPointer] = useState({ x: 0, y: 0 })
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 })
  const { camera } = useThree()

  useEffect(() => {
    const handleMove = (e) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1
      const ny = -(e.clientY / window.innerHeight) * 2 + 1
      setPointer({ x: nx, y: ny })
    }
    window.addEventListener('pointermove', handleMove)
    return () => window.removeEventListener('pointermove', handleMove)
  }, [])


  const meshRef = useRef()
  const config = useControls('Glass', {
    backside: false,
    samples: { value: 16, min: 1, max: 32, step: 1 },
    resolution: { value: 512, min: 64, max: 2048, step: 64 },
    transmission: { value: 0.5, min: 0, max: 1 },
    roughness: { value: 0.15, min: 0, max: 1, step: 0.01 },
    clearcoat: { value: 0.1, min: 0, max: 1, step: 0.01 },
    clearcoatRoughness: { value: 0.1, min: 0, max: 1, step: 0.01 },
    thickness: { value: 200, min: 0, max: 200, step: 0.01 },
    backsideThickness: { value: 200, min: 0, max: 200, step: 0.01 },
    ior: { value: 1.5, min: 1, max: 5, step: 0.01 },
    chromaticAberration: { value: 1, min: 0, max: 1 },
    anisotropy: { value: 1, min: 0, max: 10, step: 0.01 },
    distortion: { value: 0.1, min: 0, max: 1, step: 0.01 },
    distortionScale: { value: 1, min: 0.01, max: 1, step: 0.01 },
    temporalDistortion: { value: 0.5, min: 0, max: 1, step: 0.01 },
    attenuationDistance: { value: 0.5, min: 0, max: 10, step: 0.01 },
    attenuationColor: '#ffffff',
    color: '#ffffff',
  })

  // Extract all meshes dynamically
  const meshes = []
  scene.traverse((child) => {
    if (child.isMesh) {
      meshes.push(child)
    }
  })

  const [isIntersecting, setIsIntersecting] = useState(false)
  const raycasterRef = useRef(new THREE.Raycaster())

  const groupRef = useRef()

  const transmissionRef = useRef(0)

  useFrame((state, delta) => {
    const targetX = pointer.y * Math.PI * 0.25
    const targetY = pointer.x * Math.PI * 0.25
    const targetZ = (pointer.x - pointer.y) * Math.PI * 0.25

    meshRef.current.rotation.x = MathUtils.lerp(meshRef.current.rotation.x, targetX, 0.1)
    meshRef.current.rotation.y = MathUtils.lerp(meshRef.current.rotation.y, targetY, 0.1)
    meshRef.current.rotation.z = MathUtils.lerp(meshRef.current.rotation.z, targetZ, 0.1)

    const rc = raycasterRef.current
    rc.setFromCamera(pointer, camera)
    const hits = rc.intersectObjects(meshes, true)
    setIsIntersecting(hits.length > 0)


    const target = isIntersecting ? 0.5 : 0
    // delta = time since last frame, 0.5 factor ≈ 2 second fade
    transmissionRef.current = MathUtils.lerp(
      transmissionRef.current,
      target,
      delta * 10
    )
  })


  useEffect(() => {
  }, [isIntersecting])

  return (
    <Float floatIntensity={0.5} rotationIntensity={0} speed={2}>
      <group ref={groupRef} {...props} rotation={[Math.PI / 2, 0, 0]} position={[0.5, 1, 0]}>
        {meshes.map((mesh, i) => (
          <Float key={i} floatIntensity={0} rotationIntensity={0}>
            <mesh
              ref={meshRef}
              geometry={mesh.geometry}
              position={mesh.position}
              scale={mesh.scale}
              rotation={[rotation.x, rotation.y, rotation.z]}
              castShadow
              receiveShadow
            >
              <MeshTransmissionMaterial {...config}
                // transmission={transmissionRef.current}
                toneMapped={false}
                background={texture}
              />
            </mesh>
          </Float>
        ))}
      </group>
    </Float>
  )
}
