<script lang="ts">
	import '../styles/main.css';
	import favicon from '$lib/assets/favicon.svg';

	import { resolve } from '$app/paths';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<header>
	<nav class="container">
		<a href={resolve('/')}>root</a>
		<a href={resolve('/scrutiny')}>scrutiny</a>
	</nav>
</header>

{@render children()}

<style>
	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
</style>
