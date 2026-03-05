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
	let reticleBorders: HTMLDivElement;
	let expandReticle: HTMLDivElement;

	const SIZE = 32;
	const DWELL = 400;
	const EXIT_DELAY = 100;

	onMount(() => {
		// cursor reticle: spins freely, follows mouse, fully independent
		const xTo = gsap.quickTo(reticle, 'x', { duration: 0.8, ease: 'power3.out' });
		const yTo = gsap.quickTo(reticle, 'y', { duration: 0.8, ease: 'power3.out' });
		gsap.set(reticle, { xPercent: -50, yPercent: -50, opacity: 0, width: SIZE, height: SIZE });
		gsap.to(reticleBorders, { rotation: 360, duration: 10, repeat: -1, ease: 'none' });

		// expand reticle: separate, always 0deg, locked to button
		gsap.set(expandReticle, { xPercent: -50, yPercent: -50, opacity: 0, width: 0, height: 0 });

		let dwellTimer: ReturnType<typeof setTimeout> | null = null;
		let collapseTimer: ReturnType<typeof setTimeout> | null = null;
		let expanded = false;

		const isItem = (el: EventTarget | null) =>
			projectItems.some((item) => item.contains(el as Node));

		const collapseExpand = () => {
			if (!expanded) return;
			expanded = false;
			gsap.to(expandReticle, {
				width: 0,
				height: 0,
				opacity: 0,
				duration: 0.4,
				ease: 'power3.inOut'
			});
		};

		projectItems.forEach((item) => {
			if (!item) return;
			const bg = item.querySelector('.project--bg');
			const arrow = item.querySelector('.arrow');

			item.addEventListener('mouseenter', (e: MouseEvent) => {
				clearTimeout(dwellTimer!);
				clearTimeout(collapseTimer!);
				gsap.killTweensOf([bg, arrow, item]);

				// slide expand reticle to new button if already active
				if (expanded) {
					const rect = item.getBoundingClientRect();
					gsap.to(expandReticle, {
						x: rect.left + rect.width / 2,
						y: rect.top + rect.height / 2,
						width: rect.width,
						height: rect.height,
						duration: 0.5,
						ease: 'power3.inOut'
					});
				}

				gsap.to(bg, { opacity: 1, duration: 0.3, ease: 'power3.out' });
				gsap.to(item, { zIndex: 20, padding: '0 0.6rem', duration: 0.3, ease: 'power3.out' });
				gsap.to(arrow, { opacity: 0, duration: 0.2, ease: 'power3.out' });

				// cursor reticle + dwell only when not already in expand state
				if (!expanded) {
					if (!isItem(e.relatedTarget)) {
						// fresh hover: snap cursor reticle to right & fade in
						const rect = item.getBoundingClientRect();
						gsap.set(reticle, { x: rect.right, y: rect.top + rect.height / 2 });
						gsap.to(reticle, { opacity: 1, duration: 0.3, ease: 'power3.out' });
					}

					dwellTimer = setTimeout(() => {
						expanded = true;
						const rect = item.getBoundingClientRect();
						const cx = rect.left + rect.width / 2;
						const cy = rect.top + rect.height / 2;

						gsap.to(reticle, { opacity: 0, duration: 0.2, ease: 'power3.out' });
						gsap.set(expandReticle, { x: cx, y: cy, width: 0, height: 0 });
						gsap.to(expandReticle, {
							width: rect.width,
							height: rect.height,
							opacity: 1,
							duration: 0.5,
							ease: 'power3.out'
						});
					}, DWELL);
				}
			});

			item.addEventListener('mousemove', (e: MouseEvent) => {
				xTo(e.clientX);
				yTo(e.clientY);
			});

			item.addEventListener('mouseleave', (e: MouseEvent) => {
				clearTimeout(dwellTimer!);
				gsap.killTweensOf([bg, arrow, item]);
				gsap.to(bg, { opacity: 0, duration: 0.3, ease: 'power3.out' });
				gsap.to(item, { zIndex: 1, padding: '0', duration: 0.3, ease: 'power3.out' });
				gsap.to(arrow, { opacity: 0.8, duration: 0.3, ease: 'power3.out' });

				if (!isItem(e.relatedTarget)) {
					// delay collapse so reticle lingers briefly after leaving
					collapseTimer = setTimeout(() => {
						collapseExpand();
						gsap.to(reticle, { opacity: 0, duration: 0.3, ease: 'power3.out' });
					}, EXIT_DELAY);
				}
			});
		});
	});
</script>

<!-- cursor reticle: spins, follows mouse -->
<div class="reticle" bind:this={reticle}>
	<div class="reticle-borders" bind:this={reticleBorders}></div>
	<div class="reticle-box"></div>
</div>

<!-- expand reticle: static 0deg, locks to hovered button on dwell -->
<div class="reticle reticle--expand" bind:this={expandReticle}></div>

<div class="info__projects">
	{#each projects as project, i (project.name)}
		<a href={resolve(project.href)} class="project--item" bind:this={projectItems[i]}>
			<div class="project--bg"></div>
			<span>{project.name}</span>
			<span class="arrow"><IconArrow size={12} /></span>
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

	/* shared reticle base */
	.reticle {
		position: fixed;
		top: 0;
		left: 0;
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

	/* 1px corner brackets via css gradients — adapts to any size */
	.reticle-borders,
	.reticle--expand {
		background-image:
			linear-gradient(to right, white 1px, transparent 1px),
			linear-gradient(to bottom, white 1px, transparent 1px),
			linear-gradient(to left, white 1px, transparent 1px),
			linear-gradient(to bottom, white 1px, transparent 1px),
			linear-gradient(to right, white 1px, transparent 1px),
			linear-gradient(to top, white 1px, transparent 1px),
			linear-gradient(to left, white 1px, transparent 1px),
			linear-gradient(to top, white 1px, transparent 1px);
		background-position:
			0 0,
			0 0,
			100% 0,
			100% 0,
			0 100%,
			0 100%,
			100% 100%,
			100% 100%;
		background-repeat: no-repeat;
		background-size: 6px 6px;
	}

	/* solid 4px center dot */
	.reticle-box {
		background: none;
	}

	.reticle-box::after {
		content: '';
		width: 4px;
		height: 4px;
		background: white;
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
