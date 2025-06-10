import StoragedSet from './storaged-set.js';

class PathFilters extends StoragedSet {
  constructor(showUI = false) {
    super('pathFilters');
    this.showUI = showUI;
    this.init(showUI);
  }

  get pathFilters() {
    return this.value;
  }

  async clearFilters() {
    await this.clear();
    this.updateFilterDisplay();
  }

  async addFilter(filter) {
    filter = filter.trim();
    if (filter) {
      const added = await this.add(filter);
      if (added) {
        this.updateFilterDisplay();
      }
      return added;
    }
    return false;
  }

  async removeFilter(filter) {
    const removed = await this.delete(filter);
    if (removed) {
      this.updateFilterDisplay();
    }
  }

  matchesFilter(url) {
    if (this.size === 0) return true;
    const lowerUrl = url.toLowerCase();
    return Array.from(this.value).some(filter => lowerUrl.includes(filter));
  }

  updateFilterDisplay() {
    if (!this.showUI) return;
    const container = document.getElementById('activeFilters');
    const clearBtn = document.getElementById('clearFiltersButton');

    container.innerHTML = '';
    
    this.pathFilters.forEach(filter => {
      const tag = document.createElement('div');
      tag.className = 'selector-tag tag';
      
      const filterText = document.createTextNode(filter);
      tag.appendChild(filterText);
      
      const button = document.createElement('button');
      button.className = 'remove-btn';
      button.innerHTML = '&times;';
      button.onclick = () => this.removeFilter(filter);
      
      tag.appendChild(button);
      container.appendChild(tag);
    });
    
    clearBtn.style.display = this.size > 0 ? 'block' : 'none';
  }

  toggleFilterControls(disabled) {
    const filterSection = document.getElementById('filterSection');
    const filterInput = document.getElementById('pathInput');
    const addFilterButton = document.getElementById('addFilterButton');
    const clearFiltersButton = document.getElementById('clearFiltersButton');
    const removeButtons = filterSection.querySelectorAll('.remove-btn');
    const filterTags = filterSection.querySelectorAll('.filter-tag');

    filterInput.disabled = disabled;
    addFilterButton.disabled = disabled;
    clearFiltersButton.disabled = disabled;
    removeButtons.forEach(btn => btn.disabled = disabled);
    filterTags.forEach(tag => tag.classList.toggle('disabled', disabled));
    filterSection.classList.toggle('disabled', disabled);
  }

  initEventListeners() {
    const filterInput = document.getElementById('pathInput');
    const addFilterButton = document.getElementById('addFilterButton');
    const clearFiltersButton = document.getElementById('clearFiltersButton');

    filterInput.addEventListener('keypress', (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        addFilterButton.click();
      }
    });
    
    addFilterButton.addEventListener('click', async () => {
      const filter = filterInput.value.trim();
      if (await this.addFilter(filter)) {
        filterInput.value = '';
      }
    });

    clearFiltersButton.addEventListener('click', () => {
      this.clearFilters();
    });
  }

  async init(showUI = false) {
    await this.load();
    if (showUI) {
      this.updateUI();
    }
  }

  updateUI() {
    this.initEventListeners();
    this.updateFilterDisplay();
    this.toggleFilterControls(false);
  }
}

export default PathFilters;