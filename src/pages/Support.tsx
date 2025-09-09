import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Plus, Clock, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';

const Support = () => {
  const { user, isLoadingDashboard } = useAuth();
  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: '',
    priority: 'medium',
    description: ''
  });

  // Mock data for tickets
  const tickets = [
    {
      id: '1',
      subject: 'مشکل در سفارش #ORD-123',
      category: 'سفارش',
      priority: 'high',
      status: 'open',
      createdAt: '2024-09-08',
      lastMessage: 'لطفاً وضعیت سفارش من را بررسی کنید'
    },
    {
      id: '2',
      subject: 'سوال در مورد خدمات',
      category: 'عمومی',
      priority: 'medium',
      status: 'closed',
      createdAt: '2024-09-07',
      lastMessage: 'آیا امکان سفارشی‌سازی وجود دارد؟'
    },
    {
      id: '3',
      subject: 'مشکل فنی در سایت',
      category: 'فنی',
      priority: 'low',
      status: 'waiting_response',
      createdAt: '2024-09-06',
      lastMessage: 'صفحه بارگذاری نمی‌شود'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'default';
      case 'closed': return 'secondary';
      case 'waiting_response': return 'outline';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return 'باز';
      case 'closed': return 'بسته';
      case 'waiting_response': return 'در انتظار پاسخ';
      default: return status;
    }
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the ticket to the backend
    console.log('Creating ticket:', newTicket);
    setNewTicket({ subject: '', category: '', priority: 'medium', description: '' });
  };

  if (isLoadingDashboard) {
    return (
      <div className="min-h-screen" dir="rtl">
        <Navbar />
        <div className="bg-gray-50 p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" dir="rtl">
      <Navbar />
      <div className="bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">پشتیبانی</h1>
              <p className="text-gray-600">مدیریت تیکت‌ها و درخواست‌های پشتیبانی</p>
            </div>
            <Button asChild>
              <a href="#create-ticket">
                <Plus className="h-4 w-4 mr-2" />
                تیکت جدید
              </a>
            </Button>
          </div>

          <Tabs defaultValue="tickets" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tickets">تیکت‌های من</TabsTrigger>
              <TabsTrigger value="create">ایجاد تیکت جدید</TabsTrigger>
            </TabsList>

            <TabsContent value="tickets" className="space-y-4">
              {tickets.length > 0 ? (
                <div className="space-y-4">
                  {tickets.map((ticket) => (
                    <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg">{ticket.subject}</h3>
                              <Badge variant={getPriorityColor(ticket.priority)}>
                                {ticket.priority === 'high' ? 'فوری' : 
                                 ticket.priority === 'medium' ? 'متوسط' : 'کم'}
                              </Badge>
                              <Badge variant={getStatusColor(ticket.status)}>
                                {getStatusText(ticket.status)}
                              </Badge>
                            </div>
                            <p className="text-gray-600 mb-2">{ticket.lastMessage}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>دسته: {ticket.category}</span>
                              <span>تاریخ: {ticket.createdAt}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <MessageSquare className="h-4 w-4 mr-2" />
                              مشاهده
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <HelpCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold mb-2">هیچ تیکتی یافت نشد</h3>
                    <p className="text-gray-600 mb-4">هنوز تیکتی ایجاد نکرده‌اید</p>
                    <Button asChild>
                      <a href="#create-ticket">
                        <Plus className="h-4 w-4 mr-2" />
                        ایجاد اولین تیکت
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="create">
              <Card id="create-ticket">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    ایجاد تیکت جدید
                  </CardTitle>
                  <CardDescription>
                    درخواست پشتیبانی خود را با جزئیات کامل ارسال کنید
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateTicket} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="subject">موضوع *</Label>
                        <input
                          id="subject"
                          type="text"
                          value={newTicket.subject}
                          onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="موضوع تیکت را وارد کنید"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">دسته‌بندی *</Label>
                        <Select value={newTicket.category} onValueChange={(value) => setNewTicket({...newTicket, category: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="دسته‌بندی را انتخاب کنید" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="order">سفارش</SelectItem>
                            <SelectItem value="technical">فنی</SelectItem>
                            <SelectItem value="general">عمومی</SelectItem>
                            <SelectItem value="billing">مالی</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="priority">اولویت</Label>
                      <Select value={newTicket.priority} onValueChange={(value) => setNewTicket({...newTicket, priority: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">کم</SelectItem>
                          <SelectItem value="medium">متوسط</SelectItem>
                          <SelectItem value="high">فوری</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">توضیحات *</Label>
                      <Textarea
                        id="description"
                        value={newTicket.description}
                        onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                        placeholder="توضیحات کامل مشکل یا درخواست خود را بنویسید..."
                        className="min-h-[120px]"
                        required
                      />
                    </div>

                    <div className="flex justify-end gap-3">
                      <Button type="button" variant="outline">
                        انصراف
                      </Button>
                      <Button type="submit">
                        <Plus className="h-4 w-4 mr-2" />
                        ایجاد تیکت
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Support;
