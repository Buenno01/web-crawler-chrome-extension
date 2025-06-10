class CustomSelectors {
  constructor(showUI = false) {
    this.cssSelectors = new Set();
    this.showUI = showUI;
    this.init(showUI);
  }

  get value() {
    return this.cssSelectors;
  }

  async saveSelectors() {
    await chrome.storage.local.set({
      'cssSelectors': Array.from(this.cssSelectors)
    });
  }
  
  async loadSelectors() {
    const result = await chrome.storage.local.get(['cssSelectors']);

    if (result.cssSelectors) {
      this.cssSelectors = new Set(result.cssSelectors);
    }
  }

  async clearSelectors() {
    this.cssSelectors.clear();
    await this.saveSelectors();
    this.updateSelectorDisplay();
  }

  async addSelector(selector) {
    selector = selector.trim();
    if (selector && !this.cssSelectors.has(selector)) {
      this.cssSelectors.add(selector);
      await this.saveSelectors();
      this.updateSelectorDisplay();
      return true;
    }
    return false;
  }

  async removeSelector(selector) {
    this.cssSelectors.delete(selector);
    await this.saveSelectors();
    this.updateSelectorDisplay();
  }

  updateSelectorDisplay() {
    const container = document.getElementById('activeSelectors');
    const clearBtn = document.getElementById('clearSelectorsButton');

    container.innerHTML = '';
    
    this.cssSelectors.forEach(selector => {
      const tag = document.createElement('div');
      tag.className = 'selector-tag tag';
      
      const selectorText = document.createTextNode(selector);
      tag.appendChild(selectorText);
      
      const button = document.createElement('button');
      button.className = 'remove-btn';
      button.innerHTML = '&times;';
      button.onclick = () => this.removeSelector(selector);
      
      tag.appendChild(button);
      container.appendChild(tag);
    });
    
    clearBtn.style.display = this.cssSelectors.size > 0 ? 'block' : 'none';
  }

  toggleSelectorControls(disabled) {
    const selectorSection = document.getElementById('selectorSection');
    const selectorInput = document.getElementById('selectorInput');
    const addSelectorButton = document.getElementById('addSelectorButton');
    const clearSelectorsButton = document.getElementById('clearSelectorsButton');
    const removeButtons = selectorSection.querySelectorAll('.remove-btn');
    const selectorTags = selectorSection.querySelectorAll('.selector-tag');

    selectorInput.disabled = disabled;
    addSelectorButton.disabled = disabled;
    clearSelectorsButton.disabled = disabled;
    removeButtons.forEach(btn => btn.disabled = disabled);
    selectorTags.forEach(tag => tag.classList.toggle('disabled', disabled));
    selectorSection.classList.toggle('disabled', disabled);
  }

  initEventListeners() {
    const selectorInput = document.getElementById('selectorInput');
    const addSelectorButton = document.getElementById('addSelectorButton');
    const clearSelectorsButton = document.getElementById('clearSelectorsButton');

    selectorInput.addEventListener('keypress', (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        addSelectorButton.click();
      }
    });
    
    addSelectorButton.addEventListener('click', () => {
      const selector = selectorInput.value.trim();
      if (this.addSelector(selector)) {
        selectorInput.value = '';
        this.saveSelectors(); // Save after adding selector
      }
    });

    clearSelectorsButton.addEventListener('click', () => {
      this.clearSelectors();
      this.saveSelectors(); // Save after clearing selectors
    });
  }

  async init(showUI = false) {
    await this.loadSelectors();
    if (showUI) {
      this.updateUI();
    }
  }

  updateUI() {
    this.initEventListeners();
    this.updateSelectorDisplay();
    this.toggleSelectorControls(false);
  }
}
