import Editor, { Monaco } from '@monaco-editor/react';
import { Cloud, X, Flame } from 'lucide-react';
import { useState, useRef } from 'react';

interface DBMLEditorProps {
  code: string;
  onChange: (value: string) => void;
}

export function DBMLEditor({ code, onChange }: DBMLEditorProps) {
  const [showBanner, setShowBanner] = useState(true);
  const editorRef = useRef(null);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      onChange(value);
    }
  };

  // Setup Autocomplete agar terasa seperti VS Code
  const setupAutocomplete = (monaco: Monaco) => {
    monaco.languages.registerCompletionItemProvider('dbml', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const suggestions = [
          {
            label: 'Table',
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: 'Table ${1:TableName} {\n\t$0\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Define a new table',
            range: range,
          },
          {
            label: 'Ref',
            kind: monaco.languages.CompletionItemKind.Reference,
            insertText: 'Ref: ${1:table1}.${2:col} > ${3:table2}.${4:col}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Define a relationship',
            range: range,
          },
          {
            label: 'Enum',
            kind: monaco.languages.CompletionItemKind.Enum,
            insertText: 'Enum ${1:EnumName} {\n\t$0\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range,
          },
          // Data Types
          ...['integer', 'varchar', 'text', 'boolean', 'timestamp'].map((type) => ({
            label: type,
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: type,
            range: range,
          })),
          // Properties
          ...['primary key', 'not null', 'increment', 'unique'].map((prop) => ({
            label: prop,
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: prop,
            range: range,
          })),
        ];

        return { suggestions: suggestions };
      },
    });
  };

  return (
    <div className="editor-panel flex flex-col h-full bg-[#1e1e1e] border border-border rounded-lg overflow-hidden">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#252526]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">
              <span className="text-primary font-bold text-xs">S</span>
            </div>
            <span className="font-semibold text-gray-200">SchemaCraft</span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-black/20 rounded-md border border-white/5">
          <Cloud className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-400">Untitled Diagram</span>
        </div>
      </div>

      {/* Code Editor Wrapper */}
      {/* FIX UTAMA: Stop Propagation ada di sini (Container level), 
         bukan di dalam monaco instance. 
         Ini mencegah event naik ke Parent (Modal/Drawer) tapi membiarkan Monaco bekerja normal.
      */}
      <div className="flex-1 relative min-h-[400px]" onKeyDown={(e) => e.stopPropagation()}>
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
            minimap: { enabled: false }, // Ubah true jika ingin seperti VS Code asli
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
            padding: { top: 16, bottom: 16 },
            renderLineHighlight: 'all', // Ganti 'gutter' ke 'all' biar lebih jelas
            contextmenu: true, // Pastikan klik kanan aktif
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
          }}
          beforeMount={(monaco) => {
            // Register language
            monaco.languages.register({ id: 'dbml' });

            // Setup Tokenizer (Warna-warni sintaks)
            monaco.languages.setMonarchTokensProvider('dbml', {
              keywords: ['Table', 'Ref', 'Enum', 'TableGroup', 'Project', 'Note'],
              tokenizer: {
                root: [
                  // Fix regex Anda sebelumnya agar warna Table Name berbeda
                  [/\b(Table)(\s+)([a-zA-Z_]\w*)/, ['keyword', '', 'table.name']],
                  [/\/\/.*$/, 'comment'],
                  [/'[^']*'/, 'string'],
                  [/"[^"]*"/, 'string'],
                  [/\b(Table|Ref|Enum|TableGroup|Project|Note)\b/, 'keyword'],
                  [/[\[\]]/, 'delimiter.bracket'],
                  [/\b(integer|varchar|text|timestamp|boolean|date|datetime|float|serial|uuid)\b/, 'type'],
                  [/\b(primary key|pk|not null|null|unique|increment|default|ref)\b/i, 'property'],
                  [/[a-zA-Z_]\w*/, 'identifier'],
                  [/\d+/, 'number'],
                ],
              },
            });

            // Define Theme
            monaco.editor.defineTheme('dbml-dark', {
              base: 'vs-dark',
              inherit: true, // Ubah ke true agar warna dasar VS Code terbawa (seperti selection, cursor)
              rules: [
                { token: 'keyword', foreground: 'C586C0', fontStyle: 'bold' },
                { token: 'table.name', foreground: '9CDCFE', fontStyle: 'bold' },
                { token: 'identifier', foreground: 'c3c7cd' },
                { token: 'type', foreground: '4EC9B0' },
                { token: 'property', foreground: 'CE9178' },
                { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
              ],
              colors: {
                'editor.background': '#1e1e1e',
              },
            });

            // Jalankan setup Autocomplete
            setupAutocomplete(monaco);
          }}
          onMount={(editor, monaco) => {
            editorRef.current = editor;
            monaco.editor.setTheme('dbml-dark');

            // HAPUS editor.onKeyDown di sini karena sudah ditangani di div wrapper
          }}
        />
      </div>

      {/* Bottom Banner */}
      {showBanner && (
        <div className="relative border-t border-white/10 bg-[#252526] px-4 py-3">
          {/* Banner Content (sama seperti sebelumnya) */}
          <button
            onClick={() => setShowBanner(false)}
            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-start gap-3 pr-6">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Flame className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-200 flex items-center gap-2">
                <span className="text-lg">🔥</span>
                Embed Dashboards
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Fast, flexible, and pixel-perfect embedded analytics.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
