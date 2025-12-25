import { useMemo, useCallback, useEffect } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
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
import type { ParsedDBML, Relationship } from '@/lib/dbmlParser';

const nodeTypes = {
  tableNode: TableNode,
};

const glowColors: Array<TableNodeData['glowColor']> = ['cyan', 'purple', 'orange', 'green', 'pink', 'blue'];

interface DiagramCanvasProps {
  parsedDBML: ParsedDBML;
  dbmlCode: string;
  onImport: (code: string) => void;
  onSave: () => void;
}

// Calculate dynamic handles based on relative node positions
function getEdgeHandles(
  sourceNode: Node | undefined,
  targetNode: Node | undefined,
  rel: Relationship
): { sourceHandle: string; targetHandle: string } {
  if (!sourceNode || !targetNode) {
    return {
      sourceHandle: `${rel.from.column}-right`,
      targetHandle: `${rel.to.column}-left`,
    };
  }

  const sourceX = sourceNode.position.x;
  const targetX = targetNode.position.x;
  const nodeWidth = 220;

  // If target is to the right of source
  if (targetX > sourceX + nodeWidth / 2) {
    return {
      sourceHandle: `${rel.from.column}-right`,
      targetHandle: `${rel.to.column}-left`,
    };
  }
  // If target is to the left of source
  else if (targetX < sourceX - nodeWidth / 2) {
    return {
      sourceHandle: `${rel.from.column}-left-source`,
      targetHandle: `${rel.to.column}-right-target`,
    };
  }
  // If they overlap horizontally, use vertical logic based on Y position
  else {
    if (targetNode.position.y > sourceNode.position.y) {
      return {
        sourceHandle: `${rel.from.column}-right`,
        targetHandle: `${rel.to.column}-right-target`,
      };
    } else {
      return {
        sourceHandle: `${rel.from.column}-left-source`,
        targetHandle: `${rel.to.column}-left`,
      };
    }
  }
}

function DiagramCanvasInner({ parsedDBML, dbmlCode, onImport, onSave }: DiagramCanvasProps) {
  const initialNodes = useMemo(() => {
    return parsedDBML.tables.map((table, index) => ({
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
  }, [parsedDBML]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Update nodes when DBML changes
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  // Update edges dynamically based on node positions
  useEffect(() => {
    const newEdges: Edge[] = parsedDBML.relationships.map((rel, index) => {
      const sourceNode = nodes.find((n) => n.id === rel.from.table);
      const targetNode = nodes.find((n) => n.id === rel.to.table);
      const { sourceHandle, targetHandle } = getEdgeHandles(sourceNode, targetNode, rel);

      return {
        id: `edge-${index}`,
        source: rel.from.table,
        target: rel.to.table,
        sourceHandle,
        targetHandle,
        type: 'smoothstep',
        animated: false,
        style: { stroke: 'hsl(var(--muted-foreground))', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: 'hsl(var(--muted-foreground))',
          width: 16,
          height: 16,
        },
      };
    });

    setEdges(newEdges);
  }, [nodes, parsedDBML.relationships, setEdges]);

  return (
    <div className="canvas-panel">
      <DiagramToolbar 
        dbmlCode={dbmlCode} 
        parsedDBML={parsedDBML}
        onImport={onImport}
        onSave={onSave}
      />
      
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
        // Important: don't let React Flow global keyboard handlers interfere with Monaco
        // (space, arrows, backspace/delete should behave like VSCode inside the editor)
        deleteKeyCode={null}
        selectionKeyCode={null}
        multiSelectionKeyCode={null}
        panActivationKeyCode={null}
        zoomActivationKeyCode={null}
        disableKeyboardA11y
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
