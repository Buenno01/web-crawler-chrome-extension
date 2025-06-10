import CustomSelectors from './custom-selectors.js';
import PathFilters from './path-filters.js';

const cssSelectorUI = !!document.getElementById('selectorSection');
new CustomSelectors(cssSelectorUI);

const pathFiltersUI = !!document.getElementById('filterSection');
new PathFilters(pathFiltersUI);