<script lang="ts">
	import SocialCard from './SocialCard.svelte';
	import gsap from 'gsap';

	const socials = [
		{ name: 'X(TWITTER)', href: 'https://twitter.com', external: true },
		{ name: 'LINKEDIN', href: 'https://linkedin.com', external: true },
		{ name: 'GITHUB', href: 'https://github.com', external: true },
		{ name: 'ABOUT', href: '/', external: false },
		{ name: 'BLOG', href: '/', external: false },
		{ name: 'ACEDIA', href: '/', external: false }
	] as const;

	// glitch palette
	const smallSymbols = '·.:,;+-';
	const largeSymbols = 'urilQZXW';

	let displayTexts = $state<string[]>(socials.map((s) => s.name));
	let intervals: (ReturnType<typeof setInterval> | null)[] = socials.map(() => null);
	let hoveredIndex = $state<number | null>(null);
	let isSocialRevealed = $state(false);

	let linkElements: HTMLAnchorElement[] = [];
	let boxElements: HTMLDivElement[] = [];
	let container = $state<HTMLDivElement>();
	let lineL = $state<SVGPolylineElement>();
	let lineR = $state<SVGPolylineElement>();
	let lineTracking: gsap.core.Tween | null = null;

	const activeSocial = $derived(hoveredIndex !== null ? socials[hoveredIndex] : null);

	function startGlitch(index: number) {
		const original = socials[index].name;
		let frames = 0;
		const revealSpeed = 1; // 1 frame per character reveal
		const totalFrames = original.length * revealSpeed + 10; // slightly shorter tail

		// pre-calculate random resolution delays for each character to keep randomness
		const resolveDelays = original.split('').map(() => Math.floor(Math.random() * 4)); // max 4 frames delay instead of 6

		hoveredIndex = index;
		isSocialRevealed = false;

		if (intervals[index]) clearInterval(intervals[index]);

		intervals[index] = setInterval(() => {
			const charsToShow = Math.min(original.length, Math.floor(frames / revealSpeed) + 1);

			displayTexts[index] = original
				.split('')
				.map((_, i) => {
					if (i >= charsToShow) return ''; // character not yet revealed

					const appearedFrame = i * revealSpeed;
					const progress = frames - appearedFrame - resolveDelays[i];

					if (progress > 5) return original[i]; // resolves faster
					if (progress > 2) return largeSymbols[Math.floor(Math.random() * largeSymbols.length)];
					return smallSymbols[Math.floor(Math.random() * smallSymbols.length)];
				})
				.join('');

			if (frames > totalFrames) {
				if (intervals[index]) clearInterval(intervals[index]);
				displayTexts[index] = original;
				isSocialRevealed = true;
				summonBox(index);
				summonLines(index);
			}
			frames++;
		}, 20); // 20ms per frame for a slightly faster overall tick
	}

	function summonBox(index: number) {
		const link = linkElements[index];
		const box = boxElements[index];
		if (!link || !box) return;

		const w = link.offsetWidth;
		const h = link.offsetHeight;
		const boxSize = 7; // roughly 0.43rem in px

		const minX = w * 0.4;
		const maxX = w * 0.9;
		const x = minX + Math.random() * (maxX - minX - boxSize);
		// follow project button logic for Y: center + jitter
		const y = h / 2 - boxSize / 2 + (Math.random() * 10 - 5);

		gsap.killTweensOf(box);
		gsap.set(box, { x, y, opacity: 0 });
		gsap.to(box, { opacity: 1, duration: 0.4, ease: 'power3.out' });
	}

	function summonLines(index: number) {
		const box = boxElements[index];
		if (!box || !lineL || !lineR) return;

		const card = document.querySelector('.social-card');
		const info = box.closest('.info');
		if (!card || !info) return;

		gsap.killTweensOf([lineL, lineR]);

		const update = () => {
			if (hoveredIndex !== index) {
				if (lineTracking) lineTracking.kill();
				return;
			}
			const infoRect = info.getBoundingClientRect();
			const boxRect = box.getBoundingClientRect();
			const cardRect = card.getBoundingClientRect();

			// box center in local coords relative to .info
			const bx = boxRect.left + boxRect.width / 2 - infoRect.left;
			const by = boxRect.top + boxRect.height / 2 - infoRect.top;

			// card bottom corners in local coords relative to .info
			const clx = cardRect.left - infoRect.left;
			const crx = cardRect.right - infoRect.left;
			const cby = cardRect.bottom - infoRect.top;

			lineL!.setAttribute('points', `${bx},${by} ${clx},${cby}`);
			lineR!.setAttribute('points', `${bx},${by} ${crx},${cby}`);
		};

		gsap.killTweensOf([lineL, lineR]);
		gsap.set([lineL, lineR], { opacity: 0 });
		gsap.to([lineL, lineR], { opacity: 1, duration: 0.3 });

		// Track during the entrance animation (0.5s) and slightly beyond
		lineTracking = gsap.to(
			{},
			{
				duration: 0.7,
				onUpdate: update
			}
		);
	}

	function stopGlitch(index: number) {
		if (intervals[index]) clearInterval(intervals[index]);
		displayTexts[index] = socials[index].name;

		// Only reset global reveal state if the link being exited is the one currently active
		// This prevents rapid transitions from killing the state of the *new* hover
		if (hoveredIndex === index) {
			hoveredIndex = null;
			isSocialRevealed = false;

			if (lineTracking) lineTracking.kill();
			if (lineL && lineR) {
				gsap.killTweensOf([lineL, lineR]);
				gsap.to([lineL, lineR], { opacity: 0, duration: 0.2, overwrite: true });
			}
		}

		const box = boxElements[index];
		if (box) {
			gsap.killTweensOf(box);
			gsap.to(box, { opacity: 0, duration: 0.2, overwrite: true });
		}
	}
