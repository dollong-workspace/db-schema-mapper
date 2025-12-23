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
          defaultLanguage="sql"
          theme="vs-dark"
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
            monaco.editor.defineTheme('dbml-dark', {
              base: 'vs-dark',
              inherit: true,
              rules: [
                { token: 'keyword', foreground: '22D3EE', fontStyle: 'bold' },
                { token: 'string', foreground: '4ADE80' },
                { token: 'comment', foreground: '737373', fontStyle: 'italic' },
                { token: 'type', foreground: 'A78BFA' },
                { token: 'identifier', foreground: 'FB923C' },
              ],
              colors: {
                'editor.background': '#111111',
                'editor.foreground': '#E5E5E5',
                'editorLineNumber.foreground': '#525252',
                'editorLineNumber.activeForeground': '#A3A3A3',
                'editor.lineHighlightBackground': '#1A1A1A',
                'editorCursor.foreground': '#22D3EE',
                'editor.selectionBackground': '#22D3EE33',
                'editorGutter.background': '#0D0D0D',
              },
            });
          }}
          onMount={(editor, monaco) => {
            monaco.editor.setTheme('dbml-dark');
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
