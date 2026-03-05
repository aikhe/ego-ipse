<section class="hero-section">
	<div class="hero-container section-container">
		<div class="hero__content">
			<h1 class="hero__title">
				<span class="font-line dim">Lorem Ipsum</span> is simply dummy text of the printing and
				typesetting industry. <span class="font-line dim">Lorem Ipsum</span> has been the industry's
				standard dummy text ever since the 1500s.
			</h1>
			<p class="hero__description">
				<span class="white-text">CONTRARY TO POPULAR BELIEF,</span>
				<span class="dim">
					LOREM IPSUM IS NOT SIMPLY RANDOM TEXT. IT HAS ROOTS IN A PIECE OF CLASSICAL LATIN
					LITERATURE FROM 45 BC.
				</span>
			</p>
		</div>

		<div class="hero__grid">
			<svg width="100%" height="100%" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
				<defs>
					<pattern id="isoGrid" width="60" height="34" patternUnits="userSpaceOnUse">
						<path
							d="M 60 0 L 0 34 M 0 0 L 60 34"
							fill="none"
							stroke="rgba(255,255,255,0.08)"
							stroke-width="0.5"
						/>
					</pattern>
				</defs>
				<rect width="100%" height="100%" fill="url(#isoGrid)" />
			</svg>
		</div>
	</div>
</section>

<style>
	.hero-section {
		position: relative;
		min-height: calc(100dvh - 4.8rem);
		display: flex;
		align-items: flex-end;
		overflow: hidden;
		padding-bottom: 4rem;
	}

	.hero-container {
		position: relative;
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		gap: 1.2rem;
		z-index: 2;
	}

	.hero__content {
		grid-column: 1 / span 10;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.hero__title {
		font-family: 'Geist', sans-serif;
		font-size: clamp(2rem, 3.5vw, 3rem);
		line-height: 1.1;
		font-weight: 300;
		color: #ffffff;
		max-width: 900px;
	}

	.hero__description {
		font-family: 'Geist Mono', monospace;
		font-size: 14px;
		letter-spacing: 0.05em;
		line-height: 1.6;
		max-width: 600px;
		display: flex;
		flex-direction: column;
	}

	.font-line {
		font-family: 'GeistPixel Line', sans-serif;
	}

	.dim {
		color: #555555;
	}

	.white-text {
		color: #ffffff;
	}

	.hero__grid {
		position: absolute;
		bottom: -10%;
		right: -10%;
		width: 100%;
		height: 100%;
		z-index: 1;
		pointer-events: none;
		opacity: 0.6;
		transform: skewY(-15deg);
	}

	@media (max-width: 768px) {
		.hero__content {
			grid-column: 1 / span 12;
		}
	}
</style>
