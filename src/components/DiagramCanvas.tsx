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
  OnConnect,
  Connection,
  OnNodesDelete,
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
  // Tambahkan prop ini untuk mengirim balik perubahan ke parent
  onCodeChange: (newCode: string) => void;
}

// ... (keep getEdgeHandles function as is) ...
function getEdgeHandles(
  sourceNode: Node | undefined,
  targetNode: Node | undefined,
  rel: Relationship,
): { sourceHandle: string; targetHandle: string } {
  // ... (kode lama tetap sama) ...
  // Pastikan kode getEdgeHandles Anda ada di sini
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
    return { sourceHandle: `${rel.from.column}-right`, targetHandle: `${rel.to.column}-left` };
  } else if (targetX < sourceX - nodeWidth / 2) {
    return { sourceHandle: `${rel.from.column}-left-source`, targetHandle: `${rel.to.column}-right-target` };
  } else {
    if (targetNode.position.y > sourceNode.position.y) {
      return { sourceHandle: `${rel.from.column}-right`, targetHandle: `${rel.to.column}-right-target` };
    } else {
      return { sourceHandle: `${rel.from.column}-left-source`, targetHandle: `${rel.to.column}-left` };
    }
  }
}

function DiagramCanvasInner({ parsedDBML, dbmlCode, onImport, onSave, onCodeChange }: DiagramCanvasProps) {
  // ... (Initial Nodes memo logic remains same) ...
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

  // Sync Nodes from DBML
  useEffect(() => {
    // Kita hanya mereset nodes jika jumlah tabel berubah drastis atau initial load
    // Untuk menghindari jumpy layout saat ngetik, logic ini bisa diperhalus nanti.
    // Untuk sekarang, kita overwrite agar sync.
    if (nodes.length === 0 && initialNodes.length > 0) {
      setNodes(initialNodes);
    }
  }, [initialNodes, setNodes, nodes.length]);

  // Sync Edges from DBML
  useEffect(() => {
    const newEdges: Edge[] = parsedDBML.relationships.map((rel, index) => {
      const sourceNode = nodes.find((n) => n.id === rel.from.table);
      const targetNode = nodes.find((n) => n.id === rel.to.table);
      const { sourceHandle, targetHandle } = getEdgeHandles(sourceNode, targetNode, rel);

      return {
        id: `edge-${index}-${rel.from.table}-${rel.from.column}-${rel.to.table}-${rel.to.column}`,
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

  // 1. HANDLER KONEKSI (Canvas -> Code)
  const onConnect: OnConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target || !params.sourceHandle || !params.targetHandle) return;

      // Bersihkan handle ID untuk mendapatkan nama kolom asli
      // Handle format: "columnName-left", "columnName-right", dll.
      const cleanHandle = (handle: string) => {
        return handle.replace(/-left|-right|-source|-target/g, '');
      };

      const sourceTable = params.source;
      const sourceCol = cleanHandle(params.sourceHandle);
      const targetTable = params.target;
      const targetCol = cleanHandle(params.targetHandle);

      // Buat string Ref baru
      const newRef = `\nRef: ${sourceTable}.${sourceCol} > ${targetTable}.${targetCol} // Added from canvas`;

      // Update Code Editor
      onCodeChange(dbmlCode + newRef);
    },
    [dbmlCode, onCodeChange],
  );

  // 2. HANDLER HAPUS NODE (Canvas -> Code)
  const onNodesDelete: OnNodesDelete = useCallback(
    (deletedNodes) => {
      let newCode = dbmlCode;

      deletedNodes.forEach((node) => {
        const tableName = node.id;

        // A. Hapus blok Table
        // Regex: Cari "Table <tableName> { ... }" (multiline non-greedy)
        const tableRegex = new RegExp(`Table\\s+${tableName}\\s+\\{[\\s\\S]*?\\}`, 'g');
        newCode = newCode.replace(tableRegex, '');

        // B. Hapus Relationship (Ref) yang terkait dengan tabel ini
        // Regex: Cari baris yang mengandung "Ref:" dan nama tabel
        const refRegex = new RegExp(`Ref:.*\\b${tableName}\\b.*`, 'g');
        newCode = newCode.replace(refRegex, '');
      });

      // Bersihkan baris kosong berlebih (opsional, biar rapi)
      newCode = newCode.replace(/\n\s*\n\s*\n/g, '\n\n');

      onCodeChange(newCode);
    },
    [dbmlCode, onCodeChange],
  );

  return (
    <div className="canvas-panel h-full w-full">
      <DiagramToolbar dbmlCode={dbmlCode} parsedDBML={parsedDBML} onImport={onImport} onSave={onSave} />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect} // Trigger saat user tarik garis
        onNodesDelete={onNodesDelete} // Trigger saat user tekan delete/backspace pada node
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: false,
        }}>
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
