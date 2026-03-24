<script lang="ts">
	import { tick } from 'svelte';
	import gsap from 'gsap';

	interface Social {
		name: string;
		href: string;
		external: boolean;
		handle?: string;
		bioPrefix?: string;
		bioHighlight?: string;
		stats?: { label: string; value: string }[];
		tags?: string[];
		status?: string;
		image?: string;
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

		const themeColor =
			getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim();

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
			transformOrigin: 'bottom left',
			scaleY: 0,
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
	<div class="social-card__accents"></div>
	{#if displaySocial}
		<div class="social-card__inner" bind:this={content}>
			<div class="social-card__side social-card__side--left">
				<div class="social-card__user">
					<p class="social-card__handle">{displaySocial.handle || '@aikheandrei'}</p>
					<p class="social-card__bio">
						&gt; {displaySocial.bioPrefix || 'BIO'}
						<strong class="social-card__bio--strong"
							>{displaySocial.bioHighlight || '→ CREATIVE DEV'}</strong
						>
					</p>
				</div>
				<div class="social-card__stats">
					{#if displaySocial.stats}
						{#each displaySocial.stats as stat (stat.label)}
							<div class="social-card__stat">
								<span class="social-card__stat-label">{stat.label}:</span>
								<span class="social-card__stat-val">[{stat.value}]</span>
							</div>
						{/each}
					{:else}
						<div class="social-card__stat">
							<span class="social-card__stat-label">FOLLOWING:</span>
							<span class="social-card__stat-val">[939]</span>
						</div>
						<div class="social-card__stat">
							<span class="social-card__stat-label">FOLLOWERS:</span>
							<span class="social-card__stat-val">[4,426]</span>
						</div>
						<div class="social-card__stat">
							<span class="social-card__stat-label">LEVEL:</span>
							<span class="social-card__stat-val">[99]</span>
						</div>
						<div class="social-card__stat">
							<span class="social-card__stat-label">RANK:</span>
							<span class="social-card__stat-val">[S]</span>
						</div>
					{/if}
				</div>
				<div class="social-card__bottom">
					<div class="social-card__tags">
						{#if displaySocial.tags}
							{#each displaySocial.tags as tag (tag)}
								<span class="social-card__tag">[ {tag} ]</span>
							{/each}
						{:else}
							<span class="social-card__tag">[ {displaySocial.name} ]</span>
							<span class="social-card__tag"
								>[ {displaySocial.external ? 'SOCIAL' : 'INTERNAL'} ]</span
							>
						{/if}
					</div>
					<button class="social-card__status"> {displaySocial.status || 'ACTIVE...'} </button>
				</div>
			</div>
			<div class="social-card__side social-card__side--right">
				<div class="social-card__preview">
					<img src={displaySocial.image} alt="Preview" class="social-card__img" />
					<div class="social-card__dot social-card__dot--tl"></div>
					<div class="social-card__dot social-card__dot--tr"></div>
					<div class="social-card__dot social-card__dot--bl"></div>
					<div class="social-card__dot social-card__dot--br"></div>
					<canvas bind:this={canvas} class="social-card__canvas"></canvas>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.social-card {
		position: absolute;
		bottom: calc(100% - 1rem);
		right: 0;
		width: calc(50% - 0.6rem); /* 3 grid columns */
		height: auto;
		background: var(--color-bg);
		border: 1px solid var(--color-overlay-20);
		opacity: 0;
		pointer-events: none;
		z-index: 999;
		box-sizing: border-box;
		transform-origin: bottom left;
		backdrop-filter: blur(4px);
	}

	.social-card__accents {
		position: absolute;
		inset: -1px;
		pointer-events: none;
		z-index: 5;
	}

	.social-card__accents::before {
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

	.social-card__inner {
		display: grid;
		grid-template-columns: 1fr 1fr;
		min-height: 12.5rem;
		padding: 1rem;
		box-sizing: border-box;
		gap: 1rem;
	}

	.social-card__side--left {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		font-family: 'Geist Mono', monospace;
	}

	.social-card__user {
		margin-bottom: 0rem;
		display: flex;
		flex-direction: column;
		row-gap: 0.24rem;
	}

	.social-card__handle {
		color: var(--color-text);
		margin: 0;
		font-family: 'Geist Mono', monospace;
		letter-spacing: 0.034em;
		font-size: 0.8rem;
		font-weight: 400;
	}

	.social-card__bio {
		color: var(--color-overlay-60);
		margin: 0.1rem 0 0 0;
		font-family: 'Geist Mono', monospace;
		letter-spacing: 0.034em;
		font-size: 0.8rem;
		font-weight: 400;
		text-wrap: nowrap;
	}

	.social-card__bio--strong {
		color: var(--color-text);
		font-weight: 400;
	}

	.social-card__stats {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
		margin: 0.4rem 0;
	}

	.social-card__stat {
		display: flex;
		justify-content: flex-start;
		gap: 1.86rem;
		font-family: 'Geist Mono', monospace;
		letter-spacing: 0.034em;
		font-size: 0.8rem;
		font-weight: 400;
		line-height: 1.2;
	}

	.social-card__stat-label {
		color: var(--color-overlay-60);
		width: 85px;
		flex-shrink: 0;
	}

	.social-card__stat-val {
		color: var(--color-text);
		flex-grow: 1;
	}

	.social-card__bottom {
		margin-top: auto;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	.social-card__tags {
		display: flex;
		gap: 0.4rem;
	}

	.social-card__tag {
		color: var(--color-text);
		font-family: 'Geist Mono', monospace;
		letter-spacing: 0.034em;
		font-weight: 400;
		font-size: 0.7rem;
		white-space: nowrap;
	}

	.social-card__status {
		width: 100%;
		padding: 0.24rem;
		background: var(--color-overlay-02);
		border: 1px solid var(--color-overlay-20);
		color: var(--color-overlay-60);
		font-family: 'Geist Mono', monospace;
		letter-spacing: 0.034em;
		font-weight: 400;
		font-size: 0.8rem;
		text-align: center;
		transition: background 0.2s ease;
		cursor: default;
	}

	.social-card__side--right {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.social-card__preview {
		width: 100%;
		aspect-ratio: 1 / 1;
		border: 1px dashed var(--color-overlay-60);
		position: relative;
		background: var(--color-bg);
		overflow: visible;
		display: flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
	}

	.social-card__img {
		max-width: 100%;
		max-height: 100%;
		object-fit: contain;
		display: block;
	}

	.social-card__dot {
		position: absolute;
		width: 4px;
		height: 4px;
		background: var(--color-text);
		z-index: 100;
	}

	.social-card__dot--tl {
		top: -1px;
		left: -1px;
	}
	.social-card__dot--tr {
		top: -1px;
		right: -1px;
	}
	.social-card__dot--bl {
		bottom: -1px;
		left: -1px;
	}
	.social-card__dot--br {
		bottom: -1px;
		right: -1px;
	}

	.social-card__canvas {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}
</style>
