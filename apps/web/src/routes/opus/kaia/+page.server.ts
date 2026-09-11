import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const prerender = false;

// opus tabs moved to top-level routes — keep the old url working.
export const load: PageServerLoad = async () => {
  throw redirect(308, '/kaia');
};
