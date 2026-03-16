<script lang="ts">
  import { T } from '@threlte/core'
  import { Edges, Outlines } from '@threlte/extras'
  import gsap from 'gsap'
  import * as THREE from 'three'

  let { position, trigger = 0, active = false }: { position: [number, number, number], trigger?: number, active?: boolean } = $props()

  let rotY = $state(0)
  const tweenTarget = { val: 0 }
  let prevTrigger = 0

  // The original box was [4, 1.4, 4]
  // Dimensions of the "C" (looking from above):
  // Width: 4, Depth: 4
  // We'll draw the C on the XZ plane, then extrude along Y (height 1.4)
  const cShape = new THREE.Shape()
  
  // Start drawing our C
  // We draw it centered around 0,0 so it rotates cleanly
  const w = 4
  const d = 4
  const thickness = 1.2

  // Outer corners
  cShape.moveTo(-w/2, -d/2)
  cShape.lineTo(w/2, -d/2)
  cShape.lineTo(w/2, -d/2 + thickness)
  
  // Inner cut-out
  cShape.lineTo(-w/2 + thickness, -d/2 + thickness)
  cShape.lineTo(-w/2 + thickness, d/2 - thickness)
  
  // Bottom part
  cShape.lineTo(w/2, d/3 - thickness)
  cShape.lineTo(w/2, d/2)
  cShape.lineTo(-w/2, d/2)
  cShape.lineTo(-w/2, -d/2) // close shape

  const extrudeSettings = {
    depth: 1.1, // Height of the original box
    bevelEnabled: false
  }

  // spin when trigger increments
  $effect(() => {
    if (trigger <= prevTrigger) return
    prevTrigger = trigger

    gsap.killTweensOf(tweenTarget)
    tweenTarget.val = 0

    gsap.to(tweenTarget, {
      val: Math.PI * 1,
      duration: 3.4,
      ease: 'elastic.out(3, 1)',
      onUpdate: () => {
        rotY = tweenTarget.val
      }
    })
  })
</script>

<!-- The ExtrudeGeometry grows along the Z axis based on depth. 
     Since we drew on XY (Shape) and we want our base flat, 
     we normally would rotate it. 
     Threlte's T.Mesh let's us compose its position/rotation cleanly. -->
<T.Group {position} rotation.y={rotY}>
  <!-- We rotate the mesh 90 on X so it sits flat just like a BoxGeometry -->
  <!-- and shift it up by half its depth so it centers on Y=0 -->
  <T.Mesh rotation.x={Math.PI / 2} position.y={0.55}>
    <T.ExtrudeGeometry args={[cShape, extrudeSettings]} />
    <T.MeshBasicMaterial color="#080807" toneMapped={false} polygonOffset polygonOffsetFactor={2} polygonOffsetUnits={2} />
    <!-- Outlines to provide visibly thicker overall borders -->
    <Outlines color={active ? 'white' : '#444444'} thickness={0.025} />
    <!-- We only want outlines on hard edges -->
    <Edges color={active ? 'white' : '#444444'} threshold={15} />
  </T.Mesh>
</T.Group>
