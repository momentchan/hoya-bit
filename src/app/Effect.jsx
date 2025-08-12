import { EffectComposer, Bloom, ToneMapping } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import { useControls } from 'leva'

export default function Effect() {

    const { bloomIntensity, bloomThreshold, bloomSmoothing } = useControls('Effect', {
        bloomIntensity: { value: 0.2, min: 0, max: 1 },
        bloomThreshold: { value: 0.8, min: 0, max: 1 },
        bloomSmoothing: { value: 0.025, min: 0, max: 1 },
    })

    return (
        <EffectComposer>
            <Bloom intensity={bloomIntensity}
                luminanceThreshold={bloomThreshold}
                luminanceSmoothing={bloomSmoothing} />
            <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        </EffectComposer>
    )
}