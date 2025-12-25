import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Key, Link } from 'lucide-react';
import type { Column } from '@/lib/dbmlParser';

export interface TableNodeData {
  tableName: string;
  columns: Column[];
  glowColor: 'cyan' | 'purple' | 'orange' | 'green' | 'pink' | 'blue';
}

const glowGradients = {
  cyan: 'from-glow-cyan/15 to-transparent',
  purple: 'from-glow-purple/15 to-transparent',
  orange: 'from-glow-orange/15 to-transparent',
  green: 'from-glow-green/15 to-transparent',
  pink: 'from-glow-pink/15 to-transparent',
  blue: 'from-glow-blue/15 to-transparent',
};

const borderColors = {
  cyan: 'border-glow-cyan/30',
  purple: 'border-glow-purple/30',
  orange: 'border-glow-orange/30',
  green: 'border-glow-green/30',
  pink: 'border-glow-pink/30',
  blue: 'border-glow-blue/30',
};

const dotColors = {
  cyan: 'bg-glow-cyan',
  purple: 'bg-glow-purple',
  orange: 'bg-glow-orange',
  green: 'bg-glow-green',
  pink: 'bg-glow-pink',
  blue: 'bg-glow-blue',
};

function TableNode({ data }: NodeProps<TableNodeData>) {
  const { tableName, columns, glowColor } = data;

  return (
    <div className={`table-node min-w-[220px] bg-card/95 backdrop-blur-sm border ${borderColors[glowColor]} rounded-lg shadow-table relative overflow-hidden`}>
      {/* Corner glow effects */}
      <div className={`absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr ${glowGradients[glowColor]} blur-sm pointer-events-none`} />
      <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl ${glowGradients[glowColor]} blur-sm pointer-events-none`} />
      
      {/* Table Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 bg-secondary/30 relative z-10">
        <span className="font-semibold text-foreground text-sm">{tableName}</span>
        <div className={`w-2.5 h-2.5 rounded-full ${dotColors[glowColor]} animate-pulse-glow`} />
      </div>

      {/* Columns */}
      <div className="divide-y divide-border/50 relative z-10">
        {columns.map((column, index) => {
          const hasConnection = column.isPrimaryKey || column.isForeignKey;
          
          return (
            <div
              key={column.name}
              className="flex items-center justify-between px-4 py-2 text-sm hover:bg-muted/30 transition-colors group relative"
            >
            <Handle
              type="source"
              position={Position.Left}
              id={`${column.name}-left-source`}
              className="!-left-1.5 !w-3 !h-3 !bg-muted-foreground/60 hover:!bg-primary hover:!scale-125 transition-all !border-2 !border-background"
            />
            <Handle
              type="target"
              position={Position.Left}
              id={`${column.name}-left`}
              className="!-left-1.5 !w-3 !h-3 !bg-muted-foreground/60 hover:!bg-primary hover:!scale-125 transition-all !border-2 !border-background"
            />
            
            <div className="flex items-center gap-2">
              {column.isPrimaryKey && (
                <Key className="w-3 h-3 text-syntax-keyword" />
              )}
              {column.isForeignKey && !column.isPrimaryKey && (
                <Link className="w-3 h-3 text-syntax-property" />
              )}
              <span className="text-foreground">
                {column.name}
              </span>
              {column.isNotNull && (
                <span className="text-[10px] px-1 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                  NN
                </span>
              )}
              {hasConnection && (
                <div className={`w-1.5 h-1.5 rounded-full ${dotColors[glowColor]}`} />
              )}
            </div>
            
            <span className="text-muted-foreground font-mono text-xs">
              {column.type}
            </span>

            <Handle
              type="source"
              position={Position.Right}
              id={`${column.name}-right`}
              className="!-right-1.5 !w-3 !h-3 !bg-muted-foreground/60 hover:!bg-primary hover:!scale-125 transition-all !border-2 !border-background"
            />
            <Handle
              type="target"
              position={Position.Right}
              id={`${column.name}-right-target`}
              className="!-right-1.5 !w-3 !h-3 !bg-muted-foreground/60 hover:!bg-primary hover:!scale-125 transition-all !border-2 !border-background"
            />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default memo(TableNode);
