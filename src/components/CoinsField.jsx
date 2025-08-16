import React, { useMemo } from 'react'
import * as THREE from 'three'
import { useControls, folder } from 'leva'
import Bitcoin from './Bitcoin'

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const randIn = (rnd, min, max) => min + (max - min) * rnd()

export default function CoinsField({
  count: countProp,
  fbxPath = 'Bitcoin.fbx',
  pointer,
  progress,
}) {

  const leva = useControls('Coins', {
    count: { value: countProp ?? 3, min: 1, max: 5, step: 1 },
    Orbit: folder({
      radius: { value: 0.6, min: 0.05, max: 5, step: 0.001 },
      speed: { value: 0.8, min: 0.0, max: 2, step: 0.01 },
      bobAmp: { value: 0.05, min: 0, max: 0.3, step: 0.001 },
    }),
    Tilt: folder({
      tiltDeg: { value: 15, min: 0, max: 30, step: 0.1 },
      tiltSpeed: { value: 0.6, min: 0.0, max: 3, step: 0.01 },
      precessSpeed: { value: 0.3, min: 0.0, max: 3, step: 0.01 },
    }),
    ScaleSpin: folder({
      scaleMin: { value: 0.015, min: 0.005, max: 0.2, step: 0.001 },
      scaleMax: { value: 0.022, min: 0.005, max: 0.2, step: 0.001 },

      spinX: { value: 0.2, min: 0, max: 3, step: 0.01 },
      spinY: { value: 0.6, min: 0, max: 3, step: 0.01 },
      spinZ: { value: 0.15, min: 0, max: 3, step: 0.01 },

      spinJitter: { value: 2, min: 0, max: 3, step: 0.01 },
      spinSeed: { value: 20250816, min: 1, max: 2 ** 31 - 1, step: 1 },
    }),
    Material: folder({
      transmission: { value: 1, min: 0, max: 1, step: 0.01 },
      roughness: { value: 0.1, min: 0, max: 1, step: 0.01 },
      thickness: { value: 50, min: 0, max: 200, step: 1 },
      ior: { value: 1.5, min: 1, max: 3, step: 0.01 },
      chromaticAberration: { value: 0.5, min: 0, max: 1, step: 0.01 },
      distortion: { value: 0.1, min: 0, max: 1, step: 0.01 },
      color: '#fff3ac',
    }),
  }, { collapsed: false })

  const sharedMatProps = useMemo(() => ({
    transmission: leva.transmission,
    roughness: leva.roughness,
    thickness: leva.thickness,
    ior: leva.ior,
    chromaticAberration: leva.chromaticAberration,
    distortion: leva.distortion,
    color: leva.color,
  }), [leva])

  // —— Evenly distributed phase + random spin —— //
  
  const paramsList = useMemo(() => {
    const list = []
    const baseCenter = new THREE.Vector3(0, 0, 0)
    const rnd = mulberry32(leva.spinSeed)

    for (let i = 0; i < leva.count; i++) {
      const phase = (i / Math.max(1, leva.count)) * Math.PI * 2

      // spin: base value ± jitter (allow negative value => random direction)
      const sx = leva.spinX + randIn(rnd, -leva.spinJitter, leva.spinJitter)
      const sy = leva.spinY + randIn(rnd, -leva.spinJitter, leva.spinJitter)
      const sz = leva.spinZ + randIn(rnd, -leva.spinJitter, leva.spinJitter)


      list.push({
        center: baseCenter,
        radius: leva.radius,
        speed: leva.speed,
        phase,
        bobIntensity: leva.bobAmp,
        tiltAmplitude: THREE.MathUtils.degToRad(leva.tiltDeg),
        tiltSpeed: leva.tiltSpeed,
        precessSpeed: leva.precessSpeed,
        scale: randIn(rnd, leva.scaleMin, leva.scaleMax)    ,
        speedX: sx,
        speedY: sy,
        speedZ: sz,
      })
    }
    return list
  }, [leva])

  return (
    <group>
      {paramsList.map((p, i) => (
        <Bitcoin
          key={i}
          params={p}
          progress={progress}
          sharedMatProps={sharedMatProps}
          fbxPath={fbxPath}
          pointer={pointer}
        />
      ))}
    </group>
  )
}
