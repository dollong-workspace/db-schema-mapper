import Editor from '@monaco-editor/react';
import { Cloud, X, Flame } from 'lucide-react';
import { useState } from 'react';

interface DBMLEditorProps {
  code: string;
  onChange: (value: string) => void;
}

export function DBMLEditor({ code, onChange }: DBMLEditorProps) {
  const [showBanner, setShowBanner] = useState(true);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      onChange(value);
    }
  };

  return (
    <div className="editor-panel">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">
              <span className="text-primary font-bold text-xs">S</span>
            </div>
            <span className="font-semibold text-foreground">SchemaCraft</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-md">
          <Cloud className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Untitled Diagram</span>
        </div>
      </div>

      {/* Code Editor */}
      <div className="flex-1 relative">
        <Editor
          height="100%"
          defaultLanguage="dbml"
          theme="dbml-dark"
          value={code}
          onChange={handleEditorChange}
          options={{
            fontSize: 14,
            fontFamily: "'JetBrains Mono', Consolas, monospace",
            lineNumbers: 'on',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
            padding: { top: 16, bottom: 16 },
            renderLineHighlight: 'gutter',
            lineDecorationsWidth: 8,
            lineNumbersMinChars: 3,
            glyphMargin: false,
            folding: true,
            scrollbar: {
              vertical: 'auto',
              horizontal: 'auto',
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8,
            },
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            overviewRulerBorder: false,
          }}
          beforeMount={(monaco) => {
            // Register DBML language
            monaco.languages.register({ id: 'dbml' });
            
            // Define DBML syntax highlighting
            monaco.languages.setMonarchTokensProvider('dbml', {
              keywords: ['Table', 'Ref', 'Enum', 'TableGroup', 'Project', 'Note'],
              typeKeywords: ['integer', 'varchar', 'text', 'timestamp', 'boolean', 'date', 'datetime', 'float', 'decimal', 'bigint', 'serial', 'uuid'],
              operators: ['>', '<', '-', ':'],
              
              tokenizer: {
                root: [
                  // Comments
                  [/\/\/.*$/, 'comment'],
                  
                  // Strings
                  [/'[^']*'/, 'string'],
                  [/"[^"]*"/, 'string'],
                  
                  // Keywords (Table, Ref, etc.)
                  [/\b(Table|Ref|Enum|TableGroup|Project|Note)\b/, 'keyword'],
                  
                  // Attributes in brackets
                  [/\[/, 'delimiter.bracket', '@brackets'],
                  
                  // Type keywords
                  [/\b(integer|varchar|text|timestamp|boolean|date|datetime|float|decimal|bigint|serial|uuid)\b/, 'type'],
                  
                  // Properties like primary key, not null
                  [/\b(primary key|pk|not null|null|unique|increment|default|ref)\b/i, 'property'],
                  
                  // Identifiers (table names, column names)
                  [/[a-zA-Z_]\w*/, 'identifier'],
                  
                  // Numbers
                  [/\d+/, 'number'],
                ],
                
                brackets: [
                  [/\[/, 'delimiter.bracket', '@pop'],
                  [/\]/, 'delimiter.bracket', '@pop'],
                  [/\b(primary key|pk|not null|null|unique|increment|default|note)\b/i, 'property'],
                  [/'[^']*'/, 'string'],
                  [/[^\]]+/, 'property'],
                ],
              },
            });

            monaco.editor.defineTheme('dbml-dark', {
              base: 'vs-dark',
              inherit: false,
              rules: [
                { token: '', foreground: 'E0E0E0' },
                { token: 'keyword', foreground: 'C586C0', fontStyle: 'bold' }, // Pink/magenta for Table, Ref
                { token: 'identifier', foreground: '4EC9B0' }, // Cyan/green for names
                { token: 'type', foreground: 'DCDCAA' }, // Yellow/orange for data types
                { token: 'comment', foreground: '6A6A6A', fontStyle: 'italic' }, // Gray for comments
                { token: 'string', foreground: '6A9955' }, // Green for strings
                { token: 'property', foreground: '9CDCFE' }, // Light blue for properties
                { token: 'number', foreground: 'B5CEA8' }, // Light green for numbers
                { token: 'delimiter.bracket', foreground: 'FFD700' }, // Gold for brackets
              ],
              colors: {
                'editor.background': '#1A1A1A',
                'editor.foreground': '#E0E0E0',
                'editorLineNumber.foreground': '#5A5A5A',
                'editorLineNumber.activeForeground': '#858585',
                'editor.lineHighlightBackground': '#252525',
                'editorCursor.foreground': '#AEAFAD',
                'editor.selectionBackground': '#264F78',
                'editorGutter.background': '#1A1A1A',
                'editorIndentGuide.background': '#404040',
                'editorIndentGuide.activeBackground': '#707070',
              },
            });
          }}
          onMount={(editor, monaco) => {
            monaco.editor.setTheme('dbml-dark');
            // Set the language to DBML
            monaco.editor.setModelLanguage(editor.getModel()!, 'dbml');
          }}
        />
      </div>

      {/* Bottom Banner */}
      {showBanner && (
        <div className="relative border-t border-border bg-gradient-to-r from-muted/50 to-muted/30 px-4 py-3">
          <button
            onClick={() => setShowBanner(false)}
            className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-start gap-3 pr-6">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Flame className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground flex items-center gap-2">
                <span className="text-lg">🔥</span>
                Embed Dashboards
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Fast, flexible, and pixel-perfect embedded analytics is just a snippet away.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
