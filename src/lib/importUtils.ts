import { ParsedDBML, Table, Column, Relationship } from './dbmlParser';
import { DiagramJSON } from './exportUtils';

export type ImportResult = {
  success: true;
  dbmlCode: string;
  nodePositions?: Record<string, { x: number; y: number }>;
} | {
  success: false;
  error: string;
};

// ============= DBML Import =============
export function importDBML(content: string): ImportResult {
  try {
    // Basic validation - check if it contains Table definitions
    if (!content.includes('Table ') && !content.includes('table ')) {
      return { success: false, error: 'Invalid DBML: No table definitions found' };
    }
    return { success: true, dbmlCode: content };
  } catch (error) {
    return { success: false, error: `Failed to parse DBML: ${error}` };
  }
}

// ============= JSON Import =============
export function importJSON(content: string): ImportResult {
  try {
    const data = JSON.parse(content) as DiagramJSON;
    
    if (!data.dbmlCode) {
      return { success: false, error: 'Invalid JSON: Missing dbmlCode field' };
    }
    
    return { 
      success: true, 
      dbmlCode: data.dbmlCode,
      nodePositions: data.nodePositions 
    };
  } catch (error) {
    return { success: false, error: `Failed to parse JSON: ${error}` };
  }
}

// ============= SQL Import =============
export function importSQL(content: string): ImportResult {
  try {
    const tables: Table[] = [];
    const relationships: Relationship[] = [];
    
    // Match CREATE TABLE statements
    const createTableRegex = /CREATE\s+TABLE\s+[`"\[]?(\w+)[`"\]]?\s*\(([\s\S]*?)\);/gi;
    let match;
    
    while ((match = createTableRegex.exec(content)) !== null) {
      const tableName = match[1];
      const tableBody = match[2];
      const columns: Column[] = [];
      
      // Parse columns
      const lines = tableBody.split(',').map(line => line.trim()).filter(Boolean);
      
      for (const line of lines) {
        // Skip constraints
        if (/^(PRIMARY|FOREIGN|UNIQUE|CHECK|CONSTRAINT)/i.test(line)) {
          continue;
        }
        
        // Match column: name type [constraints]
        const columnMatch = line.match(/^[`"\[]?(\w+)[`"\]]?\s+(\w+)(?:\([\d,]+\))?(.*)$/i);
        if (columnMatch) {
          const [, name, type, constraints = ''] = columnMatch;
          
          columns.push({
            name,
            type: mapSQLTypeToDBML(type),
            isPrimaryKey: /PRIMARY\s*KEY/i.test(constraints),
            isForeignKey: false,
            isNotNull: /NOT\s*NULL/i.test(constraints),
          });
        }
      }
      
      // Check for PRIMARY KEY constraint at end
      const pkMatch = tableBody.match(/PRIMARY\s+KEY\s*\(\s*[`"\[]?(\w+)[`"\]]?\s*\)/i);
      if (pkMatch) {
        const pkColumn = columns.find(c => c.name.toLowerCase() === pkMatch[1].toLowerCase());
        if (pkColumn) pkColumn.isPrimaryKey = true;
      }
      
      if (columns.length > 0) {
        tables.push({ name: tableName, columns });
      }
    }
    
    // Match FOREIGN KEY constraints
    const fkRegex = /FOREIGN\s+KEY\s*\(\s*[`"\[]?(\w+)[`"\]]?\s*\)\s*REFERENCES\s+[`"\[]?(\w+)[`"\]]?\s*\(\s*[`"\[]?(\w+)[`"\]]?\s*\)/gi;
    const alterFkRegex = /ALTER\s+TABLE\s+[`"\[]?(\w+)[`"\]]?[\s\S]*?FOREIGN\s+KEY\s*\(\s*[`"\[]?(\w+)[`"\]]?\s*\)\s*REFERENCES\s+[`"\[]?(\w+)[`"\]]?\s*\(\s*[`"\[]?(\w+)[`"\]]?\s*\)/gi;
    
    // Get the current table context from CREATE TABLE for inline FK
    let currentTable = '';
    const tableMatches = content.matchAll(/CREATE\s+TABLE\s+[`"\[]?(\w+)[`"\]]?\s*\(/gi);
    for (const tm of tableMatches) {
      currentTable = tm[1];
      const tableSection = content.slice(tm.index!);
      const endIndex = tableSection.indexOf(');');
      const tableContent = tableSection.slice(0, endIndex);
      
      const inlineFkMatches = tableContent.matchAll(fkRegex);
      for (const fkMatch of inlineFkMatches) {
        relationships.push({
          from: { table: currentTable, column: fkMatch[1] },
          to: { table: fkMatch[2], column: fkMatch[3] },
          type: 'many-to-one',
        });
      }
    }
    
    // Parse ALTER TABLE foreign keys
    let alterMatch;
    while ((alterMatch = alterFkRegex.exec(content)) !== null) {
      relationships.push({
        from: { table: alterMatch[1], column: alterMatch[2] },
        to: { table: alterMatch[3], column: alterMatch[4] },
        type: 'many-to-one',
      });
    }
    
    // Mark foreign keys
    for (const rel of relationships) {
      const table = tables.find(t => t.name === rel.from.table);
      if (table) {
        const col = table.columns.find(c => c.name === rel.from.column);
        if (col) col.isForeignKey = true;
      }
    }
    
    if (tables.length === 0) {
      return { success: false, error: 'No valid table definitions found in SQL' };
    }
    
    // Convert to DBML
    const dbmlCode = convertToDBML(tables, relationships);
    return { success: true, dbmlCode };
    
  } catch (error) {
    return { success: false, error: `Failed to parse SQL: ${error}` };
  }
}

function mapSQLTypeToDBML(sqlType: string): string {
  const type = sqlType.toLowerCase();
  const mapping: Record<string, string> = {
    'int': 'integer',
    'bigint': 'integer',
    'smallint': 'integer',
    'tinyint': 'integer',
    'float': 'float',
    'double': 'float',
    'real': 'float',
    'decimal': 'decimal',
    'numeric': 'decimal',
    'varchar': 'varchar',
    'nvarchar': 'varchar',
    'char': 'varchar',
    'text': 'text',
    'ntext': 'text',
    'datetime': 'timestamp',
    'datetime2': 'timestamp',
    'timestamp': 'timestamp',
    'date': 'timestamp',
    'time': 'timestamp',
    'boolean': 'boolean',
    'bit': 'boolean',
    'uuid': 'uuid',
    'uniqueidentifier': 'uuid',
  };
  return mapping[type] || type;
}

function convertToDBML(tables: Table[], relationships: Relationship[]): string {
  const lines: string[] = ['// Imported from SQL\n'];
  
  for (const table of tables) {
    lines.push(`Table ${table.name} {`);
    for (const column of table.columns) {
      let constraints: string[] = [];
      if (column.isPrimaryKey) constraints.push('primary key');
      if (column.isNotNull && !column.isPrimaryKey) constraints.push('not null');
      
      const constraintStr = constraints.length > 0 ? ` [${constraints.join(', ')}]` : '';
      lines.push(`  ${column.name} ${column.type}${constraintStr}`);
    }
    lines.push('}\n');
  }
  
  for (const rel of relationships) {
    lines.push(`Ref: ${rel.from.table}.${rel.from.column} > ${rel.to.table}.${rel.to.column}`);
  }
  
  return lines.join('\n');
}

// ============= File Reader =============
export async function readFileContent(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

export function detectFileType(filename: string): 'dbml' | 'sql' | 'json' | 'unknown' {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (ext === 'dbml') return 'dbml';
  if (ext === 'sql') return 'sql';
  if (ext === 'json') return 'json';
  return 'unknown';
}
