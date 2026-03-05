<script lang="ts">
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import gsap from 'gsap';
	import IconArrow from '$lib/components/IconArrow.svelte';

	const projects = [
		{ name: 'Sample', href: '/' },
		{ name: 'Project', href: '/' },
		{ name: 'Placeholder', href: '/' },
		{ name: 'Lorem Ipsum', href: '/' },
		{ name: 'To Be Replaced', href: '/' }
	] as const;

	let projectItems: HTMLAnchorElement[] = [];
	let reticle: HTMLDivElement;

	onMount(() => {
		const xTo = gsap.quickTo(reticle, 'x', { duration: 0.8, ease: 'power3.out' });
		const yTo = gsap.quickTo(reticle, 'y', { duration: 0.8, ease: 'power3.out' });
		gsap.set(reticle, { xPercent: -50, yPercent: -50, opacity: 0 });

		// check if a node belongs to any project item
		const isItem = (el: EventTarget | null) =>
			projectItems.some((item) => item.contains(el as Node));

		projectItems.forEach((item) => {
			if (!item) return;
			const bg = item.querySelector('.project--bg');
			const arrow = item.querySelector('.arrow');

			item.addEventListener('mouseenter', (e: MouseEvent) => {
				gsap.killTweensOf([bg, arrow, item]);

				// fresh hover from outside: snap reticle to right of this button & fade in
				if (!isItem(e.relatedTarget)) {
					const rect = item.getBoundingClientRect();
					gsap.set(reticle, { x: rect.right, y: rect.top + rect.height / 2 });
					gsap.to(reticle, { opacity: 1, duration: 0.3, ease: 'power3.out' });
				}
				// transitioning from another item: reticle stays where it is, no interruption

				gsap.to(bg, { opacity: 1, duration: 0.3, ease: 'power3.out' });
				gsap.to(item, { zIndex: 20, padding: '0 0.6rem', duration: 0.3, ease: 'power3.out' });
				gsap.to(arrow, { opacity: 0, duration: 0.2, ease: 'power3.out' });
			});

			item.addEventListener('mousemove', (e: MouseEvent) => {
				xTo(e.clientX);
				yTo(e.clientY);
			});

			item.addEventListener('mouseleave', (e: MouseEvent) => {
				gsap.killTweensOf([bg, arrow, item]);
				gsap.to(bg, { opacity: 0, duration: 0.3, ease: 'power3.out' });
				gsap.to(item, { zIndex: 1, padding: '0', duration: 0.3, ease: 'power3.out' });
				gsap.to(arrow, { opacity: 0.8, duration: 0.3, ease: 'power3.out' });

				// only fade out when truly leaving all project items
				if (!isItem(e.relatedTarget)) {
					gsap.to(reticle, { opacity: 0, duration: 0.3, ease: 'power3.out' });
				}
			});
		});
	});
</script>

<!-- global reticle, fixed to viewport, tracks cursor across all items -->
<div class="reticle" bind:this={reticle}>
	<div class="reticle-borders">
		<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M1 7V1H7M25 1H31V7M31 25V31H25M7 31H1V25" stroke="white" stroke-width="1" />
		</svg>
	</div>
	<div class="reticle-box">
		<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
			<rect x="13" y="13" width="6" height="6" fill="white" />
		</svg>
	</div>
</div>

<div class="info__projects">
	{#each projects as project, i (project.name)}
		<a href={resolve(project.href)} class="project--item" bind:this={projectItems[i]}>
			<div class="project--bg"></div>
			<span>{project.name}</span>
			<span class="arrow"><IconArrow /></span>
		</a>
	{/each}
	<button class="project--more">MORE ...</button>
</div>

<style>
	.info__projects {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0 1.2rem;
	}

	.project--item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 48px;
		position: relative;

		font-weight: 400;
		font-size: 1.2rem;
		letter-spacing: 0.34%;
		color: #fff;
		text-decoration: none;

		border-bottom: 1px solid rgba(255, 255, 255, 0.2);
	}

	.project--bg {
		position: absolute;
		inset: 0;
		background: linear-gradient(90deg, transparent 10%, #7892c1 80%, #b8d6d9 100%);
		opacity: 0;
		z-index: 0;
		pointer-events: none;
	}

	.project--item:nth-child(-n + 2) {
		border-top: 1px solid rgba(255, 255, 255, 0.2);
	}

	.project--item span {
		position: relative;
		z-index: 1;
		flex-shrink: 0;
	}

	.arrow {
		opacity: 0.8;
	}

	.arrow :global(svg) {
		width: 1rem;
		height: 1rem;
	}

	/* global reticle */
	.reticle {
		position: fixed;
		top: 0;
		left: 0;
		width: 32px;
		height: 32px;
		pointer-events: none;
		z-index: 999;
	}

	.reticle-borders,
	.reticle-box {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.reticle-borders {
		animation: rotate-reticle 10s linear infinite;
	}

	@keyframes rotate-reticle {
		to {
			transform: rotate(360deg);
		}
	}

	.reticle-borders svg,
	.reticle-box svg {
		width: 100%;
		height: 100%;
	}

	.project--more {
		height: 48px;
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid #363636;
		margin-top: -1px;

		color: #fff;
		font-family: 'Geist Mono', monospace;
		font-weight: 400;
		letter-spacing: 0.34%;
		font-size: 0.875rem;
		line-height: 18px;

		cursor: pointer;
		position: relative;
		display: flex;
		align-items: center;
		padding-left: 1rem;
	}

	.project--more::before {
		content: '';
		position: absolute;
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
		pointer-events: none;
	}

	.project--more:hover {
		background: rgba(255, 255, 255, 0.05);
		border-color: #444;
	}
</style>
