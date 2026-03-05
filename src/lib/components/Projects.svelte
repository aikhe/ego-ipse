<script lang="ts">
	import { resolve } from '$app/paths';
	import IconArrow from '$lib/components/IconArrow.svelte';

	const projects = [
		{ name: 'Sample', href: '/' },
		{ name: 'Project', href: '/' },
		{ name: 'Placeholder', href: '/' },
		{ name: 'Lorem Ipsum', href: '/' },
		{ name: 'To Be Replaced', href: '/' }
	] as const;
</script>

<div class="info__projects">
	{#each projects as project (project.name)}
		<a href={resolve(project.href)} class="project--item">
			<span>{project.name}</span>
			<span class="arrow">
				<IconArrow />
			</span>
		</a>
	{/each}
	<button class="project--more">MORE ...</button>
</div>

<style>
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

		font-weight: 400;
		font-size: 1.2rem;
		letter-spacing: 0.34%;
		color: #fff;
		text-decoration: none;

		border-bottom: 1px solid rgba(255, 255, 255, 0.2);
		transition: padding 100ms cubic-bezier(0.12, 0, 0.39, 0) 0s;
	}

	.project--item:nth-child(-n + 2) {
		border-top: 1px solid rgba(255, 255, 255, 0.2);
	}

	.project--item:hover {
		/* color: #797979; */
		padding: 0 0.6rem;
	}

	.project--item span,
	.project--item :global(svg) {
		flex-shrink: 0;
	}

	.arrow {
		font-size: 1.125rem;
		opacity: 0.8;
		display: flex; /* Helps ensure svg doesn't behave strangely */
		align-items: center;
	}

	.project--more {
		height: 48px;
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid #363636;
		margin-top: -1px;

		color: #fff;
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
			linear-gradient(to right, #888 1px, transparent 1px) 0 0,
			linear-gradient(to bottom, #888 1px, transparent 1px) 0 0,
			linear-gradient(to left, #888 1px, transparent 1px) 100% 0,
			linear-gradient(to bottom, #888 1px, transparent 1px) 100% 0,
			linear-gradient(to right, #888 1px, transparent 1px) 0 100%,
			linear-gradient(to top, #888 1px, transparent 1px) 0 100%,
			linear-gradient(to left, #888 1px, transparent 1px) 100% 100%,
			linear-gradient(to top, #888 1px, transparent 1px) 100% 100%;
		background-repeat: no-repeat;
		background-size: 8px 8px;
		pointer-events: none;
	}

	.project--more:hover {
		background: rgba(255, 255, 255, 0.05);
		border-color: #444;
	}
</style>
