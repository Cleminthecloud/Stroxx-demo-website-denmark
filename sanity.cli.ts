import { defineCliConfig } from 'sanity/cli';
import { projectId, dataset } from './sanity/env';

/** Lets `npx sanity ...` commands (login, exec for the seed script) know which
 *  project and dataset to talk to. */
export default defineCliConfig({ api: { projectId, dataset } });
