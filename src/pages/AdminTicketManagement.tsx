import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MessageSquare, 
  Search, 
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  User,
  Calendar,
  Shield,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
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

interface ContentViolation {
  id: string;
  user_name: string;
  violation_type: string;
  detected_content: string;
  action_taken: string;
  confidence_score: number;
  is_false_positive: boolean;
  created_at: string;
  reviewed_by_name?: string;
  reviewed_at?: string;
}

const AdminTicketManagement = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [violations, setViolations] = useState<ContentViolation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [violationFilter, setViolationFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showTicketDetails, setShowTicketDetails] = useState(false);

  useEffect(() => {
    fetchTickets();
    fetchViolations();
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

  const fetchViolations = async () => {
    try {
      const response = await api.getContentFilterLogs();
      setViolations(Array.isArray(response) ? response : response.results || []);
    } catch (error) {
      console.error('Error fetching violations:', error);
      toast({
        title: 'خطا',
        description: 'خطا در بارگذاری تخلفات',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateTicketStatus = async (ticketId: string, newStatus: string) => {
    try {
      await api.updateTicketStatus(ticketId, newStatus);
      toast({
        title: 'موفق',
        description: 'وضعیت تیکت به‌روزرسانی شد',
      });
      fetchTickets();
    } catch (error) {
      console.error('Error updating ticket status:', error);
      toast({
        title: 'خطا',
        description: 'خطا در به‌روزرسانی وضعیت تیکت',
        variant: 'destructive'
      });
    }
  };

  const handleReviewViolation = async (violationId: string, isFalsePositive: boolean) => {
    try {
      await api.reviewContentViolation(violationId, isFalsePositive);
      toast({
        title: 'موفق',
        description: 'تخلف بررسی شد',
      });
      fetchViolations();
    } catch (error) {
      console.error('Error reviewing violation:', error);
      toast({
        title: 'خطا',
        description: 'خطا در بررسی تخلف',
        variant: 'destructive'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'waiting_response': return 'bg-yellow-100 text-yellow-800';
      case 'quarantined': return 'bg-red-100 text-red-800';
      case 'escalated': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <CheckCircle className="w-4 h-4" />;
      case 'closed': return <CheckCircle className="w-4 h-4" />;
      case 'waiting_response': return <Clock className="w-4 h-4" />;
      case 'quarantined': return <AlertTriangle className="w-4 h-4" />;
      case 'escalated': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getViolationTypeText = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'phone': 'شماره تلفن',
      'email': 'ایمیل',
      'url': 'لینک',
      'social_id': 'آیدی شبکه اجتماعی',
      'contact_invitation': 'دعوت به ارتباط خارجی',
      'other': 'سایر'
    };
    return typeMap[type] || type;
  };

  const getActionText = (action: string) => {
    const actionMap: { [key: string]: string } = {
      'blocked': 'مسدود شده',
      'quarantined': 'قرنطینه شده',
      'warning': 'هشدار',
      'allowed': 'مجاز'
    };
    return actionMap[action] || action;
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.category_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.creator_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const filteredViolations = violations.filter(violation => {
    const matchesType = violationFilter === 'all' || violation.violation_type === violationFilter;
    return matchesType;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
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
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">مدیریت تیکت‌ها</h1>
          <p className="text-muted-foreground">
            مدیریت و نظارت بر تیکت‌های پشتیبانی و تخلفات محتوا
          </p>
        </div>

        <Tabs defaultValue="tickets" className="space-y-6">
          <TabsList>
            <TabsTrigger value="tickets" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              تیکت‌ها
            </TabsTrigger>
            <TabsTrigger value="violations" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              تخلفات محتوا
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tickets" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="جستجو در تیکت‌ها..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pr-10"
                      />
                    </div>
                  </div>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="وضعیت" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">همه وضعیت‌ها</SelectItem>
                      <SelectItem value="open">باز</SelectItem>
                      <SelectItem value="closed">بسته</SelectItem>
                      <SelectItem value="waiting_response">در انتظار پاسخ</SelectItem>
                      <SelectItem value="quarantined">قرنطینه شده</SelectItem>
                      <SelectItem value="escalated">ارجاع شده</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="اولویت" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">همه اولویت‌ها</SelectItem>
                      <SelectItem value="urgent">فوری</SelectItem>
                      <SelectItem value="high">زیاد</SelectItem>
                      <SelectItem value="medium">متوسط</SelectItem>
                      <SelectItem value="low">کم</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button onClick={fetchTickets} variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    به‌روزرسانی
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tickets Table */}
            <Card>
              <CardHeader>
                <CardTitle>لیست تیکت‌ها ({filteredTickets.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>موضوع</TableHead>
                      <TableHead>ایجاد کننده</TableHead>
                      <TableHead>دسته‌بندی</TableHead>
                      <TableHead>وضعیت</TableHead>
                      <TableHead>اولویت</TableHead>
                      <TableHead>تاریخ ایجاد</TableHead>
                      <TableHead>عملیات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTickets.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-medium">{ticket.subject}</TableCell>
                        <TableCell>{ticket.creator_name}</TableCell>
                        <TableCell>{ticket.category_name}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(ticket.status)}>
                            {getStatusIcon(ticket.status)}
                            <span className="mr-1">
                              {ticket.status === 'open' ? 'باز' :
                               ticket.status === 'closed' ? 'بسته' :
                               ticket.status === 'waiting_response' ? 'در انتظار پاسخ' :
                               ticket.status === 'quarantined' ? 'قرنطینه شده' :
                               ticket.status === 'escalated' ? 'ارجاع شده' : ticket.status}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(ticket.priority)}>
                            {ticket.priority === 'urgent' ? 'فوری' :
                             ticket.priority === 'high' ? 'زیاد' :
                             ticket.priority === 'medium' ? 'متوسط' : 'کم'}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(ticket.created_at)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedTicket(ticket);
                                setShowTicketDetails(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Select
                              value={ticket.status}
                              onValueChange={(value) => handleUpdateTicketStatus(ticket.id, value)}
                            >
                              <SelectTrigger className="w-[120px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="open">باز</SelectItem>
                                <SelectItem value="closed">بسته</SelectItem>
                                <SelectItem value="waiting_response">در انتظار پاسخ</SelectItem>
                                <SelectItem value="quarantined">قرنطینه شده</SelectItem>
                                <SelectItem value="escalated">ارجاع شده</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="violations" className="space-y-6">
            {/* Violations Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Select value={violationFilter} onValueChange={setViolationFilter}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue placeholder="نوع تخلف" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">همه انواع</SelectItem>
                      <SelectItem value="phone">شماره تلفن</SelectItem>
                      <SelectItem value="email">ایمیل</SelectItem>
                      <SelectItem value="url">لینک</SelectItem>
                      <SelectItem value="social_id">آیدی شبکه اجتماعی</SelectItem>
                      <SelectItem value="contact_invitation">دعوت به ارتباط خارجی</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button onClick={fetchViolations} variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    به‌روزرسانی
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Violations Table */}
            <Card>
              <CardHeader>
                <CardTitle>تخلفات محتوا ({filteredViolations.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>کاربر</TableHead>
                      <TableHead>نوع تخلف</TableHead>
                      <TableHead>محتوای تشخیص داده شده</TableHead>
                      <TableHead>اقدام انجام شده</TableHead>
                      <TableHead>امتیاز اطمینان</TableHead>
                      <TableHead>وضعیت بررسی</TableHead>
                      <TableHead>تاریخ</TableHead>
                      <TableHead>عملیات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredViolations.map((violation) => (
                      <TableRow key={violation.id}>
                        <TableCell className="font-medium">{violation.user_name}</TableCell>
                        <TableCell>{getViolationTypeText(violation.violation_type)}</TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {violation.detected_content}
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            violation.action_taken === 'blocked' ? 'destructive' :
                            violation.action_taken === 'quarantined' ? 'default' :
                            violation.action_taken === 'warning' ? 'secondary' : 'outline'
                          }>
                            {getActionText(violation.action_taken)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{(violation.confidence_score * 100).toFixed(1)}%</span>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{ width: `${violation.confidence_score * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {violation.is_false_positive ? (
                            <Badge variant="outline">نادرست</Badge>
                          ) : violation.reviewed_at ? (
                            <Badge variant="secondary">بررسی شده</Badge>
                          ) : (
                            <Badge variant="destructive">بررسی نشده</Badge>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(violation.created_at)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReviewViolation(violation.id, false)}
                              disabled={violation.reviewed_at && !violation.is_false_positive}
                            >
                              تایید
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReviewViolation(violation.id, true)}
                              disabled={violation.is_false_positive}
                            >
                              نادرست
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Ticket Details Dialog */}
        <Dialog open={showTicketDetails} onOpenChange={setShowTicketDetails}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>جزئیات تیکت</DialogTitle>
            </DialogHeader>
            {selectedTicket && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">موضوع</label>
                    <p className="text-lg">{selectedTicket.subject}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">ایجاد کننده</label>
                    <p>{selectedTicket.creator_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">دسته‌بندی</label>
                    <p>{selectedTicket.category_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">اولویت</label>
                    <Badge className={getPriorityColor(selectedTicket.priority)}>
                      {selectedTicket.priority === 'urgent' ? 'فوری' :
                       selectedTicket.priority === 'high' ? 'زیاد' :
                       selectedTicket.priority === 'medium' ? 'متوسط' : 'کم'}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleUpdateTicketStatus(selectedTicket.id, 'open')}
                    variant={selectedTicket.status === 'open' ? 'default' : 'outline'}
                  >
                    باز
                  </Button>
                  <Button
                    onClick={() => handleUpdateTicketStatus(selectedTicket.id, 'closed')}
                    variant={selectedTicket.status === 'closed' ? 'default' : 'outline'}
                  >
                    بسته
                  </Button>
                  <Button
                    onClick={() => handleUpdateTicketStatus(selectedTicket.id, 'escalated')}
                    variant={selectedTicket.status === 'escalated' ? 'default' : 'outline'}
                  >
                    ارجاع شده
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminTicketManagement;
