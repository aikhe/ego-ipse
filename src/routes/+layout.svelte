<script lang="ts">
	import '../styles/main.css';
	import favicon from '$lib/assets/favicon.ico';
	import logo from '$lib/assets/logo.svg';

	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
	let theme = $state('light');
	let showGrid = $state(false);
	let time = $state('--:--:--');

	function toggleTheme() {
		theme = theme === 'dark' ? 'light' : 'dark';
	}

	// glitch animation logic
	const smallSymbols = '·.:,;+-';
	const largeSymbols = 'urilQZXW';
	let themeDisplayText = $state('LIGHT');
	let glitchInterval: ReturnType<typeof setInterval> | null = null;

	function startGlitch() {
		const original = theme.toUpperCase();
		let frames = 0;
		const revealSpeed = 3;
		const totalFrames = original.length * revealSpeed + 15;
		const resolveDelays = original.split('').map(() => Math.floor(Math.random() * 5));

		if (glitchInterval) clearInterval(glitchInterval);

		glitchInterval = setInterval(() => {
			const charsToShow = Math.min(original.length, Math.floor(frames / revealSpeed) + 1);

			themeDisplayText = original
				.split('')
				.map((_: string, i: number) => {
					if (i >= charsToShow) return '';

					const appearedFrame = i * revealSpeed;
					const progress = frames - appearedFrame - resolveDelays[i];

					if (progress > 8) return original[i];
					if (progress > 4) return largeSymbols[Math.floor(Math.random() * largeSymbols.length)];
					return smallSymbols[Math.floor(Math.random() * smallSymbols.length)];
				})
				.join('');

			if (frames > totalFrames) {
				if (glitchInterval) clearInterval(glitchInterval);
				glitchInterval = null;
				themeDisplayText = original;
			}
			frames++;
		}, 20);
	}

	$effect(() => {
		document.documentElement.setAttribute('data-theme', theme);
		// when the theme changes
		startGlitch();
	});

	function handleKeydown(event: KeyboardEvent) {
		if (event.shiftKey && event.key === 'G') {
			showGrid = !showGrid;
		}
		if (event.shiftKey && event.key === 'T') {
			toggleTheme();
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

	<button class="theme-toggle" onclick={toggleTheme}>
		MODE: {themeDisplayText}
	</button>

	<button class="contact-btn">CONTACT</button>

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

<div class="grid-background section-container">
	{#each Array(12)}
		<div class="bg-grid-column"></div>
	{/each}
</div>

<div class="stripe-gutter stripe-gutter--left"></div>
<div class="stripe-gutter stripe-gutter--right"></div>

<style>
	header {
		z-index: 2;
		height: 4.8rem;

		display: grid;
		grid-template-columns: repeat(12, 1fr);
		gap: 1.2rem;
		align-items: center;
		white-space: nowrap;

		font-family: 'Geist Mono', monospace;
		font-weight: 500;
		letter-spacing: 0.34%;
		font-size: 0.875rem;
		color: var(--color-text-muted);
	}

	header > * {
		grid-row: 1;
	}

	.logo {
		grid-column: 1;
		filter: brightness(0) invert(var(--logo-invert, 0));
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

	.theme-toggle {
		grid-column: 9;
		background: none;
		border: none;
		color: var(--color-text-muted);
		font-family: 'Geist Mono', monospace;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		text-align: left;
		padding: 0;
	}

	.theme-toggle:hover {
		color: var(--color-text);
	}


	.contact-btn {
		grid-column: 12 / span 1;
		justify-self: flex-end;
		position: relative;

		background: var(--color-overlay-02);
		color: var(--color-text);
		border: 1px solid var(--color-overlay-20);
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
		border-color: var(--color-text-muted);
		pointer-events: none;
	}

	.contact-btn::before {
		inset: -1px;
		background:
			linear-gradient(to right, var(--color-text) 1px, transparent 1px) 0 0,
			linear-gradient(to bottom, var(--color-text) 1px, transparent 1px) 0 0,
			linear-gradient(to left, var(--color-text) 1px, transparent 1px) 100% 0,
			linear-gradient(to bottom, var(--color-text) 1px, transparent 1px) 100% 0,
			linear-gradient(to right, var(--color-text) 1px, transparent 1px) 0 100%,
			linear-gradient(to top, var(--color-text) 1px, transparent 1px) 0 100%,
			linear-gradient(to left, var(--color-text) 1px, transparent 1px) 100% 100%,
			linear-gradient(to top, var(--color-text) 1px, transparent 1px) 100% 100%;
		background-repeat: no-repeat;
		background-size: 8px 8px;
	}

	.contact-btn:hover {
		background: var(--color-overlay-05);
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
		background-color: var(--color-overlay-02);
	}

	.grid-background {
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
		z-index: -1; 
	}

	.bg-grid-column:is(:nth-child(1), :nth-child(2), :nth-child(4), :nth-child(7), :nth-child(10)) {
		border-left: 1px dashed var(--color-overlay-15);
	}

	.bg-grid-column:nth-child(9) {
		border-right: 1px dashed var(--color-overlay-15);
	}

	.bg-grid-column:last-child {
		border-right: 1px dashed var(--color-overlay-15);
	}

	.stripe-gutter {
		position: fixed;
		top: 0;
		bottom: 0;
		/* match the gutter of .section-container */
		width: max(calc((100vw - var(--container-width)) / 2), calc((100vw - var(--container-max-width)) / 2));
		z-index: 1000;
		pointer-events: none;
		background-color: var(--color-overlay-10);
		mask-image: url('$lib/assets/stripe.svg');
		mask-repeat: repeat;
		mask-size: 7px 7px;
	}

	.stripe-gutter--left {
		left: 0;
	}

	.stripe-gutter--right {
		right: 0;
	}
</style>
