import { useState, useCallback } from 'react';
import { FamilyTreeData } from '../types/familyTree';

const MAX_HISTORY_LENGTH = 30;

export function useHistory(initialPresent: FamilyTreeData) {
  const [past, setPast] = useState<FamilyTreeData[]>([]);
  const [present, setPresent] = useState<FamilyTreeData>(initialPresent);
  const [future, setFuture] = useState<FamilyTreeData[]>([]);

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  const setWithHistory = useCallback((newPresent: FamilyTreeData | ((prev: FamilyTreeData) => FamilyTreeData), recordHistory = true) => {
    setPresent(current => {
      const resolved = typeof newPresent === 'function' ? newPresent(current) : newPresent;
      if (recordHistory) {
        setPast(prevPast => [...prevPast.slice(-MAX_HISTORY_LENGTH + 1), current]);
        setFuture([]);
      }
      return resolved;
    });
  }, []);

  const undo = useCallback(() => {
    if (!canUndo) return;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    setPast(newPast);
    setFuture(prevFuture => [present, ...prevFuture]);
    setPresent(previous);
  }, [canUndo, past, present]);

  const redo = useCallback(() => {
    if (!canRedo) return;
    const next = future[0];
    const newFuture = future.slice(1);
    setPast(prevPast => [...prevPast, present]);
    setFuture(newFuture);
    setPresent(next);
  }, [canRedo, future, present]);

  const resetHistory = useCallback((newInitial: FamilyTreeData) => {
    setPast([]);
    setFuture([]);
    setPresent(newInitial);
  }, []);

  return {
    state: present,
    setState: setWithHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    resetHistory
  };
}

