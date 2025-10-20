import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Settings, Beaker, Shield, Layers, Target, Factory, Gauge, CheckCircle, Wrench, TreePine } from 'lucide-react';

interface DocumentationOption {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface DocumentationSectionProps {
  needsDocumentation: boolean;
  onNeedsDocumentationChange: (needs: boolean) => void;
  documentationOptions: Record<string, boolean>;
  onDocumentationOptionChange: (option: string, checked: boolean) => void;
  documentationNotes: string;
  onDocumentationNotesChange: (notes: string) => void;
}

const documentationOptions: DocumentationOption[] = [
  {
    id: 'function_description',
    name: 'شرح عملکرد قطعات/سامانه',
    description: 'توضیح کامل نحوه عملکرد و کاربرد قطعات',
    icon: FileText
  },
  {
    id: 'assembly_instructions',
    name: 'دستورالعمل مونتاژ قطعات/سامانه',
    description: 'راهنمای گام به گام مونتاژ و نصب',
    icon: Settings
  },
  {
    id: 'metallurgical_document',
    name: 'سند متالورژیکی قطعات',
    description: 'تحلیل و مشخصات مواد و خواص متالورژیکی',
    icon: Beaker
  },
  {
    id: 'heat_treatment_document',
    name: 'سند عملیات حرارتی قطعات',
    description: 'فرآیندهای حرارتی و عملیات گرمایی',
    icon: Factory
  },
  {
    id: 'test_analysis_report',
    name: 'گزارش آزمون آنالیز',
    description: 'نتایج آزمایشات و تحلیل‌های انجام شده',
    icon: Gauge
  },
  {
    id: 'coating_document',
    name: 'سند پوشش دهی قطعات',
    description: 'مشخصات پوشش‌ها و فرآیندهای پوشش‌دهی',
    icon: Shield
  },
  {
    id: 'bom_document',
    name: 'سند BOM (لیست قطعات و مواد)',
    description: 'فهرست کامل قطعات، مواد و مقادیر مورد نیاز',
    icon: Layers
  },
  {
    id: 'opc_document',
    name: 'سند عملیات فرآیند ساخت (OPC)',
    description: 'راهنمای عملیات و فرآیندهای ساخت',
    icon: Settings
  },
  {
    id: 'fpc_document',
    name: 'سند فرآیند جریان ساخت (FPC)',
    description: 'نمودار جریان فرآیندهای ساخت',
    icon: Target
  },
  {
    id: 'qc_checklist',
    name: 'چک لیست کنترل ابعادی (QC)',
    description: 'لیست کنترل کیفیت و اندازه‌گیری ابعاد',
    icon: CheckCircle
  },
  {
    id: 'contractor_capability',
    name: 'سند توانایی پیمانکار',
    description: 'مشخصات توانمندی‌ها و تجهیزات پیمانکار',
    icon: Wrench
  },
  {
    id: 'design_tree',
    name: 'درخت طراحی',
    description: 'ساختار سلسله‌مراتبی طراحی و وابستگی‌ها',
    icon: TreePine
  }
];

const DocumentationSection: React.FC<DocumentationSectionProps> = ({
  needsDocumentation,
  onNeedsDocumentationChange,
  documentationOptions,
  onDocumentationOptionChange,
  documentationNotes,
  onDocumentationNotesChange
}) => {
  return (
    <div className="space-y-6">
      {/* Documentation Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            مستندسازی
          </CardTitle>
          <CardDescription>
            انتخاب کنید آیا نیاز به مستندسازی دارید یا خیر
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 space-x-reverse">
            <Checkbox
              id="needs-documentation"
              checked={needsDocumentation}
              onCheckedChange={(checked) => onNeedsDocumentationChange(checked === true)}
            />
            <Label htmlFor="needs-documentation" className="text-sm font-medium">
              نیاز به مستندسازی دارم
            </Label>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            قیمت و زمان ارائه مستندات به صورت جداگانه برای شما در پلتفرم ارسال خواهد شد.
          </p>
        </CardContent>
      </Card>

      {/* Documentation Options */}
      {needsDocumentation && (
        <Card>
          <CardHeader>
            <CardTitle>گزینه‌های مستندسازی</CardTitle>
            <CardDescription>
              نوع مستندات مورد نیاز خود را انتخاب کنید (می‌توانید چند مورد انتخاب کنید)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documentationOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <div key={option.id} className="flex items-start space-x-3 space-x-reverse">
                    <Checkbox
                      id={option.id}
                      checked={documentationOptions[option.id] || false}
                      onCheckedChange={(checked) => onDocumentationOptionChange(option.id, checked === true)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label htmlFor={option.id} className="flex items-center gap-2 cursor-pointer">
                        <Icon className="h-4 w-4 text-primary" />
                        <span className="font-medium">{option.name}</span>
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        {option.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Documentation Notes */}
            <div className="mt-6">
              <Label htmlFor="documentation-notes" className="text-sm font-medium">
                توضیحات مستندسازی
              </Label>
              <Textarea
                id="documentation-notes"
                value={documentationNotes}
                onChange={(e) => onDocumentationNotesChange(e.target.value)}
                placeholder="اگر مستند بخشی از قطعات این سفارش را می‌خواهید، قطعه مورد نظر را مشخص کنید..."
                className="mt-2 text-right"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DocumentationSection;