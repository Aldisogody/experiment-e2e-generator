/**
 * Page paths for {{EXPERIMENT_NAME}} tests.
 *
 * Import the groups your experiment targets from the page-paths catalogue.
 *
 * Available groups:
 *   pfp  — pfp.smartphones · pfp.tvs · pfp.tablets · pfp.computers
 *          pfp.monitors · pfp.watches · pfp.audio · pfp.lifestyleTvs
 *          pfp.refrigerators · pfp.washers · pfp.cooking
 *          pfp.dishwashers · pfp.vacuums
 *   pcd  — pcd.smartphones · pcd.tvs · pcd.lifestyleTvs · pcd.audio
 *          pcd.projectors · pcd.refrigerators · pcd.washers · pcd.cooking
 *          pcd.dishwashers · pcd.vacuums
 *   pdp  — pdp.galaxyS25 · pdp.galaxyS24 · pdp.galaxyZFold · pdp.galaxyZFlip
 *   buy  — buy.galaxyS25 · buy.galaxyS24 · buy.galaxyZFold · buy.galaxyZFlip
 *
 * Example — spread multiple groups:
 *   import { pfp, pdp } from 'experiment-e2e-generator/page-paths';
 *   export const pagePaths = { ...pfp.smartphones, ...pdp.galaxyS25 };
 */
import { pfp } from 'experiment-e2e-generator/page-paths';

// Adjust to the pages your experiment targets:
export const pagePaths = {
	...pfp.smartphones,
};
