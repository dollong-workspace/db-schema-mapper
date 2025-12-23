import { Minus, Plus, Maximize2, Hand, Grid3X3, Search } from 'lucide-react';
import { useReactFlow } from 'reactflow';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export function ZoomControls() {
  const { zoomIn, zoomOut, fitView, zoomTo } = useReactFlow();

  return (
    <>
      {/* Center Controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-1 z-10">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => zoomOut()}>
              <Minus className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Zoom out</TooltipContent>
        </Tooltip>

        <Button
          variant="ghost"
          size="sm"
          className="px-3 h-8 text-xs font-mono text-muted-foreground hover:text-foreground"
          onClick={() => zoomTo(1)}
        >
          100%
        </Button>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => zoomIn()}>
              <Plus className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Zoom in</TooltipContent>
        </Tooltip>

        <div className="w-px h-5 bg-border mx-1" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => fitView({ padding: 0.2 })}>
              <Maximize2 className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Fit view</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <Hand className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Pan mode</TooltipContent>
        </Tooltip>
      </div>

      {/* Right Controls */}
      <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-1 z-10">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <Maximize2 className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Fullscreen</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <Grid3X3 className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Toggle grid</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <Search className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Search</TooltipContent>
        </Tooltip>
      </div>
    </>
  );
}
