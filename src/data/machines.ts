export interface MachineType {
  id: string;
  name: string;
  description: string;
  placeholder: string;
}

export const MACHINE_TYPES: MachineType[] = [
  {
    id: 'manual_lathe',
    name: 'دستگاه تراش manual',
    description: 'دستگاه تراش دستی برای تراشکاری قطعات',
    placeholder: 'ابعاد و قطر کارگیر (مثال: قطر 500mm، طول 1000mm)'
  },
  {
    id: 'manual_mill',
    name: 'دستگاه فرز manual',
    description: 'دستگاه فرز دستی برای فرزکاری قطعات',
    placeholder: 'ابعاد میز کار (مثال: 800x400mm)'
  },
  {
    id: 'cnc_lathe',
    name: 'دستگاه تراش CNC',
    description: 'دستگاه تراش کنترل عددی',
    placeholder: 'تعداد محور و ابعاد (مثال: 3 محور، قطر 600mm، طول 1200mm)'
  },
  {
    id: 'cnc_mill',
    name: 'دستگاه فرز CNC',
    description: 'دستگاه فرز کنترل عددی',
    placeholder: 'تعداد محور و ابعاد (مثال: 4 محور، میز 1000x500mm)'
  },
  {
    id: 'spark_machine',
    name: 'دستگاه اسپارک',
    description: 'دستگاه تخلیه الکتریکی',
    placeholder: 'نوع و ابعاد (مثال: Wire EDM، میز 400x300mm)'
  },
  {
    id: 'wire_cut',
    name: 'دستگاه وایر کات',
    description: 'دستگاه برش با سیم',
    placeholder: 'ابعاد و دقت (مثال: میز 500x400mm، دقت ±0.01mm)'
  },
  {
    id: 'drill_machine',
    name: 'دستگاه دریل',
    description: 'دستگاه سوراخکاری',
    placeholder: 'ابعاد و قابلیت (مثال: قطر سوراخ تا 50mm، ارتفاع 500mm)'
  },
  {
    id: 'grinding_spindle',
    name: 'دستگاه سنگ محور',
    description: 'دستگاه سنگ زنی محوری',
    placeholder: 'ابعاد و دقت (مثال: قطر تا 200mm، دقت ±0.005mm)'
  },
  {
    id: 'magnetic_grinder',
    name: 'دستگاه سنگ مغناطیس',
    description: 'دستگاه سنگ زنی مغناطیسی',
    placeholder: 'ابعاد میز (مثال: میز 300x150mm)'
  },
  {
    id: 'centerless_grinder',
    name: 'دستگاه سنترلس',
    description: 'دستگاه سنگ زنی بدون مرکز',
    placeholder: 'ابعاد و دقت (مثال: قطر تا 100mm، دقت ±0.002mm)'
  },
  {
    id: 'laser_cutter',
    name: 'دستگاه برش لیزر',
    description: 'دستگاه برش با لیزر',
    placeholder: 'قدرت و ابعاد (مثال: 3kW، میز 3000x1500mm)'
  },
  {
    id: 'plasma_cutter',
    name: 'دستگاه برش پلاسما',
    description: 'دستگاه برش با پلاسما',
    placeholder: 'قدرت و ضخامت (مثال: 100A، ضخامت تا 25mm)'
  },
  {
    id: 'oxy_cutter',
    name: 'دستگاه هوا برش',
    description: 'دستگاه برش با اکسیژن',
    placeholder: 'ابعاد و ضخامت (مثال: ضخامت تا 50mm)'
  },
  {
    id: 'co2_welder',
    name: 'دستگاه جوش CO2',
    description: 'دستگاه جوشکاری CO2',
    placeholder: 'قدرت و نوع (مثال: 350A، نیمه اتوماتیک)'
  },
  {
    id: 'argon_welder',
    name: 'دستگاه جوش آرگون',
    description: 'دستگاه جوشکاری آرگون',
    placeholder: 'قدرت و نوع (مثال: 200A، TIG)'
  },
  {
    id: 'brake_press',
    name: 'دستگاه خم بریک',
    description: 'دستگاه خمکاری دستی',
    placeholder: 'طول و ضخامت (مثال: طول 3000mm، ضخامت تا 6mm)'
  },
  {
    id: 'cnc_brake',
    name: 'دستگاه خم بریک CNC',
    description: 'دستگاه خمکاری کنترل عددی',
    placeholder: 'طول و دقت (مثال: طول 4000mm، دقت ±0.1mm)'
  },
  {
    id: 'tube_bender',
    name: 'دستگاه خم لوله',
    description: 'دستگاه خمکاری لوله',
    placeholder: 'قطر و ضخامت (مثال: قطر تا 150mm، ضخامت تا 8mm)'
  },
  {
    id: 'sheet_roller',
    name: 'دستگاه رول ورق',
    description: 'دستگاه رول کردن ورق',
    placeholder: 'ابعاد و ضخامت (مثال: عرض 2000mm، ضخامت تا 10mm)'
  },
  {
    id: 'tap_machine',
    name: 'دستگاه قلاویز زن',
    description: 'دستگاه قلاویزکاری',
    placeholder: 'قطر و نوع (مثال: قطر تا M20، دستی/اتوماتیک)'
  },
  {
    id: 'cold_saw',
    name: 'دستگاه کلدزنی',
    description: 'دستگاه برش سرد',
    placeholder: 'ابعاد و زاویه (مثال: قطر تا 200mm، زاویه 45 درجه)'
  },
  {
    id: 'tool_grinder',
    name: 'دستگاه ابزار تیز کنی',
    description: 'دستگاه تیز کردن ابزار',
    placeholder: 'نوع و دقت (مثال: Universal، دقت ±0.01mm)'
  }
];

export interface SelectedMachine {
  id: string;
  machineType: MachineType;
  description: string;
  quantity: number;
}

export const getMachineTypeById = (id: string): MachineType | undefined => {
  return MACHINE_TYPES.find(machine => machine.id === id);
};
