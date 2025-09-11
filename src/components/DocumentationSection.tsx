import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { FileText } from 'lucide-react';

interface DocumentationSectionProps {
  documentationOptions: Record<string, boolean>;
  setDocumentationOptions: (updater: (prev: Record<string, boolean>) => Record<string, boolean>) => void;
  serviceSupportsDocumentation?: boolean;
}

const DocumentationSection: React.FC<DocumentationSectionProps> = ({
  documentationOptions,
  setDocumentationOptions,
  serviceSupportsDocumentation = true
}) => {
  // Check if any documentation option is selected
  const hasAnyDocumentationSelected = () => {
    return Object.values(documentationOptions).some(value => value === true);
  };

  // Don't render if service doesn't support documentation
  if (!serviceSupportsDocumentation) {
    return null;
  }

  // Don't render if no documentation options are selected
  if (!hasAnyDocumentationSelected()) {
    return null;
  }

  const documentationOptionsList = [
    { key: 'performanceReport', label: 'گزارش شرح عملکرد قطعات/سامانه' },
    { key: 'assemblyInstructions', label: 'دستورالعمل مونتاژ' },
    { key: 'metallurgicalDocument', label: 'مستندات متالورژیکی' },
    { key: 'heatTreatmentDocument', label: 'مستندات عملیات حرارتی' },
    { key: 'analysisTestReport', label: 'گزارش تست و تحلیل' },
    { key: 'coatingDocument', label: 'مستندات پوشش‌دهی' },
    { key: 'bomDocument', label: 'مستندات BOM (فهرست قطعات)' },
    { key: 'opcDocument', label: 'مستندات OPC (کنترل فرآیند عملیاتی)' },
    { key: 'fpcDocument', label: 'مستندات FPC (کنترل فرآیند نهایی)' },
    { key: 'qcChecklist', label: 'چک‌لیست کنترل کیفیت' },
    { key: 'contractorCapabilityDocument', label: 'مستندات قابلیت‌های پیمانکار' },
    { key: 'designTree', label: 'درخت طراحی' },
    { key: 'allPartsDocumentation', label: 'مستندسازی تمام قطعات' },
  ];

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          گزینه‌های مستندسازی
        </CardTitle>
        <CardDescription>
          نوع مستندات مورد نیاز خود را انتخاب کنید
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documentationOptionsList.map((option) => (
              <div key={option.key} className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id={option.key}
                  checked={documentationOptions[option.key] || false}
                  onCheckedChange={(checked) => setDocumentationOptions(prev => ({ 
                    ...prev, 
                    [option.key]: checked as boolean 
                  }))}
                />
                <Label htmlFor={option.key} className="text-sm">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentationSection;
