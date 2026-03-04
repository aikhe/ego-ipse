<script lang="ts">
	import '../styles/main.css';
	import favicon from '$lib/assets/favicon.svg';
	import logo from '$lib/assets/logo.svg';

	import { resolve } from '$app/paths';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<header class="section-container">
	<img class="logo size-8" src={logo} alt="Aikhe Logo Mark" />

	<p class="time">01:34.18 AM</p>

	<p class="time-zone">GMT+8</p>

	<p class="location">CALOOCAN, PH</p>

	<nav class="nav">
		<a href={resolve('/')}>ROOT</a>
		<a href={resolve('/scrutiny')}>SCRUTINY</a>
	</nav>
</header>

{@render children()}

<div class="grid-overlay section-container">
	{#each Array(12)}
		<div class="grid-column"></div>
	{/each}
</div>

<style>
	header {
		position: sticky;
		top: 0;
		z-index: 2;
		height: 4.8rem;

		display: grid;
		grid-template-columns: repeat(12, 1fr);
		gap: 1.2rem;
		align-items: center;
		margin-inline: auto;
		/* border-bottom: 1px solid rgba(255, 255, 255, 0.1); */

		font-family: 'Geist Mono', monospace;
		font-weight: 200;
		letter-spacing: 0.34%;
		font-size: 16px;
		color: #797979;
	}

	.logo {
		grid-column: 1;
	}

	.time {
		grid-column: 2 / span 1;
	}

	.time-zone {
		grid-column: 3;
	}

	.location {
		grid-column: 4 / span 1;
	}

	.nav {
		grid-column: 9 / span 2;
		display: flex;
		gap: 1rem;
		justify-content: flex-end;
	}

	nav {
		display: flex;
		gap: 1rem;
	}

	.grid-overlay {
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		margin-inline: auto;
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		gap: 1.2rem;
		pointer-events: none;
		z-index: 1;
	}

	.grid-column {
		background-color: rgba(255, 255, 255, 0.04);
		/* border-left: 1px solid rgba(255, 255, 255, 0.06); */
		/* border-right: 1px solid rgba(255, 255, 255, 0.06); */
	}
</style>
