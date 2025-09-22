import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Package, Clock, CheckCircle, AlertCircle, Truck, 
  Search, Filter, Plus, Eye, MessageCircle, Star,
  TrendingUp, Users, Award, Calendar
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import OrderStatusManager from '@/components/OrderStatusManager';

interface Project {
  id: string;
  order_number: string;
  title: string;
  deadline: string;
  days_left: number;
  status: string;
  price: number;
  service: {
    name: string;
  };
  order: {
    customer: {
      username: string;
    };
  };
}

const ContractorProjects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('active');
  const [stats, setStats] = useState({
    total_proposals: 0,
    accepted_proposals: 0,
    active_projects: 0,
    rating: 0
  });

  useEffect(() => {
    fetchProjects();
    fetchStats();
  }, []);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/v1/contractor/active-projects/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/v1/contractor/stats/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'accepted': { label: 'تایید شده', variant: 'secondary' as const, icon: CheckCircle },
      'in_progress': { label: 'در حال انجام', variant: 'default' as const, icon: Package },
      'delivered': { label: 'تحویل داده شده', variant: 'default' as const, icon: Truck },
      'completed': { label: 'تکمیل شده', variant: 'default' as const, icon: CheckCircle },
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { 
      label: status, 
      variant: 'secondary' as const, 
      icon: AlertCircle 
    };
    
    const IconComponent = statusInfo.icon;
    return (
      <Badge variant={statusInfo.variant} className="flex items-center gap-1">
        <IconComponent className="h-3 w-3" />
        {statusInfo.label}
      </Badge>
    );
  };

  const getPriorityColor = (daysLeft: number) => {
    if (daysLeft <= 0) return 'text-red-600 bg-red-100';
    if (daysLeft <= 3) return 'text-orange-600 bg-orange-100';
    if (daysLeft <= 7) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getPriorityLabel = (daysLeft: number) => {
    if (daysLeft <= 0) return 'تاخیر';
    if (daysLeft <= 3) return 'فوری';
    if (daysLeft <= 7) return 'مهم';
    return 'عادی';
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.order.customer.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeProjects = filteredProjects.filter(p => p.status === 'in_progress');
  const completedProjects = filteredProjects.filter(p => p.status === 'completed');
  const deliveredProjects = filteredProjects.filter(p => p.status === 'delivered');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <Navbar />
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-8 bg-muted rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">مدیریت پروژه‌ها</h1>
              <p className="text-gray-600">پیگیری و مدیریت پروژه‌های فعال شما</p>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link to="/contractor/proposals">
                  <Plus className="h-4 w-4 ml-2" />
                  پیشنهاد جدید
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/contractor/orders">
                  <Eye className="h-4 w-4 ml-2" />
                  مشاهده سفارشات
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">کل پیشنهادات</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_proposals}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">پیشنهادات تایید شده</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.accepted_proposals}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Package className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">پروژه‌های فعال</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.active_projects}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Star className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">امتیاز متوسط</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.rating.toFixed(1)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="جستجو در پروژه‌ها..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pr-10"
                    />
                  </div>
                </div>
                <div className="w-full md:w-48">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="فیلتر وضعیت" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">همه وضعیت‌ها</SelectItem>
                      <SelectItem value="in_progress">در حال انجام</SelectItem>
                      <SelectItem value="delivered">تحویل داده شده</SelectItem>
                      <SelectItem value="completed">تکمیل شده</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="active" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                پروژه‌های فعال ({activeProjects.length})
              </TabsTrigger>
              <TabsTrigger value="delivered" className="flex items-center gap-2">
                <Truck className="h-4 w-4" />
                تحویل داده شده ({deliveredProjects.length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                تکمیل شده ({completedProjects.length})
              </TabsTrigger>
            </TabsList>

            {/* Active Projects Tab */}
            <TabsContent value="active" className="space-y-4">
              {activeProjects.length > 0 ? (
                <div className="space-y-4">
                  {activeProjects.map((project) => (
                    <Card key={project.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                              {getStatusBadge(project.status)}
                              <Badge 
                                variant="outline" 
                                className={`${getPriorityColor(project.days_left)}`}
                              >
                                {getPriorityLabel(project.days_left)}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                              <div>
                                <span className="font-medium">شماره سفارش:</span>
                                <p>{project.order_number}</p>
                              </div>
                              <div>
                                <span className="font-medium">مشتری:</span>
                                <p>{project.order.customer.username}</p>
                              </div>
                              <div>
                                <span className="font-medium">مبلغ:</span>
                                <p className="text-green-600 font-semibold">
                                  {project.price.toLocaleString()} تومان
                                </p>
                              </div>
                              <div>
                                <span className="font-medium">تاریخ تحویل:</span>
                                <p>{new Date(project.deadline).toLocaleDateString('fa-IR')}</p>
                              </div>
                              <div>
                                <span className="font-medium">روزهای باقی‌مانده:</span>
                                <p className={project.days_left <= 3 ? 'text-red-600 font-semibold' : ''}>
                                  {project.days_left} روز
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            <Button 
                              onClick={() => {/* Handle deliver project */}}
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              <Truck className="h-4 w-4 ml-2" />
                              تحویل پروژه
                            </Button>
                            <Button variant="outline" size="sm">
                              <MessageCircle className="h-4 w-4 ml-2" />
                              پشتیبانی
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
                    <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">پروژه فعالی یافت نشد</h3>
                    <p className="text-gray-600 mb-6">
                      {searchTerm || statusFilter !== 'all' 
                        ? 'با فیلترهای انتخابی پروژه فعالی یافت نشد'
                        : 'هنوز پروژه فعالی ندارید'
                      }
                    </p>
                    <Button asChild>
                      <Link to="/contractor/orders">مشاهده سفارشات</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Delivered Projects Tab */}
            <TabsContent value="delivered" className="space-y-4">
              {deliveredProjects.length > 0 ? (
                <div className="space-y-4">
                  {deliveredProjects.map((project) => (
                    <Card key={project.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                              {getStatusBadge(project.status)}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                              <div>
                                <span className="font-medium">شماره سفارش:</span>
                                <p>{project.order_number}</p>
                              </div>
                              <div>
                                <span className="font-medium">مشتری:</span>
                                <p>{project.order.customer.username}</p>
                              </div>
                              <div>
                                <span className="font-medium">مبلغ:</span>
                                <p className="text-green-600 font-semibold">
                                  {project.price.toLocaleString()} تومان
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 ml-2" />
                              مشاهده جزئیات
                            </Button>
                            <Button variant="outline" size="sm">
                              <MessageCircle className="h-4 w-4 ml-2" />
                              پشتیبانی
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
                    <Truck className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">پروژه تحویل داده شده‌ای یافت نشد</h3>
                    <p className="text-gray-600 mb-6">
                      {searchTerm || statusFilter !== 'all' 
                        ? 'با فیلترهای انتخابی پروژه تحویل داده شده‌ای یافت نشد'
                        : 'هنوز پروژه تحویل داده شده‌ای ندارید'
                      }
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Completed Projects Tab */}
            <TabsContent value="completed" className="space-y-4">
              {completedProjects.length > 0 ? (
                <div className="space-y-4">
                  {completedProjects.map((project) => (
                    <Card key={project.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                              {getStatusBadge(project.status)}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                              <div>
                                <span className="font-medium">شماره سفارش:</span>
                                <p>{project.order_number}</p>
                              </div>
                              <div>
                                <span className="font-medium">مشتری:</span>
                                <p>{project.order.customer.username}</p>
                              </div>
                              <div>
                                <span className="font-medium">مبلغ:</span>
                                <p className="text-green-600 font-semibold">
                                  {project.price.toLocaleString()} تومان
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            <Button variant="outline" size="sm">
                              <Star className="h-4 w-4 ml-2" />
                              مشاهده نظرات
                            </Button>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 ml-2" />
                              مشاهده جزئیات
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
                    <CheckCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">پروژه تکمیل شده‌ای یافت نشد</h3>
                    <p className="text-gray-600 mb-6">
                      {searchTerm || statusFilter !== 'all' 
                        ? 'با فیلترهای انتخابی پروژه تکمیل شده‌ای یافت نشد'
                        : 'هنوز پروژه تکمیل شده‌ای ندارید'
                      }
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ContractorProjects;