</script>

<div class="socials" bind:this={container}>
	<div class="socials__grid">
		<div class="socials__col">
			{#each socials.slice(0, 3) as social, i (social.name)}
				<a
					href={social.href}
					rel={social.external ? 'external' : undefined}
					class="socials__link"
					onmouseenter={() => startGlitch(i)}
					onmouseleave={() => stopGlitch(i)}
					bind:this={linkElements[i]}
				>
					{displayTexts[i]}
					<div class="socials__box" bind:this={boxElements[i]}></div>
				</a>
			{/each}
		</div>
		<div class="socials__col">
			{#each socials.slice(3, 6) as social, i (social.name)}
				<a
					href={social.href}
					rel={social.external ? 'external' : undefined}
					class="socials__link"
					onmouseenter={() => startGlitch(i + 3)}
					onmouseleave={() => stopGlitch(i + 3)}
					bind:this={linkElements[i + 3]}
				>
					{displayTexts[i + 3]}
					<div class="socials__box" bind:this={boxElements[i + 3]}></div>
				</a>
			{/each}
		</div>
	</div>

	<svg class="socials__connector">
		<polyline bind:this={lineL} points="0,0 0,0 0,0" />
		<polyline bind:this={lineR} points="0,0 0,0 0,0" />
	</svg>

	<SocialCard social={activeSocial} visible={isSocialRevealed} />
</div>

<style>
	.socials {
		/* static positioning to allow absolute children (SVG/Card) to reference .info parent */
		position: static;
	}

	.socials__grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.2rem;
	}

	.socials__col {
		display: flex;
		flex-direction: column;
	}

	.socials__link {
		font-family: 'Geist Mono', monospace;
		font-weight: 400;
		letter-spacing: 0.34%;
		font-size: 0.875rem;
		line-height: 18px;
		position: relative;
		display: block;
		width: 100%;
		overflow: hidden;
		color: #fff;
		text-decoration: none;
		z-index: 1;
		transition: color 0.1s ease;
	}

	.socials__link::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: #fff;
		transform: translateY(100%);
		transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
		z-index: -1;
	}

	.socials__link:hover {
		color: #000;
	}

	.socials__link:hover::before {
		transform: translateY(0);
	}

	.socials__box {
		position: absolute;
		width: 0.43rem;
		height: 0.43rem;
		background: #000;
		pointer-events: none;
		opacity: 0;
		z-index: 2;
		top: 0;
		left: 0;
	}

	.socials__connector {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		overflow: visible;
		z-index: 50;
	}

	.socials__connector polyline {
		fill: none;
		stroke: rgba(255, 255, 255, 0.4);
		stroke-width: 1px;
		opacity: 0;
	}
</style>
