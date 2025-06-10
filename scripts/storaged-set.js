class StoragedSet {
  constructor(key) {
    this.key = key;
    this._set = new Set();
  }

  async save() {
    await chrome.storage.local.set({
      [this.key]: Array.from(this._set)
    });
  }

  async load() {
    const result = await chrome.storage.local.get([this.key]);
    if (result[this.key]) {
      this._set = new Set(result[this.key]);
    }
    return this._set;
  }

  async clear() {
    this._set.clear();
    await this.save();
  }

  async add(value) {
    if (!this._set.has(value)) {
      this._set.add(value);
      await this.save();
      return true;
    }
    return false;
  }

  async delete(value) {
    const deleted = this._set.delete(value);
    if (deleted) {
      await this.save();
    }
    return deleted;
  }

  has(value) {
    return this._set.has(value);
  }
  
  get value() {
    return this._set;
  }

  get size() {
    return this._set.size;
  }

  forEach(callback) {
    return this._set.forEach(callback);
  }
}

export default StoragedSet;