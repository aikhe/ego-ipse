<script lang="ts">
  import { onMount } from 'svelte';
  import gsap from 'gsap';

  import ProjectPreview from './ProjectPreview.svelte';

  import katha from '$lib/assets/projects/katha.png';
  import sola from '$lib/assets/projects/sola.png';
  import praf from '$lib/assets/projects/praf.png';
  import success from '$lib/assets/projects/success.png';
  import uccingo from '$lib/assets/projects/uccingo.png';

  const projects = [
    {
      name: 'Katha',
      href: '/',
      section: 'IDEA COMPRESSION',
      date: '03.2026 | PRESENT',
      tags: ['AI & MCP', 'WEB'],
      id: '25-26',
      width: 340,
      height: 440,
      image: katha,
      external: false,
    },
    {
      name: 'Sola',
      href: '/',
      section: 'HEALTH BUDDY',
      date: '12.2025',
      tags: ['WEB', 'RAG & FAISS'],
      id: '2025',
      width: 290,
      height: 420,
      image: sola,
      external: false,
    },
    {
      name: 'Success',
      href: '/',
      section: 'CLI AI APP',
      date: '11.2025',
      tags: ['VSS', 'TUI'],
      id: '2025',
      width: 280,
      height: 410,
      image: success,
      external: false,
    },
    {
      name: 'P.R.A.F',
      href: '/',
      section: 'IoT FLOOD SYSTEM',
      date: '04.2025',
      tags: ['IoT', 'AI & SMS'],
      id: '2025',
      width: 320,
      height: 380,
      image: praf,
      external: false,
    },
    {
      name: 'Uccingo',
      href: '/',
      section: 'CS COUNCIL HUB',
      date: '07.2025 | PRESENT',
      tags: ['FULLSTACK', 'CMS'],
      id: '25-26',
      width: 320,
      height: 400,
      image: uccingo,
      external: false,
    },
  ] as const;

  type Project = (typeof projects)[number];
  let { onselect = (p: Project) => {}, activeProject = $bindable(null) } =
    $props();

  let projectItems = $state<HTMLButtonElement[]>([]);
  let reticle: HTMLDivElement;
  let reticleBorders: HTMLDivElement;
  let expandReticle: HTMLDivElement;
  let infoSection: HTMLDivElement;
  let randomBox: HTMLDivElement;
  let buttonBox: HTMLDivElement;
  let connectorLine: SVGPolylineElement;
  let currentItem = $state<HTMLButtonElement | null>(null);
  let currentProject = $state<(typeof projects)[number] | null>(null);
  let showPreview = $state(false);
  let previewX = $state(0);
  let previewY = $state(0);

  const SIZE = 32;
  const DWELL = 400;
  const EXIT_DELAY = 100;
  const BOX_DELAY = 300;

  // sticky active state effect
  $effect(() => {
    if (!activeProject) {
      return;
    }

    const index = projects.findIndex(p => p.name === activeProject.name);
    if (index === -1) return;

    const item = projectItems[index];
    if (!item) return;

    const rect = item.getBoundingClientRect();

    // force active visuals - clear inline styles to let CSS take over
    const bg = item.querySelector('.project--bg');
    const arrow = item.querySelector('.arrow');
    gsap.killTweensOf([bg, item, arrow]);
    gsap.set([bg, item, arrow], { clearProps: 'all' });

    // Move expand reticle back to active one if not hovering anything else
    if (!currentItem) {
      gsap.to(expandReticle, {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        width: rect.width,
        height: rect.height,
        opacity: 1,
        duration: 0.5,
        ease: 'power3.out',
      });
    }

    // Cleanup others
    projectItems.forEach(otherItem => {
      if (otherItem === item) return;
      const otherBg = otherItem.querySelector('.project--bg');
      const otherArrow = otherItem.querySelector('.arrow');
      gsap.killTweensOf([otherBg, otherItem, otherArrow]);
      gsap.to(otherBg, { opacity: 0, duration: 0.2 });
      gsap.to(otherItem, { padding: '0', zIndex: 1, duration: 0.2 });
      gsap.to(otherArrow, { opacity: 0.8, duration: 0.2 });
    });
  });

  onMount(() => {
    // cursor reticle: spins freely, follows mouse
    const xTo = gsap.quickTo(reticle, 'x', {
      duration: 0.8,
      ease: 'power3.out',
    });
    const yTo = gsap.quickTo(reticle, 'y', {
      duration: 0.8,
      ease: 'power3.out',
    });
    gsap.set(reticle, {
      xPercent: -50,
      yPercent: -50,
      opacity: 0,
      width: SIZE,
      height: SIZE,
    });
    gsap.to(reticleBorders, {
      rotation: 360,
      duration: 10,
      repeat: -1,
      ease: 'none',
    });

    // expand reticle: separate, always 0deg, locked to button
    gsap.set(expandReticle, {
      xPercent: -50,
      yPercent: -50,
      opacity: 0,
      width: 0,
      height: 0,
    });

    let dwellTimer: ReturnType<typeof setTimeout> | null = null;
    let collapseTimer: ReturnType<typeof setTimeout> | null = null;
    let boxSpawnTimer: ReturnType<typeof setTimeout> | null = null;
    let expanded = false;

    const isItem = (el: EventTarget | null) =>
      projectItems.some(item => item.contains(el as Node));

    const collapseExpand = () => {
      clearTimeout(dwellTimer!);
      clearTimeout(boxSpawnTimer!);

      gsap.killTweensOf([randomBox, buttonBox, connectorLine]);

      if (activeProject) {
        const index = projects.findIndex(p => p.name === activeProject.name);
        if (index !== -1) {
          const item = projectItems[index];
          const rect = item.getBoundingClientRect();
          gsap.to(expandReticle, {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
            width: rect.width,
            height: rect.height,
            opacity: 1,
            duration: 0.5,
            ease: 'power3.inOut',
          });
        }
      } else {
        expanded = false;
        gsap.to(expandReticle, {
          width: 0,
          height: 0,
          opacity: 0,
          duration: 0.4,
          ease: 'power3.inOut',
        });
      }

      gsap.to([randomBox, buttonBox], { opacity: 0, duration: 0.3 });
      gsap.to(connectorLine, { opacity: 0, duration: 0.3 });
      showPreview = false;
    };

    const showRandomBox = () => {
      if (!infoSection || !randomBox || !buttonBox || !currentItem) return;
      const sectionRect = infoSection.getBoundingClientRect();
      const itemRect = currentItem.getBoundingClientRect();

      const btnMinX = itemRect.width * 0.4;
      const btnMaxX = itemRect.width * 0.9;
      const btnRelX = btnMinX + Math.random() * (btnMaxX - btnMinX - 16);
      const btnFinalX = itemRect.left - sectionRect.left + btnRelX;
      const btnFinalY =
        itemRect.top -
        sectionRect.top +
        itemRect.height / 2 -
        8 +
        (Math.random() * 10 - 5);

      const spread = sectionRect.width * 0.3;
      let outX = btnFinalX + (Math.random() * spread - spread / 2);

      const currentProj = projects[projectItems.indexOf(currentItem)];
      const cardWidth = currentProj?.width || 260;
      const margin = 20;

      const minOutX = cardWidth / 2 + margin;
      const maxOutX = sectionRect.width - cardWidth / 2 - margin;
      outX = Math.max(minOutX, Math.min(outX, maxOutX));

      const outY = -40 - Math.random() * 120;

      gsap.to(randomBox, {
        opacity: 0,
        duration: 0.1,
        onComplete: () => {
          gsap.to(randomBox, {
            left: outX,
            top: outY,
            opacity: 1,
            duration: 0.4,
            ease: 'power3.out',
          });
        },
      });

      gsap.to(buttonBox, {
        opacity: 0,
        duration: 0.1,
        onComplete: () => {
          gsap.to(buttonBox, {
            left: btnFinalX,
            top: btnFinalY,
            opacity: 1,
            duration: 0.4,
            ease: 'power3.out',
          });
        },
      });

      const boxSize = 0.43 * 16;
      const outCX = outX + boxSize / 2;
      const outCY = outY + boxSize / 2;
      const btnCX = btnFinalX + boxSize / 2;
      const btnCY = btnFinalY + boxSize / 2;
      const pivotX = outCX + (btnCX - outCX) * 0.5;
      const pivotY = outCY;

      previewX = outCX;
      previewY = outCY;
      if (currentItem) {
        const index = projectItems.indexOf(currentItem);
        if (index !== -1) {
          currentProject = projects[index];
          showPreview = true;
        }
      }

      gsap.to(connectorLine, { opacity: 1, duration: 0.3 });
      connectorLine.setAttribute(
        'points',
        `${outCX},${outCY} ${pivotX},${pivotY} ${btnCX},${btnCY}`
      );
    };

    projectItems.forEach(item => {
      if (!item) return;
      const bg = item.querySelector('.project--bg');
      const arrow = item.querySelector('.arrow');

      item.addEventListener('mouseenter', (e: MouseEvent) => {
        clearTimeout(dwellTimer!);
        clearTimeout(collapseTimer!);
        gsap.killTweensOf([bg, arrow, item]);
        currentItem = item;

        if (expanded || activeProject) {
          expanded = true;
          const rect = item.getBoundingClientRect();
          gsap.to(expandReticle, {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
            width: rect.width,
            height: rect.height,
            opacity: 1,
            duration: 0.5,
            ease: 'power3.inOut',
          });
          clearTimeout(boxSpawnTimer!);
          if (projects[projectItems.indexOf(item)] !== activeProject) {
            boxSpawnTimer = setTimeout(showRandomBox, BOX_DELAY);
          }
        }

        gsap.to(bg, { opacity: 1, duration: 0.3, ease: 'power3.out' });
        gsap.to(item, {
          zIndex: 20,
          padding: '0 0.6rem',
          duration: 0.3,
          ease: 'power3.out',
        });
        gsap.to(arrow, { opacity: 0, duration: 0.2, ease: 'power3.out' });

        if (
          !expanded &&
          projects[projectItems.indexOf(item)] !== activeProject
        ) {
          if (!isItem(e.relatedTarget)) {
            const rect = item.getBoundingClientRect();
            gsap.set(reticle, { x: rect.right, y: rect.top + rect.height / 2 });
            gsap.to(reticle, { opacity: 1, duration: 0.3, ease: 'power3.out' });
          }
          dwellTimer = setTimeout(() => {
            expanded = true;
            const rect = item.getBoundingClientRect();
            gsap.to(reticle, { opacity: 0, duration: 0.2 });
            gsap.set(expandReticle, {
              x: rect.left + rect.width / 2,
              y: rect.top + rect.height / 2,
              width: 0,
              height: 0,
            });
            gsap.to(expandReticle, {
              width: rect.width,
              height: rect.height,
              opacity: 1,
              duration: 0.5,
            });
            showRandomBox();
          }, DWELL);
        }
      });

      item.addEventListener('mousemove', (e: MouseEvent) => {
        xTo(e.clientX);
        yTo(e.clientY);
      });

      item.addEventListener('mouseleave', (e: MouseEvent) => {
        clearTimeout(dwellTimer!);
        clearTimeout(boxSpawnTimer!);
        gsap.killTweensOf([bg, arrow, item]);

        const isCurrentActive =
          projects[projectItems.indexOf(item)] === activeProject;
        if (!isCurrentActive) {
          gsap.to(bg, { opacity: 0, duration: 0.3 });
          gsap.to(item, { zIndex: 1, padding: '0', duration: 0.3 });
          gsap.to(arrow, { opacity: 0.8, duration: 0.3 });
        }

        if (!isItem(e.relatedTarget)) {
          currentItem = null;
          collapseTimer = setTimeout(() => {
            collapseExpand();
            gsap.to(reticle, { opacity: 0, duration: 0.3 });
          }, EXIT_DELAY);
        }
      });

      item.addEventListener('click', () => {
        const index = projectItems.indexOf(item);
        if (index === -1) return;
        const project = projects[index];
        activeProject = project;
        onselect(project);

        if (showPreview) {
          gsap.to([randomBox, buttonBox, connectorLine], {
            opacity: 0,
            duration: 0.3,
          });
          showPreview = false;
        }

        gsap.killTweensOf([bg, arrow, item]);
        gsap.to(bg, { opacity: 1, duration: 0.2 });
        gsap.to(item, { padding: '0 0.6rem', zIndex: 20, duration: 0.2 });
        gsap.to(arrow, { opacity: 0, duration: 0.1 });
      });
    });
  });
