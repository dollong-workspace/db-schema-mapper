import { Save, Share2, Download, Upload, Sparkles, Sun, Moon, HelpCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useState } from 'react';
import { ExportModal } from './ExportModal';
import { ImportModal } from './ImportModal';
import { ShareModal } from './ShareModal';
import { ParsedDBML } from '@/lib/dbmlParser';
import { toast } from 'sonner';

interface DiagramToolbarProps {
  dbmlCode: string;
  parsedDBML: ParsedDBML;
  onImport: (code: string) => void;
  onSave: () => void;
  diagramRef?: React.RefObject<HTMLElement>;
}

export function DiagramToolbar({ dbmlCode, parsedDBML, onImport, onSave, diagramRef }: DiagramToolbarProps) {
  const [isDark, setIsDark] = useState(true);
  const [showExport, setShowExport] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');

  const handleSave = () => {
    setSaveState('saving');
    onSave();
    setTimeout(() => {
      setSaveState('saved');
      toast.success('Project saved');
      setTimeout(() => setSaveState('idle'), 2000);
    }, 300);
  };

  return (
    <>
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        {/* Save Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="toolbar"
              size="sm"
              onClick={handleSave}
              className="gap-2"
            >
              {saveState === 'saved' ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">
                {saveState === 'saving' ? 'Saving...' : saveState === 'saved' ? 'Saved' : 'Save'}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Save project</p>
          </TooltipContent>
        </Tooltip>

        {/* Share Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="toolbar"
              size="sm"
              onClick={() => setShowShare(true)}
              className="gap-2"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Share diagram</p>
          </TooltipContent>
        </Tooltip>

        {/* Import Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="toolbar"
              size="sm"
              onClick={() => setShowImport(true)}
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Import</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Import DBML/SQL</p>
          </TooltipContent>
        </Tooltip>

        {/* Export Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="toolbar"
              size="sm"
              onClick={() => setShowExport(true)}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Export diagram</p>
          </TooltipContent>
        </Tooltip>

        {/* Theme Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="toolbar"
              size="icon"
              onClick={() => setIsDark(!isDark)}
              className="w-9 h-9"
            >
              {isDark ? (
                <Moon className="w-4 h-4 text-primary" />
              ) : (
                <Sun className="w-4 h-4 text-primary" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Toggle theme</p>
          </TooltipContent>
        </Tooltip>

        {/* Pro AI Button */}
        <Button variant="pro" size="sm" className="gap-2">
          <Sparkles className="w-4 h-4" />
          <span>Pro AI</span>
        </Button>

        {/* Help */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="w-9 h-9 text-muted-foreground hover:text-foreground">
              <HelpCircle className="w-5 h-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Help</p>
          </TooltipContent>
        </Tooltip>

        {/* User Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-glow-orange to-glow-pink" />
      </div>

      {/* Modals */}
      <ExportModal
        open={showExport}
        onOpenChange={setShowExport}
        dbmlCode={dbmlCode}
        parsedDBML={parsedDBML}
        diagramRef={diagramRef}
      />
      
      <ImportModal
        open={showImport}
        onOpenChange={setShowImport}
        onImport={onImport}
      />
      
      <ShareModal
        open={showShare}
        onOpenChange={setShowShare}
        dbmlCode={dbmlCode}
      />
    </>
  );
}
