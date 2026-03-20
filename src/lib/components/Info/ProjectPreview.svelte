<script lang="ts">
	import { tick } from 'svelte';
	import gsap from 'gsap';

	export let project: {
		name: string;
		section: string;
		date: string;
		tags: readonly string[];
		id: string;
		image?: string;
	} | null = null;
	export let visible = false;
	export let posX = 0;
	export let posY = 0;
	export let width = 260;
	export let height = 380;

	let container: HTMLDivElement;
	let content: HTMLDivElement;
	let canvas: HTMLCanvasElement;
	let tl: gsap.core.Timeline | null = null;
	let lastProjectName = '';

	const COLS = 20;
	const ROWS = 28;

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
		// sync pixel size to rendered size
		canvas.width = canvas.offsetWidth;
		canvas.height = canvas.offsetHeight;
		const ctx = canvas.getContext('2d')!;
		const tw = canvas.width / COLS;
		const th = canvas.height / ROWS;
		const tiles = shuffledTiles();
		const total = tiles.length;

		const themeColor =
			getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim();

		// setup canvas state for reveal or hide
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		if (reveal) {
			ctx.fillStyle = themeColor;
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
							ctx.fillStyle = themeColor;
							ctx.fillRect(c * tw, r * th, tw + 0.5, th + 0.5);
						}
						drawn++;
					}
				}
			},
			startAt
		);
	}

	$: if (container) {
		const shouldShow = visible && project;
		if (shouldShow && project) {
			if (project.name !== lastProjectName) {
				lastProjectName = project.name;
				show();
			}
		} else {
			lastProjectName = '';
			hide();
		}
	}

	$: if (container && (posX || posY)) {
		gsap.to(container, {
			left: posX,
			top: posY,
			duration: 0.4,
			ease: 'power3.out'
		});
	}

	async function show() {
		await tick();
		if (!container) return;

		if (tl) tl.kill();
		tl = gsap.timeline();

		tl.set(container, {
			xPercent: -50,
			yPercent: -100,
			transformOrigin: 'bottom center',
			scaleY: 0,
			y: 0
		});

		tl.to(container, {
			opacity: 1,
			scaleY: 1,
			y: -12,
			duration: 0.5,
			ease: 'expo.out'
		});

		// hologram flicker
		tl.to(
			container,
			{
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

		// run tile reveal
		runTileReveal(true, 0.7, '<0.15');
	}

	function hide() {
		if (tl) tl.kill();
		tl = gsap.timeline();

		// fade out content
		if (content) {
			tl.to(content.children, {
				opacity: 0,
				y: -5,
				duration: 0.2,
				stagger: 0.03,
				ease: 'power2.in'
			});
		}

		// run tile cover
		runTileReveal(false, 0.25, '<');

		// collapse container
		tl.to(
			container,
			{
				opacity: 0,
				scaleY: 0,
				y: 0,
				duration: 0.3,
				ease: 'expo.in'
			},
			'-=0.1'
		);
	}
</script>

<div
	class="preview-container"
	bind:this={container}
	style:width="{width}px"
	style:height="{height}px"
>
	<div class="corner-accents"></div>
	{#if project}
		<div class="preview-card" bind:this={content}>
			<div class="header">
				<h3 class="name">{project.name.toUpperCase()} ...</h3>
				<div class="meta">
					<span class="symbol">&gt;</span>
					<span class="section">{project.section}</span>
					<span class="separator">→</span>
					<span class="date">{project.date}</span>
				</div>
			</div>

			<div class="content-area">
				<div class="preview-inner">
					<div class="image-box">
						<img src={project.image} alt={project.name} class="project-image" />
						<canvas bind:this={canvas} class="tile-canvas"></canvas>
					</div>
					<div class="text-footer">
						<div class="tags">
							{#each project.tags as tag, i (i + tag)}
								<span class="tag">[ {tag} ]</span>
							{/each}
						</div>
						<div class="id">{project.id}</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.preview-container {
		position: absolute;
		background: var(--color-bg);
		border: 1px solid var(--color-overlay-20);
		padding: 0;
		opacity: 0;
		pointer-events: none;
		z-index: 200;
		backdrop-filter: blur(4px);
		box-sizing: border-box;
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
			linear-gradient(to right, var(--color-text) 1px, transparent 1px) 0 0,
			linear-gradient(to bottom, var(--color-text) 1px, transparent 1px) 0 0,
			linear-gradient(to left, var(--color-text) 1px, transparent 1px) 100% 0,
			linear-gradient(to bottom, var(--color-text) 1px, transparent 1px) 100% 0,
			linear-gradient(to right, var(--color-text) 1px, transparent 1px) 0 100%,
			linear-gradient(to top, var(--color-text) 1px, transparent 1px) 0 100%,
			linear-gradient(to left, var(--color-text) 1px, transparent 1px) 100% 100%,
			linear-gradient(to top, var(--color-text) 1px, transparent 1px) 100% 100%;
		background-repeat: no-repeat;
		background-size: 10px 10px;
	}

	.preview-card {
		display: flex;
		flex-direction: column;
		height: 100%;
		box-sizing: border-box;
		position: relative;
		z-index: 1;
	}

	.header {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 0.44rem;
		padding: 0.8rem 0.8rem;
		flex-shrink: 0;

		font-family: 'Geist Mono', monospace;
		letter-spacing: 0.34%;
		font-size: 0.8rem;
		font-weight: 400;

		background: var(--color-overlay-02);
		border-bottom: 1px solid var(--color-overlay-20);
	}

	.header::before,
	.header::after {
		content: '';
		position: absolute;
		bottom: -10px;
		width: 10px;
		height: 20px;
		z-index: 10;
		pointer-events: none;
	}

	.header::before {
		left: -1px;
		background:
			linear-gradient(to right, var(--color-text) 1px, transparent 1px) 0 0,
			linear-gradient(to bottom, var(--color-text) 1px, transparent 1px) 0 50%;
		background-repeat: no-repeat;
		background-size:
			1px 100%,
			100% 1px;
	}

	.header::after {
		right: -1px;
		background:
			linear-gradient(to left, var(--color-text) 1px, transparent 1px) 100% 0,
			linear-gradient(to bottom, var(--color-text) 1px, transparent 1px) 100% 50%;
		background-repeat: no-repeat;
		background-size:
			1px 100%,
			100% 1px;
	}

	.name {
		color: var(--color-text);
		font-weight: 500;
		margin: 0;
		letter-spacing: 0.08em;
	}

	.meta {
		display: flex;
		align-items: center;
		color: var(--color-overlay-60);
		gap: 0.6rem;
	}

	.content-area {
		padding: 0.8rem 0.8rem 0.96rem 0.8rem;
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		min-height: 0;
		box-sizing: border-box;
	}

	.preview-inner {
		display: flex;
		flex-direction: column;
		flex: 1;
		border: 1px solid var(--color-overlay-20);
		overflow: hidden;
		background: var(--color-bg);
	}

	.image-box {
		width: 100%;
		flex: 1;
		min-height: 0;
		/* padding: 0.8rem; */
		/* background: #fff; */
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
	}

	.project-image {
		max-width: 100%;
		max-height: 100%;
		object-fit: contain;
		display: block;
	}

	.tile-canvas {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}

	.text-footer {
		padding: 0.6rem 0.8rem;
		display: flex;
		justify-content: space-between;
		align-items: center;

		background: var(--color-bg);
		color: var(--color-overlay-60);
		border-top: 1px solid var(--color-overlay-20);
		font-family: 'Geist Mono', monospace;
		font-weight: 500;
		letter-spacing: 0.34%;
		font-size: 0.7rem;

		flex-shrink: 0;
	}

	.tags {
		display: flex;
		gap: 0.5rem;
	}

	.tag {
		letter-spacing: 0.05em;
	}

	.id {
		opacity: 0.8;
	}
</style>
