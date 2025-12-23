import { useEffect, useRef, useCallback } from 'react';

const STORAGE_KEY = 'dbml-diagram-project';
const AUTO_SAVE_INTERVAL = 5000; // 5 seconds

export interface ProjectData {
  id: string;
  name: string;
  dbmlCode: string;
  nodePositions?: Record<string, { x: number; y: number }>;
  updatedAt: string;
  createdAt: string;
}

export function useAutoSave(
  dbmlCode: string,
  nodePositions?: Record<string, { x: number; y: number }>,
  projectId?: string
) {
  const lastSavedRef = useRef<string>('');
  const debounceRef = useRef<NodeJS.Timeout>();

  const saveToLocalStorage = useCallback((immediate = false) => {
    const dataToSave = JSON.stringify({ dbmlCode, nodePositions });
    
    // Skip if nothing changed
    if (dataToSave === lastSavedRef.current && !immediate) {
      return;
    }

    const save = () => {
      const existingData = localStorage.getItem(STORAGE_KEY);
      const existing: ProjectData = existingData 
        ? JSON.parse(existingData) 
        : { 
            id: projectId || crypto.randomUUID(), 
            name: 'Untitled Project',
            createdAt: new Date().toISOString() 
          };

      const project: ProjectData = {
        ...existing,
        dbmlCode,
        nodePositions,
        updatedAt: new Date().toISOString(),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
      lastSavedRef.current = dataToSave;
      console.log('Project saved to localStorage');
    };

    if (immediate) {
      save();
    } else {
      // Debounce saves
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(save, 500);
    }
  }, [dbmlCode, nodePositions, projectId]);

  // Auto-save at intervals
  useEffect(() => {
    const interval = setInterval(() => {
      saveToLocalStorage();
    }, AUTO_SAVE_INTERVAL);

    return () => {
      clearInterval(interval);
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [saveToLocalStorage]);

  // Save on unmount
  useEffect(() => {
    return () => {
      saveToLocalStorage(true);
    };
  }, [saveToLocalStorage]);

  const forceSave = useCallback(() => {
    saveToLocalStorage(true);
  }, [saveToLocalStorage]);

  return { forceSave };
}

export function loadFromLocalStorage(): ProjectData | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return null;
  }
}

export function clearLocalStorage(): void {
  localStorage.removeItem(STORAGE_KEY);
}
