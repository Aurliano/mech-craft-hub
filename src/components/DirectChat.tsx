import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api, DirectMessageType } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

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
  const [isLoading, setIsLoading] = useState(false);
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

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setIsLoading(true);
    try {
      const msg = await api.sendDirectMessage(conversationId, newMessage.trim());
      setNewMessage('');
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
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="پیام خود را بنویسید..."
              className="min-h-[60px] resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !newMessage.trim()}
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
