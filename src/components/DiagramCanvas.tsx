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
  Connection,
  addEdge,
  OnConnect,
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

// Create edge style helper
function createEdgeStyle(selected: boolean = false) {
  return {
    stroke: selected ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
    strokeWidth: selected ? 3 : 2,
  };
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
        id: `edge-${rel.from.table}-${rel.from.column}-${rel.to.table}-${rel.to.column}`,
        source: rel.from.table,
        target: rel.to.table,
        sourceHandle,
        targetHandle,
        type: 'smoothstep',
        animated: false,
        style: createEdgeStyle(false),
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: 'hsl(var(--muted-foreground))',
          width: 16,
          height: 16,
        },
      };
    });

    setEdges((currentEdges) => {
      // Keep manually created edges that don't exist in DBML
      const dbmlEdgeIds = new Set(newEdges.map((e) => e.id));
      const manualEdges = currentEdges.filter(
        (e) => e.id.startsWith('manual-') || !dbmlEdgeIds.has(e.id)
      );
      
      // Merge DBML edges with manual edges
      const mergedEdges = [...newEdges];
      manualEdges.forEach((manualEdge) => {
        if (!mergedEdges.some((e) => e.id === manualEdge.id)) {
          mergedEdges.push(manualEdge);
        }
      });
      
      return mergedEdges;
    });
  }, [nodes, parsedDBML.relationships, setEdges]);

  // Handle new connection from drag
  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      
      const newEdge: Edge = {
        id: `manual-${connection.source}-${connection.sourceHandle}-${connection.target}-${connection.targetHandle}`,
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle,
        targetHandle: connection.targetHandle,
        type: 'smoothstep',
        animated: false,
        style: createEdgeStyle(false),
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: 'hsl(var(--muted-foreground))',
          width: 16,
          height: 16,
        },
      };
      
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  // Handle keyboard delete for selected edges
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Backspace' || event.key === 'Delete') {
        // Don't delete if focus is in an input/editor
        const activeElement = document.activeElement;
        if (
          activeElement?.tagName === 'INPUT' ||
          activeElement?.tagName === 'TEXTAREA' ||
          activeElement?.closest('.monaco-editor')
        ) {
          return;
        }
        
        setEdges((eds) => eds.filter((edge) => !edge.selected));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setEdges]);

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
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        deleteKeyCode={['Backspace', 'Delete']}
        edgesUpdatable
        edgesFocusable
        selectNodesOnDrag={false}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: false,
          style: createEdgeStyle(false),
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: 'hsl(var(--muted-foreground))',
            width: 16,
            height: 16,
          },
        }}
        connectionLineStyle={{
          stroke: 'hsl(var(--primary))',
          strokeWidth: 2,
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
