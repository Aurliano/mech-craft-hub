import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ExternalLink, FileText } from 'lucide-react';

interface TermsAndConditionsProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  error?: string;
  className?: string;
  termsContent?: string;
  termsUrl?: string;
  openInNewTab?: boolean;
}

const TermsAndConditions: React.FC<TermsAndConditionsProps> = ({
  checked,
  onCheckedChange,
  error,
  className = "",
  termsContent,
  termsUrl,
  openInNewTab = true
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleTermsClick = () => {
    if (termsUrl) {
      if (openInNewTab) {
        window.open(termsUrl, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = termsUrl;
      }
    } else {
      setIsModalOpen(true);
    }
  };

  const defaultTermsContent = `
قوانین و شرایط استفاده از سرویس

1. تعریف خدمات
این سرویس شامل ارائه خدمات مهندسی مکانیک شامل طراحی، تحلیل، نقشه‌کشی و ساخت و تولید می‌باشد.

2. تعهدات کاربر
- کاربر متعهد است اطلاعات صحیح و کامل ارائه دهد
- کاربر مسئولیت محتوای فایل‌های آپلود شده را بر عهده دارد
- کاربر حق استفاده غیرقانونی از خدمات را ندارد

3. تعهدات سرویس‌دهنده
- ارائه خدمات با کیفیت مناسب
- حفظ محرمانگی اطلاعات کاربر
- تحویل به موقع پروژه‌ها

4. مسئولیت‌ها
- سرویس‌دهنده مسئولیت خسارات ناشی از استفاده نادرست از خدمات را ندارد
- کاربر مسئولیت رعایت قوانین مالکیت فکری را دارد

5. پرداخت و فاکتور
- پرداخت مطابق با قیمت‌های اعلام شده انجام می‌شود
- فاکتور رسمی صادر خواهد شد
- امکان بازگشت وجه طبق شرایط خاص وجود دارد

6. محرمانگی
- تمام اطلاعات کاربر محرمانه تلقی می‌شود
- اطلاعات فقط برای ارائه خدمات استفاده می‌شود
- اطلاعات به اشخاص ثالث منتقل نخواهد شد

7. تغییرات
- این قوانین قابل تغییر است
- تغییرات از طریق سایت اطلاع‌رسانی می‌شود
- ادامه استفاده به معنای پذیرش تغییرات است

8. حل اختلاف
- اختلافات از طریق مذاکره حل می‌شود
- در صورت عدم توافق، مراجع قضایی صالح رسیدگی خواهند کرد

9. تماس
- برای سوالات: info@saydatech.ir
- تلفن: 09373497128

تاریخ آخرین بروزرسانی: ${new Date().toLocaleDateString('fa-IR')}
  `;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-start space-x-2 space-x-reverse">
        <Checkbox
          id="terms-and-conditions"
          checked={checked}
          onCheckedChange={onCheckedChange}
          className="mt-1"
        />
        <div className="flex-1">
          <Label 
            htmlFor="terms-and-conditions" 
            className="text-sm leading-relaxed cursor-pointer"
          >
            با{' '}
            <Button
              type="button"
              variant="link"
              className="p-0 h-auto text-primary underline font-medium"
              onClick={handleTermsClick}
            >
              قوانین و شرایط
              {termsUrl ? (
                <ExternalLink className="h-3 w-3 mr-1" />
              ) : (
                <FileText className="h-3 w-3 mr-1" />
              )}
            </Button>
            {' '}موافقم
          </Label>
        </div>
      </div>
      
      {error && (
        <p className="text-sm text-destructive mt-1">{error}</p>
      )}

      {/* Modal for terms content */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              قوانین و شرایط استفاده
            </DialogTitle>
            <DialogDescription>
              لطفاً قوانین و شرایط را به دقت مطالعه کنید
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh] w-full pr-4">
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {termsContent || defaultTermsContent}
            </div>
          </ScrollArea>
          <div className="flex justify-end gap-2 mt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsModalOpen(false)}
            >
              بستن
            </Button>
            <Button 
              onClick={() => {
                onCheckedChange(true);
                setIsModalOpen(false);
              }}
            >
              موافقم
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TermsAndConditions;
