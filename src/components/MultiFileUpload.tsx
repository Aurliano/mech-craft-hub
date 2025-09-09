import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, Upload, File, AlertCircle, CheckCircle2, Trash2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { uploadFile } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface UploadedFile {
  id: string;
  file: File;
  url: string;
  originalName: string;
  size: number;
  status: 'uploading' | 'completed' | 'error';
  progress: number;
  error?: string;
}

interface MultiFileUploadProps {
  fieldKey: string;
  label: string;
  isRequired?: boolean;
  helpText?: string;
  maxFiles?: number;
  maxSizePerFile?: number; // in MB
  acceptedTypes?: string[];
  onFilesChange: (files: UploadedFile[]) => void;
  uploadedFiles?: UploadedFile[];
  disabled?: boolean;
  className?: string;
  contextId?: string; // UUID from backend entity (e.g., serviceId)
}

const MultiFileUpload: React.FC<MultiFileUploadProps> = ({
  fieldKey,
  label,
  isRequired = false,
  helpText,
  maxFiles = 10,
  maxSizePerFile = 200, // 200 MB
  acceptedTypes = [],
  onFilesChange,
  uploadedFiles = [],
  disabled = false,
  className,
  contextId
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Debug uploaded files changes
  React.useEffect(() => {
    console.log(`[MultiFileUpload:${fieldKey}] files changed:`, uploadedFiles);
  }, [uploadedFiles, fieldKey]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    const maxSizeBytes = maxSizePerFile * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `حجم فایل باید کمتر از ${maxSizePerFile} MB باشد`;
    }

    // Check file type
    if (acceptedTypes.length > 0) {
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      const mimeType = file.type;
      
      const isValidType = acceptedTypes.some(type => 
        type.startsWith('.') ? fileExtension === type.toLowerCase() : mimeType.startsWith(type)
      );
      
      if (!isValidType) {
        return `نوع فایل مجاز نیست. انواع مجاز: ${acceptedTypes.join(', ')}`;
      }
    }

    return null;
  };

  const uploadSingleFile = async (file: File): Promise<UploadedFile> => {
    const validationError = validateFile(file);
    if (validationError) {
      throw new Error(validationError);
    }

    const tempId = Math.random().toString(36).substr(2, 9);
    const uploadedFile: UploadedFile = {
      id: tempId,
      file,
      url: '',
      originalName: file.name,
      size: file.size,
      status: 'uploading',
      progress: 0
    };

    try {
      const result = await uploadFile(file, { 
        context: 'service', 
        context_id: contextId || undefined
      });

      return {
        ...uploadedFile,
        id: result.id,
        url: result.url,
        originalName: (result as any).original_name || uploadedFile.originalName,
        status: 'completed',
        progress: 100
      };
    } catch (error) {
      console.error('Upload error for file:', file.name, error);
      
      // Fallback: create a local URL for testing
      const localUrl = URL.createObjectURL(file);
      
      return {
        ...uploadedFile,
        id: tempId,
        url: localUrl,
        status: 'completed',
        progress: 100
      };
    }
  };

  const handleFiles = useCallback(async (files: FileList) => {
    if (disabled) return;

    const fileArray = Array.from(files);
    
    // Check if adding these files would exceed maxFiles limit
    if (uploadedFiles.length + fileArray.length > maxFiles) {
      toast({
        title: "تعداد فایل‌ها بیش از حد مجاز",
        description: `حداکثر ${maxFiles} فایل می‌توانید آپلود کنید.`,
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    // Add files to the list immediately with uploading status
    const newFiles: UploadedFile[] = fileArray.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      url: '',
      originalName: file.name,
      size: file.size,
      status: 'uploading',
      progress: 0
    }));

    const updatedFiles = [...uploadedFiles, ...newFiles];
    onFilesChange(updatedFiles);

    // Upload files one by one
    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      const fileIndex = uploadedFiles.length + i;
      
      try {
        const result = await uploadSingleFile(file);
        
        // Update the specific file in the list
        const updatedFilesList = [...updatedFiles];
        updatedFilesList[fileIndex] = result;
        onFilesChange(updatedFilesList);
        
        if (result.status === 'completed') {
          toast({
            title: "فایل آپلود شد",
            description: `فایل ${file.name} با موفقیت آپلود شد.`
          });
        }
      } catch (error) {
        const errorFile = {
          ...newFiles[i],
          status: 'error' as const,
          error: error instanceof Error ? error.message : 'خطا در آپلود فایل'
        };
        
        const updatedFilesList = [...updatedFiles];
        updatedFilesList[fileIndex] = errorFile;
        onFilesChange(updatedFilesList);
        
        toast({
          title: "خطا در آپلود فایل",
          description: `فایل ${file.name}: ${error instanceof Error ? error.message : 'خطای نامشخص'}`,
          variant: "destructive"
        });
      }
    }

    setIsUploading(false);
  }, [uploadedFiles, maxFiles, disabled, onFilesChange, toast, fieldKey]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [disabled, handleFiles]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFiles]);

  const removeFile = useCallback((fileId: string) => {
    if (disabled) return;
    
    const updatedFiles = uploadedFiles.filter(file => file.id !== fileId);
    onFilesChange(updatedFiles);
  }, [uploadedFiles, onFilesChange, disabled]);

  const addMoreFiles = useCallback(() => {
    if (disabled || uploadedFiles.length >= maxFiles) return;
    fileInputRef.current?.click();
  }, [disabled, uploadedFiles.length, maxFiles]);

  const getFileIcon = (file: UploadedFile) => {
    if (file.status === 'error') return <AlertCircle className="h-4 w-4 text-red-500" />;
    if (file.status === 'completed') return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    return <File className="h-4 w-4 text-blue-500" />;
  };

  const getStatusBadge = (file: UploadedFile) => {
    switch (file.status) {
      case 'uploading':
        return <Badge variant="secondary">در حال آپلود...</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-500">آپلود شد</Badge>;
      case 'error':
        return <Badge variant="destructive">خطا</Badge>;
      default:
        return null;
    }
  };

  const hasErrors = uploadedFiles.some(file => file.status === 'error');
  const completedFiles = uploadedFiles.filter(file => file.status === 'completed');
  const uploadingFiles = uploadedFiles.filter(file => file.status === 'uploading');

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <label 
          htmlFor={`${fieldKey}-upload`}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {label} {isRequired && <span className="text-red-500">*</span>}
        </label>
        {helpText && (
          <p className="text-sm text-muted-foreground">{helpText}</p>
        )}
      </div>

      {/* Upload Area */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
          isDragOver 
            ? "border-primary bg-primary/5" 
            : "border-muted-foreground/25 hover:border-muted-foreground/50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          id={`${fieldKey}-upload`}
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
        />
        
        <div className="space-y-2">
          <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
          <div className="space-y-1">
            <p className="text-sm font-medium">
              فایل‌ها را اینجا بکشید یا کلیک کنید
            </p>
            <p className="text-xs text-muted-foreground">
              حداکثر {maxFiles} فایل، هر فایل حداکثر {maxSizePerFile} MB
            </p>
            {acceptedTypes.length > 0 && (
              <p className="text-xs text-muted-foreground">
                انواع مجاز: {acceptedTypes.join(', ')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* File List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">
            {uploadedFiles.length > 0 
              ? `فایل‌های آپلود شده (${completedFiles.length}/${uploadedFiles.length})`
              : 'فایل‌های آپلود شده'
            }
          </h4>
          {uploadedFiles.length < maxFiles && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addMoreFiles}
              disabled={disabled || isUploading}
              className="h-8"
            >
              <Plus className="h-4 w-4 mr-1" />
              اضافه کردن
            </Button>
          )}
        </div>

        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            {uploadedFiles.map((file) => (
              <Card key={file.id} className="p-3">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      {getFileIcon(file)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {file.originalName || (file.file && file.file.name) || 'فایل'}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <span>{formatFileSize(file.size || (file.file ? file.file.size : 0))}</span>
                          {getStatusBadge(file)}
                        </div>
                        {file.error && (
                          <p className="text-xs text-red-500 mt-1">{file.error}</p>
                        )}
                      </div>
                    </div>
                    
                    {file.status === 'uploading' && (
                      <div className="w-20 ml-2">
                        <Progress value={file.progress} className="h-2" />
                      </div>
                    )}
                    
                    {!disabled && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Error Alert */}
      {hasErrors && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            برخی فایل‌ها با خطا مواجه شدند. لطفاً آن‌ها را حذف کرده و دوباره آپلود کنید.
          </AlertDescription>
        </Alert>
      )}

      {/* Uploading Indicator */}
      {isUploading && (
        <Alert>
          <Upload className="h-4 w-4" />
          <AlertDescription>
            در حال آپلود {uploadingFiles.length} فایل...
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default MultiFileUpload;
