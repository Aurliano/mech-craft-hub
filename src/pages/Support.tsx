import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Plus, Clock, CheckCircle, AlertCircle, HelpCircle, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import TicketList from '@/components/TicketList';
import TicketChat from '@/components/TicketChat';
import CreateTicketModal from '@/components/CreateTicketModal';
import { api } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface Ticket {
  id: string;
  subject: string;
  category_name: string;
  status: string;
  priority: string;
  creator_name: string;
  order_number?: string;
  created_at: string;
  last_activity_at: string;
  messages_count?: number;
}

interface TicketMessage {
  id: string;
  sender: string;
  sender_name: string;
  content: string;
  is_internal: boolean;
  created_at: string;
  attachments: any[];
}

const Support = () => {
  const { user, isLoadingDashboard } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [ticketMessages, setTicketMessages] = useState<TicketMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tickets');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await api.getTickets();
      setTickets(Array.isArray(response) ? response : response.results || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({
        title: 'خطا',
        description: 'خطا در بارگذاری تیکت‌ها',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketMessages = async (ticketId: string) => {
    try {
      const response = await api.getTicketMessages(ticketId);
      setTicketMessages(Array.isArray(response) ? response : response.results || []);
    } catch (error) {
      console.error('Error fetching ticket messages:', error);
      toast({
        title: 'خطا',
        description: 'خطا در بارگذاری پیام‌ها',
        variant: 'destructive'
      });
    }
  };

  const handleSelectTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setActiveTab('chat');
    fetchTicketMessages(ticket.id);
  };

  const handleTicketCreated = (ticketId: string) => {
    fetchTickets();
    // Optionally select the new ticket
    const newTicket = tickets?.find(t => t.id === ticketId);
    if (newTicket) {
      handleSelectTicket(newTicket);
    }
  };

  const handleNewMessage = (message: TicketMessage) => {
    setTicketMessages(prev => [...prev, message]);
  };

  if (isLoadingDashboard) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">پشتیبانی</h1>
          <p className="text-muted-foreground">
            برای دریافت کمک و راهنمایی، تیکت پشتیبانی ایجاد کنید
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="tickets" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              تیکت‌های من
            </TabsTrigger>
            {selectedTicket && (
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                چت تیکت
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="tickets" className="space-y-6">
            <TicketList
              onCreateTicket={() => setActiveTab('create')}
              onSelectTicket={handleSelectTicket}
              selectedTicketId={selectedTicket?.id}
            />
          </TabsContent>

          <TabsContent value="chat" className="space-y-6">
            {selectedTicket ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">{selectedTicket.subject}</CardTitle>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">{selectedTicket.category_name}</Badge>
                        <Badge variant={
                          selectedTicket.status === 'open' ? 'default' :
                          selectedTicket.status === 'closed' ? 'secondary' :
                          selectedTicket.status === 'waiting_response' ? 'outline' : 'destructive'
                        }>
                          {selectedTicket.status === 'open' ? 'باز' :
                           selectedTicket.status === 'closed' ? 'بسته' :
                           selectedTicket.status === 'waiting_response' ? 'در انتظار پاسخ' :
                           selectedTicket.status === 'quarantined' ? 'قرنطینه شده' :
                           selectedTicket.status === 'escalated' ? 'ارجاع شده' : selectedTicket.status}
                        </Badge>
                        <Badge variant={
                          selectedTicket.priority === 'urgent' ? 'destructive' :
                          selectedTicket.priority === 'high' ? 'default' :
                          selectedTicket.priority === 'medium' ? 'secondary' : 'outline'
                        }>
                          {selectedTicket.priority === 'urgent' ? 'فوری' :
                           selectedTicket.priority === 'high' ? 'زیاد' :
                           selectedTicket.priority === 'medium' ? 'متوسط' : 'کم'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <span>ایجاد کننده:</span>
                          <span>{selectedTicket.creator_name}</span>
                        </div>
                        {selectedTicket.order_number && (
                          <div className="flex items-center gap-2">
                            <span>سفارش:</span>
                            <span>{selectedTicket.order_number}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span>تاریخ ایجاد:</span>
                          <span>{new Date(selectedTicket.created_at).toLocaleDateString('fa-IR')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>آخرین فعالیت:</span>
                          <span>{new Date(selectedTicket.last_activity_at).toLocaleDateString('fa-IR')}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="lg:col-span-2">
                  <TicketChat
                    ticketId={selectedTicket.id}
                    messages={ticketMessages}
                    onNewMessage={handleNewMessage}
                  />
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">تیکتی انتخاب نشده</h3>
                  <p className="text-muted-foreground mb-4">
                    برای شروع چت، ابتدا یک تیکت انتخاب کنید
                  </p>
                  <Button onClick={() => setActiveTab('tickets')}>
                    بازگشت به لیست تیکت‌ها
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Create Ticket Modal */}
        <CreateTicketModal onTicketCreated={handleTicketCreated}>
          <Button className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-6 h-6" />
          </Button>
        </CreateTicketModal>
      </div>
    </div>
  );
};

export default Support;