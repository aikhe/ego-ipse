// shared tile-reveal animation for canvas-based transitions
// used by ProjectPreview & SocialCard

import gsap from 'gsap';

// build shuffled tile indices
export function shuffledTiles(cols: number, rows: number): [number, number][] {
	const tiles: [number, number][] = Array.from({ length: cols * rows }, (_, i) => [
		i % cols,
		Math.floor(i / cols)
	]);
	for (let i = tiles.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[tiles[i], tiles[j]] = [tiles[j], tiles[i]];
	}
	return tiles;
}

// animate tile reveal/hide on a canvas
export function runTileReveal(
	canvas: HTMLCanvasElement,
	tl: gsap.core.Timeline,
	cols: number,
	rows: number,
	reveal: boolean,
	duration: number,
	startAt: gsap.Position
) {
	canvas.width = canvas.offsetWidth;
	canvas.height = canvas.offsetHeight;
	const ctx = canvas.getContext('2d')!;
	const tw = canvas.width / cols;
	const th = canvas.height / rows;
	const tiles = shuffledTiles(cols, rows);
	const total = tiles.length;

	const themeColor = getComputedStyle(document.documentElement)
		.getPropertyValue('--color-primary')
		.trim();

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	if (reveal) {
		ctx.fillStyle = themeColor;
		ctx.fillRect(0, 0, canvas.width, canvas.height);
	}

	const proxy = { t: 0 };
	let drawn = 0;

	tl.to(
		proxy,
		{
			t: 1,
			duration,
			ease: 'power2.inOut',
			onUpdate() {
				const target = Math.floor(proxy.t * total);
				while (drawn < target) {
					const [c, r] = tiles[drawn];
					if (reveal) {
						ctx.clearRect(c * tw, r * th, tw + 0.5, th + 0.5);
					} else {
						ctx.fillStyle = themeColor;
						ctx.fillRect(c * tw, r * th, tw + 0.5, th + 0.5);
					}
					drawn++;
				}
			}
		},
		startAt
	);
}
