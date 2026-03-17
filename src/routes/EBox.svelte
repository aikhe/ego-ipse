<script lang="ts">
  import { T, useTask } from '@threlte/core'
  import { Edges, Outlines } from '@threlte/extras'
  import gsap from 'gsap'
  import * as THREE from 'three'

  let { 
    position, 
    trigger = 0, 
    active = false, 
    text = 'SENIOR PROJECT DISCOVERY SHOWCASE' 
  }: { 
    position: [number, number, number], 
    trigger?: number, 
    active?: boolean, 
    text?: string 
  } = $props()

  let rotY = $state(0)
  const tweenTarget = { val: 0 }
  let prevTrigger = 0

  // dimensions
  const [boxW, boxH, boxD] = [4, 1.1, 4]

  // e-shape geometry
  const seg = boxD / 7
  const thk = seg
  const gap = 0.4
  const sX = -boxW/2 + thk + gap
  const bR = sX + thk
  const t2B = -boxD/2 + 2 * seg
  const t2T = -boxD/2 + 3 * seg
  const t3B = -boxD/2 + 4 * seg
  const t3T = -boxD/2 + 5 * seg

  const shape = new THREE.Shape()
  shape.moveTo(-boxW/2, -boxD/2)
  shape.lineTo(boxW/2, -boxD/2)
  shape.lineTo(boxW/2, -boxD/2 + seg)
  shape.lineTo(-boxW/2 + thk, -boxD/2 + seg)
  shape.lineTo(-boxW/2 + thk, boxD/2 - seg)
  shape.lineTo(boxW/2 - thk, boxD/2 - seg)
  shape.lineTo(boxW/2 - thk, t3T)
  shape.lineTo(sX, t3T)
  shape.lineTo(sX, t2B)
  shape.lineTo(boxW/2, t2B)
  shape.lineTo(boxW/2, t2T)
  shape.lineTo(bR, t2T)
  shape.lineTo(bR, t3B)
  shape.lineTo(boxW/2, t3B)
  shape.lineTo(boxW/2, boxD/2)
  shape.lineTo(-boxW/2, boxD/2)
  shape.closePath()

  // marquee logic
  const fontSize = 38
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  canvas.height = 64

  let tilePixels = $state(0)
  const tileWorld = $derived((tilePixels / canvas.height) * boxH)

  function drawCanvas() {
    if (canvas.width <= 0) return
    ctx.fillStyle = '#080807'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.font = `${fontSize}px "Minecraft", monospace`
    ctx.fillStyle = active ? '#ffffff' : '#444444'
    ctx.textBaseline = 'middle'
    ctx.fillText(text.toUpperCase(), 0, (canvas.height / 2) + 4)
    textures.forEach(t => t.needsUpdate = true)
  }

  function updateMarquee() {
    ctx.font = `${fontSize}px "Minecraft", monospace`
    const width = Math.ceil(ctx.measureText(text.toUpperCase()).width + 40)
    if (tilePixels !== width) {
      tilePixels = width
      canvas.width = width
    }
    drawCanvas()
  }

  const textures = [0, 1, 2].map(() => {
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.wrapS = THREE.RepeatWrapping
    tex.wrapT = THREE.ClampToEdgeWrapping
    tex.minFilter = tex.magFilter = THREE.NearestFilter
    return tex
  })

  // react to text or active status changes
  $effect(() => {
    updateMarquee()
    document.fonts.ready.then(updateMarquee)
  })

  // update texture repeat and offsets
  $effect(() => {
    if (tileWorld <= 0) return
    const widths = [boxW, boxD, boxD]
    const offsets = [0, boxW, 2 * boxW + boxD]
    textures.forEach((tex, i) => {
      tex.repeat.x = widths[i] / tileWorld
      tex.offset.x = offsets[i] / tileWorld
    })
  })

  useTask((delta) => {
    textures.forEach(t => t.offset.x += delta * 0.08)
  })

  const poly = { polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }
  const [matF, matR, matL] = textures.map(map => new THREE.MeshBasicMaterial({ map, toneMapped: false, ...poly }))

  // spin animation
  $effect(() => {
    if (trigger <= prevTrigger) return
    prevTrigger = trigger
    gsap.killTweensOf(tweenTarget)
    tweenTarget.val = 0
    gsap.to(tweenTarget, {
      val: Math.PI * 2,
      duration: 5,
      ease: 'elastic.out(1.5, 1)',
      onUpdate: () => { rotY = tweenTarget.val }
    })
  })
</script>

<T.Group {position} rotation.y={rotY}>
  <T.Mesh rotation.x={Math.PI / 2} rotation.z={Math.PI / -2} position.y={0.55}>
    <T.ExtrudeGeometry args={[shape, { depth: boxH, bevelEnabled: false }]} />
    <T.MeshBasicMaterial color="#080807" toneMapped={false} polygonOffset polygonOffsetFactor={2} polygonOffsetUnits={2} />
    <Outlines color={active ? 'white' : '#444444'} thickness={0.025} />
    <Edges color={active ? 'white' : '#444444'} threshold={15} />
  </T.Mesh>

  {#if active}
    <T.Mesh position.z={boxD/2} material={matF}><T.PlaneGeometry args={[boxW, boxH]} /></T.Mesh>
    <T.Mesh position.x={boxW/2} rotation.y={Math.PI/2} material={matR}><T.PlaneGeometry args={[boxD, boxH]} /></T.Mesh>
    <T.Mesh position.x={-boxW/2} rotation.y={-Math.PI/2} material={matL}><T.PlaneGeometry args={[boxD, boxH]} /></T.Mesh>
  {/if}
</T.Group>
