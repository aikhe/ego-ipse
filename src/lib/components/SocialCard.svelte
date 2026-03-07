<script lang="ts">
	import { tick } from 'svelte';
	import gsap from 'gsap';

	interface Social {
		name: string;
		href: string;
		external: boolean;
	}

	interface Props {
		social?: Social | null;
		visible?: boolean;
	}

	let { social = null, visible = false }: Props = $props();

	let container = $state<HTMLDivElement>();
	let content = $state<HTMLDivElement>();
	let canvas = $state<HTMLCanvasElement>();
	let tl: gsap.core.Timeline | null = null;
	let lastName = '';
	let displaySocial = $state<Social | null>(null);

	const COLS = 20;
	const ROWS = 20;

	// build shuffled tile list
	function shuffledTiles() {
		const tiles = Array.from({ length: COLS * ROWS }, (_, i) => [i % COLS, Math.floor(i / COLS)]);
		for (let i = tiles.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[tiles[i], tiles[j]] = [tiles[j], tiles[i]];
		}
		return tiles;
	}

	function runTileReveal(reveal: boolean, duration: number, startAt: gsap.Position) {
		if (!canvas) return;
		canvas.width = canvas.offsetWidth;
		canvas.height = canvas.offsetHeight;
		const ctx = canvas.getContext('2d')!;
		const tw = canvas.width / COLS;
		const th = canvas.height / ROWS;
		const tiles = shuffledTiles();
		const total = tiles.length;

		ctx.clearRect(0, 0, canvas.width, canvas.height);
		if (reveal) {
			ctx.fillStyle = '#080807';
			ctx.fillRect(0, 0, canvas.width, canvas.height);
		}

		const proxy = { t: 0 };
		let drawn = 0;

		tl!.to(
			proxy,
			{
				t: 1,
				duration,
				ease: 'power2.inOut',
				onUpdate() {
					const target = Math.floor(proxy.t * total);
					while (drawn < target) {
						const [c, r] = tiles[drawn];
						if (reveal) {
							ctx.clearRect(c * tw, r * th, tw + 0.5, th + 0.5);
						} else {
							ctx.fillStyle = '#080807';
							ctx.fillRect(c * tw, r * th, tw + 0.5, th + 0.5);
						}
						drawn++;
					}
				}
			},
			startAt
		);
	}

	$effect(() => {
		if (container) {
			if (visible && social) {
				if (social.name !== lastName) {
					displaySocial = social;
					lastName = social.name;
					show();
				}
			} else if (!visible && lastName !== '') {
				lastName = '';
				hide();
			}
		}
	});

	async function show() {
		await tick();
		if (!container) return;

		if (tl) tl.kill();
		tl = gsap.timeline();

		tl.set(container!, {
			transformOrigin: 'bottom right',
			scaleY: 0, // start from 0 for the hologram effect
			opacity: 0,
			y: 10
		});

		tl.to(container!, {
			opacity: 1,
			scaleY: 1,
			y: 0,
			duration: 0.5,
			ease: 'expo.out'
		});

		// hologram flicker
		tl.to(
			container!,
			{
				opacity: 0.7,
				duration: 0.05,
				repeat: 3,
				yoyo: true,
				ease: 'none'
			},
			'<0.1'
		);

		if (content) {
			tl.fromTo(
				content.children,
				{ opacity: 0, y: 10 },
				{
					opacity: 1,
					y: 0,
					duration: 0.4,
					stagger: 0.05,
					ease: 'power2.out'
				},
				'-=0.2'
			);
		}

		// tile reveal on placeholder
		runTileReveal(true, 0.6, '<0.15');
	}

	function hide() {
		if (!container) return;
		if (tl) tl.kill();
		tl = gsap.timeline();

		if (content) {
			tl.to(content.children, {
				opacity: 0,
				y: -5,
				duration: 0.2,
				stagger: 0.03,
				ease: 'power2.in'
			});
		}

		runTileReveal(false, 0.25, '<');

		// collapse container
		tl.to(
			container!,
			{
				opacity: 0,
				scaleY: 0,
				y: 10,
				duration: 0.3,
				ease: 'expo.in'
			},
			'-=0.1'
		);
	}
</script>

