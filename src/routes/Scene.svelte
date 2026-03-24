<script lang="ts">
  import { T } from '@threlte/core'
  import { useTexture } from '@threlte/extras'
  import poster1 from '$lib/assets/posters/1.png'
  import poster2 from '$lib/assets/posters/2.png'
  import poster3 from '$lib/assets/posters/3.png'
  import poster4 from '$lib/assets/posters/4.png'

  const posters = [poster1, poster2, poster3, poster4]

  const textures = useTexture(posters, {
    transform: (t) => {
      t.anisotropy = 16
      t.generateMipmaps = false
      t.colorSpace = 'srgb'
      return t
    }
  })

  const width = 3
  const height = (3690 / 2848) * width
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
    <T.Mesh position={[i * 0.9, i * 0.8, i * -0.4]}>
      <T.PlaneGeometry args={[width, height]} />
      <T.MeshBasicMaterial map={texture} />
    </T.Mesh>
  {/each}
{/if}
