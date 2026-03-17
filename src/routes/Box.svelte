<script lang="ts">
  import { T, useTask } from '@threlte/core'
  import { Edges, Outlines } from '@threlte/extras'
  import gsap from 'gsap'
  import * as THREE from 'three'

  let { position, trigger = 0, text = 'ONLINE PUBLIC INFORMATION BOARD', active = false }: { position: [number, number, number], trigger?: number, text?: string, active?: boolean } = $props()

  let rotY = $state(0)
  const tweenTarget = { val: 0 }
  let prevTrigger = 0

  const boxW = 4
  const boxH = 1.1
  const boxD = 4

  // marquee setup - one canvas tile drawn once, scrolled via uv offset
  const fontSize = 38 // slightly smaller for minecraft font scaling

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  canvas.height = 64

  let tilePixels = $state(64) // initial fallback
  const tileWorld = $derived((tilePixels / canvas.height) * boxH)

  const textures = $state<THREE.CanvasTexture[]>([])

  // measure and resize canvas reactively
  $effect(() => {
    // Re-run measurement whenever text changes
    const _t = text 
    const measure = () => {
      ctx.font = `${fontSize}px "Minecraft", monospace`
      const textWidth = ctx.measureText(text.toUpperCase()).width
      const newWidth = Math.ceil(textWidth + 140) // healthy gap
      if (tilePixels !== newWidth) {
        tilePixels = newWidth
        canvas.width = tilePixels
        drawCanvas()
      }
    }

    document.fonts.ready.then(measure)
    const i1 = setTimeout(measure, 100)
    const i2 = setTimeout(measure, 500)
    const i3 = setTimeout(measure, 1500)
    return () => {
      clearTimeout(i1)
      clearTimeout(i2)
      clearTimeout(i3)
    }
  })

  // update texture repeat/offset whenever tileWorld/text changes
  $effect(() => {
    if (tilePixels > 64 && textures.length > 0) {
      textures.forEach((tex, i) => {
        const sideWidth = (i === 0 || i === 2) ? boxW : boxD
        const perimOffset = sideOffsets[i]
        tex.repeat.x = sideWidth / tileWorld
        tex.offset.x = perimOffset / tileWorld
        tex.needsUpdate = true
      })
    }
  })

  function drawCanvas() {
    if (tilePixels <= 0) return
    const uppercaseText = text.toUpperCase()
    ctx.fillStyle = '#080807'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.font = `${fontSize}px "Minecraft", monospace`
    ctx.fillStyle = active ? '#ffffff' : '#444444'
    ctx.textBaseline = 'middle'
    ctx.fillText(uppercaseText, 0, (canvas.height / 2) + 4)
    textures.forEach(t => {
      t.needsUpdate = true
    })
  }

  // 4 sides: front(w), right(d), back(w), left(d) — perimeter order
  const perimeter = 2 * (boxW + boxD)
  const sideOffsets = [0, boxW, boxW + boxD, 2 * boxW + boxD]

  function createTex(sideWidth: number, perimOffset: number) {
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.wrapS = THREE.RepeatWrapping
    tex.wrapT = THREE.ClampToEdgeWrapping
    tex.minFilter = THREE.NearestFilter
    tex.magFilter = THREE.NearestFilter
    tex.repeat.x = sideWidth / tileWorld
    tex.offset.x = perimOffset / tileWorld // Added positive offset for seamless flow
    return tex
  }

  const frontTex = createTex(boxW, sideOffsets[0])
  const rightTex = createTex(boxD, sideOffsets[1])
  const backTex = createTex(boxW, sideOffsets[2])
  const leftTex = createTex(boxD, sideOffsets[3])
  textures.push(frontTex, rightTex, backTex, leftTex)

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
  const frontMat = new THREE.MeshBasicMaterial({ map: frontTex, toneMapped: false, ...offsetProps })
  const rightMat = new THREE.MeshBasicMaterial({ map: rightTex, toneMapped: false, ...offsetProps })
  const backMat = new THREE.MeshBasicMaterial({ map: backTex, toneMapped: false, ...offsetProps })
  const leftMat = new THREE.MeshBasicMaterial({ map: leftTex, toneMapped: false, ...offsetProps })

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

<T.Mesh {position} rotation.y={rotY}>
  <T.BoxGeometry args={[boxW, boxH, boxD]} />
  <T.MeshBasicMaterial color="#080807" toneMapped={false} polygonOffset polygonOffsetFactor={2} polygonOffsetUnits={2} />
  <Outlines color={active ? 'white' : '#444444'} thickness={0.025} />
  <Edges color={active ? 'white' : '#444444'} threshold={15} />
</T.Mesh>

<!-- marquee planes as children of a group that follows the box rotation -->
<T.Group position={position} rotation.y={rotY}>
  {#if active}
    <!-- front (z+) -->
    <T.Mesh position.z={boxD / 2} material={frontMat}>
      <T.PlaneGeometry args={[boxW, boxH]} />
    </T.Mesh>

    <!-- right (x+) -->
    <T.Mesh position.x={boxW / 2} rotation.y={Math.PI / 2} material={rightMat}>
      <T.PlaneGeometry args={[boxD, boxH]} />
    </T.Mesh>

    <!-- back (z-) -->
    <T.Mesh position.z={-(boxD / 2)} rotation.y={Math.PI} material={backMat}>
      <T.PlaneGeometry args={[boxW, boxH]} />
    </T.Mesh>

    <!-- left (x-) -->
    <T.Mesh position.x={-(boxW / 2)} rotation.y={-Math.PI / 2} material={leftMat}>
      <T.PlaneGeometry args={[boxD, boxH]} />
    </T.Mesh>
  {/if}
</T.Group>
