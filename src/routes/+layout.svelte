<script lang="ts">
	import '../styles/main.css';
	import favicon from '$lib/assets/favicon.svg';
	import logo from '$lib/assets/logo.svg';

	import { resolve } from '$app/paths';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<header>
	<div class="header-container container">
		<img class="size-8" src={logo} alt="Aikhe Logo Mark" />

		<nav class="container">
			<a href={resolve('/')}>root</a>
			<a href={resolve('/scrutiny')}>scrutiny</a>
		</nav>
	</div>
</header>

{@render children()}

<style>
	header {
		position: sticky;
		top: 0;
		z-index: 100;
		display: flex;
		justify-content: center;
		align-items: center;
		height: 4rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		transition: transform 0.3s ease;
	}

	.header-container {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	nav {
		display: flex;
		gap: 1rem;
	}
</style>
