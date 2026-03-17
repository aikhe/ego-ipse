<script lang="ts">
  import { T, useTask } from '@threlte/core'
  import { Edges, Outlines } from '@threlte/extras'
  import gsap from 'gsap'
  import * as THREE from 'three'

  let { 
    position, 
    trigger = 0, 
    text = 'ONLINE PUBLIC INFORMATION BOARD', 
    active = false 
  }: { 
    position: [number, number, number], 
    trigger?: number, 
    text?: string, 
    active?: boolean 
  } = $props()

  let rotY = $state(0)
  const tweenTarget = { val: 0 }
  let prevTrigger = 0

  // dimensions
  const [boxW, boxH, boxD] = [4, 1.1, 4]

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

  const sideOffsets = [0, boxW, boxW + boxD, 2 * boxW + boxD]
  const textures = [0, 1, 2, 3].map(() => {
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
    textures.forEach((tex, i) => {
      const sideWidth = (i % 2 === 0) ? boxW : boxD
      tex.repeat.x = sideWidth / tileWorld
      tex.offset.x = sideOffsets[i] / tileWorld
    })
  })

  useTask((delta) => {
    textures.forEach(t => t.offset.x += delta * 0.08)
  })

  const poly = { polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }
  const materials = textures.map(map => new THREE.MeshBasicMaterial({ map, toneMapped: false, ...poly }))

  // spin animation
  $effect(() => {
    if (trigger <= prevTrigger) return
    prevTrigger = trigger
    gsap.killTweensOf(tweenTarget)
    tweenTarget.val = 0
    gsap.to(tweenTarget, {
      val: Math.PI,
      duration: 3.4,
      ease: 'elastic.out(3, 1)',
      onUpdate: () => { rotY = tweenTarget.val }
    })
  })
</script>

<T.Mesh {position} rotation.y={rotY}>
  <T.BoxGeometry args={[boxW, boxH, boxD]} />
  <T.MeshBasicMaterial color="#080807" toneMapped={false} polygonOffset polygonOffsetFactor={2} polygonOffsetUnits={2} />
  <Outlines color={active ? 'white' : '#444444'} thickness={0.025} />
  <Edges color={active ? 'white' : '#444444'} threshold={15} />
</T.Mesh>

<T.Group {position} rotation.y={rotY}>
  {#if active}
    <T.Mesh position.z={boxD / 2} material={materials[0]}><T.PlaneGeometry args={[boxW, boxH]} /></T.Mesh>
    <T.Mesh position.x={boxW / 2} rotation.y={Math.PI / 2} material={materials[1]}><T.PlaneGeometry args={[boxD, boxH]} /></T.Mesh>
    <T.Mesh position.z={-(boxD / 2)} rotation.y={Math.PI} material={materials[2]}><T.PlaneGeometry args={[boxW, boxH]} /></T.Mesh>
    <T.Mesh position.x={-(boxW / 2)} rotation.y={-Math.PI / 2} material={materials[3]}><T.PlaneGeometry args={[boxD, boxH]} /></T.Mesh>
  {/if}
</T.Group>
