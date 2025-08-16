import React, { useMemo } from 'react'
import * as THREE from 'three'
import { useControls, folder } from 'leva'
import Bitcoin from './Bitcoin'

// 穩定亂數（可重現）
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
  // 可選 props（不想要 Leva 也可用這些 props 控制）
  count: countProp,
  seed: seedProp,
  center = new THREE.Vector3(0, 0, 0),
  spread = 0.0, // 0 = 不做場中心擴散
  fbxPath = '/Bitcoin.fbx',
  pointer, // 若要在 Bitcoin 裡加 pointer 互動，可傳入
}) {
  // ---- Leva 面板（集中在這裡，不在 HoyaModel）----
  const leva = useControls('Coins (Field-wide)', {
    count: { value: countProp ?? 3, min: 1, max: 100, step: 1 },
    seed: { value: seedProp ?? 20250816, min: 1, max: 2 ** 31 - 1, step: 1 },
    Orbit: folder({
      radiusMin: { value: 0.3, min: 0.1, max: 5, step: 0.01 },
      radiusMax: { value: 0.8, min: 0.1, max: 5, step: 0.01 },
      speedMin: { value: 0.8, min: 0.05, max: 8, step: 0.01 },
      speedMax: { value: 1.6, min: 0.05, max: 8, step: 0.01 },
      bobMin: { value: 0.02, min: 0, max: 0.3, step: 0.001 },
      bobMax: { value: 0.08, min: 0, max: 0.3, step: 0.001 },
      precessMin: { value: 0.15, min: 0, max: 2, step: 0.01 },
      precessMax: { value: 0.45, min: 0, max: 2, step: 0.01 },
    }),
    Tilt: folder({
      tiltDegMin: { value: 4, min: 0, max: 30, step: 0.1 },
      tiltDegMax: { value: 10, min: 0, max: 30, step: 0.1 },
      tiltSpeedMin: { value: 0.3, min: 0.05, max: 3, step: 0.01 },
      tiltSpeedMax: { value: 0.8, min: 0.05, max: 3, step: 0.01 },
    }),
    ScaleSpin: folder({
      scaleMin: { value: 0.01, min: 0.002, max: 0.2, step: 0.001 },
      scaleMax: { value: 0.025, min: 0.002, max: 0.2, step: 0.001 },
      spinXMin: { value: 0.1, min: 0, max: 3, step: 0.01 },
      spinXMax: { value: 0.5, min: 0, max: 3, step: 0.01 },
      spinYMin: { value: 0.4, min: 0, max: 3, step: 0.01 },
      spinYMax: { value: 1.0, min: 0, max: 3, step: 0.01 },
      spinZMin: { value: 0.05, min: 0, max: 3, step: 0.01 },
      spinZMax: { value: 0.3, min: 0, max: 3, step: 0.01 },
    }),
    Material: folder({
      transmission: { value: 1, min: 0, max: 1, step: 0.01 },
      roughness: { value: 0.1, min: 0, max: 1, step: 0.01 },
      thickness: { value: 50, min: 0, max: 200, step: 1 },
      ior: { value: 1.5, min: 1, max: 3, step: 0.01 },
      chromaticAberration: { value: 0.5, min: 0, max: 1, step: 0.01 },
      distortion: { value: 0.1, min: 0, max: 1, step: 0.01 },
      color: '#ffd700',
      toneMapped: { value: false },
    }),
    FieldCenter: folder({
      centerX: { value: center.x, min: -5, max: 5, step: 0.01 },
      centerY: { value: center.y, min: -5, max: 5, step: 0.01 },
      centerZ: { value: center.z, min: -5, max: 5, step: 0.01 },
      spread: { value: spread, min: 0, max: 5, step: 0.01 },
    }),
  }, { collapsed: false })

  // 共用材質參數（傳給每顆）
  const sharedMatProps = useMemo(() => ({
    transmission: leva.transmission,
    roughness: leva.roughness,
    thickness: leva.thickness,
    ior: leva.ior,
    chromaticAberration: leva.chromaticAberration,
    distortion: leva.distortion,
    color: leva.color,
    toneMapped: leva.toneMapped,
  }), [leva])

  // 產生每顆 coin 的參數
  const paramsList = useMemo(() => {
    const rnd = mulberry32(leva.seed)
    const list = []
    const c = new THREE.Vector3(leva.centerX, leva.centerY, leva.centerZ)
    for (let i = 0; i < leva.count; i++) {
      const phaseBase = (i / Math.max(1, leva.count)) * Math.PI * 2
      const cx = c.x + randIn(rnd, -leva.spread, leva.spread)
      const cy = c.y + randIn(rnd, -leva.spread * 0.6, leva.spread * 0.6)
      const cz = c.z + randIn(rnd, -leva.spread, leva.spread)
      list.push({
        // 場中心（每顆可有微擴散）
        center: new THREE.Vector3(cx, cy, cz),

        // 公轉
        radius: randIn(rnd, leva.radiusMin, leva.radiusMax),
        speed: randIn(rnd, leva.speedMin, leva.speedMax),
        phase: phaseBase, // 去相
        bobIntensity: randIn(rnd, leva.bobMin, leva.bobMax),

        // 傾斜（軸在 XY 內繞 Z precess）
        tiltAmplitude: THREE.MathUtils.degToRad(randIn(rnd, leva.tiltDegMin, leva.tiltDegMax)),
        tiltSpeed: randIn(rnd, leva.tiltSpeedMin, leva.tiltSpeedMax),
        precessSpeed: randIn(rnd, leva.precessMin, leva.precessMax),

        // 尺寸與自轉
        scale: randIn(rnd, leva.scaleMin, leva.scaleMax),
        speedX: randIn(rnd, leva.spinXMin, leva.spinXMax),
        speedY: randIn(rnd, leva.spinYMin, leva.spinYMax),
        speedZ: randIn(rnd, leva.spinZMin, leva.spinZMax),
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
          sharedMatProps={sharedMatProps}
          fbxPath={fbxPath}
          pointer={pointer}
        />
      ))}
    </group>
  )
}
