import { useState, useMemo, useEffect } from 'react';
import { DBMLEditor } from '@/components/DBMLEditor';
import { DiagramCanvas } from '@/components/DiagramCanvas';
import { parseDBML, DEFAULT_DBML } from '@/lib/dbmlParser';
import { loadFromLocalStorage, useAutoSave } from '@/hooks/useAutoSave';

const Index = () => {
  const [dbmlCode, setDbmlCode] = useState(() => {
    // Try to load from localStorage on initial mount
    const saved = loadFromLocalStorage();
    return saved?.dbmlCode || DEFAULT_DBML;
  });

  const parsedDBML = useMemo(() => {
    try {
      return parseDBML(dbmlCode);
    } catch (error) {
      console.error('Failed to parse DBML:', error);
      return { tables: [], relationships: [] };
    }
  }, [dbmlCode]);

  const { forceSave } = useAutoSave(dbmlCode);

  const handleImport = (code: string) => {
    setDbmlCode(code);
  };

  return (
    <div className="h-full flex">
      <div className="w-[40%] min-w-[350px] border-r border-border">
        <DBMLEditor code={dbmlCode} onChange={setDbmlCode} />
      </div>
      <div className="flex-1">
        <DiagramCanvas 
          parsedDBML={parsedDBML} 
          dbmlCode={dbmlCode}
          onImport={handleImport}
          onSave={forceSave}
        />
      </div>
    </div>
  );
};

export default Index;