<div class="social-card" bind:this={container}>
	<div class="corner-accents"></div>
	{#if displaySocial}
		<div class="card" bind:this={content}>
			<div class="left-col">
				<div class="user-info">
					<p class="handle">@aikheandrei</p>
					<p class="bio">&gt; BIO → CREATIVE DEVELOPER</p>
				</div>
				<div class="stats">
					<div class="stat-row">
						<span class="label">FOLLOWING:</span>
						<span class="val">[939]</span>
					</div>
					<div class="stat-row">
						<span class="label">FOLLOWERS:</span>
						<span class="val">[4,426]</span>
					</div>
				</div>
				<div class="bottom-group">
					<div class="footer-tags">
						<span class="tag-box">[ {displaySocial.name} ]</span>
						<span class="tag-box">[ {displaySocial.external ? 'SOCIAL' : 'INTERNAL'} ]</span>
					</div>
					<button class="active-status"> ACTIVE... </button>
				</div>
			</div>
			<div class="right-col">
				<div class="placeholder-box">
					<div class="corner-dot tl"></div>
					<div class="corner-dot tr"></div>
					<div class="corner-dot bl"></div>
					<div class="corner-dot br"></div>
					<canvas bind:this={canvas} class="tile-canvas"></canvas>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.social-card {
		position: absolute;
		bottom: 100%;
		right: 0;
		width: calc(50% - 0.6rem); /* 3 grid columns */
		height: auto; /* Relative to content */
		background: #080807;
		border: 1px solid #363636;
		margin-bottom: -1.2rem;
		opacity: 0;
		pointer-events: none;
		z-index: 999;
		box-sizing: border-box;
		transform-origin: bottom right;
		backdrop-filter: blur(4px);
	}

	.corner-accents {
		position: absolute;
		inset: -1px;
		pointer-events: none;
		z-index: 5;
	}

	.corner-accents::before {
		content: '';
		position: absolute;
		inset: 0;
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
		background-size: 10px 10px;
	}

	.card {
		display: grid;
		grid-template-columns: 1fr 1fr; /* Equal column widths */
		height: auto;
		padding: 1.2rem;
		box-sizing: border-box;
		gap: 1rem;
	}

	.left-col {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		font-family: 'Geist Mono', monospace;
	}

	.user-info {
		margin-bottom: 0rem;
	}

	.handle {
		color: #fff;
		margin: 0;
		font-family: 'Geist Mono', monospace;
		letter-spacing: 0.034em;
		font-size: 0.8rem;
		font-weight: 400;
	}

	.bio {
		color: #888;
		margin: 0.1rem 0 0 0;
		font-family: 'Geist Mono', monospace;
		letter-spacing: 0.034em;
		font-size: 0.8rem;
		font-weight: 400;
	}

	.stats {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		margin: 0.4rem 0;
	}

	.stat-row {
		display: flex;
		justify-content: flex-start;
		gap: 0.5rem;
		font-family: 'Geist Mono', monospace;
		letter-spacing: 0.034em;
		font-size: 0.8rem;
		font-weight: 400;
	}

	.label {
		color: #888;
		width: 85px; /* Narrower to fit within small column */
		flex-shrink: 0;
	}

	.val {
		color: #fff;
		flex-grow: 1;
	}

	.bottom-group {
		margin-top: auto;
		display: flex;
		flex-direction: column;
		gap: 0.8rem;
	}

	.footer-tags {
		display: flex;
		gap: 0.5rem;
	}

	.tag-box {
		color: #fff;
		font-family: 'Geist Mono', monospace;
		letter-spacing: 0.034em;
		font-size: 0.8rem;
		font-weight: 400;
	}

	.active-status {
		width: 100%;
		padding: 0.44rem;
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid #363636;
		color: #888888;
		font-family: 'Geist Mono', monospace;
		font-weight: 500;
		letter-spacing: 0.034em;
		font-size: 0.7rem;
		text-align: center;
		transition: background 0.2s ease;
		cursor: default;
	}

	.right-col {
		display: flex;
		align-items: center;
		justify-content: center; /* Center the box in the column */
	}

	.placeholder-box {
		width: 100%; /* Fill the column width */
		aspect-ratio: 1 / 1; /* Maintain square shape */
		border: 1px dashed rgba(255, 255, 255, 0.4);
		position: relative;
		background: #000;
	}

	.corner-dot {
		position: absolute;
		width: 4px;
		height: 4px;
		background: #fff;
		z-index: 10;
	}

	.tl {
		top: -2.5px;
		left: -2.5px;
	}
	.tr {
		top: -2.5px;
		right: -2.5px;
	}
	.bl {
		bottom: -2.5px;
		left: -2.5px;
	}
	.br {
		bottom: -2.5px;
		right: -2.5px;
	}

	.tile-canvas {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}
</style>
