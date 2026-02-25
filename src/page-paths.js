/**
 * Samsung page-path catalogue for experiment test scaffolding.
 *
 * Four page types, each with a `type` field:
 *   PFP  — Product Filter/Listing pages  (category listing grids)
 *   PCD  — Product Category/Department   (top-level category hubs)
 *   PDP  — Product Detail Pages          (individual product pages)
 *   BUY  — Buy/Purchase pages            (buy flow for a product)
 *
 * Value keys are unique camelCase strings used as JS object keys in the
 * generated pagePaths object and as test labels in Playwright output.
 */
export const PAGE_PATH_CHOICES = [
	// ── PFP: Smartphones ─────────────────────────────────────────────────────
	{ title: 'PFP · All Smartphones',        value: 'pfpSmartphonesAll',        path: '/smartphones/all-smartphones/',            type: 'PFP' },
	{ title: 'PFP · Galaxy A',               value: 'pfpSmartphonesGalaxyA',    path: '/smartphones/galaxy-a/',                   type: 'PFP' },
	{ title: 'PFP · Galaxy S',               value: 'pfpSmartphonesGalaxyS',    path: '/smartphones/galaxy-s/',                   type: 'PFP' },
	{ title: 'PFP · Galaxy Z',               value: 'pfpSmartphonesGalaxyZ',    path: '/smartphones/galaxy-z/',                   type: 'PFP' },
	// ── PFP: Tablets ─────────────────────────────────────────────────────────
	{ title: 'PFP · All Tablets',            value: 'pfpTabletsAll',            path: '/tablets/all-tablets/',                    type: 'PFP' },
	{ title: 'PFP · Galaxy Tab S',           value: 'pfpTabletsGalaxyTabS',     path: '/tablets/galaxy-tab-s/',                   type: 'PFP' },
	{ title: 'PFP · Galaxy Tab A',           value: 'pfpTabletsGalaxyTabA',     path: '/tablets/galaxy-tab-a/',                   type: 'PFP' },
	// ── PFP: Computers ───────────────────────────────────────────────────────
	{ title: 'PFP · All Computers',          value: 'pfpComputersAll',          path: '/computers/all-computers/',                type: 'PFP' },
	{ title: 'PFP · Galaxy Book',            value: 'pfpComputersGalaxyBook',   path: '/computers/galaxy-book/',                  type: 'PFP' },
	{ title: 'PFP · Chromebook',             value: 'pfpComputersChromebook',   path: '/computers/chromebook/',                   type: 'PFP' },
	// ── PFP: Monitors ────────────────────────────────────────────────────────
	{ title: 'PFP · All Monitors',           value: 'pfpMonitorsAll',           path: '/monitors/all-monitors/',                  type: 'PFP' },
	{ title: 'PFP · Gaming Monitors',        value: 'pfpMonitorsGaming',        path: '/monitors/gaming/',                        type: 'PFP' },
	// ── PFP: Watches ─────────────────────────────────────────────────────────
	{ title: 'PFP · All Watches',            value: 'pfpWatchesAll',            path: '/watches/all-watches/',                    type: 'PFP' },
	{ title: 'PFP · Galaxy Watch',           value: 'pfpWatchesGalaxyWatch',    path: '/watches/galaxy-watch/',                   type: 'PFP' },
	// ── PFP: TVs ─────────────────────────────────────────────────────────────
	{ title: 'PFP · Neo QLED TVs',           value: 'pfpTvsNeoQled',            path: '/tvs/neo-qled-tvs/',                       type: 'PFP' },
	{ title: 'PFP · OLED TVs',               value: 'pfpTvsOled',               path: '/tvs/oled-tvs/',                           type: 'PFP' },
	{ title: 'PFP · QLED TVs',               value: 'pfpTvsQled',               path: '/tvs/qled-tvs/',                           type: 'PFP' },
	{ title: 'PFP · 8K TVs',                 value: 'pfpTvs8k',                 path: '/tvs/8k-tv/',                              type: 'PFP' },
	{ title: 'PFP · All TVs',                value: 'pfpTvsAll',                path: '/tvs/all-tvs/',                            type: 'PFP' },
	{ title: 'PFP · Crystal UHD TVs',        value: 'pfpTvsCrystalUhd',         path: '/tvs/all-tvs/?crystal-uhd',                type: 'PFP' },
	{ title: 'PFP · The Frame',              value: 'pfpLifestyleTheFrame',      path: '/lifestyle-tvs/the-frame/',                type: 'PFP' },
	{ title: 'PFP · The Serif',              value: 'pfpLifestyleTheSerif',      path: '/lifestyle-tvs/the-serif/',                type: 'PFP' },
	{ title: 'PFP · The Terrace',            value: 'pfpLifestyleTheTerrace',    path: '/lifestyle-tvs/the-terrace/',              type: 'PFP' },
	{ title: 'PFP · The Sero',               value: 'pfpLifestyleTheSero',       path: '/lifestyle-tvs/the-sero/',                 type: 'PFP' },
	// ── PFP: Audio ───────────────────────────────────────────────────────────
	{ title: 'PFP · All Audio Devices',      value: 'pfpAudioAll',              path: '/audio-devices/all-audio-devices/',        type: 'PFP' },
	// ── PFP: Refrigerators ───────────────────────────────────────────────────
	{ title: 'PFP · All Refrigerators',      value: 'pfpRefrigeratorsAll',      path: '/refrigerators/all-refrigerators/',        type: 'PFP' },
	{ title: 'PFP · Smart Refrigerators',    value: 'pfpRefrigSmart',           path: '/refrigerators/smart/',                    type: 'PFP' },
	{ title: 'PFP · French Door',            value: 'pfpRefrigFrenchDoor',      path: '/refrigerators/french-door/',              type: 'PFP' },
	{ title: 'PFP · Side-by-Side',           value: 'pfpRefrigSideBySide',      path: '/refrigerators/side-by-side/',             type: 'PFP' },
	// ── PFP: Washers & Dryers ────────────────────────────────────────────────
	{ title: 'PFP · All Washers & Dryers',   value: 'pfpWashersAll',            path: '/washers-and-dryers/all-washers-and-dryers/', type: 'PFP' },
	{ title: 'PFP · Washing Machines',       value: 'pfpWashingMachines',       path: '/washers-and-dryers/washing-machines/',    type: 'PFP' },
	{ title: 'PFP · Washer-Dryer Combo',     value: 'pfpWasherDryerCombo',      path: '/washers-and-dryers/washer-dryer-combo/',  type: 'PFP' },
	{ title: 'PFP · Dryers',                 value: 'pfpDryers',                path: '/washers-and-dryers/dryers/',              type: 'PFP' },
	// ── PFP: Cooking ─────────────────────────────────────────────────────────
	{ title: 'PFP · All Cooking',            value: 'pfpCookingAll',            path: '/cooking-appliances/all-cooking-appliances/', type: 'PFP' },
	{ title: 'PFP · Ovens',                  value: 'pfpCookingOvens',          path: '/cooking-appliances/ovens/',               type: 'PFP' },
	{ title: 'PFP · Hobs',                   value: 'pfpCookingHobs',           path: '/cooking-appliances/hobs/',                type: 'PFP' },
	{ title: 'PFP · Microwave Ovens',        value: 'pfpMicrowaveAll',          path: '/microwave-ovens/all-microwave-ovens/',    type: 'PFP' },
	{ title: 'PFP · Hoods',                  value: 'pfpCookingHoods',          path: '/cooking-appliances/hoods/',               type: 'PFP' },
	// ── PFP: Dishwashers / Vacuums ───────────────────────────────────────────
	{ title: 'PFP · All Dishwashers',        value: 'pfpDishwashersAll',        path: '/dishwashers/all-dishwashers/',            type: 'PFP' },
	{ title: 'PFP · All Vacuum Cleaners',    value: 'pfpVacuumAll',             path: '/vacuum-cleaners/all-vacuum-cleaners/',    type: 'PFP' },

	// ── PCD: Top-level category hubs ─────────────────────────────────────────
	{ title: 'PCD · Smartphones',            value: 'pcdSmartphones',           path: '/smartphones/',                            type: 'PCD' },
	{ title: 'PCD · Tablets',                value: 'pcdTablets',               path: '/tablets/',                                type: 'PCD' },
	{ title: 'PCD · Computers',              value: 'pcdComputers',             path: '/computers/',                              type: 'PCD' },
	{ title: 'PCD · Monitors',               value: 'pcdMonitors',              path: '/monitors/',                               type: 'PCD' },
	{ title: 'PCD · Watches',                value: 'pcdWatches',               path: '/watches/',                                type: 'PCD' },
	{ title: 'PCD · TVs',                    value: 'pcdTvs',                   path: '/tvs/',                                    type: 'PCD' },
	{ title: 'PCD · Lifestyle TVs',          value: 'pcdLifestyleTvs',          path: '/lifestyle-tvs/',                          type: 'PCD' },
	{ title: 'PCD · Audio Devices',          value: 'pcdAudio',                 path: '/audio-devices/',                          type: 'PCD' },
	{ title: 'PCD · Projectors',             value: 'pcdProjectors',            path: '/projectors/',                             type: 'PCD' },
	{ title: 'PCD · Refrigerators',          value: 'pcdRefrigerators',         path: '/refrigerators/',                          type: 'PCD' },
	{ title: 'PCD · Washers & Dryers',       value: 'pcdWashers',               path: '/washers-and-dryers/',                     type: 'PCD' },
	{ title: 'PCD · Cooking',                value: 'pcdCooking',               path: '/cooking-appliances/',                     type: 'PCD' },
	{ title: 'PCD · Dishwashers',            value: 'pcdDishwashers',           path: '/dishwashers/',                            type: 'PCD' },
	{ title: 'PCD · Vacuum Cleaners',        value: 'pcdVacuum',                path: '/vacuum-cleaners/',                        type: 'PCD' },

	// ── PDP: Product Detail Pages ─────────────────────────────────────────────
	{ title: 'PDP · Galaxy Z Fold7',         value: 'pdpGalaxyZFold7',          path: '/smartphones/galaxy-z-fold7/',             type: 'PDP' },
	{ title: 'PDP · Galaxy Z Flip7',         value: 'pdpGalaxyZFlip7',          path: '/smartphones/galaxy-z-flip7/',             type: 'PDP' },
	{ title: 'PDP · Galaxy Z Flip7 FE',      value: 'pdpGalaxyZFlip7Fe',        path: '/smartphones/galaxy-z-flip7-fe/',          type: 'PDP' },
	{ title: 'PDP · Galaxy S25',             value: 'pdpGalaxyS25',             path: '/smartphones/galaxy-s25/',                 type: 'PDP' },
	{ title: 'PDP · Galaxy S25 Edge',        value: 'pdpGalaxyS25Edge',         path: '/smartphones/galaxy-s25-edge/',            type: 'PDP' },
	{ title: 'PDP · Galaxy S25 Ultra',       value: 'pdpGalaxyS25Ultra',        path: '/smartphones/galaxy-s25-ultra/',           type: 'PDP' },
	{ title: 'PDP · Galaxy Z Fold6',         value: 'pdpGalaxyZFold6',          path: '/smartphones/galaxy-z-fold6/',             type: 'PDP' },
	{ title: 'PDP · Galaxy Z Flip6',         value: 'pdpGalaxyZFlip6',          path: '/smartphones/galaxy-z-flip6/',             type: 'PDP' },
	{ title: 'PDP · Galaxy S24',             value: 'pdpGalaxyS24',             path: '/smartphones/galaxy-s24/',                 type: 'PDP' },
	{ title: 'PDP · Galaxy S24 FE',          value: 'pdpGalaxyS24Fe',           path: '/smartphones/galaxy-s24-fe/',              type: 'PDP' },
	{ title: 'PDP · Galaxy S24 Ultra',       value: 'pdpGalaxyS24Ultra',        path: '/smartphones/galaxy-s24-ultra/',           type: 'PDP' },

	// ── BUY: Purchase pages ───────────────────────────────────────────────────
	{ title: 'BUY · Galaxy Z Fold7',         value: 'buyGalaxyZFold7',          path: '/smartphones/galaxy-z-fold7/buy/',         type: 'BUY' },
	{ title: 'BUY · Galaxy Z Flip7',         value: 'buyGalaxyZFlip7',          path: '/smartphones/galaxy-z-flip7/buy/',         type: 'BUY' },
	{ title: 'BUY · Galaxy Z Flip7 FE',      value: 'buyGalaxyZFlip7Fe',        path: '/smartphones/galaxy-z-flip7-fe/buy/',      type: 'BUY' },
	{ title: 'BUY · Galaxy S25',             value: 'buyGalaxyS25',             path: '/smartphones/galaxy-s25/buy/',             type: 'BUY' },
	{ title: 'BUY · Galaxy S25 Edge',        value: 'buyGalaxyS25Edge',         path: '/smartphones/galaxy-s25-edge/buy/',        type: 'BUY' },
	{ title: 'BUY · Galaxy S25 Ultra',       value: 'buyGalaxyS25Ultra',        path: '/smartphones/galaxy-s25-ultra/buy/',       type: 'BUY' },
	{ title: 'BUY · Galaxy Z Fold6',         value: 'buyGalaxyZFold6',          path: '/smartphones/galaxy-z-fold6/buy/',         type: 'BUY' },
	{ title: 'BUY · Galaxy Z Flip6',         value: 'buyGalaxyZFlip6',          path: '/smartphones/galaxy-z-flip6/buy/',         type: 'BUY' },
	{ title: 'BUY · Galaxy S24',             value: 'buyGalaxyS24',             path: '/smartphones/galaxy-s24/buy/',             type: 'BUY' },
	{ title: 'BUY · Galaxy S24 Ultra',       value: 'buyGalaxyS24Ultra',        path: '/smartphones/galaxy-s24-ultra/buy/',       type: 'BUY' },
	{ title: 'BUY · Galaxy S24 FE',          value: 'buyGalaxyS24Fe',           path: '/smartphones/galaxy-s24-fe/buy/',          type: 'BUY' },
];

