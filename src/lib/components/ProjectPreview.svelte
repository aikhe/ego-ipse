<script lang="ts">
	import { tick } from 'svelte';
	import gsap from 'gsap';

	export let project: {
		name: string;
		section: string;
		date: string;
		tags: readonly string[];
		id: string;
	} | null = null;
	export let visible = false;
	export let x = 0;
	export let y = 0;

	let container: HTMLDivElement;
	let content: HTMLDivElement;

	$: if (container) {
		if (visible && project) {
			show();
		} else {
			hide();
		}
	}

	$: if (container && (x || y)) {
		gsap.to(container, {
			left: x,
			top: y,
			duration: 0.4,
			ease: 'power3.out'
		});
	}

	async function show() {
		await tick();
		// Initial state to prevent jump
		gsap.set(container, { xPercent: -50, yPercent: -100 });
		
		gsap.to(container, {
			opacity: 1,
			y: -12, // Gap above the box
			duration: 0.4,
			ease: 'power3.out'
		});
		if (content) {
			gsap.fromTo(
				content.children,
				{ opacity: 0, y: 10 },
				{ opacity: 1, y: 0, duration: 0.3, stagger: 0.05, ease: 'power2.out', delay: 0.1 }
			);
		}
	}

	function hide() {
		gsap.to(container, {
			opacity: 0,
			y: 0, // Collapses back to the box
			duration: 0.3,
			ease: 'power3.in'
		});
	}
</script>

<div class="preview-container" bind:this={container}>
	{#if project}
		<div class="preview-card" bind:this={content}>
			<div class="header">
				<h3 class="name">{project.name.toUpperCase()}...</h3>
				<div class="meta">
					<span class="symbol">&gt;</span>
					<span class="section">{project.section}</span>
					<span class="separator">→</span>
					<span class="date">{project.date}</span>
				</div>
			</div>

			<div class="image-placeholder"></div>

			<div class="footer">
				<div class="tags">
					{#each project.tags as tag}
						<span class="tag">[ {tag} ]</span>
					{/each}
				</div>
				<div class="id">{project.id}</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.preview-container {
		position: absolute;
		width: 280px;
		background: #000;
		border: 1px solid rgba(255, 255, 255, 0.2);
		padding: 1rem;
		opacity: 0;
		pointer-events: none;
		z-index: 200;
	}

	.preview-container::before {
		content: '';
		position: absolute;
		inset: -1px;
		background:
			linear-gradient(to right, white 1px, transparent 1px) 0 0,
			linear-gradient(to bottom, white 1px, transparent 1px) 0 0,
			linear-gradient(to left, white 1px, transparent 1px) 100% 0,
			linear-gradient(to bottom, white 1px, transparent 1px) 100% 0,
			linear-gradient(to right, white 1px, transparent 1px) 0 100%,
			linear-gradient(to top, white 1px, transparent 1px) 0 100%,
			linear-gradient(to left, white 1px, transparent 1px) 100% 100%,
			linear-gradient(to top, white 1px, transparent 1px) 100% 100%;
		background-repeat: no-repeat;
		background-size: 8px 8px;
	}

	.preview-card {
		display: flex;
		flex-direction: column;
		gap: 0.8rem;
	}

	.header {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.name {
		font-family: 'Geist Mono', monospace;
		font-size: 0.875rem;
		font-weight: 500;
		color: #fff;
		margin: 0;
		letter-spacing: 0.05em;
	}

	.meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-family: 'Geist Mono', monospace;
		font-size: 0.75rem;
		color: #888;
	}

	.symbol {
		color: #fff;
	}

	.separator {
		opacity: 0.5;
	}

	.image-placeholder {
		width: 100%;
		aspect-ratio: 4 / 5;
		background: #0a0a0a;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-family: 'Geist Mono', monospace;
		font-size: 0.7rem;
		color: #888;
	}

	.tags {
		display: flex;
		gap: 0.5rem;
	}

	.tag {
		letter-spacing: 0.05em;
	}

	.id {
		opacity: 0.6;
	}

	.hidden {
		display: none;
	}
</style>
