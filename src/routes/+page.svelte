<script lang="ts">
	// import Hero from '$lib/layouts/Hero.svelte';
	// import Info from '$lib/layouts/Info.svelte';

import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
</script>

<section class="section-container">


	<!-- <Hero /> -->
	<!---->
	<!-- <Info /> -->
</section>

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
