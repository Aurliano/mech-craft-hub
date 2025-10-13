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
import { Plus, Edit, Trash2, MapPin, Calendar, Building2, Settings, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useContractorWorkshops, useCreateContractorWorkshop, useCheckContractorManufacturingService } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import MachineSelector from '@/components/MachineSelector';
import { SelectedMachine } from '@/data/machines';

const MyWorkshops = () => {
  const { user, isContractor } = useAuth();
  const { data: workshops, isLoading, refetch } = useContractorWorkshops();
  type Workshop = {
    id: string | number;
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
    capabilities: [] as string[],
    machines: [] as SelectedMachine[]
  });

  // Manufacturing processes list
  const manufacturingProcesses = [
    'تراشکاری',
    'فرزکاری', 
    'جوشکاری',
    'پوشش دهی',
    'سنگ زنی',
    'نمونه سازی',
    'فرآیند های متالوژی'
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
        !newWorkshop.manager_phone.trim()) {
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

    try {
      // Convert SelectedMachine to the format expected by backend
      const machinesForBackend = newWorkshop.machines.map(machine => ({
        name: machine.machineType.name,
        precision: machine.description,
        quantity: machine.quantity
      }));

      const workshopData = {
        ...newWorkshop,
        machines: machinesForBackend
      };

      await createWorkshopMutation.mutateAsync(workshopData);
      toast({
        title: "موفق",
        description: "کارگاه با موفقیت ثبت شد.",
      });
      setNewWorkshop({ 
        name: '', address: '', description: '', province: '', city: '', 
        postal_address: '', manager_name: '', manager_phone: '', 
        capabilities: [], machines: [] 
      });
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

  const handleCapabilityChange = (capability: string, checked: boolean) => {
    if (checked) {
      setNewWorkshop(prev => ({
        ...prev,
        capabilities: [...prev.capabilities, capability]
      }));
    } else {
      setNewWorkshop(prev => ({
        ...prev,
        capabilities: prev.capabilities.filter(c => c !== capability)
      }));
    }
  };

  const handleMachinesChange = (machines: SelectedMachine[]) => {
    setNewWorkshop(prev => ({
      ...prev,
      machines
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
                    <Label htmlFor="address">تعداد پرسنل </Label>
                    <Textarea
                      id="WorkersCount"
                      value={newWorkshop.address}
                      onChange={(e) => setNewWorkshop({ ...newWorkshop, address: e.target.value })}
                      placeholder="تعداد پرسنل رسمی"
                      rows={1}
                    />
                  </div>
                </div>

                {/* Capabilities */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">توانمندی‌ها</h3>
                  <p className="text-sm text-muted-foreground">کدام فرآیندهای ساخت در این کارگاه انجام می‌شود؟</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {manufacturingProcesses.map((process) => (
                      <div key={process} className="flex items-center space-x-2">
                        <Checkbox
                          id={process}
                          checked={newWorkshop.capabilities.includes(process)}
                          onCheckedChange={(checked) => handleCapabilityChange(process, checked as boolean)}
                        />
                        <Label htmlFor={process} className="text-sm">
                          {process}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Machines */}
                <MachineSelector
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
                      <CardTitle className="text-lg">{workshop.name}</CardTitle>
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
