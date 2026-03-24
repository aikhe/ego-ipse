<script lang="ts">
  import Hero from '$lib/layouts/Hero.svelte';
  import Info from '$lib/layouts/Info.svelte';

  import { Canvas } from '@threlte/core'
  import Scene from './Scene.svelte'
  import * as THREE from 'three'
</script>

<section class="section-container">
<Hero />

<Info />
</section>

<div class="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
<Canvas 
  dpr={2}
  toneMapping={THREE.NoToneMapping}
>
  <Scene/>
</Canvas>
</div>

<style>
section {
	height: calc(100vh - 4.8rem);

	display: grid;
	grid-template-columns: repeat(12, 1fr);
	gap: 1.2rem;
	align-items: end;
	padding-bottom: 2rem;
}
</style>
