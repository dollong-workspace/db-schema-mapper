import { useMemo, useCallback, useEffect } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  MarkerType,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';

import TableNode, { TableNodeData } from './TableNode';
import { DiagramToolbar } from './DiagramToolbar';
import { ZoomControls } from './ZoomControls';
import type { ParsedDBML, Table } from '@/lib/dbmlParser';

const nodeTypes = {
  tableNode: TableNode,
};

const glowColors: Array<TableNodeData['glowColor']> = ['cyan', 'purple', 'orange', 'green', 'pink', 'blue'];

interface DiagramCanvasProps {
  parsedDBML: ParsedDBML;
}

function DiagramCanvasInner({ parsedDBML }: DiagramCanvasProps) {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const nodes: Node<TableNodeData>[] = parsedDBML.tables.map((table, index) => ({
      id: table.name,
      type: 'tableNode',
      position: {
        x: 150 + (index % 3) * 280,
        y: 80 + Math.floor(index / 3) * 250,
      },
      data: {
        tableName: table.name,
        columns: table.columns,
        glowColor: glowColors[index % glowColors.length],
      },
    }));

    const edges: Edge[] = parsedDBML.relationships.map((rel, index) => ({
      id: `edge-${index}`,
      source: rel.from.table,
      target: rel.to.table,
      sourceHandle: `${rel.from.column}-right`,
      targetHandle: `${rel.to.column}-left`,
      type: 'smoothstep',
      animated: false,
      style: { stroke: 'hsl(var(--muted-foreground))', strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: 'hsl(var(--muted-foreground))',
        width: 16,
        height: 16,
      },
    }));

    return { nodes, edges };
  }, [parsedDBML]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  return (
    <div className="canvas-panel">
      <DiagramToolbar />
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: false,
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="hsl(var(--canvas-grid))"
        />
        <ZoomControls />
      </ReactFlow>
    </div>
  );
}

export function DiagramCanvas(props: DiagramCanvasProps) {
  return (
    <ReactFlowProvider>
      <DiagramCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
