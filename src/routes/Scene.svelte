<script lang="ts">
  import { T } from '@threlte/core'
  import { interactivity } from '@threlte/extras'
  import Box from './Box.svelte'
  import EBox from './EBox.svelte'

  let { 
    trigger1 = 0, 
    trigger2 = 0, 
    trigger3 = 0,
    active1 = false,
    active2 = false,
    active3 = false
  }: { 
    trigger1?: number, 
    trigger2?: number, 
    trigger3?: number,
    active1?: boolean,
    active2?: boolean,
    active3?: boolean
  } = $props()

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

<EBox position={[0, 1.3, 0]} trigger={trigger1} active={active1} />
<Box position={[0, 0, 0]} trigger={trigger2} active={active2} />
<Box position={[0, -1.3, 0]} trigger={trigger3} text="STUDENT COLLABORATIVE NETWORK" active={active3} />
