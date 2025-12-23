export interface Column {
  name: string;
  type: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  isNotNull: boolean;
  note?: string;
}

export interface Table {
  name: string;
  columns: Column[];
  note?: string;
}

export interface Relationship {
  from: { table: string; column: string };
  to: { table: string; column: string };
  type: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many';
}

export interface ParsedDBML {
  tables: Table[];
  relationships: Relationship[];
}

export function parseDBML(code: string): ParsedDBML {
  const tables: Table[] = [];
  const relationships: Relationship[] = [];

  // Match table definitions
  const tableRegex = /Table\s+(\w+)\s*\{([^}]*)\}/gi;
  let tableMatch;

  while ((tableMatch = tableRegex.exec(code)) !== null) {
    const tableName = tableMatch[1];
    const tableBody = tableMatch[2];
    const columns: Column[] = [];

    // Parse columns
    const lines = tableBody.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('//')) continue;

      // Match column definition: name type [constraints]
      const columnMatch = trimmed.match(/^(\w+)\s+(\w+)(?:\s*\[([^\]]*)\])?/);
      if (columnMatch) {
        const [, name, type, constraints = ''] = columnMatch;
        const isPrimaryKey = /primary\s*key/i.test(constraints) || /pk/i.test(constraints);
        const isNotNull = /not\s*null/i.test(constraints);
        const noteMatch = constraints.match(/note:\s*['"]([^'"]*)['"]/i);

        columns.push({
          name,
          type: type.toLowerCase(),
          isPrimaryKey,
          isForeignKey: false,
          isNotNull,
          note: noteMatch ? noteMatch[1] : undefined,
        });
      }
    }

    tables.push({ name: tableName, columns });
  }

  // Match relationship definitions
  // Ref: table1.column1 > table2.column2 (many-to-one)
  // Ref: table1.column1 < table2.column2 (one-to-many)
  // Ref: table1.column1 - table2.column2 (one-to-one)
  // Ref: table1.column1 <> table2.column2 (many-to-many)
  const refRegex = /Ref:\s*(\w+)\.(\w+)\s*([<>\-]+)\s*(\w+)\.(\w+)/gi;
  let refMatch;

  while ((refMatch = refRegex.exec(code)) !== null) {
    const [, fromTable, fromColumn, operator, toTable, toColumn] = refMatch;
    
    let type: Relationship['type'] = 'one-to-many';
    if (operator === '>') type = 'many-to-one';
    else if (operator === '<') type = 'one-to-many';
    else if (operator === '-') type = 'one-to-one';
    else if (operator === '<>') type = 'many-to-many';

    relationships.push({
      from: { table: fromTable, column: fromColumn },
      to: { table: toTable, column: toColumn },
      type,
    });

    // Mark foreign keys
    const fromTableObj = tables.find(t => t.name === fromTable);
    if (fromTableObj) {
      const col = fromTableObj.columns.find(c => c.name === fromColumn);
      if (col) col.isForeignKey = true;
    }
  }

  return { tables, relationships };
}

export const DEFAULT_DBML = `// Use DBML to define your database structure
// Docs: https://dbml.dbdiagram.io/docs

Table follows {
  following_user_id integer
  followed_user_id integer
  created_at timestamp
}

Table users {
  id integer [primary key]
  username varchar
  role varchar
  created_at timestamp
}

Table posts {
  id integer [primary key]
  title varchar
  body text [note: 'Content of the post']
  user_id integer [not null]
  status varchar
  created_at timestamp
}

Ref: posts.user_id > users.id // many-to-one

Ref: users.id < follows.following_user_id

Ref: users.id < follows.followed_user_id
`;
