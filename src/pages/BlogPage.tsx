import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Eye, Heart, Search, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getApiUrl } from '@/lib/api';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  author_name: string;
  featured_image?: string;
  source_name?: string;
  view_count: number;
  like_count: number;
  reading_time: number;
  comments_count: number;
  published_at: string;
}

interface BlogCategory {
  value: string;
  label: string;
  count: number;
}

const BlogPage: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: '9',
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCategory && selectedCategory !== 'all' && { category: selectedCategory }),
      });

      const response = await fetch(getApiUrl(`/api/v1/blog/posts/?${params}`));
      if (!response.ok) throw new Error('خطا در دریافت مقالات');
      
      const data = await response.json();
      setPosts(data.results);
      setTotalPages(data.num_pages);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(getApiUrl('/api/v1/blog/categories/'));
      if (!response.ok) throw new Error('خطا در دریافت دسته‌بندی‌ها');
      
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [currentPage, searchTerm, selectedCategory]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setCurrentPage(1);
  };

  const getCategoryLabel = (categoryValue: string) => {
    const category = categories.find(cat => cat.value === categoryValue);
    return category ? category.label : categoryValue;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">وبلاگ مکاترونیک</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            منتخب ترندها و مقالات به روز به همراه منبع
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="جستجو در مقالات..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pr-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="انتخاب دسته‌بندی" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه دسته‌بندی‌ها</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label} ({category.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Posts Grid */}
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {posts.map((post) => (
              <Card key={post.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      {getCategoryLabel(post.category)}
                    </Badge>
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="h-3 w-3 ml-1" />
                      {formatDate(post.published_at)}
                    </div>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">
                    <Link 
                      to={`/blog/${post.slug}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {post.title}
                    </Link>
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  
                  {post.featured_image && (
                    <div className="mb-4">
                      <img 
                        src={post.featured_image} 
                        alt={post.title}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <div className="flex items-center">
                      <User className="h-3 w-3 ml-1" />
                      {post.author_name}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 ml-1" />
                      {post.reading_time} دقیقه
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center">
                        <Eye className="h-3 w-3 ml-1" />
                        {post.view_count}
                      </div>
                      <div className="flex items-center">
                        <Heart className="h-3 w-3 ml-1" />
                        {post.like_count}
                      </div>
                    </div>
                    
                    {post.source_name && (
                      <Badge variant="secondary" className="text-xs">
                        منبع: {post.source_name}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-gray-500 text-lg">مقاله‌ای یافت نشد</p>
              <p className="text-gray-400 text-sm mt-2">
                لطفاً کلمات کلیدی یا دسته‌بندی دیگری را امتحان کنید
              </p>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              قبلی
            </Button>
            
            {[...Array(totalPages)].map((_, i) => (
              <Button
                key={i + 1}
                variant={currentPage === i + 1 ? "default" : "outline"}
                onClick={() => setCurrentPage(i + 1)}
                className="w-10"
              >
                {i + 1}
              </Button>
            ))}
            
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              بعدی
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPage;
