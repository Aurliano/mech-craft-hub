import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  AlertCircle, 
  FileText, 
  Image, 
  Paperclip,
  CheckCircle,
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface TicketCategory {
  id: string;
  name: string;
  display_name: string;
  requires_order: boolean;
  description: string;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
}

interface CreateTicketModalProps {
  children?: React.ReactNode;
  onTicketCreated?: (ticketId: string) => void;
}

const CreateTicketModal: React.FC<CreateTicketModalProps> = ({ 
  children, 
  onTicketCreated 
}) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<TicketCategory[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    category_id: '',
    subject: '',
    content: '',
    order_id: '',
    priority: 'medium'
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (open) {
      fetchCategories();
      fetchUserOrders();
    }
  }, [open]);

  const fetchCategories = async () => {
    try {
      const response = await api.getTicketCategories();
      setCategories(response);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchUserOrders = async () => {
    try {
      const response = await api.getUserOrders();
      setOrders(response.filter((order: Order) => order.status === 'in_progress'));
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

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

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (file.type.includes('pdf')) return <FileText className="w-4 h-4" />;
    return <Paperclip className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    const sizeInMB = bytes / (1024 * 1024);
    if (sizeInMB < 1) return `${(sizeInMB * 1024).toFixed(0)} KB`;
    return `${sizeInMB.toFixed(1)} MB`;
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.category_id) {
      newErrors.category_id = 'انتخاب دسته‌بندی الزامی است';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'موضوع تیکت الزامی است';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'محتوای تیکت الزامی است';
    }

    const selectedCategory = categories.find(cat => cat.id === formData.category_id);
    if (selectedCategory?.requires_order && !formData.order_id) {
      newErrors.order_id = 'برای این نوع تیکت، انتخاب سفارش الزامی است';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await api.createTicket({
        category_id: formData.category_id,
        subject: formData.subject,
        content: formData.content,
        order_id: formData.order_id || undefined,
        priority: formData.priority
      });

      if (response.ticket_id) {
        toast({
          title: 'موفق',
          description: 'تیکت با موفقیت ایجاد شد',
        });
        
        setOpen(false);
        setFormData({
          category_id: '',
          subject: '',
          content: '',
          order_id: '',
          priority: 'medium'
        });
        setFiles([]);
        setErrors({});
        
        onTicketCreated?.(response.ticket_id);
      }
    } catch (error: any) {
      console.error('Error creating ticket:', error);
      
      if (error.response?.data?.violations) {
        setErrors({
          subject: error.response.data.violations.subject || '',
          content: error.response.data.violations.content || ''
        });
      } else {
        toast({
          title: 'خطا',
          description: error.response?.data?.error || 'خطا در ایجاد تیکت',
          variant: 'destructive'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = categories.find(cat => cat.id === formData.category_id);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            تیکت جدید
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ایجاد تیکت جدید</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="category">دسته‌بندی *</Label>
            <Select 
              value={formData.category_id} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="دسته‌بندی را انتخاب کنید" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex flex-col">
                      <span>{category.display_name}</span>
                      {category.requires_order && (
                        <span className="text-xs text-muted-foreground">
                          نیاز به سفارش
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category_id && (
              <p className="text-sm text-destructive">{errors.category_id}</p>
            )}
          </div>

          {/* Order Selection (if required) */}
          {selectedCategory?.requires_order && (
            <div className="space-y-2">
              <Label htmlFor="order">سفارش *</Label>
              <Select 
                value={formData.order_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, order_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="سفارش را انتخاب کنید" />
                </SelectTrigger>
                <SelectContent>
                  {orders.map((order) => (
                    <SelectItem key={order.id} value={order.id}>
                      {order.order_number} - {order.total_amount.toLocaleString()} تومان
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.order_id && (
                <p className="text-sm text-destructive">{errors.order_id}</p>
              )}
            </div>
          )}

          {/* Priority Selection */}
          <div className="space-y-2">
            <Label htmlFor="priority">اولویت</Label>
            <Select 
              value={formData.priority} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">کم</SelectItem>
                <SelectItem value="medium">متوسط</SelectItem>
                <SelectItem value="high">زیاد</SelectItem>
                <SelectItem value="urgent">فوری</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">موضوع *</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="موضوع تیکت را وارد کنید"
            />
            {errors.subject && (
              <p className="text-sm text-destructive">{errors.subject}</p>
            )}
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">محتوای تیکت *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="توضیحات کامل مشکل یا سوال خود را بنویسید"
              className="min-h-[120px]"
            />
            {errors.content && (
              <p className="text-sm text-destructive">{errors.content}</p>
            )}
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label>فایل‌های ضمیمه (اختیاری)</Label>
            <div
              className={`border-2 border-dashed rounded-lg p-4 transition-colors ${
                dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
                accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.txt,.stl,.obj,.dwg,.dxf,.zip,.rar"
              />
              
              <div className="text-center">
                <Paperclip className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  فایل‌ها را اینجا بکشید یا کلیک کنید
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  انتخاب فایل
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  حداکثر 100 مگابایت - فرمت‌های مجاز: تصاویر، اسناد، فایل‌های 3D، نقشه‌ها
                </p>
              </div>
            </div>

            {/* File Preview */}
            {files.length > 0 && (
              <div className="space-y-2">
                {files.map((file, index) => (
                  <Card key={index} className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getFileIcon(file)}
                        <div>
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Warning */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              لطفاً از ارسال اطلاعات تماس شخصی (شماره تلفن، ایمیل، آدرس) در تیکت‌ها خودداری کنید.
            </AlertDescription>
          </Alert>

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              انصراف
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'در حال ایجاد...' : 'ایجاد تیکت'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTicketModal;
