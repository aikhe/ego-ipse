// glitch text-reveal animation
// shared between theme toggle & social link hovers

const SMALL_SYMBOLS = '·.:,;+-';
const LARGE_SYMBOLS = 'urilQZXW';

interface GlitchOptions {
	text: string;
	onUpdate: (text: string) => void;
	onComplete?: () => void;
	revealSpeed?: number;
	tailFrames?: number;
	frameMs?: number;
}

export function startGlitch(opts: GlitchOptions): ReturnType<typeof setInterval> {
	const { text, onUpdate, onComplete, revealSpeed = 1, tailFrames = 10, frameMs = 20 } = opts;

	let frames = 0;
	const totalFrames = text.length * revealSpeed + tailFrames;
	const resolveDelays = text.split('').map(() => Math.floor(Math.random() * 4));

	const interval = setInterval(() => {
		const charsToShow = Math.min(text.length, Math.floor(frames / revealSpeed) + 1);

		const result = text
			.split('')
			.map((_, i) => {
				if (i >= charsToShow) return '';

				const appearedFrame = i * revealSpeed;
				const progress = frames - appearedFrame - resolveDelays[i];

				if (progress > 5) return text[i];
				if (progress > 2) return LARGE_SYMBOLS[Math.floor(Math.random() * LARGE_SYMBOLS.length)];
				return SMALL_SYMBOLS[Math.floor(Math.random() * SMALL_SYMBOLS.length)];
			})
			.join('');

		onUpdate(result);

		if (frames > totalFrames) {
			clearInterval(interval);
			onUpdate(text);
			onComplete?.();
		}
		frames++;
	}, frameMs);

	return interval;
}
