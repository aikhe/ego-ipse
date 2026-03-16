<script lang="ts">
	import { Canvas } from '@threlte/core'
	import Scene from './Scene.svelte'

	let trigger1 = $state(0)
	let trigger2 = $state(0)
	let trigger3 = $state(0)
	let activeIdx = $state(1) // box 1 is white by default
</script>

<div class="canvas-container">
	<Canvas>
		<Scene 
			{trigger1} {trigger2} {trigger3}
			active1={activeIdx === 1}
			active2={activeIdx === 2}
			active3={activeIdx === 3}
		/>
	</Canvas>
</div>

<div class="controls">
	<button class="spin-btn" onclick={() => { trigger1++; activeIdx = 1 }}>BOX 1</button>
	<button class="spin-btn" onclick={() => { trigger2++; activeIdx = 2 }}>BOX 2</button>
	<button class="spin-btn" onclick={() => { trigger3++; activeIdx = 3 }}>BOX 3</button>
</div>

<style>
	.canvas-container {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100vh;
		z-index: 1;
	}

	.controls {
		position: fixed;
		bottom: 10rem;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		gap: 1rem;
		z-index: 10;
	}

	.spin-btn {
		position: relative;
		background: var(--color-overlay-02);
		color: var(--color-overlay-60);
		border: 1px solid var(--color-overlay-20);
		padding: 6px 12px;
		cursor: pointer;
		font-family: 'Geist Mono', monospace;
		font-size: 0.875rem;
		font-weight: 300;
		letter-spacing: 0.05em;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background 0.2s ease;
	}

	.spin-btn::before {
		content: '';
		position: absolute;
		inset: -1px;
		background:
			linear-gradient(to right, var(--color-overlay-20) 1px, transparent 1px) 0 0,
			linear-gradient(to bottom, var(--color-overlay-20) 1px, transparent 1px) 0 0,
			linear-gradient(to left, var(--color-overlay-20) 1px, transparent 1px) 100% 0,
			linear-gradient(to bottom, var(--color-overlay-20) 1px, transparent 1px) 100% 0,
			linear-gradient(to right, var(--color-overlay-20) 1px, transparent 1px) 0 100%,
			linear-gradient(to top, var(--color-overlay-20) 1px, transparent 1px) 0 100%,
			linear-gradient(to left, var(--color-overlay-20) 1px, transparent 1px) 100% 100%,
			linear-gradient(to top, var(--color-overlay-20) 1px, transparent 1px) 100% 100%;
		background-repeat: no-repeat;
		background-size: 8px 8px;
		pointer-events: none;
	}

	.spin-btn:hover {
		background: var(--color-overlay-05);
		color: var(--color-text);
		/* text-shadow: 1px 0 #cc432c, -1px 0 #3b82f6; */
	}
</style>
