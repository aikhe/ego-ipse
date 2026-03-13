<script lang="ts">
	import Hero from '$lib/layouts/Hero.svelte';
	import Info from '$lib/layouts/Info.svelte';
</script>

<section class="section-container">
	<Hero />

	<Info />
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
