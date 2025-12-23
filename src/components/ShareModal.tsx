import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Share2, Link, Code, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dbmlCode: string;
}

export function ShareModal({ open, onOpenChange, dbmlCode }: ShareModalProps) {
  const [copied, setCopied] = useState<'link' | 'embed' | null>(null);
  
  // Generate a shareable link (using base64 encoded DBML for now - client-side only)
  const shareableLink = `${window.location.origin}?diagram=${encodeURIComponent(btoa(dbmlCode))}`;
  
  const embedCode = `<iframe 
  src="${shareableLink}&embed=true" 
  width="100%" 
  height="500" 
  frameborder="0" 
  style="border-radius: 8px; border: 1px solid #333;">
</iframe>`;

  const handleCopy = async (text: string, type: 'link' | 'embed') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      toast.success(type === 'link' ? 'Link copied!' : 'Embed code copied!');
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            Share Diagram
          </DialogTitle>
          <DialogDescription>
            Share your diagram with others via link or embed code
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Public Link */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Link className="w-4 h-4" />
              Public Link
            </Label>
            <div className="flex gap-2">
              <Input 
                value={shareableLink} 
                readOnly 
                className="bg-background text-sm font-mono"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleCopy(shareableLink, 'link')}
              >
                {copied === 'link' ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Anyone with this link can view your diagram (read-only)
            </p>
          </div>

          {/* Embed Code */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              Embed Code
            </Label>
            <div className="relative">
              <pre className="p-3 bg-background rounded-lg text-xs font-mono overflow-x-auto border border-border">
                {embedCode}
              </pre>
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => handleCopy(embedCode, 'embed')}
              >
                {copied === 'embed' ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Embed this diagram in your website or documentation
            </p>
          </div>

          {/* Pro Feature Hint */}
          <div className="p-3 bg-primary/10 border border-primary/30 rounded-lg">
            <p className="text-sm text-primary">
              💡 <strong>Pro Feature:</strong> Team sharing with edit permissions and version history coming soon!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
