<script lang="ts">
  import { T } from '@threlte/core'
  import { useTexture, interactivity } from '@threlte/extras'
  import poster1 from '$lib/assets/posters/1.png'
  import poster2 from '$lib/assets/posters/2.png'
  import poster3 from '$lib/assets/posters/3.png'
  import poster4 from '$lib/assets/posters/4.png'
  import Poster from './Poster.svelte'

  interactivity()

  const posters = [poster1, poster2, poster3, poster4]

  const textures = useTexture(posters, {
    transform: (t) => {
      t.anisotropy = 16
      t.generateMipmaps = true
      // t.minFilter = THREE.LinearMipmapLinearFilter
      t.colorSpace = 'srgb'
      return t
    }
  })

  const width = 3
  const height = (3690 / 2848) * width

  let { onposterclick } = $props<{
    onposterclick?: (index: number) => void
  }>()

  let hovered = $state<number | null>(null)
</script>

<T.OrthographicCamera
  makeDefault
  position={[6, 6, 7]}
  zoom={94}
  oncreate={(ref) => {
    ref.lookAt(2.2, 1, 0)
  }}
/>

{#if $textures}
  {#each $textures as texture, i (i)}
  <Poster 
    index={i} 
    {texture} 
    {hovered} 
    {width} 
    {height}
    onenter={() => hovered = i}
    onleave={() => hovered = null}
    onclick={() => onposterclick?.(i)}
  />
  {/each}
{/if}
