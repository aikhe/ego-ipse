<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	import { resolve } from '$app/paths';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<nav>
	<a href={resolve('/')}>root</a>
	<a href={resolve('/scrutiny')}>scrutiny</a>
</nav>

{@render children()}
