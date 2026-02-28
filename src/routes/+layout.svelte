<script lang="ts">
	import '../styles/main.css';
	import favicon from '$lib/assets/favicon.svg';
	import logo from '$lib/assets/logo.svg';

	import { resolve } from '$app/paths';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
	let showGrid = $state(false);
	let time = $state('--:--:--');

	function handleKeydown(event: KeyboardEvent) {
		if (event.shiftKey && event.key === 'G') {
			showGrid = !showGrid;
		}
	}

	$effect(() => {
		const updateTime = () => {
			time = new Date().toLocaleTimeString('en-US', {
				timeZone: 'Asia/Manila',
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit',
				hour12: true
			});
		};

		updateTime();
		const interval = setInterval(updateTime, 1000);

		return () => clearInterval(interval);
	});
</script>

<svelte:window onkeydown={handleKeydown} />

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<header class="section-container">
	<img class="logo size-8" src={logo} alt="Aikhe Logo Mark" />

	<p class="time">{time}</p>
	<p class="time-zone">GMT+8</p>
	<p class="location">CALOOCAN, PH</p>
	<p class="coordinates">14.6514° N, 120.9902° E</p>
	<button class="contact-btn">CONTACT</button>

	<nav class="nav">
		<a href={resolve('/')}>ROOT</a>
		<a href={resolve('/scrutiny')}>SCRUTINY</a>
	</nav>
</header>

<main>
	{@render children()}
</main>

{#if showGrid}
	<div class="grid-overlay section-container">
		{#each Array(12)}
			<div class="grid-column"></div>
		{/each}
	</div>
{/if}

<style>
	header {
		/* position: sticky; */
		/* top: 0; */
		z-index: 2;
		height: 4.8rem;

		display: grid;
		grid-template-columns: repeat(12, 1fr);
		gap: 1.2rem;
		align-items: center;
		margin-inline: auto;
		white-space: nowrap;
		/* border-bottom: 1px solid rgba(255, 255, 255, 0.1); */

		font-family: 'Geist Mono', monospace;
		font-weight: 300;
		letter-spacing: 0.34%;
		font-size: 14px;
		color: #797979;
	}

	header > * {
		grid-row: 1;
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
		grid-column: 4 / span 2;
	}

	.coordinates {
		grid-column: 7 / span 2;
	}

	.nav {
		grid-column: 10 / span 2;
		display: flex;
		gap: 1rem;
		justify-content: flex-end;
	}

	.contact-btn {
		grid-column: 12 / span 1;
		justify-self: flex-end;
		position: relative;

		background-color: rgba(255, 255, 255, 0.06);
		color: #fff;
		border: 1px solid #363636;
		padding: 6px 12px;
		cursor: pointer;

		display: flex;
		align-items: center;
		justify-content: center;
	}

	.contact-btn::before,
	.contact-btn::after {
		content: '';
		position: absolute;
		border-style: solid;
		border-color: #888888;
		pointer-events: none;
	}

	.contact-btn::before {
		inset: -1px;
		background:
			linear-gradient(to right, #888 1px, transparent 1px) 0 0,
			linear-gradient(to bottom, #888 1px, transparent 1px) 0 0,
			linear-gradient(to left, #888 1px, transparent 1px) 100% 0,
			linear-gradient(to bottom, #888 1px, transparent 1px) 100% 0,
			linear-gradient(to right, #888 1px, transparent 1px) 0 100%,
			linear-gradient(to top, #888 1px, transparent 1px) 0 100%,
			linear-gradient(to left, #888 1px, transparent 1px) 100% 100%,
			linear-gradient(to top, #888 1px, transparent 1px) 100% 100%;
		background-repeat: no-repeat;
		background-size: 8px 8px;
	}

	.contact-btn:hover {
		background-color: #1a1a1a;
		border-color: #444;
		color: #fff;
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
		background-color: rgba(255, 255, 255, 0.02);
		/* border-left: 1px solid rgba(255, 255, 255, 0.06); */
		/* border-right: 1px solid rgba(255, 255, 255, 0.06); */
	}
</style>
