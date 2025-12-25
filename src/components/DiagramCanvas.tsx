import { useMemo, useCallback, useEffect, useState } from 'react';
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
  EdgeMouseHandler,
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

  if (targetX > sourceX + nodeWidth / 2) {
    return {
      sourceHandle: `${rel.from.column}-right`,
      targetHandle: `${rel.to.column}-left`,
    };
  } else if (targetX < sourceX - nodeWidth / 2) {
    return {
      sourceHandle: `${rel.from.column}-left-source`,
      targetHandle: `${rel.to.column}-right-target`,
    };
  } else {
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
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

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

  // Create edge with selection state
  const createEdge = useCallback(
    (
      id: string,
      source: string,
      target: string,
      sourceHandle: string | null,
      targetHandle: string | null,
      isSelected: boolean
    ): Edge => ({
      id,
      source,
      target,
      sourceHandle,
      targetHandle,
      type: 'smoothstep',
      animated: false,
      selected: isSelected,
      style: {
        stroke: isSelected ? 'hsl(210, 100%, 60%)' : 'hsl(var(--muted-foreground))',
        strokeWidth: isSelected ? 3 : 2,
        filter: isSelected ? 'drop-shadow(0 0 4px hsl(210, 100%, 60%))' : 'none',
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: isSelected ? 'hsl(210, 100%, 60%)' : 'hsl(var(--muted-foreground))',
        width: 16,
        height: 16,
      },
    }),
    []
  );

  // Update edges dynamically based on node positions and selection
  useEffect(() => {
    const newEdges: Edge[] = parsedDBML.relationships.map((rel) => {
      const sourceNode = nodes.find((n) => n.id === rel.from.table);
      const targetNode = nodes.find((n) => n.id === rel.to.table);
      const { sourceHandle, targetHandle } = getEdgeHandles(sourceNode, targetNode, rel);
      const edgeId = `edge-${rel.from.table}-${rel.from.column}-${rel.to.table}-${rel.to.column}`;

      return createEdge(edgeId, rel.from.table, rel.to.table, sourceHandle, targetHandle, selectedEdgeId === edgeId);
    });

    setEdges((currentEdges) => {
      const dbmlEdgeIds = new Set(newEdges.map((e) => e.id));
      const manualEdges = currentEdges
        .filter((e) => e.id.startsWith('manual-'))
        .map((e) => ({
          ...e,
          selected: selectedEdgeId === e.id,
          style: {
            stroke: selectedEdgeId === e.id ? 'hsl(210, 100%, 60%)' : 'hsl(var(--muted-foreground))',
            strokeWidth: selectedEdgeId === e.id ? 3 : 2,
            filter: selectedEdgeId === e.id ? 'drop-shadow(0 0 4px hsl(210, 100%, 60%))' : 'none',
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: selectedEdgeId === e.id ? 'hsl(210, 100%, 60%)' : 'hsl(var(--muted-foreground))',
            width: 16,
            height: 16,
          },
        }));

      const mergedEdges = [...newEdges];
      manualEdges.forEach((manualEdge) => {
        if (!mergedEdges.some((e) => e.id === manualEdge.id)) {
          mergedEdges.push(manualEdge);
        }
      });

      return mergedEdges;
    });
  }, [nodes, parsedDBML.relationships, setEdges, selectedEdgeId, createEdge]);

  // Handle new connection from drag
  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;

      const newEdge = createEdge(
        `manual-${connection.source}-${connection.sourceHandle}-${connection.target}-${connection.targetHandle}`,
        connection.source,
        connection.target,
        connection.sourceHandle,
        connection.targetHandle,
        false
      );

      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges, createEdge]
  );

  // Handle edge click for selection
  const onEdgeClick: EdgeMouseHandler = useCallback((event, edge) => {
    event.stopPropagation();
    setSelectedEdgeId((prev) => (prev === edge.id ? null : edge.id));
  }, []);

  // Handle pane click to deselect
  const onPaneClick = useCallback(() => {
    setSelectedEdgeId(null);
  }, []);

  // Handle keyboard delete for selected edges
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Backspace' || event.key === 'Delete') {
        const activeElement = document.activeElement;
        if (
          activeElement?.tagName === 'INPUT' ||
          activeElement?.tagName === 'TEXTAREA' ||
          activeElement?.closest('.monaco-editor')
        ) {
          return;
        }

        if (selectedEdgeId) {
          setEdges((eds) => eds.filter((edge) => edge.id !== selectedEdgeId));
          setSelectedEdgeId(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setEdges, selectedEdgeId]);

  return (
    <div className="canvas-panel">
      <DiagramToolbar dbmlCode={dbmlCode} parsedDBML={parsedDBML} onImport={onImport} onSave={onSave} />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        edgesUpdatable
        edgesFocusable
        selectNodesOnDrag={false}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: false,
          style: { stroke: 'hsl(var(--muted-foreground))', strokeWidth: 2 },
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
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="hsl(var(--canvas-grid))" />
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
