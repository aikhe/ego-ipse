<script lang="ts">
  import gsap from 'gsap';

  import { startGlitch as runGlitch } from '$lib/utils/glitch';

  import SocialCard from './SocialCard.svelte';
  import xIcon from '$lib/assets/socials/X.png';
  import linkedinIcon from '$lib/assets/socials/linkedin.png';
  import githubIcon from '$lib/assets/socials/github.png';
  import aboutIcon from '$lib/assets/socials/about.png';
  import blogIcon from '$lib/assets/socials/blog.png';
  import acediaIcon from '$lib/assets/socials/acedia.png';

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
        { label: 'LIKES', value: '12' },
      ],
      tags: ['X', 'SOCIAL'],
      status: 'ACTIVE...',
    },
    {
      name: 'LINKEDIN',
      href: 'https://www.linkedin.com/in/ike-rosacay-5a8b12316/',
      external: true,
      handle: 'aikhe-andrei',
      bioPrefix: 'PROFESSIONAL',
      bioHighlight: '→ ENG',
      image: linkedinIcon,
      stats: [
        { label: 'CONNECTS', value: '268' },
        { label: 'POSTS', value: '1' },
        { label: 'SKILLS', value: '12' },
      ],
      tags: ['LINKEDIN', 'WORK'],
      status: 'ONLINE...',
    },
    {
      name: 'GITHUB',
      href: 'https://github.com/aikhe',
      external: true,
      handle: 'aikhe',
      bioPrefix: 'OS',
      bioHighlight: '→ OPEN SOURCE',
      image: githubIcon,
      stats: [
        { label: 'CONTRIBUTIONS', value: '—' },
        { label: 'STARS', value: '—' },
        { label: 'REPOS', value: '—' },
        { label: 'FOLLOWERS', value: '—' },
      ],
      tags: ['GITHUB', 'CODE'],
      status: 'PUSHING...',
    },
    {
      name: 'ABOUT',
      href: 'https://aikhe.pages.dev/about',
      external: false,
      handle: '@aikhe',
      bioPrefix: 'ORIGIN',
      bioHighlight: '→ HUMAN ENTITY',
      image: aboutIcon,
      stats: [
        { label: 'AGE', value: '24' },
        { label: 'LOC', value: 'SEA' },
        { label: 'EXP', value: '5Y' },
      ],
      tags: ['ABOUT', 'INTERNAL'],
      status: 'WIP...',
    },
    {
      name: 'BLOG',
      href: 'https://acedia.pages.dev/blog',
      external: false,
      handle: 'log_entry',
      bioPrefix: 'DATA',
      bioHighlight: '→ THOUGHTS',
      image: blogIcon,
      stats: [
        { label: 'ENTRIES', value: '8' },
        { label: 'TOPIC', value: 'CODE\\AI\\ART' },
      ],
      tags: ['BLOG', 'DATA'],
      status: 'INITIALIZING...',
    },
    {
      name: 'ACEDIA',
      href: 'https://acedia.pages.dev/',
      external: false,
      handle: 'null_state',
      bioPrefix: 'VOID',
      bioHighlight: '→ EXPERIMENT',
      image: acediaIcon,
      stats: [
        { label: 'STATUS', value: 'OFFLINE' },
        { label: 'VERSION', value: '0.0.1' },
      ],
      tags: ['EXPERIMENTAL', 'VOID'],
      status: 'IN PROGRESS...',
    },
  ]);

  // fetch github stats on mount
  $effect(() => {
    const username = 'aikhe';

    (async () => {
      const [userRes, reposRes, searchRes] = await Promise.all([
        fetch(`https://api.github.com/users/${username}`),
        fetch(`https://api.github.com/users/${username}/repos?per_page=100`),
        fetch(`https://api.github.com/search/commits?q=author:${username}`, {
          headers: { Accept: 'application/vnd.github.cloak-preview+json' },
        }),
      ]);

      if (!userRes.ok || !reposRes.ok) return;

      const user = await userRes.json();
      const repos: { stargazers_count: number }[] = await reposRes.json();
      const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
      const contributions = searchRes.ok
        ? ((await searchRes.json()).total_count ?? '—')
        : '—';

      socials[GITHUB_INDEX].stats = [
        { label: 'CONTRIBUTIONS', value: String(contributions) },
        { label: 'STARS', value: String(totalStars) },
        { label: 'REPOS', value: String(user.public_repos) },
        { label: 'FOLLOWERS', value: String(user.followers) },
      ];
    })();
  });

  let displayTexts = $state<string[]>(socials.map(s => s.name));
  let intervals: (ReturnType<typeof setInterval> | null)[] = socials.map(
    () => null
  );
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
      {#each socials.slice(0, 3) as social, i (social.name)}
        <a
          href={social.href}
          rel={social.external ? 'external' : undefined}
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
      {#each socials.slice(3, 6) as social, i (social.name)}
        <a
          href={social.href}
          rel={social.external ? 'external' : undefined}
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
    z-index: 50;
  }

  .socials__connector polyline {
    fill: none;
    opacity: 0;
    stroke: var(--color-overlay-40);
    stroke-width: 1px;
  }
</style>
