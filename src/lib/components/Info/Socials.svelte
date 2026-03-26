<script lang="ts">
	import SocialCard from './SocialCard.svelte';
	import gsap from 'gsap';
	import xIcon from '$lib/assets/socials/X.png';

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
		image: string;
	}

	// github stats index in socials array
	const GITHUB_INDEX = 2;

	let socials = $state<Social[]>([
		{
			name: 'X(TWITTER)',
			href: 'https://x.com/aikheandrie',
			external: true,
			handle: '@aikheandrei',
			bioPrefix: 'BIO',
			bioHighlight: '→ ANTI SLOP',
			image: xIcon,
			stats: [
				{ label: 'FOLLOWING', value: '164' },
				{ label: 'FOLLOWERS', value: '7' },
				{ label: 'POSTS', value: '20' },
				{ label: 'LIKES', value: '12' }
			],
			tags: ['X', 'SOCIAL'],
			status: 'ACTIVE...'
		},
		{
			name: 'LINKEDIN',
			href: 'https://www.linkedin.com/in/ike-rosacay-5a8b12316/',
			external: true,
			handle: 'aikhe-andrei',
			bioPrefix: 'PROFESSIONAL',
			bioHighlight: '→ ENG',
			image: xIcon,
			stats: [
				{ label: 'CONNECTS', value: '268' },
				{ label: 'POSTS', value: '1' },
				{ label: 'SKILLS', value: '12' }
			],
			tags: ['LINKEDIN', 'WORK'],
			status: 'ONLINE...'
		},
		{
			name: 'GITHUB',
			href: 'https://github.com/aikhe',
			external: true,
			handle: 'aikhe',
			bioPrefix: 'OS',
			bioHighlight: '→ ARCH & NEOVIM',
			image: xIcon,
			stats: [
				{ label: 'CONTRIBUTIONS', value: '—' },
				{ label: 'STARS', value: '—' },
				{ label: 'REPOS', value: '—' },
				{ label: 'FOLLOWERS', value: '—' }
			],
			tags: ['GITHUB', 'CODE'],
			status: 'PUSHING...'
		},
		{
			name: 'ABOUT',
			href: 'https://aikhe.pages.dev/about',
			external: false,
			handle: '@aikhe',
			bioPrefix: 'ORIGIN',
			bioHighlight: '→ HUMAN ENTITY',
			image: xIcon,
			stats: [
				{ label: 'AGE', value: '24' },
				{ label: 'LOC', value: 'SEA' },
				{ label: 'EXP', value: '5Y' }
			],
			tags: ['ABOUT', 'INTERNAL'],
			status: 'WIP...'
		},
		{
			name: 'BLOG',
			href: 'https://acedia.pages.dev/blog',
			external: false,
			handle: 'log_entry',
			bioPrefix: 'DATA',
			bioHighlight: '→ THOUGHTS',
			image: xIcon,
			stats: [
				{ label: 'ENTRIES', value: '8' },
				{ label: 'TOPIC', value: 'CODE\\AI\\ART' }
			],
			tags: ['BLOG', 'DATA'],
			status: 'INITIALIZING...'
		},
		{
			name: 'ACEDIA',
			href: 'https://acedia.pages.dev/',
			external: false,
			handle: 'null_state',
			bioPrefix: 'VOID',
			bioHighlight: '→ EXPERIMENT',
			image: xIcon,
			stats: [
				{ label: 'STATUS', value: 'OFFLINE' },
				{ label: 'VERSION', value: '0.0.1' }
			],
			tags: ['EXPERIMENTAL', 'VOID'],
			status: 'IN PROGRESS...'
		}
	]);

	// fetch github stats on mount
	$effect(() => {
		const username = 'aikhe';

		(async () => {
			const [userRes, reposRes, searchRes] = await Promise.all([
				fetch(`https://api.github.com/users/${username}`),
				fetch(`https://api.github.com/users/${username}/repos?per_page=100`),
				fetch(`https://api.github.com/search/commits?q=author:${username}`, {
					headers: { Accept: 'application/vnd.github.cloak-preview+json' }
				})
			]);

			if (!userRes.ok || !reposRes.ok) return;

			const user = await userRes.json();
			const repos: { stargazers_count: number }[] = await reposRes.json();
			const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
			const contributions = searchRes.ok ? (await searchRes.json()).total_count ?? '—' : '—';

			socials[GITHUB_INDEX].stats = [
				{ label: 'CONTRIBUTIONS', value: String(contributions) },
				{ label: 'STARS', value: String(totalStars) },
				{ label: 'REPOS', value: String(user.public_repos) },
				{ label: 'FOLLOWERS', value: String(user.followers) }
			];
		})();
	});

	// glitch palette
	const smallSymbols = '·.:,;+-';
	const largeSymbols = 'urilQZXW';

	let displayTexts = $state<string[]>(socials.map((s) => s.name));
	let intervals: (ReturnType<typeof setInterval> | null)[] = socials.map(() => null);
	let hoveredIndex = $state<number | null>(null);
	let isSocialRevealed = $state(false);

	let linkElements = $state<HTMLAnchorElement[]>([]);
	let boxElements = $state<HTMLDivElement[]>([]);
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

		// track during the entrance animation (0.5s) and slightly beyond
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

		// only reset global reveal state if the link being exited is the one currently active
		// this prevents rapid transitions from killing the state of the *new* hover
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
		color: var(--color-text);
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
		background-color: var(--color-text);
		transform: translateY(100%);
		transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
		z-index: -1;
	}

	.socials__link:hover {
		color: var(--color-text-inv);
	}

	.socials__link:hover::before {
		transform: translateY(0);
	}

	.socials__box {
		position: absolute;
		width: 0.43rem;
		height: 0.43rem;
		background: var(--color-text-inv);
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
		stroke: var(--color-overlay-40);
		stroke-width: 1px;
		opacity: 0;
	}
</style>
