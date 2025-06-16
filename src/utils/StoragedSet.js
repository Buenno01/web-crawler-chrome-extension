import { useRef, useEffect, useState } from 'react';

export default function useStoragedSet(key) {
  const valuesRef = useRef(new Set());
  const [, forceUpdate] = useState(0); // For triggering re-renders

  const triggerRerender = () => {
    forceUpdate(prev => prev + 1);
  };

  useEffect(() => {
    load();
  }, [key]);

  const load = async () => {
    const result = await chrome.storage.local.get(key);
    valuesRef.current = new Set(result[key]);
    triggerRerender();
  };

  const save = async () => {
    await chrome.storage.local.set({
      [key]: Array.from(valuesRef.current)
    });
  };

  const clear = async () => {
    valuesRef.current = new Set();
    await save();
    triggerRerender();
  };

  const add = async (value) => {
    valuesRef.current = new Set([...valuesRef.current, value]);
    await save();
    triggerRerender();
  };

  const remove = async (value) => {
    if (valuesRef.current.size === 1) {
      await clear();
      return;
    }
    valuesRef.current = new Set([...valuesRef.current].filter((v) => v !== value));
    await save();
    triggerRerender();
  };

  const has = (value) => {
    return valuesRef.current.has(value);
  };

  const size = () => {
    return valuesRef.current.size;
  };

  const forEach = (callback) => {
    valuesRef.current.forEach(callback);
  };

  return { values: Array.from(valuesRef.current), add, remove, clear, has, size, forEach };
};
