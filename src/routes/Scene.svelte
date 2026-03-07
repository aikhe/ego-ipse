<script lang="ts">
  import { T, useTask } from '@threlte/core'
  import { interactivity } from '@threlte/extras'
  import { Spring } from 'svelte/motion'
  import { GLTF } from '@threlte/extras'
  import modelUrl from '$lib/assets/model.glb?url'

  import type { PerspectiveCamera } from 'three'

  interactivity()
  const scale = new Spring(1)

  let rotation = $state(0)
  useTask((delta) => {
    rotation += delta
  })
</script>

<GLTF url={modelUrl} />

<T.PerspectiveCamera
  makeDefault
  position={[10, 10, 10]}
  oncreate={(ref: PerspectiveCamera) => {
    ref.lookAt(0, 1, 0)
  }}
/>

<T.DirectionalLight position={[0, 10, 10]}
  castShadow
/>

<T.Mesh
  rotation.y={rotation}
  position.y={1}
  scale={scale.current}
  onpointerenter={() => {
    scale.target = 1.5
  }}
  onpointerleave={() => {
    scale.target = 1
  }}
  castShadow
>
  <T.BoxGeometry args={[1, 2, 1]} />
  <T.MeshBasicMaterial color="hotpink" />
  <T.MeshStandardMaterial color="hotpink" />
</T.Mesh>

<T.Mesh
  rotation.x={-Math.PI / 2}
  receiveShadow
>
  <T.BoxGeometry args={[8, 8, 0.34]} />
  <T.MeshStandardMaterial color="white" />
</T.Mesh>
