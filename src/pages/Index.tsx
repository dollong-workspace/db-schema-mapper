import { useState, useMemo } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
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
    <div className="h-full">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        <ResizablePanel defaultSize={30} minSize={20} maxSize={40} className="border-r border-border">
          <DBMLEditor code={dbmlCode} onChange={setDbmlCode} />
        </ResizablePanel>
        <ResizableHandle withHandle className="bg-border hover:bg-primary/50 transition-colors" />
        <ResizablePanel defaultSize={70} minSize={60}>
          <DiagramCanvas
            parsedDBML={parsedDBML}
            dbmlCode={dbmlCode}
            onImport={handleImport}
            onSave={forceSave}
            onCodeChange={setDbmlCode} // <--- INI PERUBAHANNYA
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default Index;
