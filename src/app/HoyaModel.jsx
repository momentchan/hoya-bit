import { useGLTF, MeshTransmissionMaterial, ContactShadows } from '@react-three/drei'
import { Float } from '@react-three/drei'
import { useControls } from 'leva'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { MathUtils } from 'three'
import { useState, useRef, useEffect } from 'react'
import { useLoader } from '@react-three/fiber'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'

export default function HoyaModel({ props, pointer }) {
  const texture = useLoader(RGBELoader, '/aerodynamics_workshop_1k.hdr')

  const { scene } = useGLTF('/Hoya.gltf')
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 })
  const { camera } = useThree()

  const meshRef = useRef()
  const config = useControls('Glass', {
    backside: false,
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
    const targetX = pointer.y;
    const targetY = 0;
    const targetZ = pointer.x * Math.PI * 0.25

    meshRef.current.rotation.x = MathUtils.lerp(meshRef.current.rotation.x, targetX, 0.1)
    meshRef.current.rotation.y = MathUtils.lerp(meshRef.current.rotation.y, targetY, 0.1)
    meshRef.current.rotation.z = MathUtils.lerp(meshRef.current.rotation.z, targetZ, 0.1)

    const rc = raycasterRef.current
    rc.setFromCamera(pointer, camera)
    const hits = rc.intersectObjects(meshes, true)
    setIsIntersecting(hits.length > 0)


    const target = isIntersecting ? 0.5 : 0
    transmissionRef.current = MathUtils.lerp(
      transmissionRef.current,
      target,
      delta * 10
    )
  })


  useEffect(() => {
  }, [isIntersecting])

  return (
    <>
      <Float floatIntensity={1} rotationIntensity={0} speed={2}>
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
                  toneMapped={false}
                  side={THREE.DoubleSide}
                />
              </mesh>
            </Float>
          ))}
        </group>
      </Float>

      <mesh rotation={[-Math.PI * 0.5, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <shadowMaterial transparent opacity={0.1} />
      </mesh>
    </>
  )
}
