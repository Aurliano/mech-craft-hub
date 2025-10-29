import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Edit, Trash2, MapPin, Calendar, Building2, Settings, X, Upload, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useContractorWorkshops, useCreateContractorWorkshop, useCheckContractorManufacturingService } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import CapabilityMachineSelector from '@/components/CapabilityMachineSelector';
import { SelectedMachine } from '@/data/capabilitiesAndMachines';
import MultiFileUpload from '@/components/MultiFileUpload';

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

const MyWorkshops = () => {
  const { user, isContractor } = useAuth();
  const { data: workshops, isLoading, refetch } = useContractorWorkshops();
  type Workshop = {
    id: string | number;
    code?: string;
    name: string;
    is_active?: boolean;
    address?: string;
    description?: string;
    province?: string;
    city?: string;
    postal_address?: string;
    manager_name?: string;
    manager_phone?: string;
    capabilities?: string[];
    machines?: { name: string; precision: string; quantity?: number }[];
    created_at?: string;
  };
  const normalizedWorkshops: Workshop[] = Array.isArray(workshops) ? (workshops as unknown as Workshop[]) : [];
  const createWorkshopMutation = useCreateContractorWorkshop();
  const { data: manufacturingCheck, isLoading: isLoadingManufacturingCheck } = useCheckContractorManufacturingService();
  const { toast } = useToast();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newWorkshop, setNewWorkshop] = useState({
    name: '',
    address: '',
    description: '',
    province: '',
    city: '',
    postal_address: '',
    manager_name: '',
    manager_phone: '',
    workers_count: '',
    capabilities: [] as string[],
    machines: [] as SelectedMachine[]
  });
  
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([]);
  
  // State for uploaded documents
  const [uploadedDocuments, setUploadedDocuments] = useState<Record<string, UploadedFile[]>>({});

  // Manufacturing capabilities list (using IDs from capabilities data)
  const manufacturingCapabilities = [
    { id: 'turning_milling', name: 'تراشکاری و فرزکاری' },
    { id: 'drilling_tapping', name: 'سوراخکاری و قلاویز زنی' },
    { id: 'grinding', name: 'سنگ زنی' },
    { id: 'cutting', name: 'برش کاری' },
    { id: 'sheet_metal', name: 'شیت متال' },
    { id: 'gear_cutting', name: 'دنده زنی' },
    { id: 'welding', name: 'جوشکاری' },
    { id: 'edm', name: 'اسپارگ' },
    { id: 'tool_grinding', name: 'ابزار سازی' },
    { id: 'coating', name: 'پوشش دهی' },
    { id: 'molding', name: 'قالب سازی' },
    { id: 'heat_treatment', name: 'عملیات حرارتی' }
  ];

  // Iranian provinces
  const provinces = [
    'تهران', 'اصفهان', 'فارس', 'خراسان رضوی', 'آذربایجان شرقی', 'مازندران',
    'گیلان', 'کرمان', 'خوزستان', 'سیستان و بلوچستان', 'کردستان', 'لرستان',
    'همدان', 'یزد', 'کرمانشاه', 'چهارمحال و بختیاری', 'قزوین', 'زنجان',
    'اردبیل', 'آذربایجان غربی', 'کهگیلویه و بویراحمد', 'ایلام', 'بوشهر',
    'هرمزگان', 'سمنان', 'قم', 'گلستان', 'البرز', 'خراسان شمالی', 'خراسان جنوبی'
  ];

  // Redirect if not contractor
  if (!isContractor) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">دسترسی غیرمجاز</h1>
            <p className="text-gray-600">شما دسترسی لازم برای مشاهده این صفحه را ندارید.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleCreateWorkshop = async () => {
    if (!newWorkshop.name.trim() || !newWorkshop.address.trim() || !newWorkshop.province || 
        !newWorkshop.city || !newWorkshop.postal_address.trim() || !newWorkshop.manager_name.trim() || 
        !newWorkshop.manager_phone.trim() || selectedCapabilities.length === 0) {
      toast({
        title: "خطا",
        description: "لطفاً تمام فیلدهای اجباری را پر کنید.",
        variant: "destructive",
      });
      return;
    }

    // Validate machines
    const invalidMachines = newWorkshop.machines.filter(machine => 
      !machine.description.trim() || machine.quantity < 1
    );
    
    if (invalidMachines.length > 0) {
      toast({
        title: "خطا",
        description: "لطفاً توضیحات و تعداد تمام دستگاه‌ها را وارد کنید.",
        variant: "destructive",
      });
      return;
    }

    // Validate document upload limits (100MB total per section)
    const maxTotalSizeBytes = 100 * 1024 * 1024; // 100MB
    let hasExceededLimit = false;
    Object.entries(uploadedDocuments).forEach(([fieldKey, files]) => {
      const totalSize = files
        .filter(file => file.status === 'completed')
        .reduce((sum, file) => sum + (file.size || 0), 0);
      if (totalSize > maxTotalSizeBytes) {
        hasExceededLimit = true;
      }
    });
    
    if (hasExceededLimit) {
      toast({
        title: "خطا",
        description: "حجم مجموع فایل‌های هر بخش نباید از 100 مگابایت بیشتر باشد.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Convert SelectedMachine to the format expected by backend
      const machinesForBackend = newWorkshop.machines.map(machine => ({
        name: machine.isCustom ? machine.customName : machine.machineType.name,
        precision: machine.description,
        quantity: machine.quantity,
        capability_id: machine.capabilityId,
        is_custom: machine.isCustom || false
      }));

      // Collect uploaded documents
      const documentsData: Record<string, string[]> = {};
      Object.entries(uploadedDocuments).forEach(([fieldKey, files]) => {
        documentsData[fieldKey] = files
          .filter(file => file.status === 'completed')
          .map(file => file.url);
      });

      const workshopData = {
        ...newWorkshop,
        capabilities: selectedCapabilities,
        machines: machinesForBackend,
        documents: documentsData,
        workers_count: newWorkshop.workers_count ? parseInt(newWorkshop.workers_count) : undefined
      };

      await createWorkshopMutation.mutateAsync(workshopData);
      toast({
        title: "موفق",
        description: "کارگاه با موفقیت ثبت شد و در انتظار تایید مدیر است. پس از تایید، کارگاه شما در صفحه ساخت و تولید نمایش داده خواهد شد.",
      });
      setNewWorkshop({ 
        name: '', address: '', description: '', province: '', city: '', 
        postal_address: '', manager_name: '', manager_phone: '', 
        workers_count: '', capabilities: [], machines: [] 
      });
      setSelectedCapabilities([]);
      setUploadedDocuments({});
      setIsCreateDialogOpen(false);
      refetch();
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطا در ثبت کارگاه. لطفاً دوباره تلاش کنید.",
        variant: "destructive",
      });
    }
  };

  const handleCapabilityChange = (capabilityId: string, checked: boolean) => {
    if (checked) {
      setSelectedCapabilities(prev => [...prev, capabilityId]);
    } else {
      setSelectedCapabilities(prev => prev.filter(c => c !== capabilityId));
      // Remove machines from unchecked capability
      setNewWorkshop(prev => ({
        ...prev,
        machines: prev.machines.filter(m => m.capabilityId !== capabilityId)
      }));
    }
  };

  const handleMachinesChange = (machines: SelectedMachine[]) => {
    setNewWorkshop(prev => ({
      ...prev,
      machines
    }));
  };

  const handleDocumentsChange = (fieldKey: string, files: UploadedFile[]) => {
    setUploadedDocuments(prev => ({
      ...prev,
      [fieldKey]: files
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">در حال بارگذاری...</h1>
            <p className="text-gray-600">در حال دریافت اطلاعات کارگاه‌ها</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">کارگاه‌های من</h1>
          <p className="text-gray-600">مدیریت کارگاه‌ها و قابلیت‌های تولیدی شما</p>
        </div>

        {/* Create Workshop Button */}
        <div className="mb-6">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                ثبت کارگاه جدید
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>ثبت کارگاه جدید</DialogTitle>
                <DialogDescription>
                  اطلاعات کامل کارگاه خود را وارد کنید
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">اطلاعات پایه</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">نام کارگاه *</Label>
                      <Input
                        id="name"
                        value={newWorkshop.name}
                        onChange={(e) => setNewWorkshop({ ...newWorkshop, name: e.target.value })}
                        placeholder="نام کارگاه خود را وارد کنید"
                      />
                    </div>
                    <div>
                      <Label htmlFor="manager_name">نام مسئول کارگاه *</Label>
                      <Input
                        id="manager_name"
                        value={newWorkshop.manager_name}
                        onChange={(e) => setNewWorkshop({ ...newWorkshop, manager_name: e.target.value })}
                        placeholder="نام مسئول کارگاه"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="manager_phone">شماره تماس مسئول *</Label>
                    <Input
                      id="manager_phone"
                      value={newWorkshop.manager_phone}
                      onChange={(e) => setNewWorkshop({ ...newWorkshop, manager_phone: e.target.value })}
                      placeholder="شماره تماس مسئول کارگاه"
                    />
                  </div>
                </div>

                {/* Address Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">اطلاعات آدرس</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="province">استان *</Label>
                      <Select value={newWorkshop.province} onValueChange={(value) => setNewWorkshop({ ...newWorkshop, province: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="استان را انتخاب کنید" />
                        </SelectTrigger>
                        <SelectContent>
                          {provinces.map((province) => (
                            <SelectItem key={province} value={province}>
                              {province}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="city">شهر *</Label>
                      <Input
                        id="city"
                        value={newWorkshop.city}
                        onChange={(e) => setNewWorkshop({ ...newWorkshop, city: e.target.value })}
                        placeholder="نام شهر"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="postal_address">آدرس پستی *</Label>
                    <Textarea
                      id="postal_address"
                      value={newWorkshop.postal_address}
                      onChange={(e) => setNewWorkshop({ ...newWorkshop, postal_address: e.target.value })}
                      placeholder="آدرس پستی کامل"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="workers_count">تعداد پرسنل</Label>
                    <Input
                      id="workers_count"
                      type="number"
                      min="0"
                      value={newWorkshop.workers_count}
                      onChange={(e) => setNewWorkshop({ ...newWorkshop, workers_count: e.target.value })}
                      placeholder="تعداد پرسنل رسمی"
                    />
                  </div>
                </div>

                {/* Capabilities and Machines */}
                <CapabilityMachineSelector
                  selectedCapabilities={selectedCapabilities}
                  onCapabilityChange={handleCapabilityChange}
                  selectedMachines={newWorkshop.machines}
                  onMachinesChange={handleMachinesChange}
                />

                {/* Description */}
                <div>
                  <Label htmlFor="description">توضیحات اضافی</Label>
                  <Textarea
                    id="description"
                    value={newWorkshop.description}
                    onChange={(e) => setNewWorkshop({ ...newWorkshop, description: e.target.value })}
                    placeholder="توضیحات اضافی درباره کارگاه"
                    rows={3}
                  />
                </div>

                {/* Document Upload Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    بارگذاری مدارک مربوطه
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    مجوزها، گواهی‌ها و مدارک مربوط به کارگاه و دستگاه‌ها را آپلود کنید
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Workshop License */}
                    <div>
                      <MultiFileUpload
                        fieldKey="workshop_license"
                        label="مجوز کارگاه"
                        isRequired={false}
                        helpText="مجوز فعالیت کارگاه از سازمان‌های مربوطه (حداکثر 100MB مجموع)"
                        maxFiles={999}
                        maxSizePerFile={100}
                        maxTotalSize={100}
                        acceptedTypes={['.pdf', '.jpg', '.jpeg', '.png']}
                        onFilesChange={(files) => handleDocumentsChange('workshop_license', files)}
                        uploadedFiles={uploadedDocuments['workshop_license'] || []}
                        contextId="workshop"
                      />
                    </div>

                    {/* Machine Certificates */}
                    <div>
                      <MultiFileUpload
                        fieldKey="machine_certificates"
                        label="گواهی‌های دستگاه‌ها"
                        isRequired={false}
                        helpText="گواهی‌های کالیبراسیون و استاندارد دستگاه‌ها (حداکثر 100MB مجموع)"
                        maxFiles={999}
                        maxSizePerFile={100}
                        maxTotalSize={100}
                        acceptedTypes={['.pdf', '.jpg', '.jpeg', '.png']}
                        onFilesChange={(files) => handleDocumentsChange('machine_certificates', files)}
                        uploadedFiles={uploadedDocuments['machine_certificates'] || []}
                        contextId="workshop"
                      />
                    </div>

                    {/* Quality Certificates */}
                    <div>
                      <MultiFileUpload
                        fieldKey="quality_certificates"
                        label="گواهی‌های کیفیت"
                        isRequired={false}
                        helpText="گواهی‌های ISO، استانداردهای کیفیت و مدیریت (حداکثر 100MB مجموع)"
                        maxFiles={999}
                        maxSizePerFile={100}
                        maxTotalSize={100}
                        acceptedTypes={['.pdf', '.jpg', '.jpeg', '.png']}
                        onFilesChange={(files) => handleDocumentsChange('quality_certificates', files)}
                        uploadedFiles={uploadedDocuments['quality_certificates'] || []}
                        contextId="workshop"
                      />
                    </div>

                    {/* Insurance Documents */}
                    <div>
                      <MultiFileUpload
                        fieldKey="insurance_documents"
                        label="مدارک بیمه"
                        isRequired={false}
                        helpText="بیمه مسئولیت مدنی و بیمه کارگاه (حداکثر 100MB مجموع)"
                        maxFiles={999}
                        maxSizePerFile={100}
                        maxTotalSize={100}
                        acceptedTypes={['.pdf', '.jpg', '.jpeg', '.png']}
                        onFilesChange={(files) => handleDocumentsChange('insurance_documents', files)}
                        uploadedFiles={uploadedDocuments['insurance_documents'] || []}
                        contextId="workshop"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    انصراف
                  </Button>
                  <Button 
                    onClick={handleCreateWorkshop}
                    disabled={createWorkshopMutation.isPending}
                  >
                    {createWorkshopMutation.isPending ? 'در حال ثبت...' : 'ثبت کارگاه'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Workshops List */}
        {normalizedWorkshops.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {normalizedWorkshops.map((workshop) => (
              <Card key={workshop.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      <div>
                        <CardTitle className="text-lg">{workshop.name}</CardTitle>
                        {workshop.code && (
                          <p className="text-xs text-muted-foreground">{workshop.code}</p>
                        )}
                      </div>
                    </div>
                    <Badge variant={workshop.is_active ? "default" : "secondary"}>
                      {workshop.is_active ? 'فعال' : 'غیرفعال'}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {workshop.address}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {workshop.description && (
                      <p className="text-sm text-gray-600">{workshop.description}</p>
                    )}
                    
                    <div className="text-sm">
                      <div className="flex items-center gap-1 mb-1">
                        <MapPin className="h-4 w-4" />
                        <span className="font-medium">آدرس:</span>
                      </div>
                      <p className="text-gray-600 mr-5">
                        {workshop.province && workshop.city ? `${workshop.province} - ${workshop.city}` : ''}
                      </p>
                      {workshop.postal_address && (
                        <p className="text-gray-600 mr-5 text-xs">{workshop.postal_address}</p>
                      )}
                    </div>

                    {workshop.manager_name && (
                      <div className="text-sm">
                        <span className="font-medium">مسئول:</span>
                        <span className="text-gray-600 mr-2">{workshop.manager_name}</span>
                        {workshop.manager_phone && (
                          <span className="text-gray-500">- {workshop.manager_phone}</span>
                        )}
                      </div>
                    )}

                    {workshop.capabilities && workshop.capabilities.length > 0 && (
                      <div>
                        <div className="font-medium text-sm mb-2">توانمندی‌ها:</div>
                        <div className="flex flex-wrap gap-1">
                          {workshop.capabilities.map((capability, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {capability}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {workshop.machines && workshop.machines.length > 0 && (
                      <div>
                        <div className="font-medium text-sm mb-2">دستگاه‌ها:</div>
                        <div className="space-y-1">
                          {workshop.machines.slice(0, 3).map((machine, index) => (
                            <div key={index} className="flex justify-between items-center text-xs">
                              <span className="text-gray-600">{machine.name}</span>
                              <div className="flex gap-1">
                                <Badge variant="outline" className="text-xs">
                                  {machine.precision}
                                </Badge>
                                {machine.quantity && machine.quantity > 1 && (
                                  <Badge variant="secondary" className="text-xs">
                                    {machine.quantity} عدد
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                          {workshop.machines.length > 3 && (
                            <p className="text-xs text-gray-500">
                              و {workshop.machines.length - 3} دستگاه دیگر...
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-1 text-xs text-gray-500 pt-2 border-t">
                      <Calendar className="h-4 w-4" />
                      ثبت شده در: {new Date(workshop.created_at).toLocaleDateString('fa-IR')}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-4 w-4 ml-1" />
                      ویرایش
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4 ml-1" />
                      حذف
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">هنوز کارگاهی ثبت نکرده‌اید</h3>
              <p className="text-gray-600 mb-6">
                برای شروع کار به عنوان پیمانکار، ابتدا کارگاه خود را ثبت کنید.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 ml-2" />
                ثبت اولین کارگاه
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default MyWorkshops;
