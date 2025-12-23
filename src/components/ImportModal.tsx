import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileCode, Database, FileJson, AlertCircle } from 'lucide-react';
import { importDBML, importSQL, importJSON, readFileContent, detectFileType, ImportResult } from '@/lib/importUtils';
import { toast } from 'sonner';

interface ImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (dbmlCode: string) => void;
}

export function ImportModal({ open, onOpenChange, onImport }: ImportModalProps) {
  const [pasteContent, setPasteContent] = useState('');
  const [pasteType, setPasteType] = useState<'dbml' | 'sql'>('dbml');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const content = await readFileContent(file);
      const fileType = detectFileType(file.name);
      
      let result: ImportResult;
      switch (fileType) {
        case 'dbml':
          result = importDBML(content);
          break;
        case 'sql':
          result = importSQL(content);
          break;
        case 'json':
          result = importJSON(content);
          break;
        default:
          // Try to auto-detect
          if (content.includes('CREATE TABLE')) {
            result = importSQL(content);
          } else if (content.includes('"dbmlCode"')) {
            result = importJSON(content);
          } else {
            result = importDBML(content);
          }
      }

      if (result.success === true) {
        onImport(result.dbmlCode);
        toast.success('Diagram imported successfully');
        onOpenChange(false);
        setError(null);
      } else if (result.success === false) {
        setError(result.error);
      }
    } catch (err) {
      setError(`Failed to read file: ${err}`);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePasteImport = () => {
    if (!pasteContent.trim()) {
      setError('Please paste some content');
      return;
    }

    let result: ImportResult;
    if (pasteType === 'sql') {
      result = importSQL(pasteContent);
    } else {
      result = importDBML(pasteContent);
    }

    if (result.success === true) {
      onImport(result.dbmlCode);
      toast.success('Diagram imported successfully');
      onOpenChange(false);
      setPasteContent('');
      setError(null);
    } else if (result.success === false) {
      setError(result.error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            Import Diagram
          </DialogTitle>
          <DialogDescription>
            Import from a file or paste code directly
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="file" className="py-4">
          <TabsList className="w-full">
            <TabsTrigger value="file" className="flex-1">Upload File</TabsTrigger>
            <TabsTrigger value="paste" className="flex-1">Paste Code</TabsTrigger>
          </TabsList>
          
          <TabsContent value="file" className="space-y-4 mt-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept=".dbml,.sql,.json"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-foreground font-medium">Click to upload</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Supports .dbml, .sql, .json files
                </p>
              </label>
            </div>
            
            <div className="flex gap-2 text-sm text-muted-foreground">
              <FileCode className="w-4 h-4 text-cyan-400" />
              <span>DBML</span>
              <Database className="w-4 h-4 text-orange-400 ml-2" />
              <span>SQL</span>
              <FileJson className="w-4 h-4 text-green-400 ml-2" />
              <span>JSON</span>
            </div>
          </TabsContent>
          
          <TabsContent value="paste" className="space-y-4 mt-4">
            <div className="flex gap-2 mb-2">
              <Button
                variant={pasteType === 'dbml' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPasteType('dbml')}
              >
                <FileCode className="w-4 h-4 mr-1" />
                DBML
              </Button>
              <Button
                variant={pasteType === 'sql' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPasteType('sql')}
              >
                <Database className="w-4 h-4 mr-1" />
                SQL
              </Button>
            </div>
            
            <Textarea
              placeholder={pasteType === 'dbml' 
                ? 'Paste your DBML code here...\n\nTable users {\n  id integer [primary key]\n  name varchar\n}'
                : 'Paste your SQL CREATE TABLE statements here...'}
              value={pasteContent}
              onChange={(e) => setPasteContent(e.target.value)}
              className="min-h-[200px] font-mono text-sm bg-background"
            />
            
            <Button onClick={handlePasteImport} className="w-full">
              Import
            </Button>
          </TabsContent>
        </Tabs>
        
        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
