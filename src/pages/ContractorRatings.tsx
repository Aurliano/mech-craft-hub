import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Star, TrendingUp, Award, Users, MessageCircle, 
  Eye, Filter, Search, Calendar, ThumbsUp, ThumbsDown, AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';

interface Rating {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  customer: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
  };
  order_item: {
    id: string;
    service_name: string;
  };
}

interface RatingStats {
  total_ratings: number;
  average_rating: number;
  rating_breakdown: {
    '5_star': number;
    '4_star': number;
    '3_star': number;
    '2_star': number;
    '1_star': number;
  };
  recent_ratings: Rating[];
}

const ContractorRatings = () => {
  const { user } = useAuth();
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [stats, setStats] = useState<RatingStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRatings();
    fetchStats();
  }, []);

  const fetchRatings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/v1/contractor/ratings/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRatings(data);
      } else {
        setError('خطا در دریافت امتیازات');
      }
    } catch (error) {
      setError('خطای شبکه در دریافت امتیازات');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/v1/contractor/rating-stats/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching rating stats:', error);
    }
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600 bg-green-100';
    if (rating >= 3.5) return 'text-yellow-600 bg-yellow-100';
    if (rating >= 2.5) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getRatingLabel = (rating: number) => {
    if (rating >= 4.5) return 'عالی';
    if (rating >= 3.5) return 'خوب';
    if (rating >= 2.5) return 'متوسط';
    if (rating >= 1.5) return 'ضعیف';
    return 'خیلی ضعیف';
  };

  const filteredRatings = ratings.filter(rating => {
    const matchesSearch = rating.customer.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rating.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rating.order_item.service_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = ratingFilter === 'all' || rating.rating.toString() === ratingFilter;
    return matchesSearch && matchesRating;
  });

  const recentRatings = filteredRatings.slice(0, 10);
  const highRatings = filteredRatings.filter(r => r.rating >= 4);
  const lowRatings = filteredRatings.filter(r => r.rating <= 2);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <Navbar />
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-6xl mx-auto space-y-6">
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
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">امتیازات و نظرات</h1>
              <p className="text-gray-600">بررسی امتیازات و نظرات مشتریان</p>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link to="/contractor/projects">
                  <Eye className="h-4 w-4 ml-2" />
                  پروژه‌های من
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/contractor/stats">
                  <TrendingUp className="h-4 w-4 ml-2" />
                  آمار کلی
                </Link>
              </Button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Star className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">میانگین امتیاز</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {(stats?.average_rating || 0).toFixed(1)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">کل نظرات</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats?.total_ratings || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <ThumbsUp className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">نظرات مثبت</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {highRatings.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <ThumbsDown className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">نظرات منفی</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {lowRatings.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Rating Distribution */}
          {stats && (
            <Card>
              <CardHeader>
                <CardTitle>توزیع امتیازات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const key = `${rating}_star` as keyof typeof stats.rating_breakdown;
                    const count = stats?.rating_breakdown?.[key] || 0;
                    const percentage = (stats?.total_ratings || 0) > 0 ? (count / (stats?.total_ratings || 1)) * 100 : 0;
                    
                    return (
                      <div key={rating} className="flex items-center gap-3">
                        <div className="flex items-center gap-1 w-16">
                          <span className="text-sm font-medium">{rating}</span>
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        </div>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-12 text-left">
                          {count} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="جستجو در نظرات..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="w-full md:w-48">
                  <select
                    value={ratingFilter}
                    onChange={(e) => setRatingFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">همه امتیازات</option>
                    <option value="5">5 ستاره</option>
                    <option value="4">4 ستاره</option>
                    <option value="3">3 ستاره</option>
                    <option value="2">2 ستاره</option>
                    <option value="1">1 ستاره</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                همه نظرات ({filteredRatings.length})
              </TabsTrigger>
              <TabsTrigger value="high" className="flex items-center gap-2">
                <ThumbsUp className="h-4 w-4" />
                نظرات مثبت ({highRatings.length})
              </TabsTrigger>
              <TabsTrigger value="low" className="flex items-center gap-2">
                <ThumbsDown className="h-4 w-4" />
                نظرات منفی ({lowRatings.length})
              </TabsTrigger>
            </TabsList>

            {/* All Ratings Tab */}
            <TabsContent value="all" className="space-y-4">
              {filteredRatings.length > 0 ? (
                <div className="space-y-4">
                  {filteredRatings.map((rating) => (
                    <Card key={rating.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            {rating.customer.first_name || rating.customer.last_name ? (
                              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                                {(rating.customer.first_name?.[0] || '') + (rating.customer.last_name?.[0] || '')}
                              </div>
                            ) : (
                              <Users className="h-5 w-5 text-gray-500" />
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <h3 className="font-semibold text-gray-900">
                                  {rating.customer.username}
                                </h3>
                                <div className="flex items-center gap-1">
                                  {getRatingStars(rating.rating)}
                                </div>
                                <Badge 
                                  variant="outline" 
                                  className={`${getRatingColor(rating.rating)}`}
                                >
                                  {getRatingLabel(rating.rating)}
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-500">
                                {new Date(rating.created_at).toLocaleDateString('fa-IR')}
                              </div>
                            </div>
                            
                            <div className="mb-3">
                              <p className="text-sm text-gray-600 mb-1">
                                آیتم سفارش: {rating.order_item.id}
                              </p>
                              <p className="text-sm text-gray-600">
                                سرویس: {rating.order_item.service_name}
                              </p>
                            </div>
                            
                            {rating.comment && (
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-gray-700">{rating.comment}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">نظری یافت نشد</h3>
                    <p className="text-gray-600">
                      {searchTerm || ratingFilter !== 'all' 
                        ? 'با فیلترهای انتخابی نظری یافت نشد'
                        : 'هنوز نظری دریافت نکرده‌اید'
                      }
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* High Ratings Tab */}
            <TabsContent value="high" className="space-y-4">
              {highRatings.length > 0 ? (
                <div className="space-y-4">
                  {highRatings.map((rating) => (
                    <Card key={rating.id} className="hover:shadow-md transition-shadow border-green-200">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <ThumbsUp className="h-5 w-5 text-green-600" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <h3 className="font-semibold text-gray-900">
                                  {rating.customer.username}
                                </h3>
                                <div className="flex items-center gap-1">
                                  {getRatingStars(rating.rating)}
                                </div>
                                <Badge variant="outline" className="text-green-600 bg-green-100">
                                  {getRatingLabel(rating.rating)}
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-500">
                                {new Date(rating.created_at).toLocaleDateString('fa-IR')}
                              </div>
                            </div>
                            
                            <div className="mb-3">
                              <p className="text-sm text-gray-600 mb-1">
                                آیتم سفارش: {rating.order_item.id}
                              </p>
                              <p className="text-sm text-gray-600">
                                سرویس: {rating.order_item.service_name}
                              </p>
                            </div>
                            
                            {rating.comment && (
                              <div className="bg-green-50 p-3 rounded-lg">
                                <p className="text-gray-700">{rating.comment}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <ThumbsUp className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">نظر مثبتی یافت نشد</h3>
                    <p className="text-gray-600">
                      هنوز نظر مثبتی دریافت نکرده‌اید
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Low Ratings Tab */}
            <TabsContent value="low" className="space-y-4">
              {lowRatings.length > 0 ? (
                <div className="space-y-4">
                  {lowRatings.map((rating) => (
                    <Card key={rating.id} className="hover:shadow-md transition-shadow border-red-200">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <ThumbsDown className="h-5 w-5 text-red-600" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <h3 className="font-semibold text-gray-900">
                                  {rating.customer.username}
                                </h3>
                                <div className="flex items-center gap-1">
                                  {getRatingStars(rating.rating)}
                                </div>
                                <Badge variant="outline" className="text-red-600 bg-red-100">
                                  {getRatingLabel(rating.rating)}
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-500">
                                {new Date(rating.created_at).toLocaleDateString('fa-IR')}
                              </div>
                            </div>
                            
                            <div className="mb-3">
                              <p className="text-sm text-gray-600 mb-1">
                                آیتم سفارش: {rating.order_item.id}
                              </p>
                              <p className="text-sm text-gray-600">
                                سرویس: {rating.order_item.service_name}
                              </p>
                            </div>
                            
                            {rating.comment && (
                              <div className="bg-red-50 p-3 rounded-lg">
                                <p className="text-gray-700">{rating.comment}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <ThumbsDown className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">نظر منفی یافت نشد</h3>
                    <p className="text-gray-600">
                      خوشبختانه نظر منفی دریافت نکرده‌اید
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

export default ContractorRatings;
