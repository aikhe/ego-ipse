<script lang="ts">
	import { resolve } from '$app/paths';
</script>

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

<style>
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
		font-weight: 400;
		letter-spacing: 0.34%;
		font-size: 0.875rem;
		line-height: 18px;
	}

	.socials--col a:hover {
		color: #fff;
	}
</style>
