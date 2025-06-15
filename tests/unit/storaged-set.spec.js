import StoragedSet from '../../scripts/storaged-set';
import storageMock from '../__mocks__/storageMock';

describe('Storaged sets', () => {
  let storagedSet;

  beforeEach(() => {
    global.chrome = storageMock();
    storagedSet = new StoragedSet('testKey');
  });

  describe('constructor', () => {
    it('should create a new StoragedSet with the given key', () => {
      expect(storagedSet.key).toBe('testKey');
      expect(storagedSet.size).toBe(0);
    });
  });

  describe('load', () => {
    it('should load data from storage', async () => {
      const testData = ['item1', 'item2'];
      global.chrome.storage.local.get.mockResolvedValue({ testKey: testData });

      await storagedSet.load();

      expect(global.chrome.storage.local.get).toHaveBeenCalledWith(['testKey']);
      expect(storagedSet.size).toBe(2);
      expect(storagedSet.has('item1')).toBe(true);
      expect(storagedSet.has('item2')).toBe(true);
    });

    it('should handle empty storage data', async () => {
      global.chrome.storage.local.get.mockResolvedValue({});

      await storagedSet.load();

      expect(global.chrome.storage.local.get).toHaveBeenCalledWith(['testKey']);
      expect(storagedSet.size).toBe(0);
    });
  });

  describe('save', () => {
    it('should save data to storage when a new item is added', async () => {
      await storagedSet.add('item1');

      expect(global.chrome.storage.local.set).toHaveBeenCalledWith({
        testKey: ['item1']
      });
    });

    it('should save data to storage when the set is cleared', async () => {
      await storagedSet.clear();

      expect(global.chrome.storage.local.set).toHaveBeenCalledWith({
        testKey: []
      });
    });

    it('should save data to storage when any item is deleted', async () => {
      await storagedSet.add('item1');
      await storagedSet.add('item2');
      await storagedSet.delete('item1');

      expect(global.chrome.storage.local.set).toHaveBeenLastCalledWith({
        testKey: ['item2']
      });
    });
  });

  describe('add', () => {
    it('should add new items and return true', async () => {
      const result = await storagedSet.add('item1');

      expect(result).toBe(true);
      expect(storagedSet.has('item1')).toBe(true);
      expect(global.chrome.storage.local.set).toHaveBeenCalledWith({
        testKey: ['item1']
      });
    });

    it('should not add duplicate items and return false', async () => {
      await storagedSet.add('item1');
      global.chrome.storage.local.set.mockClear();

      const result = await storagedSet.add('item1');

      expect(result).toBe(false);
      expect(storagedSet.size).toBe(1);
      expect(global.chrome.storage.local.set).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete existing items and return true', async () => {
      await storagedSet.add('item1');
      global.chrome.storage.local.set.mockClear();

      const result = await storagedSet.delete('item1');

      expect(result).toBe(true);
      expect(storagedSet.has('item1')).toBe(false);
      expect(global.chrome.storage.local.set).toHaveBeenCalledWith({
        testKey: []
      });
    });

    it('should return false when deleting non-existent items', async () => {
      const result = await storagedSet.delete('nonexistent');

      expect(result).toBe(false);
      expect(global.chrome.storage.local.set).not.toHaveBeenCalled();
    });
  });

  describe('clear', () => {
    it('should clear all items', async () => {
      await storagedSet.add('item1');
      await storagedSet.add('item2');
      global.chrome.storage.local.set.mockClear();

      await storagedSet.clear();

      expect(storagedSet.size).toBe(0);
      expect(global.chrome.storage.local.set).toHaveBeenCalledWith({
        testKey: []
      });
    });
  });

  describe('forEach', () => {
    it('should iterate over all items', async () => {
      await storagedSet.add('item1');
      await storagedSet.add('item2');

      const items = [];
      storagedSet.forEach(item => items.push(item));

      expect(items).toEqual(['item1', 'item2']);
    });
  });
}); 