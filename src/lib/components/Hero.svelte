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

<style>
	.hero {
		grid-column: 1 / span 10;
		grid-row: 1;
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
		font-weight: 300;
		color: #ffffff;
	}
</style>
