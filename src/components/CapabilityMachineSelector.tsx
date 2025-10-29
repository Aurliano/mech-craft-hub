import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Settings } from 'lucide-react';
import { CAPABILITIES_WITH_MACHINES, SelectedMachine, MachineType } from '@/data/capabilitiesAndMachines';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface CapabilityMachineSelectorProps {
  selectedCapabilities: string[];
  onCapabilityChange: (capabilityId: string, checked: boolean) => void;
  selectedMachines: SelectedMachine[];
  onMachinesChange: (machines: SelectedMachine[]) => void;
}

const CapabilityMachineSelector: React.FC<CapabilityMachineSelectorProps> = ({
  selectedCapabilities,
  onCapabilityChange,
  selectedMachines,
  onMachinesChange
}) => {
  const [isAddCustomMachineOpen, setIsAddCustomMachineOpen] = useState(false);
  const [customMachineForm, setCustomMachineForm] = useState({
    name: '',
    description: '',
    quantity: 1,
    capabilityId: ''
  });

  const handleCapabilityToggle = (capabilityId: string, checked: boolean) => {
    onCapabilityChange(capabilityId, checked);
    
    // Remove machines from unchecked capability
    if (!checked) {
      onMachinesChange(selectedMachines.filter(m => m.capabilityId !== capabilityId));
    }
  };

  const handleMachineToggle = (capabilityId: string, machineType: MachineType, checked: boolean) => {
    if (checked) {
      const newMachine: SelectedMachine = {
        id: `${machineType.id}_${Date.now()}`,
        machineType,
        capabilityId,
        description: '',
        quantity: 1,
        isCustom: false
      };
      onMachinesChange([...selectedMachines, newMachine]);
    } else {
      onMachinesChange(selectedMachines.filter(m => 
        !(m.machineType.id === machineType.id && m.capabilityId === capabilityId && !m.isCustom)
      ));
    }
  };

  const handleMachineDescriptionChange = (machineId: string, description: string) => {
    onMachinesChange(selectedMachines.map(machine => 
      machine.id === machineId ? { ...machine, description } : machine
    ));
  };

  const handleMachineQuantityChange = (machineId: string, quantity: number) => {
    if (quantity < 1) return;
    onMachinesChange(selectedMachines.map(machine => 
      machine.id === machineId ? { ...machine, quantity } : machine
    ));
  };

  const removeMachine = (machineId: string) => {
    onMachinesChange(selectedMachines.filter(m => m.id !== machineId));
  };

  const handleAddCustomMachine = () => {
    if (!customMachineForm.name.trim() || !customMachineForm.description.trim() || !customMachineForm.capabilityId) {
      return;
    }

    const customMachineType: MachineType = {
      id: `custom_${Date.now()}`,
      name: customMachineForm.name,
      description: customMachineForm.description,
      placeholder: 'توضیحات دستگاه'
    };

    const newMachine: SelectedMachine = {
      id: `custom_${Date.now()}`,
      machineType: customMachineType,
      capabilityId: customMachineForm.capabilityId,
      description: customMachineForm.description,
      quantity: customMachineForm.quantity,
      isCustom: true,
      customName: customMachineForm.name
    };

    onMachinesChange([...selectedMachines, newMachine]);
    
    // Reset form
    setCustomMachineForm({
      name: '',
      description: '',
      quantity: 1,
      capabilityId: ''
    });
    setIsAddCustomMachineOpen(false);
  };

  const isMachineSelected = (capabilityId: string, machineId: string) => {
    return selectedMachines.some(m => 
      m.machineType.id === machineId && m.capabilityId === capabilityId && !m.isCustom
    );
  };

  const getSelectedMachinesForCapability = (capabilityId: string) => {
    return selectedMachines.filter(m => m.capabilityId === capabilityId);
  };

  return (
    <div className="space-y-6">
      {/* Capabilities Selection */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">انتخاب توانمندی‌ها</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          ابتدا توانمندی‌های کارگاه خود را انتخاب کنید. سپس دستگاه‌های مربوط به هر توانمندی را انتخاب می‌کنید.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {CAPABILITIES_WITH_MACHINES.map((capability) => (
            <div key={capability.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
              <Checkbox
                id={`capability_${capability.id}`}
                checked={selectedCapabilities.includes(capability.id)}
                onCheckedChange={(checked) => handleCapabilityToggle(capability.id, checked as boolean)}
              />
              <Label htmlFor={`capability_${capability.id}`} className="text-sm cursor-pointer flex-1">
                {capability.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Machines Selection by Capability */}
      {selectedCapabilities.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-md font-semibold">انتخاب دستگاه‌ها بر اساس توانمندی</h4>
          
          {selectedCapabilities.map((capabilityId) => {
            const capability = CAPABILITIES_WITH_MACHINES.find(cap => cap.id === capabilityId);
            if (!capability) return null;

            const capabilityMachines = getSelectedMachinesForCapability(capabilityId);

            return (
              <Card key={capabilityId} className="border-l-4 border-l-primary">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{capability.name}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    دستگاه‌های مربوط به این توانمندی را انتخاب کنید
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Machine Selection Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {capability.machines.map((machine) => {
                      const isSelected = isMachineSelected(capabilityId, machine.id);
                      return (
                        <div key={machine.id} className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50">
                          <Checkbox
                            id={`machine_${capabilityId}_${machine.id}`}
                            checked={isSelected}
                            onCheckedChange={(checked) => handleMachineToggle(capabilityId, machine, checked as boolean)}
                          />
                          <Label htmlFor={`machine_${capabilityId}_${machine.id}`} className="text-sm cursor-pointer flex-1">
                            {machine.name}
                          </Label>
                        </div>
                      );
                    })}
                  </div>

                  {/* Custom Machine Button */}
                  <div className="pt-2 border-t">
                    <Dialog open={isAddCustomMachineOpen} onOpenChange={setIsAddCustomMachineOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCustomMachineForm(prev => ({ ...prev, capabilityId }))}
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 ml-1" />
                          اضافه کردن دستگاه جدید برای {capability.name}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>اضافه کردن دستگاه جدید</DialogTitle>
                          <DialogDescription>
                            می‌توانید سایر دستگاه‌هایتان را از اینجا اضافه کنید.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="custom_machine_name">نام دستگاه *</Label>
                            <Input
                              id="custom_machine_name"
                              value={customMachineForm.name}
                              onChange={(e) => setCustomMachineForm(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="نام دستگاه را وارد کنید"
                            />
                          </div>
                          <div>
                            <Label htmlFor="custom_machine_desc">توضیحات دستگاه *</Label>
                            <Textarea
                              id="custom_machine_desc"
                              value={customMachineForm.description}
                              onChange={(e) => setCustomMachineForm(prev => ({ ...prev, description: e.target.value }))}
                              placeholder="دقت، ابعاد، نوع و برند دستگاه را مشخص کنید"
                              rows={3}
                            />
                          </div>
                          <div>
                            <Label htmlFor="custom_machine_qty">تعداد دستگاه *</Label>
                            <Input
                              id="custom_machine_qty"
                              type="number"
                              min="1"
                              value={customMachineForm.quantity}
                              onChange={(e) => setCustomMachineForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                              placeholder="تعداد"
                            />
                          </div>
                          <div className="flex gap-2 justify-end">
                            <Button variant="outline" onClick={() => setIsAddCustomMachineOpen(false)}>
                              انصراف
                            </Button>
                            <Button onClick={handleAddCustomMachine}>
                              اضافه کردن
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Selected Machines Details */}
                  {capabilityMachines.length > 0 && (
                    <div className="space-y-2 pt-2 border-t">
                      <p className="text-sm font-medium">دستگاه‌های انتخاب شده:</p>
                      {capabilityMachines.map((machine) => (
                        <Card key={machine.id} className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium text-sm">
                                  {machine.isCustom ? machine.customName : machine.machineType.name}
                                </span>
                                {machine.isCustom && (
                                  <Badge variant="secondary" className="text-xs">سفارشی</Badge>
                                )}
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <div>
                                  <Label htmlFor={`desc_${machine.id}`} className="text-xs">توضیحات دستگاه *</Label>
                                  <Textarea
                                    id={`desc_${machine.id}`}
                                    value={machine.description}
                                    onChange={(e) => handleMachineDescriptionChange(machine.id, e.target.value)}
                                    placeholder={machine.machineType.placeholder}
                                    rows={2}
                                    className="text-sm"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`qty_${machine.id}`} className="text-xs">تعداد دستگاه *</Label>
                                  <Input
                                    id={`qty_${machine.id}`}
                                    type="number"
                                    min="1"
                                    value={machine.quantity}
                                    onChange={(e) => handleMachineQuantityChange(machine.id, parseInt(e.target.value) || 1)}
                                    placeholder="تعداد"
                                    className="text-sm"
                                  />
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeMachine(machine.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CapabilityMachineSelector;

