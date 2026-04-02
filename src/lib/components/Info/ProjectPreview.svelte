<script lang="ts">
	import { tick } from 'svelte';
	import gsap from 'gsap';
	import { runTileReveal } from '$lib/utils/tiles';

	interface Props {
		project?: {
			name: string;
			section: string;
			date: string;
			tags: readonly string[];
			id: string;
			image?: string;
		} | null;
		visible?: boolean;
		posX?: number;
		posY?: number;
		width?: number;
		height?: number;
	}

	let {
		project = null,
		visible = false,
		posX = 0,
		posY = 0,
		width = 260,
		height = 380
	}: Props = $props();

	let container = $state<HTMLDivElement>();
	let content = $state<HTMLDivElement>();
	let canvas = $state<HTMLCanvasElement>();
	let tl: gsap.core.Timeline | null = null;
	let lastProjectName = $state('');

	const COLS = 20;
	const ROWS = 28;

	$effect(() => {
		if (container) {
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
	});

	$effect(() => {
		if (container && (posX || posY)) {
			gsap.to(container, {
				left: posX,
				top: posY,
				duration: 0.4,
				ease: 'power3.out'
			});
		}
	});

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

		if (canvas) {
			runTileReveal(canvas, tl, COLS, ROWS, true, 0.7, '<0.15');
		}
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

		if (canvas && tl) {
			runTileReveal(canvas, tl, COLS, ROWS, false, 0.25, '<');
		}

		// collapse container
		tl.to(
			container!,
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
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
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
