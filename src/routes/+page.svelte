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

<section class="section-container">
	<div class="hero">
		<h1 class="hero__title">
			<strong class="title--strong">Lorem Ipsum</strong> is simply dummy text of the printing and typesetting
			industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.
		</h1>
		<p class="hero__description">
			<strong class="description--strong">CONTRARY TO POPULAR BELIEF,</strong> LOREM IPSUM IS NOT SIMPLY
			RANDOM TEXT. IT HAS ROOTS IN A PIECE OF CLASSICAL LATIN LITERATURE FROM 45 BC.
		</p>
	</div>

	<div class="info">
		<p class="info__title">CREATIVE PROJECTS I’VE WORKED ON_</p>
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

		<div class="info__socials">
			<div class="socials--col">
				<a href="https://twitter.com">X(TWITTER)</a>
				<a href="https://linkedin.com">LINKEDIN</a>
				<a href="https://github.com">GITHUB</a>
			</div>
			<div class="socials--col">
				<a href={resolve('/')}>ABOUT</a>
				<a href={resolve('/')}>BLOG</a>
				<a href={resolve('/')}>ACEDIA</a>
			</div>
		</div>
	</div>
</section>

<style>
	section {
		height: calc(100vh - 4.8rem);

		display: grid;
		grid-template-columns: repeat(12, 1fr);
		gap: 1.2rem;
		align-items: end;
		padding-bottom: 2.4rem;
	}

	section > * {
		grid-row: 1;
	}

	.hero {
		grid-column: 1 / span 10;
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.hero__title {
		font-family: 'GeistPixel Square', sans-serif;
		font-size: 2rem;
		line-height: 34px;
		width: 38ch;
	}

	.title--strong {
		font-family: 'GeistPixel Line', sans-serif;
	}

	.hero__description {
		font-family: 'Geist Mono', monospace;
		font-weight: 300;
		letter-spacing: 0.34%;
		font-size: 0.875rem;
		line-height: 20px;
		width: 48ch;
		color: #797979;
	}

	.description--strong {
		color: #ffffff;
	}

	.info {
		grid-column: 7 / span 6;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.info__title {
		font-family: 'Geist Mono', monospace;
		font-weight: 300;
		letter-spacing: 0.34%;
		font-size: 0.875rem;
		color: #797979;
	}

	.info__projects {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0 2.4rem;
	}

	.project--item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 48px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
		color: #fff;
		text-decoration: none;
		font-size: 1.25rem;
		transition: color 0.2s ease;
	}

	.project--item:nth-child(-n + 2) {
		border-top: 1px solid rgba(255, 255, 255, 0.08);
	}

	.project--item:hover {
		color: #797979;
	}

	.arrow {
		font-size: 1.125rem;
		opacity: 0.8;
	}

	.project--more {
		height: 48px;
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid #363636;

		color: #fff;
		font-family: 'Geist Mono', monospace;
		font-weight: 300;
		letter-spacing: 0.34%;
		font-size: 0.875rem;
		line-height: 20px;

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
		background-size: 6px 6px;
		pointer-events: none;
	}

	.project--more:hover {
		background: rgba(255, 255, 255, 0.05);
		border-color: #444;
	}

	.info__socials {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.2rem;
	}

	.socials--col {
		display: flex;
		flex-direction: column;
	}

	.socials--col a {
		font-family: 'Geist Mono', monospace;
		font-weight: 300;
		letter-spacing: 0.34%;
		font-size: 0.875rem;
		line-height: 20px;
		color: #797979;
	}

	.socials--col a:hover {
		color: #fff;
	}
</style>
