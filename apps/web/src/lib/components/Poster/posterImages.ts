import poster1Small from '$lib/assets/posters/1-400.webp';
import poster1Medium from '$lib/assets/posters/1-600.webp';
import poster1Large from '$lib/assets/posters/1-800.webp';
import poster1Full from '$lib/assets/posters/1-full.webp';
import poster2Small from '$lib/assets/posters/2-400.webp';
import poster2Medium from '$lib/assets/posters/2-600.webp';
import poster2Large from '$lib/assets/posters/2-800.webp';
import poster2Full from '$lib/assets/posters/2-full.webp';
import poster3Small from '$lib/assets/posters/3-400.webp';
import poster3Medium from '$lib/assets/posters/3-600.webp';
import poster3Large from '$lib/assets/posters/3-800.webp';
import poster3Full from '$lib/assets/posters/3-full.webp';
import poster4Small from '$lib/assets/posters/4-400.webp';
import poster4Medium from '$lib/assets/posters/4-600.webp';
import poster4Large from '$lib/assets/posters/4-800.webp';
import poster4Full from '$lib/assets/posters/4-full.webp';

// native width of the lossless full masters; update after new exports.
const FULL_WIDTH = 1424;

// full masters serve the overlay, /ipse and dense grid slots; the near-lossless
// previews come from scripts/generate-poster-previews.ps1.
function poster(small: string, medium: string, large: string, full: string) {
  return {
    src: large,
    full,
    srcset: `${small} 400w, ${medium} 600w, ${large} 800w, ${full} ${FULL_WIDTH}w`,
  };
}

// grid order.
export const posters = [
  poster(poster1Small, poster1Medium, poster1Large, poster1Full),
  poster(poster4Small, poster4Medium, poster4Large, poster4Full),
  poster(poster3Small, poster3Medium, poster3Large, poster3Full),
  poster(poster2Small, poster2Medium, poster2Large, poster2Full),
];

export const posterFulls = posters.map(p => p.full);

// mobile cards occupy 78% of the column after its margins and borders.
export const posterSizes =
  '(max-width: 48rem) calc((100vw - 2rem - 4px) * 0.78), 17.65rem';
