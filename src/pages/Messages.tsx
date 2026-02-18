import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Search } from 'lucide-react';
import Navbar from '@/components/Navbar';
import DirectChat from '@/components/DirectChat';
import { api, ConversationType, DirectMessageType, UserPublicProfile } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

const Messages = () => {
  const [searchParams] = useSearchParams();
  const targetUserId = searchParams.get('user');

  const [conversations, setConversations] = useState<ConversationType[]>([]);
  const [selectedConv, setSelectedConv] = useState<ConversationType | null>(null);
  const [messages, setMessages] = useState<DirectMessageType[]>([]);
  const [users, setUsers] = useState<UserPublicProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const fetchConversations = useCallback(async () => {
    try {
      const data = await api.getConversations();
      setConversations(data);
    } catch (err) {
      console.error(err);
      toast({
        title: 'خطا',
        description: 'خطا در بارگذاری مکالمات',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async (convId: string) => {
    setLoadingMessages(true);
    try {
      const data = await api.getConversationMessages(convId);
      setMessages(data);
      await api.markMessagesRead(convId);
    } catch (err) {
      console.error(err);
      toast({
        title: 'خطا',
        description: 'خطا در بارگذاری پیام‌ها',
        variant: 'destructive',
      });
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // When ?user=xxx, get or create conversation with that user
  useEffect(() => {
    if (!targetUserId) return;
    api
      .getOrCreateConversation(targetUserId)
      .then((conv) => {
        setSelectedConv(conv);
        setShowUserSearch(false);
        fetchMessages(conv.id);
      })
      .catch((err) => {
        console.error(err);
        toast({
          title: 'خطا',
          description: 'امکان شروع چت وجود ندارد',
          variant: 'destructive',
        });
      });
  }, [targetUserId, fetchMessages]);

  const handleSelectConversation = (conv: ConversationType) => {
    setSelectedConv(conv);
    setShowUserSearch(false);
    fetchMessages(conv.id);
  };

  const handleSearchUsers = async () => {
    if (!searchQuery.trim()) {
      setUsers([]);
      return;
    }
    try {
      const data = await api.getPublicUsers(searchQuery.trim());
      setUsers(data);
      setShowUserSearch(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartChatWithUser = async (user: UserPublicProfile) => {
    try {
      const conv = await api.getOrCreateConversation(user.id);
      setSelectedConv(conv);
      setShowUserSearch(false);
      setSearchQuery('');
      setUsers([]);
      fetchMessages(conv.id);
      if (!conversations.some((c) => c.id === conv.id)) {
        setConversations((prev) => [conv, ...prev]);
      }
    } catch (err) {
      console.error(err);
      toast({
        title: 'خطا',
        description: 'امکان شروع چت وجود ندارد',
        variant: 'destructive',
      });
    }
  };

  const handleNewMessage = (msg: DirectMessageType) => {
    setMessages((prev) => [...prev, msg]);
    if (selectedConv) {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConv.id
            ? { ...c, last_message: msg, updated_at: msg.created_at }
            : c
        )
      );
    }
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">پیام‌ها</h1>
          <p className="text-muted-foreground">چت با سایر کاربران</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar: conversations + user search */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="جستجوی کاربر برای چت..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchUsers()}
              />
              <Button variant="outline" size="icon" onClick={handleSearchUsers}>
                <Search className="w-4 h-4" />
              </Button>
            </div>

            {showUserSearch && users.length > 0 && (
              <Card>
                <CardContent className="p-2">
                  <p className="text-sm font-medium mb-2">انتخاب کاربر</p>
                  {users.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between gap-3 p-2 rounded hover:bg-muted group"
                    >
                      <div
                        className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                        onClick={() => handleStartChatWithUser(u)}
                      >
                        <Avatar className="h-8 w-8 shrink-0">
                          {u.profile_image && <AvatarImage src={u.profile_image} />}
                          <AvatarFallback>
                            {(u.first_name?.[0] || u.username[0]).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm truncate">
                          {u.first_name || u.last_name || u.username}
                        </span>
                      </div>
                      <Button variant="ghost" size="sm" className="shrink-0" asChild>
                        <Link to={`/users/${u.id}`} onClick={(e) => e.stopPropagation()}>
                          پروفایل
                        </Link>
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-4 flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>هنوز مکالمه‌ای ندارید</p>
                    <p className="text-sm">یک کاربر جستجو کنید تا چت را شروع کنید</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {conversations.map((conv) => {
                      const other = conv.other_user;
                      const isSelected = selectedConv?.id === conv.id;
                      return (
                        <div
                          key={conv.id}
                          className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-muted ${
                            isSelected ? 'bg-muted' : ''
                          }`}
                          onClick={() => handleSelectConversation(conv)}
                        >
                          <Avatar className="h-10 w-10">
                            {other?.profile_image && (
                              <AvatarImage src={other.profile_image} />
                            )}
                            <AvatarFallback>
                              {(other?.first_name?.[0] || other?.username?.[0] || '?').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {other?.first_name || other?.last_name || other?.username || 'کاربر'}
                            </p>
                            {conv.last_message && (
                              <p className="text-xs text-muted-foreground truncate">
                                {conv.last_message.content}
                              </p>
                            )}
                          </div>
                          {conv.unread_count > 0 && (
                            <Badge variant="default" className="shrink-0">
                              {conv.unread_count}
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Chat area */}
          <div className="lg:col-span-2">
            {selectedConv ? (
              <DirectChat
                conversationId={selectedConv.id}
                otherUserName={
                  selectedConv.other_user?.first_name ||
                  selectedConv.other_user?.last_name ||
                  selectedConv.other_user?.username ||
                  'کاربر'
                }
                messages={messages}
                onNewMessage={handleNewMessage}
                onMarkRead={() =>
                  selectedConv &&
                  api.markMessagesRead(selectedConv.id).catch(() => {})
                }
              />
            ) : (
              <Card className="h-[500px] flex items-center justify-center">
                <CardContent className="text-center text-muted-foreground">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">مکالمه‌ای انتخاب نشده</p>
                  <p>از لیست یک مکالمه را انتخاب کنید یا کاربر جدید جستجو کنید</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
