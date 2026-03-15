<script>
  import { T } from '@threlte/core'
  import { interactivity } from '@threlte/extras'
  import Box from './Box.svelte'

  interactivity()
</script>

<T.OrthographicCamera
  makeDefault
  position={[10, 9, 10]}
  zoom={80}
  oncreate={(ref) => {
    ref.lookAt(0, 0, 0)
    ref.updateProjectionMatrix()
  }}
/>

{#each [0, -1.6] as y (y)}
  <Box position={[0, y, 0]} />
{/each}
