export default function storageMock(setVariable, getVariable) {
  return {
    storage: {
      local: {
        get: jest.fn(),
        set: jest.fn().mockResolvedValue(),
        remove: jest.fn(),
        clear: jest.fn(),
      }
    }
  };
}