<script lang="ts">
	import SocialCard from './SocialCard.svelte';

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
			}
			frames++;
		}, 20); // 20ms per frame for a slightly faster overall tick
	}

	function stopGlitch(index: number) {
		if (intervals[index]) clearInterval(intervals[index]);
		displayTexts[index] = socials[index].name;
		hoveredIndex = null;
		isSocialRevealed = false;
	}
</script>

<div class="socials">
	<div class="socials__col">
		{#each socials.slice(0, 3) as social, i (social.name)}
			<a
				href={social.href}
				rel={social.external ? 'external' : undefined}
				class="socials__link"
				onmouseenter={() => startGlitch(i)}
				onmouseleave={() => stopGlitch(i)}
			>
				{displayTexts[i]}
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
			>
				{displayTexts[i + 3]}
			</a>
		{/each}
	</div>
</div>

<SocialCard social={activeSocial} visible={isSocialRevealed} />

<style>
	.socials {
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
</style>
