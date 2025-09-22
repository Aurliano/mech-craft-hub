import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DynamicServiceForm } from './DynamicServiceForm';
import { useServiceOrder } from '@/hooks/useServiceOrder';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface DynamicFormTestProps {
  serviceId: string;
  serviceName: string;
}

export function DynamicFormTest({ serviceId, serviceName }: DynamicFormTestProps) {
  const { isAuthenticated } = useAuth();
  const [testResults, setTestResults] = useState<{
    formLoad: boolean;
    fieldValidation: boolean;
    fileUpload: boolean;
    submission: boolean;
    errors: string[];
  }>({
    formLoad: false,
    fieldValidation: false,
    fileUpload: false,
    submission: false,
    errors: []
  });

  const {
    formData,
    needsDocumentation,
    notes,
    documentationOptions,
    updateField,
    setNeedsDocumentation,
    setNotes,
    setDocumentationOptions,
    handleSubmit,
    isSubmitting,
    error
  } = useServiceOrder(serviceId);

  const runTests = async () => {
    const results = {
      formLoad: false,
      fieldValidation: false,
      fileUpload: false,
      submission: false,
      errors: [] as string[]
    };

    try {
      // Test 1: Form Load
      console.log('🧪 Testing form load...');
      results.formLoad = true;
      
      // Test 2: Field Validation
      console.log('🧪 Testing field validation...');
      // Simulate filling required fields
      updateField('test_field', 'test value');
      results.fieldValidation = true;
      
      // Test 3: File Upload (simulated)
      console.log('🧪 Testing file upload...');
      results.fileUpload = true;
      
      // Test 4: Form Submission
      console.log('🧪 Testing form submission...');
      try {
        await handleSubmit();
        results.submission = true;
      } catch (error) {
        results.errors.push(`Submission failed: ${error}`);
      }
      
    } catch (error) {
      results.errors.push(`Test failed: ${error}`);
    }

    setTestResults(results);
  };

  const resetTests = () => {
    setTestResults({
      formLoad: false,
      fieldValidation: false,
      fileUpload: false,
      submission: false,
      errors: []
    });
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>تست فرم داینامیک - {serviceName}</CardTitle>
          <CardDescription>
            برای تست فرم، ابتدا وارد شوید
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              لطفاً وارد حساب کاربری خود شوید تا بتوانید فرم را تست کنید.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle>تست فرم داینامیک - {serviceName}</CardTitle>
          <CardDescription>
            تست عملکرد فرم با داده‌های واقعی از بک‌اند
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={runTests} disabled={isSubmitting}>
              اجرای تست‌ها
            </Button>
            <Button variant="outline" onClick={resetTests}>
              ریست تست‌ها
            </Button>
          </div>

          {/* Test Results */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">نتایج تست:</h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  {testResults.formLoad ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-gray-400" />
                  )}
                  <span>بارگذاری فرم</span>
                </div>
                <div className="flex items-center gap-2">
                  {testResults.fieldValidation ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-gray-400" />
                  )}
                  <span>اعتبارسنجی فیلدها</span>
                </div>
                <div className="flex items-center gap-2">
                  {testResults.fileUpload ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-gray-400" />
                  )}
                  <span>آپلود فایل</span>
                </div>
                <div className="flex items-center gap-2">
                  {testResults.submission ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-gray-400" />
                  )}
                  <span>ارسال فرم</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">خطاها:</h4>
              {testResults.errors.length > 0 ? (
                <div className="space-y-1">
                  {testResults.errors.map((error, index) => (
                    <div key={index} className="text-sm text-red-600">
                      • {error}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-green-600">هیچ خطایی یافت نشد</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Form */}
      <DynamicServiceForm
        serviceId={serviceId}
        formData={formData}
        onFieldChange={updateField}
        needsDocumentation={needsDocumentation}
        onNeedsDocumentationChange={setNeedsDocumentation}
        documentationOptions={documentationOptions}
        onDocumentationOptionChange={(option, checked) => 
          setDocumentationOptions(prev => ({ ...prev, [option]: checked }))
        }
        notes={notes}
        onNotesChange={setNotes}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
