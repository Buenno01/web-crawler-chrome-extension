import { useState, useEffect } from 'react';

export default function useStoragedSet(key) {
  const [ values, setValues ] = useState(new Set());

  useEffect(() => {
    chrome.storage.local.get(key, (result) => {
      setValues(new Set(result[key]));
    });
  }, [key]);

  const save = () => {
    chrome.storage.local.set({
      [key]: Array.from(values)
    });
  };

  const clear = () => {
    setValues(new Set());
    save();
  };

  const add = (value) => {
    setValues(new Set([...values, value]));
    save();
  };

  const remove = (value) => {
    setValues(new Set([...values].filter((v) => v !== value)));
    save();
  };

  const has = (value) => {
    return values.has(value);
  };

  const size = () => {
    return values.size;
  };

  const forEach = (callback) => {
    values.forEach(callback);
  };

  return { values: Array.from(values), add, remove, clear, has, size, forEach };
};
