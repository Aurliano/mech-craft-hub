import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Settings } from 'lucide-react';
import { MACHINE_TYPES, MachineType, SelectedMachine } from '@/data/machines';

interface MachineSelectorProps {
  selectedMachines: SelectedMachine[];
  onMachinesChange: (machines: SelectedMachine[]) => void;
}

const MachineSelector: React.FC<MachineSelectorProps> = ({
  selectedMachines,
  onMachinesChange
}) => {
  const [selectedMachineTypes, setSelectedMachineTypes] = useState<string[]>([]);

  const handleMachineTypeToggle = (machineType: MachineType, checked: boolean) => {
    if (checked) {
      setSelectedMachineTypes(prev => [...prev, machineType.id]);
      // Add new machine to the list
      const newMachine: SelectedMachine = {
        id: `${machineType.id}_${Date.now()}`,
        machineType,
        description: '',
        quantity: 1
      };
      onMachinesChange([...selectedMachines, newMachine]);
    } else {
      setSelectedMachineTypes(prev => prev.filter(id => id !== machineType.id));
      // Remove all machines of this type
      onMachinesChange(selectedMachines.filter(machine => machine.machineType.id !== machineType.id));
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
    const machine = selectedMachines.find(m => m.id === machineId);
    if (machine) {
      setSelectedMachineTypes(prev => prev.filter(id => id !== machine.machineType.id));
      onMachinesChange(selectedMachines.filter(m => m.id !== machineId));
    }
  };

  const addDuplicateMachine = (machineType: MachineType) => {
    const newMachine: SelectedMachine = {
      id: `${machineType.id}_${Date.now()}`,
      machineType,
      description: '',
      quantity: 1
    };
    onMachinesChange([...selectedMachines, newMachine]);
  };

  return (
    <div className="space-y-6">
      {/* Machine Type Selection */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">انتخاب دستگاه‌ها</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          دستگاه‌های موجود در کارگاه خود را انتخاب کنید. می‌توانید از هر دستگاه چندین بار اضافه کنید.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {MACHINE_TYPES.map((machineType) => (
            <div key={machineType.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
              <Checkbox
                id={machineType.id}
                checked={selectedMachineTypes.includes(machineType.id)}
                onCheckedChange={(checked) => handleMachineTypeToggle(machineType, checked as boolean)}
              />
              <Label htmlFor={machineType.id} className="text-sm cursor-pointer flex-1">
                {machineType.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Machines Details */}
      {selectedMachines.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-md font-semibold">دستگاه‌های انتخاب شده</h4>
          <div className="space-y-3">
            {selectedMachines.map((machine) => (
              <Card key={machine.id} className="border-l-4 border-l-primary">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-sm">{machine.machineType.name}</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addDuplicateMachine(machine.machineType)}
                      >
                        <Plus className="h-4 w-4 ml-1" />
                        کپی
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeMachine(machine.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor={`desc_${machine.id}`}>توضیحات دستگاه *</Label>
                      <Textarea
                        id={`desc_${machine.id}`}
                        value={machine.description}
                        onChange={(e) => handleMachineDescriptionChange(machine.id, e.target.value)}
                        placeholder={machine.machineType.placeholder}
                        rows={2}
                        className="text-sm"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        دقت، ابعاد، نوع و برند دستگاه را مشخص کنید
                      </p>
                    </div>
                    <div>
                      <Label htmlFor={`qty_${machine.id}`}>تعداد دستگاه *</Label>
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
                  
                  {machine.description && (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {machine.machineType.name}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        تعداد: {machine.quantity}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MachineSelector;
