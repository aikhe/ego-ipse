<script lang="ts">
	import Projects from '$lib/components/Projects.svelte';
	import Socials from '$lib/components/Socials.svelte';
</script>

<div class="info">
	<p class="info__title">CREATIVE PROJECTS I’VE WORKED ON_</p>
	<Projects />
	<Socials />
</div>

<style>
	.info {
		grid-column: 7 / span 6;
		grid-row: 1; /* Retain global positioning directly to component itself */
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.info__title {
		font-family: 'Geist Mono', monospace;
		font-weight: 300;
		letter-spacing: 0.34%;
		font-size: 0.875rem;
		color: #797979;
	}
</style>
