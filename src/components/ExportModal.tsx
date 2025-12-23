import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileDown, FileCode, Database, Image, FileJson } from 'lucide-react';
import { ParsedDBML } from '@/lib/dbmlParser';
import { exportToDBML, exportToSQL, exportToJSON, exportToImage } from '@/lib/exportUtils';
import { toast } from 'sonner';

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dbmlCode: string;
  parsedDBML: ParsedDBML;
  diagramRef?: React.RefObject<HTMLElement>;
}

type SQLDialect = 'postgresql' | 'mysql' | 'sqlite' | 'sqlserver';

export function ExportModal({ open, onOpenChange, dbmlCode, parsedDBML, diagramRef }: ExportModalProps) {
  const [sqlDialect, setSqlDialect] = useState<SQLDialect>('postgresql');

  const handleExportDBML = () => {
    exportToDBML(dbmlCode);
    toast.success('DBML file exported');
    onOpenChange(false);
  };

  const handleExportSQL = () => {
    exportToSQL(parsedDBML, sqlDialect);
    toast.success(`SQL file exported (${sqlDialect})`);
    onOpenChange(false);
  };

  const handleExportJSON = () => {
    exportToJSON(dbmlCode, parsedDBML);
    toast.success('JSON file exported');
    onOpenChange(false);
  };

  const handleExportPNG = async () => {
    if (diagramRef?.current) {
      await exportToImage(diagramRef.current, 'png');
      toast.success('PNG image exported');
      onOpenChange(false);
    } else {
      toast.error('Diagram not available');
    }
  };

  const handleExportSVG = async () => {
    if (diagramRef?.current) {
      await exportToImage(diagramRef.current, 'svg');
      toast.success('SVG image exported');
      onOpenChange(false);
    } else {
      toast.error('Diagram not available');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <FileDown className="w-5 h-5 text-primary" />
            Export Diagram
          </DialogTitle>
          <DialogDescription>
            Choose a format to export your diagram
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 py-4">
          {/* DBML Export */}
          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-12"
            onClick={handleExportDBML}
          >
            <FileCode className="w-5 h-5 text-cyan-400" />
            <div className="text-left">
              <div className="font-medium">DBML File</div>
              <div className="text-xs text-muted-foreground">Raw DBML code (.dbml)</div>
            </div>
          </Button>

          {/* SQL Export */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 justify-start gap-3 h-12"
              onClick={handleExportSQL}
            >
              <Database className="w-5 h-5 text-orange-400" />
              <div className="text-left">
                <div className="font-medium">SQL Script</div>
                <div className="text-xs text-muted-foreground">CREATE TABLE statements</div>
              </div>
            </Button>
            <Select value={sqlDialect} onValueChange={(v) => setSqlDialect(v as SQLDialect)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="postgresql">PostgreSQL</SelectItem>
                <SelectItem value="mysql">MySQL</SelectItem>
                <SelectItem value="sqlite">SQLite</SelectItem>
                <SelectItem value="sqlserver">SQL Server</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* JSON Export */}
          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-12"
            onClick={handleExportJSON}
          >
            <FileJson className="w-5 h-5 text-green-400" />
            <div className="text-left">
              <div className="font-medium">JSON File</div>
              <div className="text-xs text-muted-foreground">Diagram structure data (.json)</div>
            </div>
          </Button>

          {/* Image Export */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 justify-start gap-3 h-12"
              onClick={handleExportPNG}
            >
              <Image className="w-5 h-5 text-pink-400" />
              <div className="text-left">
                <div className="font-medium">PNG Image</div>
                <div className="text-xs text-muted-foreground">High-resolution image</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-12 px-4"
              onClick={handleExportSVG}
            >
              SVG
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
