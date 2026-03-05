<script lang="ts">
	import Projects from '$lib/components/Projects.svelte';
	import Socials from '$lib/components/Socials.svelte';
</script>

<div class="info">
	<p class="info__title">CREATIVE PROJECTS I’VE WORKED ON</p>
	<Projects />
	<Socials />
</div>

<style>
	.info {
		grid-column: 7 / span 6;
		grid-row: 1;
		display: flex;
		flex-direction: column;
		gap: 0.88rem;
	}

	.info__title {
		font-family: 'Geist Mono', monospace;
		font-weight: 500;
		letter-spacing: 0.34%;
		font-size: 0.875rem;
		color: #888888;

		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
</style>
