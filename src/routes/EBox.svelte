<script lang="ts">
  import { T, useTask } from '@threlte/core'
  import { Edges, Outlines } from '@threlte/extras'
  import gsap from 'gsap'
  import * as THREE from 'three'

  let { position, trigger = 0, active = false }: { position: [number, number, number], trigger?: number, active?: boolean } = $props()

  let rotY = $state(0)
  const tweenTarget = { val: 0 }
  let prevTrigger = 0

  // dimensions
  const w = 4
  const d = 4
  const segment = d / 7
  const thickness = segment
  const disconnectGap = 0.4
  const extrudeDepth = 1.1

  // shape boundary
  const startX = -w/2 + thickness + disconnectGap
  const barRight = startX + thickness
  const t2Bottom = -d/2 + 2 * segment
  const t2Top = -d/2 + 3 * segment
  const t3Bottom = -d/2 + 4 * segment
  const t3Top = -d/2 + 5 * segment

  const shape = new THREE.Shape()
  shape.moveTo(-w/2, -d/2)
  shape.lineTo(w/2, -d/2)
  shape.lineTo(w/2, -d/2 + segment)
  shape.lineTo(-w/2 + thickness, -d/2 + segment)
  shape.lineTo(-w/2 + thickness, d/2 - segment)
  shape.lineTo(w/2 - thickness, d/2 - segment)
  shape.lineTo(w/2 - thickness, t3Top)
  shape.lineTo(startX, t3Top)
  shape.lineTo(startX, t2Bottom)
  shape.lineTo(w/2, t2Bottom)
  shape.lineTo(w/2, t2Top)
  shape.lineTo(barRight, t2Top)
  shape.lineTo(barRight, t3Bottom)
  shape.lineTo(w/2, t3Bottom)
  shape.lineTo(w/2, d/2)
  shape.lineTo(-w/2, d/2)
  shape.closePath()

  const extrudeSettings = { depth: extrudeDepth, bevelEnabled: false }

  // marquee setup - one canvas tile, scrolled via uv offset
  const marqueeText = 'SENIOR PROJECT DISCOVERY SHOWCASE'
  const fontSize = 38

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  canvas.height = 64

  let tilePixels = $state(64)
  const tileWorld = $derived((tilePixels / canvas.height) * extrudeDepth)

  const textures = $state<THREE.CanvasTexture[]>([])

  $effect(() => {
    // Re-run measurement whenever text changes
    const _t = marqueeText
    document.fonts.ready.then(() => {
      ctx.font = `${fontSize}px "Minecraft", monospace`
      const measure = ctx.measureText(marqueeText).width
      const newWidth = Math.ceil(measure + 140) 
      if (tilePixels !== newWidth) {
        tilePixels = newWidth
        canvas.width = tilePixels
        drawCanvas()
      }
    })
  })

  // Update repeats/offsets reactively
  $effect(() => {
    if (tilePixels > 64 && textures.length > 0) {
      // index 0: right (d), 1: front (w), 2: left (d)
      const widths = [d, w, d]
      const currentOffsets = [sideOffsets.right, sideOffsets.front, sideOffsets.left]
      textures.forEach((tex, i) => {
        tex.repeat.x = widths[i] / tileWorld
        tex.offset.x = currentOffsets[i] / tileWorld
      })
    }
  })
  
  function drawCanvas() {
    if (tilePixels <= 0 || !canvas.width) return
    ctx.fillStyle = '#080807'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.font = `${fontSize}px "Minecraft", monospace`
    ctx.fillStyle = active ? '#ffffff' : '#444444'
    ctx.textBaseline = 'middle'
    ctx.fillText(marqueeText, 0, (canvas.height / 2) + 4)
    textures.forEach(t => { t.needsUpdate = true })
  }



  // The 3 continuous outer flat faces of the E-Shape mapping exactly to the Box planes:
  // Right (+x face), Front (+z face), Left (-x face)
  const sideOffsets = {
    right: w,
    front: 0,
    left: -d
  }

  function createTex(sideWidth: number, perimOffset: number) {
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.wrapS = THREE.RepeatWrapping
    tex.wrapT = THREE.ClampToEdgeWrapping
    tex.minFilter = THREE.NearestFilter
    tex.magFilter = THREE.NearestFilter
    tex.repeat.x = sideWidth / tileWorld
    tex.offset.x = perimOffset / tileWorld // Match seamless boundary logic
    return tex
  }

  const rightTex = createTex(d, sideOffsets.right)
  const frontTex = createTex(w, sideOffsets.front)
  const leftTex = createTex(d, sideOffsets.left)
  textures.push(rightTex, frontTex, leftTex)

  drawCanvas()

  $effect(() => {
    drawCanvas()
  })

  const scrollSpeed = 0.08

  useTask((delta) => {
    const scroll = delta * scrollSpeed
    for (const t of textures) {
      t.offset.x += scroll
    }
  })

  // use '#080807' to perfectly match box faces color and set offsets to prevent clipping edges
  const offsetProps = { polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }
  const rightMat = new THREE.MeshBasicMaterial({ map: rightTex, toneMapped: false, ...offsetProps })
  const frontMat = new THREE.MeshBasicMaterial({ map: frontTex, toneMapped: false, ...offsetProps })
  const leftMat = new THREE.MeshBasicMaterial({ map: leftTex, toneMapped: false, ...offsetProps })

  // spin when trigger increments
  $effect(() => {
    if (trigger <= prevTrigger) return
    prevTrigger = trigger

    gsap.killTweensOf(tweenTarget)
    tweenTarget.val = 0

    gsap.to(tweenTarget, {
      val: Math.PI * 2,
      duration: 5,
      ease: 'elastic.out(1.5, 1)',
      onUpdate: () => {
        rotY = tweenTarget.val
      }
    })
  })
</script>

<T.Group {position} rotation.y={rotY}>
  <T.Mesh rotation.x={Math.PI / 2} rotation.z={Math.PI / -2} position.y={0.55}>
    <T.ExtrudeGeometry args={[shape, extrudeSettings]} />
    <T.MeshBasicMaterial color="#080807" toneMapped={false} polygonOffset polygonOffsetFactor={2} polygonOffsetUnits={2} />
    <Outlines color={active ? 'white' : '#444444'} thickness={0.025} />
    <Edges color={active ? 'white' : '#444444'} threshold={15} />
  </T.Mesh>

  {#if active}
    <!-- right marquee (x+) -->
    <T.Mesh
      position.x={w / 2}
      rotation.y={Math.PI / 2}
      material={rightMat}
    >
      <T.PlaneGeometry args={[d, extrudeDepth]} />
    </T.Mesh>

    <!-- front marquee (z+) -->
    <T.Mesh
      position.z={d / 2}
      material={frontMat}
    >
      <T.PlaneGeometry args={[w, extrudeDepth]} />
    </T.Mesh>

    <!-- left marquee (x-) -->
    <T.Mesh
      position.x={-(w / 2)}
      rotation.y={-Math.PI / 2}
      material={leftMat}
    >
      <T.PlaneGeometry args={[d, extrudeDepth]} />
    </T.Mesh>
  {/if}
</T.Group>