/**
 * Build the choices array for the multiselect prompt, injecting non-selectable
 * separator headers between page types so the terminal UI is scannable.
 *
 * The `prompts` library renders disabled entries as group headings.
 *
 * @returns {Array} choices array for prompts multiselect
 */
export function getPagePathPromptChoices() {
	const typeLabels = {
		PFP: '── PFP (Filter/Listing pages)',
		PCD: '── PCD (Category hubs)',
		PDP: '── PDP (Product Detail pages)',
		BUY: '── BUY (Purchase pages)',
	};
	const choices = [];
	let lastType = null;

	for (const entry of PAGE_PATH_CHOICES) {
		if (entry.type !== lastType) {
			choices.push({ title: typeLabels[entry.type], disabled: true, value: `__sep_${entry.type}` });
			lastType = entry.type;
		}
		choices.push({ title: entry.title.replace(/^[A-Z]+ · /, ''), value: entry.value });
	}

	return choices;
}

/**
 * Convert an array of selected page-path entries to a JS object literal string
 * suitable for injection as {{PAGE_PATHS_JS}} in templates.
 *
 * @param {Array<{value: string, path: string, type: string}>} selections
 * @returns {string}
 */
export function buildPagePathsJs(selections) {
	if (!selections || selections.length === 0) {
		return [
			'export const pagePaths = {',
			'\t// TODO: add page paths your experiment targets',
			"\t// pfpTvsAll: '/tvs/all-tvs/',",
			'};',
		].join('\n');
	}

	const entries = selections.map(({ value, path }) => `\t${value}: '${path}',`);
	return ['export const pagePaths = {', ...entries, '};'].join('\n');
}
