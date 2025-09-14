import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { FileText } from 'lucide-react';

interface DocumentationSectionProps {
  needsDocumentation: boolean;
  onNeedsDocumentationChange: (checked: boolean) => void;
  documentationOptions: Record<string, boolean>;
  onDocumentationOptionChange: (option: string, checked: boolean) => void;
  serviceSupportsDocumentation?: boolean;
}

const DocumentationSection: React.FC<DocumentationSectionProps> = ({
  needsDocumentation,
  onNeedsDocumentationChange,
  documentationOptions,
  onDocumentationOptionChange,
  serviceSupportsDocumentation = true
}) => {
  if (!serviceSupportsDocumentation) {
    return null;
  }

  const documentationOptionsList = [
    { key: 'technical_drawing', label: 'نقشه فنی' },
    { key: 'assembly_guide', label: 'راهنمای مونتاژ' },
    { key: 'user_manual', label: 'راهنمای کاربری' },
    { key: 'maintenance_guide', label: 'راهنمای نگهداری' },
    { key: 'quality_certificate', label: 'گواهی کیفیت' },
    { key: 'test_report', label: 'گزارش تست' }
  ];

  const hasAnyDocumentationSelected = () => {
    const options = documentationOptions || {};
    return Object.values(options).some(value => value === true);
  };

  return (
    <>
      {/* Documentation Checkbox */}
      <div className="flex items-center space-x-2 space-x-reverse pt-4 border-t">
        <Checkbox
          id="needs_documentation"
          checked={needsDocumentation}
          onCheckedChange={onNeedsDocumentationChange}
        />
        <Label htmlFor="needs_documentation" className="text-sm">
          نیاز به مستندسازی فنی
        </Label>
      </div>

      {/* Documentation Options */}
      {needsDocumentation && (
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
                      checked={documentationOptions?.[option.key] || false}
                      onCheckedChange={(checked) => 
                        onDocumentationOptionChange(option.key, checked as boolean)
                      }
                    />
                    <Label htmlFor={option.key} className="text-sm">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
              
              {hasAnyDocumentationSelected() && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>توجه:</strong> مستندات انتخاب شده به صورت جداگانه قیمت‌گذاری خواهند شد.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default DocumentationSection;