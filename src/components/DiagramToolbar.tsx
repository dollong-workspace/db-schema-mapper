import { Save, Share2, Download, Upload, Sparkles, Sun, Moon, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useState } from 'react';

export function DiagramToolbar() {
  const [isDark, setIsDark] = useState(true);

  const tools = [
    { icon: Save, label: 'Save', action: () => {} },
    { icon: Share2, label: 'Share', action: () => {} },
    { icon: Upload, label: 'Import', action: () => {} },
    { icon: Download, label: 'Export', action: () => {} },
  ];

  return (
    <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
      {tools.map(({ icon: Icon, label, action }) => (
        <Tooltip key={label}>
          <TooltipTrigger asChild>
            <Button
              variant="toolbar"
              size="sm"
              onClick={action}
              className="gap-2"
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{label}</p>
          </TooltipContent>
        </Tooltip>
      ))}

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
  );
}