</script>

<!-- cursor reticle: spins, follows mouse -->
<div class="reticle" bind:this={reticle}>
  <div class="reticle-borders" bind:this={reticleBorders}></div>
  <div class="reticle-box"></div>
</div>

<!-- expand reticle: static 0deg, locks to button on dwell -->
<div class="reticle reticle--expand" bind:this={expandReticle}></div>

<div class="projects-wrapper" bind:this={infoSection}>
  <div class="random-box" bind:this={randomBox}></div>
  <ProjectPreview
    project={currentProject}
    visible={showPreview}
    posX={previewX}
    posY={previewY}
    width={currentProject?.width}
    height={currentProject?.height}
  />
  <div class="random-box" bind:this={buttonBox}></div>
  <svg class="connector-svg">
    <polyline bind:this={connectorLine} points="0,0 0,0 0,0" />
  </svg>
  <div class="info__projects">
    {#each projects as project, i (i + project.name)}
      <button
        type="button"
        class="project--item"
        class:is-active={activeProject?.name === project.name}
        bind:this={projectItems[i]}
        onmouseenter={() => {
          currentItem = projectItems[i];
        }}
        onmouseleave={() => {
          currentItem = null;
        }}
      >
        <div
          class="project--bg"
          class:is-active={activeProject?.name === project.name}
        ></div>
        <span class="project--name">{project.name}</span>
        <svg
          data-testid="geist-icon"
          height={12}
          width={12}
          stroke-linejoin="miter"
          style="color: currentcolor;"
          viewBox="0 0 16 16"
          class="arrow"
          class:is-active={activeProject?.name === project.name}
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M5.75001 2H5.00001V3.5H5.75001H11.4393L2.21968 12.7197L1.68935 13.25L2.75001 14.3107L3.28034 13.7803L12.4988 4.56182V11H13.9988V2H5.75001Z"
            fill="currentColor"
            stroke="currentColor"
            stroke-width="0.4"
          ></path>
        </svg>
      </button>
    {/each}
    <button class="project--more">MORE ...</button>
  </div>
</div>

<style>
  .projects-wrapper {
    position: relative;
  }

  .info__projects {
    display: grid;
    gap: 0 1.2rem;
    grid-template-columns: 1fr 1fr;
  }

  .project--item {
    align-items: center;
    background: none;
    border: none;
    border-bottom: 1px solid var(--color-overlay-20);
    color: var(--color-text);
    cursor: pointer;
    display: flex;
    font-family: inherit;
    font-size: 1.2rem;
    font-weight: 400;
    height: 48px;
    justify-content: space-between;
    letter-spacing: 0.34%;
    padding: 0;
    position: relative;
    text-align: left;
    text-decoration: none;
    width: 100%;
  }

  .project--bg {
    background: linear-gradient(
      90deg,
      transparent 20%,
      var(--color-text-muted) 70%,
      var(--color-text) 100%
    );
    inset: 0;
    opacity: 0;
    pointer-events: none;
    position: absolute;
    transition: opacity 0.3s ease;
    z-index: 0;
  }

  .project--bg.is-active {
    opacity: 1 !important;
  }

  .project--item:nth-child(-n + 2) {
    border-top: 1px solid var(--color-overlay-20);
  }

  .project--item span {
    flex-shrink: 0;
    position: relative;
    z-index: 1;
  }

  .project--item.is-active {
    padding: 0 0.6rem !important;
    z-index: 20;
  }

  .arrow {
    opacity: 0.8;
    transition: opacity 0.2s ease;
  }

  .arrow.is-active {
    opacity: 0 !important;
  }

  /* shared reticle base */
  .reticle {
    left: 0;
    pointer-events: none;
    position: fixed;
    top: 0;
    z-index: 999;
  }

  .reticle-borders,
  .reticle-box {
    align-items: center;
    display: flex;
    inset: 0;
    justify-content: center;
    position: absolute;
  }

  /* 1px corner brackets via css gradients */
  .reticle-borders,
  .reticle--expand {
    background-image:
      linear-gradient(to right, var(--color-text) 1px, transparent 1px),
      linear-gradient(to bottom, var(--color-text) 1px, transparent 1px),
      linear-gradient(to left, var(--color-text) 1px, transparent 1px),
      linear-gradient(to bottom, var(--color-text) 1px, transparent 1px),
      linear-gradient(to right, var(--color-text) 1px, transparent 1px),
      linear-gradient(to top, var(--color-text) 1px, transparent 1px),
      linear-gradient(to left, var(--color-text) 1px, transparent 1px),
      linear-gradient(to top, var(--color-text) 1px, transparent 1px);
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
    background: var(--color-text);
    content: '';
    height: 0.43rem;
    width: 0.43rem;
  }

  .project--more {
    align-items: center;
    background: var(--color-overlay-02);
    border: 1px solid var(--color-overlay-20);
    color: var(--color-text);
    cursor: pointer;
    display: flex;
    font-family: 'Geist Mono', monospace;
    font-size: 0.875rem;
    font-weight: 400;
    height: 48px;
    letter-spacing: 0.34%;
    line-height: 18px;
    margin-top: -1px;
    padding-left: 1rem;
    position: relative;
  }

  .project--more::before {
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
    background-size: 8px 8px;
    content: '';
    inset: -1px;
    pointer-events: none;
    position: absolute;
  }

  .project--more:hover {
    background: var(--color-overlay-05);
  }

  .random-box {
    background: var(--color-text);
    height: 0.43rem;
    opacity: 0;
    pointer-events: none;
    position: absolute;
    width: 0.43rem;
    z-index: 100;
  }

  .connector-svg {
    height: 100%;
    inset: 0;
    overflow: visible;
    pointer-events: none;
    position: absolute;
    width: 100%;
    z-index: 50;
  }

  .connector-svg polyline {
    fill: none;
    opacity: 0;
    stroke: var(--color-overlay-40);
    stroke-width: 1px;
  }
</style>
