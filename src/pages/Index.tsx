import { useState, useMemo } from 'react';
import { DBMLEditor } from '@/components/DBMLEditor';
import { DiagramCanvas } from '@/components/DiagramCanvas';
import { parseDBML, DEFAULT_DBML } from '@/lib/dbmlParser';

const Index = () => {
  const [dbmlCode, setDbmlCode] = useState(DEFAULT_DBML);

  const parsedDBML = useMemo(() => {
    try {
      return parseDBML(dbmlCode);
    } catch (error) {
      console.error('Failed to parse DBML:', error);
      return { tables: [], relationships: [] };
    }
  }, [dbmlCode]);

  return (
    <div className="h-full flex">
      {/* Left Panel - DBML Editor */}
      <div className="w-[40%] min-w-[350px] border-r border-border">
        <DBMLEditor code={dbmlCode} onChange={setDbmlCode} />
      </div>

      {/* Right Panel - Diagram Canvas */}
      <div className="flex-1">
        <DiagramCanvas parsedDBML={parsedDBML} />
      </div>
    </div>
  );
};

export default Index;
