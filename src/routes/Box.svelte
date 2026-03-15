<script lang="ts">
  import { T } from '@threlte/core'
  import { Edges } from '@threlte/extras'
  import gsap from 'gsap'

  let { position }: { position: [number, number, number] } = $props()

  // svelte 5 state for rotation
  let rotY = $state(0)

  // gsap container object
  const tweenTarget = { val: 0 }

  // use pointer event for type safety
  function onPointerEnter(e: PointerEvent) {
    e.stopPropagation() 

    gsap.killTweensOf(tweenTarget)
    
    gsap.to(tweenTarget, {
      val: Math.PI * 2, // 1 spin
      duration: 1.2,
      ease: 'power2.out', // smooth ease out
      onUpdate: () => {
        rotY = tweenTarget.val
      }
    })
  }

  function onPointerLeave(e: PointerEvent) {
    e.stopPropagation()

    gsap.killTweensOf(tweenTarget)

    gsap.to(tweenTarget, {
      val: 0, // back to resting state
      duration: 1,
      ease: 'power2.out',
      onUpdate: () => {
        rotY = tweenTarget.val
      }
    })
  }
</script>

<T.Mesh 
  {position} 
  rotation.y={rotY}
  onpointerenter={onPointerEnter}
  onpointerleave={onPointerLeave}
>
  <T.BoxGeometry args={[4, 1.4, 4]} />
  <T.MeshBasicMaterial color="#1a1a1a" />
  <Edges 
    color="white" 
    threshold={15} 
  />
</T.Mesh>
