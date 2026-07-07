<script lang="ts">
  import gsap from 'gsap';

  import { startGlitch as runGlitch } from '$lib/utils/glitch';
  import { getOpenPanel } from '$lib/analytics';
  import { getStageScale } from '$lib/utils/stageScale';

  import SocialCard from './SocialCard.svelte';
  import type { Social } from '$lib/types/social';

  let {
    socials: _socials = [],
    github = null,
  }: { socials: Social[]; github?: Social | null } = $props();

  let gitStats = $state<{ label: string; value: string }[]>([]);

  let socials = $derived(
    _socials.map((s, i) =>
      i === 2 && s.name === '' && github
        ? { ...github, stats: gitStats.length ? gitStats : github.stats }
        : s
    )
  );

  // fetch github stats directly (browser IP, not shared Cloudflare IP)
  $effect(() => {
    (async () => {
      try {
        const [userRes, reposRes, commitsRes] = await Promise.all([
          fetch('https://api.github.com/users/aikhe'),
          fetch('https://api.github.com/users/aikhe/repos?per_page=100'),
          fetch(
            'https://api.github.com/search/commits?q=author:aikhe&per_page=1'
          ),
        ]);
        if (!userRes.ok || !reposRes.ok) return;

        const user = await userRes.json();
        const repos: { stargazers_count: number }[] = await reposRes.json();
        const totalStars = repos.reduce(
          (sum, r) => sum + r.stargazers_count,
          0
        );

        let totalContributions = '—';
        if (commitsRes.ok) {
          const commitsData = await commitsRes.json();
          totalContributions = String(commitsData.total_count ?? '—');
        }

        gitStats = [
          { label: 'CONTRIBUTION', value: totalContributions },
          { label: 'STARS', value: String(totalStars) },
          { label: 'REPOS', value: String(user.public_repos) },
          { label: 'FOLLOWERS', value: String(user.followers) },
        ];
      } catch {
        // keep placeholder on network error
      }
    })();
  });

  let displayTexts = $state<string[]>([]);
  let intervals: (ReturnType<typeof setInterval> | null)[] = $state([]);

  $effect(() => {
    displayTexts = socials.map(s => s.name);
    intervals = socials.map(() => null);
  });
  let hoveredIndex = $state<number | null>(null);
  let isSocialRevealed = $state(false);

  let linkElements = $state<HTMLAnchorElement[]>([]);
  let boxElements = $state<HTMLDivElement[]>([]);
  let container = $state<HTMLDivElement>();
  let lineL = $state<SVGPolylineElement>();
  let lineR = $state<SVGPolylineElement>();
  let lineTracking: gsap.core.Tween | null = null;

  const activeSocial = $derived(
    hoveredIndex !== null ? socials[hoveredIndex] : null
  );

  function startGlitch(index: number) {
    if (socials[index]?.name === '') return;
    hoveredIndex = index;
    isSocialRevealed = false;

    if (intervals[index]) clearInterval(intervals[index]);

    intervals[index] = runGlitch({
      text: socials[index].name,
      onUpdate: val => (displayTexts[index] = val),
      onComplete: () => {
        isSocialRevealed = true;
        summonBox(index);
        summonLines(index);
        getOpenPanel()?.track('social_dwell', {
          name: socials[index].name,
          handle: socials[index].handle,
        });
      },
    });
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

      const scale = getStageScale();
      const infoRect = info.getBoundingClientRect();
      const boxRect = box.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();

      // box center in local coords relative to .info
      const bx = (boxRect.left + boxRect.width / 2 - infoRect.left) / scale;
      const by = (boxRect.top + boxRect.height / 2 - infoRect.top) / scale;

      // card bottom corners in local coords relative to .info
      const clx = (cardRect.left - infoRect.left) / scale;
      const crx = (cardRect.right - infoRect.left) / scale;
      const cby = (cardRect.bottom - infoRect.top) / scale;

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
        onUpdate: update,
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
      {#each socials.slice(0, 3) as social, i (i)}
        <a
          href={social.href}
          target="_blank"
          rel={social.external
            ? 'external noopener noreferrer'
            : 'noopener noreferrer'}
          class="socials__link font--mono-link"
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
      {#each socials.slice(3, 6) as social, i (i + 3)}
        <a
          href={social.href}
          target="_blank"
          rel={social.external
            ? 'external noopener noreferrer'
            : 'noopener noreferrer'}
          class="socials__link font--mono-link"
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
    gap: 1.2rem;
    grid-template-columns: 1fr 1fr;
  }

  .socials__col {
    display: flex;
    flex-direction: column;
  }

  .socials__link {
    color: var(--color-text);
    display: block;
    overflow: hidden;
    position: relative;
    text-decoration: none;
    transition: color 0.1s ease;
    width: 100%;
    z-index: 1;
  }

  .socials__link::before {
    background-color: var(--color-text);
    content: '';
    height: 100%;
    left: 0;
    position: absolute;
    top: 0;
    transform: translateY(100%);
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    width: 100%;
    z-index: -1;
  }

  .socials__link:hover {
    color: var(--color-text-inv);
  }

  .socials__link:hover::before {
    transform: translateY(0);
  }

  .socials__box {
    background: var(--color-text-inv);
    height: 0.43rem;
    left: 0;
    opacity: 0;
    pointer-events: none;
    position: absolute;
    top: 0;
    width: 0.43rem;
    z-index: 2;
  }

  .socials__connector {
    height: 100%;
    inset: 0;
    overflow: visible;
    pointer-events: none;
    position: absolute;
    width: 100%;
    z-index: 5000;
  }

  .socials__connector polyline {
    fill: none;
    opacity: 0;
    stroke: var(--color-overlay-40);
    stroke-width: 1px;
  }
</style>
