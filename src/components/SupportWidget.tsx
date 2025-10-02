import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface SupportWidgetProps {
  className?: string;
}

export default function SupportWidget({ className = '' }: SupportWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const { isAuthenticated, user } = useAuth();

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        type: 'ai',
        content: 'سلام! من پشتیبان هوش مصنوعی پلتفرم سایدا هستم. چطور می‌تونم کمکتون کنم؟',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]);

  // Show login prompt for unauthenticated users
  useEffect(() => {
    if (isOpen && !isAuthenticated && messages.length === 1) {
      const loginPrompt: Message = {
        id: 'login-prompt',
        type: 'ai',
        content: 'برای استفاده از خدمات پشتیبانی، لطفاً وارد شوید یا ثبت نام کنید.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, loginPrompt]);
    }
  }, [isOpen, isAuthenticated, messages.length]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const data = await api.askAISupport(userMessage.content);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: data.response || 'متأسفانه خطایی رخ داده است.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'متأسفانه خطایی در ارتباط با سرور رخ داده است. لطفاً دوباره تلاش کنید.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleWidget = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
      setShowFeedbackForm(false);
    }
  };

  const showFeedback = () => {
    setShowFeedbackForm(true);
    setIsMinimized(false);
  };

  if (!isOpen) {
    return (
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <Button
          onClick={toggleWidget}
          size="lg"
          className="h-16 w-16 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <MessageCircle className="h-7 w-7" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      <Card className="w-96 max-h-[calc(100vh-3rem)] shadow-2xl border-0 bg-white">
        <CardHeader className="pb-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <CardTitle className="text-sm font-semibold">پشتیبان سایدا</CardTitle>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={showFeedback}
                className="text-white hover:bg-blue-800 h-8 px-2"
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-blue-800 h-8 px-2"
              >
                {isMinimized ? '↑' : '↓'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleWidget}
                className="text-white hover:bg-blue-800 h-8 px-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col" style={{ height: 'calc(100% - 60px)' }}>
            {showFeedbackForm ? (
              <FeedbackForm 
                onClose={() => setShowFeedbackForm(false)}
                isAuthenticated={isAuthenticated}
                user={user}
              />
            ) : (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-3 py-2 ${
                          message.type === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {message.type === 'ai' && <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                          {message.type === 'user' && <User className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                          <div className="text-sm">{message.content}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg px-3 py-2 flex items-center gap-2">
                        <Bot className="h-4 w-4" />
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-gray-600">در حال پاسخ...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="p-3 border-t bg-gray-50">
                  {!isAuthenticated ? (
                    <div className="space-y-3">
                      <div className="text-center text-sm text-gray-600">
                        برای استفاده از چت پشتیبانی، لطفاً وارد شوید
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => window.location.href = '/login'}
                          className="flex-1"
                          size="sm"
                        >
                          ورود
                        </Button>
                        <Button
                          onClick={() => window.location.href = '/register'}
                          variant="outline"
                          className="flex-1"
                          size="sm"
                        >
                          ثبت نام
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="پیام خود را بنویسید..."
                        disabled={isLoading}
                        className="flex-1"
                      />
                      <Button
                        onClick={sendMessage}
                        disabled={!inputMessage.trim() || isLoading}
                        size="sm"
                        className="px-3"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}

// Feedback Form Component
interface FeedbackFormProps {
  onClose: () => void;
  isAuthenticated: boolean;
  user: { username: string; email: string } | null;
}

function FeedbackForm({ onClose, isAuthenticated, user }: FeedbackFormProps) {
  const [formData, setFormData] = useState({
    used_services: null as boolean | null,
    satisfaction_rating: null as number | null,
    personal_feedback: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = await api.createSupportFeedback(formData);
      setSubmitStatus('success');
      
      // Show AI response if available
      if (data.ai_response) {
        // You could show this in a modal or toast
        console.log('AI Response:', data.ai_response);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitStatus === 'success') {
    return (
      <div className="p-4 h-full flex flex-col justify-center">
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">
            بازخورد شما با موفقیت ثبت شد. از مشارکت شما متشکریم!
          </AlertDescription>
        </Alert>
        <Button onClick={onClose} className="mt-4" variant="outline">
          بستن
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col" style={{ height: 'calc(100vh - 200px)', maxHeight: '400px' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">فرم بازخورد</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {!isAuthenticated && (
        <Alert className="mb-4 border-yellow-200 bg-yellow-50">
          <AlertDescription className="text-yellow-800">
            برای ثبت بازخورد با اطلاعات حساب کاربری، لطفاً وارد شوید.
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto flex-1">
        {/* Service Usage Question */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            آیا از خدمات و محتوای سایت استفاده کردید؟
          </label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={formData.used_services === true ? "default" : "outline"}
              size="sm"
              onClick={() => setFormData(prev => ({ ...prev, used_services: true }))}
            >
              بله
            </Button>
            <Button
              type="button"
              variant={formData.used_services === false ? "default" : "outline"}
              size="sm"
              onClick={() => setFormData(prev => ({ ...prev, used_services: false }))}
            >
              خیر
            </Button>
          </div>
        </div>

        {/* Satisfaction Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            تا چه میزان از کیفیت سایت رضایت دارید؟
          </label>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4, 5].map((rating) => (
              <Button
                key={rating}
                type="button"
                variant={formData.satisfaction_rating === rating ? "default" : "outline"}
                size="sm"
                onClick={() => setFormData(prev => ({ ...prev, satisfaction_rating: rating }))}
                className="w-10 h-10"
              >
                {rating}
              </Button>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>خیلی ضعیف</span>
            <span>عالی</span>
          </div>
        </div>

        {/* Personal Feedback */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            نظر شخصی شما راجع به رابط کاربری و محتوای سایت چیست؟
          </label>
          <Textarea
            value={formData.personal_feedback}
            onChange={(e) => setFormData(prev => ({ ...prev, personal_feedback: e.target.value }))}
            placeholder="نظر خود را بنویسید..."
            rows={3}
          />
        </div>

        {submitStatus === 'error' && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              خطا در ارسال بازخورد. لطفاً دوباره تلاش کنید.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2 mt-4 pt-4 border-t">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                در حال ارسال...
              </>
            ) : (
              'ارسال بازخورد'
            )}
          </Button>
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            className="px-4"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
