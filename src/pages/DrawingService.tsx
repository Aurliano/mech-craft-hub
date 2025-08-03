import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { Upload, FileText, Wrench, Package } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const DrawingService = () => {
  const [weldingFile, setWeldingFile] = useState<File | null>(null);
  const [explodedFile, setExplodedFile] = useState<File | null>(null);
  const [manufacturingFile, setManufacturingFile] = useState<File | null>(null);
  const [showWeldingDetails, setShowWeldingDetails] = useState(false);
  const [weldingAreas, setWeldingAreas] = useState('');
  const [weldingMethod, setWeldingMethod] = useState('');
  const [weldThickness, setWeldThickness] = useState('');
  const [tolerances, setTolerances] = useState('');
  const [additionalSpecs, setAdditionalSpecs] = useState('');

  const acceptedFormats = ".step,.stp,.sldprt,.sldasm,.ipt,.iam";

  const handleFileUpload = (file: File, setFile: (file: File | null) => void) => {
    const allowedExtensions = ['step', 'stp', 'sldprt', 'sldasm', 'ipt', 'iam'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (fileExtension && allowedExtensions.includes(fileExtension)) {
      setFile(file);
      toast({
        title: "فایل آپلود شد",
        description: `فایل ${file.name} با موفقیت انتخاب شد.`,
      });
    } else {
      toast({
        title: "فرمت فایل نامعتبر",
        description: "لطفاً فایل را در فرمت‌های step, stp, SolidWorks یا Inventor آپلود کنید.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = (tabType: string, file: File | null) => {
    if (!file) {
      toast({
        title: "خطا",
        description: "لطفاً فایل مورد نیاز را آپلود کنید.",
        variant: "destructive",
      });
      return;
    }

    if (tabType === 'welding' && showWeldingDetails && !weldingAreas.trim()) {
      toast({
        title: "خطا",
        description: "لطفاً نواحی که باید جوش شوند را مشخص کنید.",
        variant: "destructive",
      });
      return;
    }

    // Here you would typically send the data to your backend
    toast({
      title: "سفارش ثبت شد",
      description: `سفارش ${tabType === 'welding' ? 'نقشه جوش' : tabType === 'exploded' ? 'نقشه انفجاری' : 'نقشه ساخت'} با موفقیت ثبت شد.`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Service Introduction */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-4">
            نقشه کشی
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            ما خدمات تخصصی نقشه کشی صنعتی را ارائه می‌دهیم. از نقشه‌های جوش گرفته تا نقشه‌های انفجاری و ساخت قطعات، 
            تمامی نیازهای شما را با بالاترین کیفیت و دقت برآورده می‌کنیم.
          </p>
        </div>

        {/* Tabs Section */}
        <Card className="max-w-6xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center">انتخاب نوع نقشه کشی</CardTitle>
            <CardDescription className="text-center">
              نوع سرویس مورد نیاز خود را انتخاب کرده و فایل‌های لازم را آپلود کنید
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="welding" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="welding" className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-foreground" />
                  نقشه جوش
                </TabsTrigger>
                <TabsTrigger value="exploded" className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-foreground" />
                  نقشه انفجاری
                </TabsTrigger>
                <TabsTrigger value="manufacturing" className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-foreground" />
                  نقشه ساخت
                </TabsTrigger>
              </TabsList>

              {/* Welding Drawing Tab */}
              <TabsContent value="welding" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>نقشه جوش</CardTitle>
                    <CardDescription>
                      برای تهیه نقشه جوش، فایل سه‌بعدی خود را آپلود کنید
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="welding-file">آپلود فایل (اجباری)</Label>
                      <Input
                        id="welding-file"
                        type="file"
                        accept={acceptedFormats}
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], setWeldingFile)}
                        className="mt-1"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        فرمت‌های مجاز: STEP, STP, SolidWorks, Inventor
                      </p>
                      {weldingFile && (
                        <p className="text-sm text-green-600 mt-1">
                          فایل انتخاب شده: {weldingFile.name}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id="welding-details"
                        checked={showWeldingDetails}
                        onCheckedChange={(checked) => setShowWeldingDetails(checked === true)}
                      />
                      <Label htmlFor="welding-details">
                        نیاز به تکمیل جزئیات جوشکاری دارم
                      </Label>
                    </div>

                    {showWeldingDetails && (
                      <div className="space-y-4 p-4 border rounded-lg bg-secondary/10">
                        <div>
                          <Label htmlFor="welding-areas">نواحی که باید جوش شوند (اجباری)</Label>
                          <Textarea
                            id="welding-areas"
                            value={weldingAreas}
                            onChange={(e) => setWeldingAreas(e.target.value)}
                            placeholder="لطفاً نواحی که نیاز به جوش دارند را مشخص کنید..."
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor="welding-method">روش جوشکاری</Label>
                          <Input
                            id="welding-method"
                            value={weldingMethod}
                            onChange={(e) => setWeldingMethod(e.target.value)}
                            placeholder="مثال: TIG، MIG، آرک دستی..."
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor="weld-thickness">ضخامت درز (ساق جوش)</Label>
                          <Input
                            id="weld-thickness"
                            value={weldThickness}
                            onChange={(e) => setWeldThickness(e.target.value)}
                            placeholder="مثال: 3mm، 5mm..."
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor="tolerances">تلرانس‌های عددی و هندسی مدنظر طراح</Label>
                          <Textarea
                            id="tolerances"
                            value={tolerances}
                            onChange={(e) => setTolerances(e.target.value)}
                            placeholder="تلرانس‌های مورد نیاز را مشخص کنید..."
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor="additional-specs">مشخصات اضافی</Label>
                          <Textarea
                            id="additional-specs"
                            value={additionalSpecs}
                            onChange={(e) => setAdditionalSpecs(e.target.value)}
                            placeholder="اگر مشخصات دیگری مدنظرتان هست، به تفکیک و با مقدار کمی یا کیفی آن مشخص کنید..."
                            className="mt-1"
                          />
                        </div>
                      </div>
                    )}

                    <Button 
                      onClick={() => handleSubmit('welding', weldingFile)}
                      className="w-full"
                    >
                      ثبت سفارش نقشه جوش
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Exploded Drawing Tab */}
              <TabsContent value="exploded" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>نقشه انفجاری</CardTitle>
                    <CardDescription>
                      برای تهیه نقشه انفجاری، فایل سه‌بعدی مجموعه خود را آپلود کنید
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="exploded-file">آپلود فایل (اجباری)</Label>
                      <Input
                        id="exploded-file"
                        type="file"
                        accept={acceptedFormats}
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], setExplodedFile)}
                        className="mt-1"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        فرمت‌های مجاز: STEP, STP, SolidWorks, Inventor
                      </p>
                      {explodedFile && (
                        <p className="text-sm text-green-600 mt-1">
                          فایل انتخاب شده: {explodedFile.name}
                        </p>
                      )}
                    </div>

                    <Button 
                      onClick={() => handleSubmit('exploded', explodedFile)}
                      className="w-full"
                    >
                      ثبت سفارش نقشه انفجاری
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Manufacturing Drawing Tab */}
              <TabsContent value="manufacturing" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>نقشه ساخت (قطعات)</CardTitle>
                    <CardDescription>
                      برای تهیه نقشه ساخت قطعات، فایل سه‌بعدی خود را آپلود کنید
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="manufacturing-file">آپلود فایل (اجباری)</Label>
                      <Input
                        id="manufacturing-file"
                        type="file"
                        accept={acceptedFormats}
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], setManufacturingFile)}
                        className="mt-1"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        فرمت‌های مجاز: STEP, STP, SolidWorks, Inventor
                      </p>
                      {manufacturingFile && (
                        <p className="text-sm text-green-600 mt-1">
                          فایل انتخاب شده: {manufacturingFile.name}
                        </p>
                      )}
                    </div>

                    <Button 
                      onClick={() => handleSubmit('manufacturing', manufacturingFile)}
                      className="w-full"
                    >
                      ثبت سفارش نقشه ساخت
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default DrawingService;