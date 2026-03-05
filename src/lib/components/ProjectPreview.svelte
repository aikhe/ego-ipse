<script lang="ts">
	import { tick } from 'svelte';
	import gsap from 'gsap';

	export let project: {
		name: string;
		section: string;
		date: string;
		tags: readonly string[];
		id: string;
	} | null = null;
	export let visible = false;
	export let posX = 0;
	export let posY = 0;
	export let width = 260;
	export let height = 380;

	let container: HTMLDivElement;
	let content: HTMLDivElement;
	let tl: gsap.core.Timeline | null = null;
	let lastProjectName = '';

	$: if (container) {
		const shouldShow = visible && project;
		if (shouldShow) {
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
			opacity: 0,
			y: 0
		});

		tl.to(container, {
			opacity: 1,
			scaleY: 1,
			y: -12,
			duration: 0.5,
			ease: 'expo.out'
		});

		// Subtle hologram flicker
		tl.to(
			container,
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
	}

	function hide() {
		if (tl) tl.kill();
		tl = gsap.timeline();

		// 1. Fade out content first
		if (content) {
			tl.to(content.children, {
				opacity: 0,
				y: -5,
				duration: 0.2,
				stagger: 0.03,
				ease: 'power2.in'
			});
		}

		// 2. Collapse container
		tl.to(container, {
			opacity: 0,
			scaleY: 0,
			y: 0,
			duration: 0.3,
			ease: 'expo.in'
		}, "-=0.1");
	}
</script>

<div class="preview-container" bind:this={container} style:width="{width}px" style:height="{height}px">
	<div class="corner-accents"></div>
	{#if project}
		<div class="preview-card" bind:this={content}>
			<div class="header">
				<h3 class="name">{project.name.toUpperCase()} NAME ...</h3>
				<div class="meta">
					<span class="symbol">&gt;</span>
					<span class="section">{project.section}</span>
					<span class="separator">→</span>
					<span class="date">{project.date}</span>
				</div>
			</div>

			<div class="content-area">
				<div class="image-inner">
					<div class="scanlines"></div>
					<div class="footer-overlay">
						<div class="tags">
							{#each project.tags as tag}
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
		background: rgba(0, 0, 0, 0.9);
		border: 1px solid rgba(255, 255, 255, 0.1);
		padding: 0;
		opacity: 0;
		pointer-events: none;
		z-index: 200;
		backdrop-filter: blur(4px);
		box-sizing: border-box;
		/* Removed overflow: hidden to show corner borders */
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
			linear-gradient(to right, white 1px, transparent 1px) 0 0,
			linear-gradient(to bottom, white 1px, transparent 1px) 0 0,
			linear-gradient(to left, white 1px, transparent 1px) 100% 0,
			linear-gradient(to bottom, white 1px, transparent 1px) 100% 0,
			linear-gradient(to right, white 1px, transparent 1px) 0 100%,
			linear-gradient(to top, white 1px, transparent 1px) 0 100%,
			linear-gradient(to left, white 1px, transparent 1px) 100% 100%,
			linear-gradient(to top, white 1px, transparent 1px) 100% 100%;
		background-repeat: no-repeat;
		background-size: 6px 6px;
	}

	.preview-card {
		display: flex;
		flex-direction: column;
		height: 100%;
		box-sizing: border-box;
		overflow: hidden; /* Content clipping happens here now */
		position: relative;
		z-index: 1;
	}

	.header {
		display: flex;
		flex-direction: column;
		gap: 0.61rem;
		padding: 1rem 0.8rem;
		background: rgba(255, 255, 255, 0.04);
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		flex-shrink: 0;
	}

	.name {
		font-family: 'Geist Mono', monospace;
		font-size: 0.75rem;
		font-weight: 500;
		color: #fff;
		margin: 0;
		letter-spacing: 0.08em;
	}

	.meta {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		font-family: 'Geist Mono', monospace;
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.5);
	}

	.symbol {
		color: #fff;
	}

	.section, .date {
		letter-spacing: 0.02em;
	}

	.content-area {
		padding: 1rem 0.8rem 0.8rem 0.8rem;
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		min-height: 0;
		box-sizing: border-box;
	}

	.image-inner {
		width: 100%;
		flex-grow: 1;
		background: #000;
		border: 1px solid rgba(255, 255, 255, 0.1);
		position: relative;
		overflow: hidden;
		box-sizing: border-box;
	}

	.scanlines {
		position: absolute;
		inset: 0;
		background: linear-gradient(
			to bottom,
			transparent 50%,
			rgba(255, 255, 255, 0.02) 50%
		);
		background-size: 100% 4px;
		pointer-events: none;
		z-index: 1;
	}

	.footer-overlay {
		position: absolute;
		bottom: 0.8rem;
		left: 0.8rem;
		right: 0.8rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-family: 'Geist Mono', monospace;
		font-size: 0.7rem;
		color: rgba(255, 255, 255, 0.5);
		z-index: 2;
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
