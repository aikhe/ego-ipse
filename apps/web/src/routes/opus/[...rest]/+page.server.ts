import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// opus tabs moved to top-level routes — keep every old /opus/* url working.
export const load: PageServerLoad = ({ params, url }) => {
  throw redirect(308, `/${params.rest}${url.search}`);
};
