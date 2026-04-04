<script lang="ts">
  import { resolve } from '$app/paths';
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

  let projectItems = $state<HTMLAnchorElement[]>([]);
  let reticle: HTMLDivElement;
  let reticleBorders: HTMLDivElement;
  let expandReticle: HTMLDivElement;
  let infoSection: HTMLDivElement;
  let randomBox: HTMLDivElement;
  let buttonBox: HTMLDivElement;
  let connectorLine: SVGPolylineElement;
  let currentItem = $state<HTMLAnchorElement | null>(null);
  let currentProject = $state<(typeof projects)[number] | null>(null);
  let showPreview = $state(false);
  let previewX = $state(0);
  let previewY = $state(0);

  const SIZE = 32;
  const DWELL = 400;
  const EXIT_DELAY = 100;
  const BOX_DELAY = 300;

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
      expanded = false;
      clearTimeout(dwellTimer!);
      clearTimeout(boxSpawnTimer!);

      gsap.killTweensOf([randomBox, buttonBox, connectorLine]);

      gsap.to(expandReticle, {
        width: 0,
        height: 0,
        opacity: 0,
        duration: 0.4,
        ease: 'power3.inOut',
      });
      gsap.to([randomBox, buttonBox], { opacity: 0, duration: 0.3 });
      gsap.to(connectorLine, { opacity: 0, duration: 0.3 });
      showPreview = false;
    };

    const showRandomBox = () => {
      if (!infoSection || !randomBox || !buttonBox || !currentItem) return;
      const sectionRect = infoSection.getBoundingClientRect();
      const itemRect = currentItem.getBoundingClientRect();

      // calculate button box position
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

      // spread is roughly 30% of section width
      const spread = sectionRect.width * 0.3;
      let outX = btnFinalX + (Math.random() * spread - spread / 2);

      // constrain outx based on card width to prevent overflow
      const currentProj = projects[projectItems.indexOf(currentItem)];
      const cardWidth = currentProj?.width || 260;
      const margin = 20;

      const minOutX = cardWidth / 2 + margin;
      const maxOutX = sectionRect.width - cardWidth / 2 - margin;

      if (minOutX > maxOutX) {
        outX = sectionRect.width / 2;
      } else {
        outX = Math.max(minOutX, Math.min(outX, maxOutX));
      }

      const outY = -40 - Math.random() * 120;

      // box 1: above the section
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

      // box 2: inside the current button
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
      // update connector line
      const boxSize = 0.43 * 16; // 0.43rem in px
      const outCX = outX + boxSize / 2;
      const outCY = outY + boxSize / 2;
      const btnCX = btnFinalX + boxSize / 2;
      const btnCY = btnFinalY + boxSize / 2;

      const pivotX = outCX + (btnCX - outCX) * 0.5;
      const pivotY = outCY;

      // update preview data and visibility
      previewX = outCX;
      previewY = outCY;
      if (currentItem) {
        const index = projectItems.indexOf(currentItem);
        if (index !== -1) {
          currentProject = projects[index];
          showPreview = true;
        }
      }

      gsap.to(connectorLine, {
        opacity: 1,
        duration: 0.3,
      });

      // animate points via proxy for smooth transition
      const pointsAttr = connectorLine.getAttribute('points');
      const currentPoints =
        pointsAttr && pointsAttr !== '0,0 0,0 0,0'
          ? pointsAttr.split(' ').map(p => p.split(',').map(Number))
          : [
              [outCX, outCY],
              [outCX, outCY],
              [outCX, outCY],
            ];

      const lineData = {
        p1x: currentPoints[0]?.[0] ?? outCX,
        p1y: currentPoints[0]?.[1] ?? outCY,
        p2x: currentPoints[1]?.[0] ?? outCX,
        p2y: currentPoints[1]?.[1] ?? outCY,
        p3x: currentPoints[2]?.[0] ?? outCX,
        p3y: currentPoints[2]?.[1] ?? outCY,
      };

      gsap.to(lineData, {
        p1x: outCX,
        p1y: outCY,
        p2x: pivotX,
        p2y: pivotY,
        p3x: btnCX,
        p3y: btnCY,
        duration: 0.4,
        ease: 'power3.out',
        onUpdate: () => {
          connectorLine.setAttribute(
            'points',
            `${lineData.p1x},${lineData.p1y} ${lineData.p2x},${lineData.p2y} ${lineData.p3x},${lineData.p3y}`
          );
        },
      });
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

        // slide expand reticle to new button if already active
        if (expanded) {
          const rect = item.getBoundingClientRect();
          gsap.to(expandReticle, {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
            width: rect.width,
            height: rect.height,
            duration: 0.5,
            ease: 'power3.inOut',
          });
          clearTimeout(boxSpawnTimer!);
          boxSpawnTimer = setTimeout(showRandomBox, BOX_DELAY);
        }

        gsap.to(bg, { opacity: 1, duration: 0.3, ease: 'power3.out' });
        gsap.to(item, {
          zIndex: 20,
          padding: '0 0.6rem',
          duration: 0.3,
          ease: 'power3.out',
        });
        gsap.to(arrow, { opacity: 0, duration: 0.2, ease: 'power3.out' });

        // cursor reticle and dwell when not expanded
        if (!expanded) {
          if (!isItem(e.relatedTarget)) {
            // fresh hover: snap reticle and fade in
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
              ease: 'power3.out',
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
        gsap.to(bg, { opacity: 0, duration: 0.3, ease: 'power3.out' });
        gsap.to(item, {
          zIndex: 1,
          padding: '0',
          duration: 0.3,
          ease: 'power3.out',
        });
        gsap.to(arrow, { opacity: 0.8, duration: 0.3, ease: 'power3.out' });

        if (!isItem(e.relatedTarget)) {
          // delay collapse so reticle lingers briefly
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
      <a
        href={project.external ? project.href : resolve(project.href)}
        rel={project.external ? 'external' : undefined}
        class="project--item"
        bind:this={projectItems[i]}
        onmouseenter={() => {
          currentItem = projectItems[i];
        }}
        onmouseleave={() => {
          currentItem = null;
        }}
      >
        <div class="project--bg"></div>
        <span class="project--name">{project.name}</span>
        <svg
          data-testid="geist-icon"
          height={12}
          width={12}
          stroke-linejoin="miter"
          style="color: currentcolor;"
          viewBox="0 0 16 16"
          class="arrow"
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
      </a>
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
    color: var(--color-text);
    text-decoration: none;

    border-bottom: 1px solid var(--color-overlay-20);
  }

  .project--bg {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      transparent 20%,
      var(--color-accent-blue) 70%,
      var(--color-accent-cyan) 100%
    );
    opacity: 0;
    z-index: 0;
    pointer-events: none;
  }

  .project--item:nth-child(-n + 2) {
    border-top: 1px solid var(--color-overlay-20);
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
    content: '';
    width: 0.43rem;
    height: 0.43rem;
    background: var(--color-text);
  }

  .project--more {
    height: 48px;
    background: var(--color-overlay-02);
    border: 1px solid var(--color-overlay-20);
    margin-top: -1px;

    color: var(--color-text);
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
    pointer-events: none;
  }

  .project--more:hover {
    background: var(--color-overlay-05);
  }

  .random-box {
    position: absolute;
    width: 0.43rem;
    height: 0.43rem;
    background: var(--color-text);
    pointer-events: none;
    z-index: 100;
    opacity: 0;
  }

  .connector-svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    overflow: visible;
    z-index: 50;
  }

  .connector-svg polyline {
    fill: none;
    stroke: var(--color-overlay-40);
    stroke-width: 1px;
    opacity: 0;
  }
</style>
