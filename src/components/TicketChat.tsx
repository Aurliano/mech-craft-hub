import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Send,
  MessageSquare,
  Paperclip, 
  Image, 
  FileText, 
  Download, 
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Shield
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface TicketMessage {
  id: string;
  sender: string;
  sender_name: string;
  content: string;
  is_internal: boolean;
  created_at: string;
  attachments: TicketAttachment[];
}

interface TicketAttachment {
  id: string;
  filename: string;
  original_filename: string;
  file_url: string;
  file_size_mb: number;
  mime_type: string;
  attachment_type: string;
  is_processed: boolean;
  ocr_text?: string;
}

interface TicketChatProps {
  ticketId: string;
  messages: TicketMessage[];
  onNewMessage: (message: TicketMessage) => void;
  isAdmin?: boolean;
}

const TicketChat: React.FC<TicketChatProps> = ({ 
  ticketId, 
  messages, 
  onNewMessage, 
  isAdmin = false 
}) => {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    
    const fileArray = Array.from(selectedFiles);
    const validFiles = fileArray.filter(file => {
      const maxSize = 100 * 1024 * 1024; // 100MB
      if (file.size > maxSize) {
        toast({
          title: 'خطا',
          description: `فایل ${file.name} بیش از 100 مگابایت است`,
          variant: 'destructive'
        });
        return false;
      }
      return true;
    });
    
    setFiles(prev => [...prev, ...validFiles]);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (mimeType.includes('pdf')) return <FileText className="w-4 h-4" />;
    return <Paperclip className="w-4 h-4" />;
  };

  const formatFileSize = (sizeInMB: number) => {
    if (sizeInMB < 1) return `${(sizeInMB * 1024).toFixed(0)} KB`;
    return `${sizeInMB.toFixed(1)} MB`;
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && files.length === 0) return;

    setIsLoading(true);
    try {
      const response = await api.createTicketMessage(ticketId, {
        content: newMessage,
        files: files
      });

      if (response.message_id) {
        // Refresh messages or add new message to state
        setNewMessage('');
        setFiles([]);
        toast({
          title: 'موفق',
          description: 'پیام با موفقیت ارسال شد',
        });
        
        // You might want to refresh the ticket data here
        window.location.reload(); // Simple refresh for now
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: 'خطا',
        description: error.response?.data?.error || 'خطا در ارسال پیام',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadFile = (attachment: TicketAttachment) => {
    const link = document.createElement('a');
    link.href = attachment.file_url;
    link.download = attachment.original_filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          چت تیکت
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.sender === user?.id ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <Avatar className="w-8 h-8">
                  <AvatarFallback>
                    {message.sender_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.sender === user?.id
                      ? 'bg-primary text-primary-foreground'
                      : message.is_internal
                      ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                      : 'bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-sm">
                      {message.sender_name}
                    </span>
                    {message.is_internal && (
                      <Badge variant="secondary" className="text-xs">
                        <Shield className="w-3 h-3 mr-1" />
                        داخلی
                      </Badge>
                    )}
                    <span className="text-xs opacity-70">
                      {new Date(message.created_at).toLocaleString('fa-IR')}
                    </span>
                  </div>
                  
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  
                  {/* Attachments */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.attachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className="flex items-center gap-2 p-2 bg-white/10 rounded border"
                        >
                          {getFileIcon(attachment.mime_type)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {attachment.original_filename}
                            </p>
                            <p className="text-xs opacity-70">
                              {formatFileSize(attachment.file_size_mb)}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => downloadFile(attachment)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <Separator />

        {/* File Preview */}
        {files.length > 0 && (
          <div className="p-4 border-b">
            <div className="flex flex-wrap gap-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-muted px-3 py-2 rounded-lg"
                >
                  {getFileIcon(file.type)}
                  <span className="text-sm truncate max-w-[200px]">
                    {file.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(file.size / (1024 * 1024))}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeFile(index)}
                    className="h-6 w-6 p-0"
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4">
          <div
            className={`border-2 border-dashed rounded-lg p-4 transition-colors ${
              dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="پیام خود را بنویسید..."
              className="min-h-[80px] resize-none border-0 focus-visible:ring-0"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                  accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.txt,.stl,.obj,.dwg,.dxf,.zip,.rar"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="w-4 h-4 mr-2" />
                  فایل
                </Button>
                <span className="text-xs text-muted-foreground">
                  حداکثر 100 مگابایت
                </span>
              </div>
              
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || (!newMessage.trim() && files.length === 0)}
                size="sm"
              >
                <Send className="w-4 h-4 mr-2" />
                {isLoading ? 'در حال ارسال...' : 'ارسال'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TicketChat;
