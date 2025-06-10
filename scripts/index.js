import CustomSelectors from './custom-selectors.js';
import PathFilters from './path-filters.js';

const cssSelectorUI = !!document.getElementById('selectorSection');
const cssSelectorController = new CustomSelectors(cssSelectorUI);
const pathFiltersUI = !!document.getElementById('filterSection');
const pathFiltersController = new PathFilters(pathFiltersUI);