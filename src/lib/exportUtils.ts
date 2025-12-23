import { ParsedDBML, Table, Relationship } from './dbmlParser';

// ============= DBML Export =============
export function exportToDBML(code: string): void {
  downloadFile(code, 'diagram.dbml', 'text/plain');
}

// ============= SQL Export =============
type SQLDialect = 'postgresql' | 'mysql' | 'sqlite' | 'sqlserver';

const typeMapping: Record<SQLDialect, Record<string, string>> = {
  postgresql: {
    integer: 'INTEGER',
    varchar: 'VARCHAR(255)',
    text: 'TEXT',
    timestamp: 'TIMESTAMP',
    boolean: 'BOOLEAN',
    float: 'REAL',
    decimal: 'DECIMAL',
    uuid: 'UUID',
  },
  mysql: {
    integer: 'INT',
    varchar: 'VARCHAR(255)',
    text: 'TEXT',
    timestamp: 'TIMESTAMP',
    boolean: 'TINYINT(1)',
    float: 'FLOAT',
    decimal: 'DECIMAL',
    uuid: 'CHAR(36)',
  },
  sqlite: {
    integer: 'INTEGER',
    varchar: 'TEXT',
    text: 'TEXT',
    timestamp: 'TEXT',
    boolean: 'INTEGER',
    float: 'REAL',
    decimal: 'REAL',
    uuid: 'TEXT',
  },
  sqlserver: {
    integer: 'INT',
    varchar: 'NVARCHAR(255)',
    text: 'NVARCHAR(MAX)',
    timestamp: 'DATETIME2',
    boolean: 'BIT',
    float: 'FLOAT',
    decimal: 'DECIMAL',
    uuid: 'UNIQUEIDENTIFIER',
  },
};

export function generateSQL(parsedDBML: ParsedDBML, dialect: SQLDialect = 'postgresql'): string {
  const { tables, relationships } = parsedDBML;
  const lines: string[] = [];
  const mapping = typeMapping[dialect];

  // Generate CREATE TABLE statements
  for (const table of tables) {
    lines.push(`-- Table: ${table.name}`);
    lines.push(`CREATE TABLE ${quoteIdentifier(table.name, dialect)} (`);

    const columnDefs: string[] = [];
    const primaryKeys: string[] = [];

    for (const column of table.columns) {
      const sqlType = mapping[column.type] || column.type.toUpperCase();
      let def = `  ${quoteIdentifier(column.name, dialect)} ${sqlType}`;
      
      if (column.isPrimaryKey) {
        primaryKeys.push(column.name);
      }
      if (column.isNotNull) {
        def += ' NOT NULL';
      }
      if (column.note) {
        def += ` -- ${column.note}`;
      }
      
      columnDefs.push(def);
    }

    if (primaryKeys.length > 0) {
      columnDefs.push(`  PRIMARY KEY (${primaryKeys.map(k => quoteIdentifier(k, dialect)).join(', ')})`);
    }

    lines.push(columnDefs.join(',\n'));
    lines.push(');');
    lines.push('');
  }

  // Generate foreign key constraints
  for (const rel of relationships) {
    const constraintName = `fk_${rel.from.table}_${rel.from.column}`;
    lines.push(`-- Foreign Key: ${rel.from.table}.${rel.from.column} -> ${rel.to.table}.${rel.to.column}`);
    lines.push(`ALTER TABLE ${quoteIdentifier(rel.from.table, dialect)}`);
    lines.push(`  ADD CONSTRAINT ${quoteIdentifier(constraintName, dialect)}`);
    lines.push(`  FOREIGN KEY (${quoteIdentifier(rel.from.column, dialect)})`);
    lines.push(`  REFERENCES ${quoteIdentifier(rel.to.table, dialect)} (${quoteIdentifier(rel.to.column, dialect)});`);
    lines.push('');
  }

  return lines.join('\n');
}

function quoteIdentifier(name: string, dialect: SQLDialect): string {
  switch (dialect) {
    case 'mysql':
      return `\`${name}\``;
    case 'sqlserver':
      return `[${name}]`;
    default:
      return `"${name}"`;
  }
}

export function exportToSQL(parsedDBML: ParsedDBML, dialect: SQLDialect = 'postgresql'): void {
  const sql = generateSQL(parsedDBML, dialect);
  downloadFile(sql, `diagram_${dialect}.sql`, 'text/plain');
}

// ============= JSON Export =============
export interface DiagramJSON {
  version: string;
  dbmlCode: string;
  parsedDBML: ParsedDBML;
  nodePositions?: Record<string, { x: number; y: number }>;
  exportedAt: string;
}

export function exportToJSON(
  dbmlCode: string, 
  parsedDBML: ParsedDBML,
  nodePositions?: Record<string, { x: number; y: number }>
): void {
  const data: DiagramJSON = {
    version: '1.0',
    dbmlCode,
    parsedDBML,
    nodePositions,
    exportedAt: new Date().toISOString(),
  };
  downloadFile(JSON.stringify(data, null, 2), 'diagram.json', 'application/json');
}

// ============= Image Export =============
export async function exportToImage(
  element: HTMLElement, 
  format: 'png' | 'svg' = 'png'
): Promise<void> {
  // Dynamic import to reduce bundle size
  const html2canvas = (await import('html2canvas')).default;
  
  if (format === 'png') {
    const canvas = await html2canvas(element, {
      backgroundColor: '#0a0a0a',
      scale: 2,
      logging: false,
      useCORS: true,
    });
    
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'diagram.png';
        a.click();
        URL.revokeObjectURL(url);
      }
    }, 'image/png');
  } else {
    // For SVG, we'll capture the React Flow SVG elements
    const svgElement = element.querySelector('svg.react-flow__edges');
    if (svgElement) {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'diagram.svg';
      a.click();
      URL.revokeObjectURL(url);
    }
  }
}

// ============= Utility =============
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
