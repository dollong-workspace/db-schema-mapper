import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Key, Link } from 'lucide-react';
import type { Column } from '@/lib/dbmlParser';

export interface TableNodeData {
  tableName: string;
  columns: Column[];
  glowColor: 'cyan' | 'purple' | 'orange' | 'green' | 'pink' | 'blue';
}

const glowClasses = {
  cyan: 'glow-cyan border-glow-cyan/30',
  purple: 'glow-purple border-glow-purple/30',
  orange: 'glow-orange border-glow-orange/30',
  green: 'glow-green border-glow-green/30',
  pink: 'glow-pink border-glow-pink/30',
  blue: 'glow-blue border-glow-blue/30',
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
    <div className={`table-node min-w-[200px] ${glowClasses[glowColor]}`}>
      {/* Table Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/50">
        <span className="font-semibold text-foreground text-sm">{tableName}</span>
        <div className={`w-2.5 h-2.5 rounded-full ${dotColors[glowColor]} animate-pulse-glow`} />
      </div>

      {/* Columns */}
      <div className="divide-y divide-border/50">
        {columns.map((column, index) => (
          <div
            key={column.name}
            className="flex items-center justify-between px-4 py-2 text-sm hover:bg-muted/30 transition-colors group relative"
          >
            <Handle
              type="target"
              position={Position.Left}
              id={`${column.name}-left`}
              className="!-left-1"
            />
            
            <div className="flex items-center gap-2">
              {column.isPrimaryKey && (
                <Key className="w-3 h-3 text-syntax-keyword" />
              )}
              {column.isForeignKey && !column.isPrimaryKey && (
                <Link className="w-3 h-3 text-syntax-property" />
              )}
              <span className={`${column.isPrimaryKey ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                {column.name}
              </span>
              {column.isNotNull && (
                <span className="text-[10px] px-1 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                  NN
                </span>
              )}
            </div>
            
            <span className="text-syntax-type font-mono text-xs">
              {column.type}
            </span>

            <Handle
              type="source"
              position={Position.Right}
              id={`${column.name}-right`}
              className="!-right-1"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(TableNode);
