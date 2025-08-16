import { useLoader, useFrame } from '@react-three/fiber'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { MeshTransmissionMaterial } from '@react-three/drei'
import * as THREE from 'three'
import React, { useMemo, useRef } from 'react'

// --- random number ---
const smooth5 = (x) => x * x * x * (x * (x * 6 - 15) + 10)
const clamp01 = (v) => Math.min(1, Math.max(0, v))

export default function Bitcoin({ params, sharedMatProps, fbxPath = '/Bitcoin.fbx', pointer, props, progress }) {
  const model = useLoader(FBXLoader, fbxPath)

  // 單一材質實例（此元件內所有 sub-mesh 共用）
  const material = useMemo(
    () => <MeshTransmissionMaterial {...sharedMatProps} />,
    [sharedMatProps]
  )

  // 抽取幾何參照（避免 clone/new）
  const geos = useMemo(() => {
    const arr = []
    model.traverse((child) => child.isMesh && child.geometry && arr.push(child.geometry))
    return arr
  }, [model])

  // refs 與暫存
  const groupRef = useRef()
  const orbitRef = useRef()
  const coinRef = useRef()
  const angle = useRef(params.phase)

  const baseVec = useMemo(() => new THREE.Vector3(1, 0, 0), [])
  const baseAxisZ = useMemo(() => new THREE.Vector3(0, 0, 1), [])
  const currentAxis = useMemo(() => new THREE.Vector3(0, 0, 1), [])
  const tiltAxis = useMemo(() => new THREE.Vector3(1, 0, 0), [])
  const offset = useMemo(() => new THREE.Vector3(), [])
  const tmpQuat = useMemo(() => new THREE.Quaternion(), [])
  const orbitQuat = useMemo(() => new THREE.Quaternion(), [])
  const eased = useRef(0)

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime()

    // 場中心
    if (groupRef.current) groupRef.current.position.copy(params.center)

    // 傾斜：tiltAxis 在 XY 面繞 Z 轉
    const precess = t * params.precessSpeed
    tiltAxis.set(Math.cos(precess), Math.sin(precess), 0)

    const tilt = params.tiltAmplitude * Math.sin(t * params.tiltSpeed)
    currentAxis.copy(baseAxisZ).applyQuaternion(tmpQuat.setFromAxisAngle(tiltAxis, tilt)).normalize()

    const p = clamp01(progress ?? 0)
    eased.current = smooth5(p)


    // 公轉
    angle.current += params.speed * delta
    baseVec
      .set(1, 0, 0)
      .applyQuaternion(orbitQuat.setFromAxisAngle(currentAxis, angle.current))
    offset.copy(baseVec).multiplyScalar(params.radius * THREE.MathUtils.lerp(1e-4, 1, eased.current))
    offset.y += Math.sin(angle.current * 2.0) * params.radius * params.bobIntensity

    if (orbitRef.current) orbitRef.current.position.copy(offset)

    // 自轉（可加輕微 pointer 影響）
    if (coinRef.current) {
      coinRef.current.rotation.x += params.speedX * delta
      coinRef.current.rotation.y += params.speedY * delta
      coinRef.current.rotation.z += params.speedZ * delta

      if (pointer) {
        const ptrX = pointer.y * 0.02
        const ptrZ = pointer.x * Math.PI * 0.02
        coinRef.current.rotation.x = THREE.MathUtils.damp(coinRef.current.rotation.x, coinRef.current.rotation.x + ptrX, 2, delta)
        coinRef.current.rotation.z = THREE.MathUtils.damp(coinRef.current.rotation.z, coinRef.current.rotation.z + ptrZ, 2, delta)
      }
    }
  })

  return (
    <group ref={groupRef} {...props}>
      <group ref={orbitRef}>
        <group ref={coinRef} scale={[params.scale * THREE.MathUtils.lerp(1e-4, 1, eased.current), params.scale * THREE.MathUtils.lerp(1e-4, 1, eased.current), params.scale * THREE.MathUtils.lerp(1e-4, 1, eased.current)]}>
          {geos.map((g, i) => (
            <mesh key={i} geometry={g} castShadow receiveShadow>
              {material}
            </mesh>
          ))}
        </group>
      </group>
    </group>
  )
}
