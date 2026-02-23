import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageSquare, Paperclip, FileText, Image, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api, DirectMessageType, getApiUrl } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

const ALLOWED_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.gif', '.webp',
  '.pdf', '.zip', '.rar',
  '.dwg', '.dxf', '.step', '.stp', '.iges', '.igs', '.stl', '.obj',
];
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const MAX_FILES = 5;

function getAttachmentDownloadUrl(filePath: string): string {
  return getApiUrl('/v1/user-files/download/') + '?path=' + encodeURIComponent(filePath);
}

interface DirectChatProps {
  conversationId: string;
  otherUserName: string;
  messages: DirectMessageType[];
  onNewMessage: (message: DirectMessageType) => void;
  onMarkRead?: () => void;
}

const DirectChat: React.FC<DirectChatProps> = ({
  conversationId,
  otherUserName,
  messages,
  onNewMessage,
  onMarkRead,
}) => {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (onMarkRead) onMarkRead();
  }, [conversationId, onMarkRead]);

  const validateFile = (file: File): string | null => {
    const ext = '.' + (file.name.split('.').pop() || '').toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return `نوع فایل مجاز نیست: ${file.name}. مجاز: عکس، PDF، ZIP، RAR، CAD، مدل سه‌بعدی`;
    }
    if (file.size > MAX_FILE_SIZE) return `حجم فایل حداکثر ۲۵ مگابایت: ${file.name}`;
    return null;
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    const next: File[] = [];
    for (const f of files) {
      const err = validateFile(f);
      if (err) {
        toast({ title: 'خطا', description: err, variant: 'destructive' });
        continue;
      }
      next.push(f);
    }
    setAttachments((prev) => [...prev, ...next].slice(0, MAX_FILES));
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && attachments.length === 0) return;

    setIsLoading(true);
    try {
      const msg = await api.sendDirectMessage(
        conversationId,
        newMessage.trim() || '(پیوست)',
        attachments.length ? attachments : undefined
      );
      setNewMessage('');
      setAttachments([]);
      onNewMessage(msg);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'خطا',
        description: 'خطا در ارسال پیام',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="h-[500px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          چت با {otherUserName}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.sender_id === user?.id ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarFallback>
                    {(message.sender_display_name || message.sender_name).charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.sender_id === user?.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">
                      {message.sender_display_name || message.sender_name}
                    </span>
                    <span className="text-xs opacity-70">
                      {new Date(message.created_at).toLocaleString('fa-IR')}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {message.attachments.map((att) => (
                        <a
                          key={att.id}
                          href={att.file_path ? getAttachmentDownloadUrl(att.file_path) : (att.download_path || '#')}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded border px-2 py-1.5 text-xs hover:bg-black/10"
                        >
                          {att.content_type.startsWith('image/') ? (
                            <Image className="h-4 w-4" />
                          ) : (
                            <FileText className="h-4 w-4" />
                          )}
                          <span className="truncate max-w-[120px]">{att.file_name}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          {attachments.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {attachments.map((f, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 rounded bg-muted px-2 py-1 text-xs"
                >
                  <FileText className="h-3 w-3" />
                  <span className="max-w-[140px] truncate">{f.name}</span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(i)}
                    className="hover:opacity-80"
                    aria-label="حذف"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ALLOWED_EXTENSIONS.join(',')}
              className="hidden"
              onChange={onFileChange}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0 h-14 w-14"
              onClick={() => fileInputRef.current?.click()}
              title="پیوست فایل (عکس، PDF، ZIP، RAR، CAD، مدل سه‌بعدی)"
            >
              <Paperclip className="w-5 h-5" />
            </Button>
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="پیام خود را بنویسید..."
              className="min-h-[60px] resize-none flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || (!newMessage.trim() && attachments.length === 0)}
              size="icon"
              className="shrink-0 h-14 w-14"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DirectChat;
