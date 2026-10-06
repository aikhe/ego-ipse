import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

// hidden until the osn case study is ready — remove to re-enable
export const load: LayoutServerLoad = () => error(404, 'Not found');
