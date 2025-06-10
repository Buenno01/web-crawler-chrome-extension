class CustomSelectors extends StoragedSet {
  constructor(showUI = false) {
    super('cssSelectors');
    this.showUI = showUI;
    this.init(showUI);
  }

  get cssSelectors() {
    return this.value;
  }

  async clearSelectors() {
    await this.clear();
    this.updateSelectorDisplay();
  }

  async addSelector(selector) {
    selector = selector.trim();
    if (selector) {
      const added = await this.add(selector);
      if (added) {
        this.updateSelectorDisplay();
      }
      return added;
    }
    return false;
  }

  async removeSelector(selector) {
    const removed = await this.delete(selector);
    if (removed) {
      this.updateSelectorDisplay();
    }
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
    
    clearBtn.style.display = this.size > 0 ? 'block' : 'none';
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
    
    addSelectorButton.addEventListener('click', async () => {
      const selector = selectorInput.value.trim();
      if (await this.addSelector(selector)) {
        selectorInput.value = '';
      }
    });

    clearSelectorsButton.addEventListener('click', () => {
      this.clearSelectors();
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
    this.updateSelectorDisplay();
    this.toggleSelectorControls(false);
  }
}
