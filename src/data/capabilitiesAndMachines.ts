export interface MachineType {
  id: string;
  name: string;
  description: string;
  placeholder: string;
}

export interface Capability {
  id: string;
  name: string;
  machines: MachineType[];
}

export const CAPABILITIES_WITH_MACHINES: Capability[] = [
  {
    id: 'turning_milling',
    name: 'تراشکاری و فرزکاری',
    machines: [
      {
        id: 'manual_lathe',
        name: 'دستگاه تراش manual',
        description: 'دستگاه تراش دستی برای تراشکاری قطعات',
        placeholder: 'ابعاد و قطر کارگیر (مثال: قطر 500mm، طول 1000mm)'
      },
      {
        id: 'cnc_lathe',
        name: 'دستگاه تراش CNC',
        description: 'دستگاه تراش کنترل عددی',
        placeholder: 'تعداد محور و ابعاد (مثال: 3 محور، قطر 600mm، طول 1200mm)'
      },
      {
        id: 'manual_mill',
        name: 'دستگاه فرز manual',
        description: 'دستگاه فرز دستی برای فرزکاری قطعات',
        placeholder: 'ابعاد میز کار (مثال: 800x400mm)'
      },
      {
        id: 'cnc_mill',
        name: 'دستگاه فرز CNC',
        description: 'دستگاه فرز کنترل عددی',
        placeholder: 'تعداد محور و ابعاد (مثال: 4 محور، میز 1000x500mm)'
      },
      {
        id: 'copy_machine',
        name: 'دستگاه کپی زن',
        description: 'دستگاه کپی قطعات',
        placeholder: 'ابعاد و نوع (مثال: قطر تا 300mm)'
      },
      {
        id: 'keyway_machine',
        name: 'دستگاه کله زنی',
        description: 'دستگاه کله زنی',
        placeholder: 'ابعاد و نوع (مثال: قطر تا 150mm)'
      },
      {
        id: 'crankshaft_machine',
        name: 'دستگاه میل لنگ تراشی',
        description: 'دستگاه تراش میل لنگ',
        placeholder: 'طول و قطر (مثال: طول تا 2000mm)'
      },
      {
        id: 'gardon_machine',
        name: 'دستگاه گاردون سازی',
        description: 'دستگاه گاردون تراشی',
        placeholder: 'ابعاد و قطر (مثال: قطر تا 800mm)'
      }
    ]
  },
  {
    id: 'drilling_tapping',
    name: 'سوراخکاری و قلاویز زنی',
    machines: [
      {
        id: 'column_drill',
        name: 'دریل ستونی',
        description: 'دستگاه دریل ستونی',
        placeholder: 'قطر سوراخ و ارتفاع (مثال: قطر تا 50mm، ارتفاع 500mm)'
      },
      {
        id: 'tap_machine',
        name: 'دستگاه قلاویز زن',
        description: 'دستگاه قلاویزکاری',
        placeholder: 'قطر و نوع (مثال: قطر تا M20، دستی/اتوماتیک)'
      }
    ]
  },
  {
    id: 'grinding',
    name: 'سنگ زنی',
    machines: [
      {
        id: 'grinding_spindle',
        name: 'سنگ محور',
        description: 'دستگاه سنگ زنی محوری',
        placeholder: 'ابعاد و دقت (مثال: قطر تا 200mm، دقت ±0.005mm)'
      },
      {
        id: 'magnetic_grinder',
        name: 'سنگ مغناطیس',
        description: 'دستگاه سنگ زنی مغناطیسی',
        placeholder: 'ابعاد میز (مثال: میز 300x150mm)'
      },
      {
        id: 'internal_grinder',
        name: 'سنگ زنی داخلی',
        description: 'دستگاه سنگ زنی داخلی',
        placeholder: 'قطر و عمق (مثال: قطر تا 150mm، عمق تا 200mm)'
      },
      {
        id: 'centerless_grinder',
        name: 'دستگاه سنترلس',
        description: 'دستگاه سنگ زنی بدون مرکز',
        placeholder: 'ابعاد و دقت (مثال: قطر تا 100mm، دقت ±0.002mm)'
      }
    ]
  },
  {
    id: 'cutting',
    name: 'برش کاری',
    machines: [
      {
        id: 'oxy_cutter',
        name: 'دستگاه هوابرش',
        description: 'دستگاه برش با اکسیژن',
        placeholder: 'ابعاد و ضخامت (مثال: ضخامت تا 50mm)'
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
      }
    ]
  },
  {
    id: 'sheet_metal',
    name: 'شیت متال',
    machines: [
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
        id: 'sheet_roller',
        name: 'دستگاه رول ورق',
        description: 'دستگاه رول کردن ورق',
        placeholder: 'ابعاد و ضخامت (مثال: عرض 2000mm، ضخامت تا 10mm)'
      },
      {
        id: 'tube_bender',
        name: 'دستگاه خم لوله',
        description: 'دستگاه خمکاری لوله',
        placeholder: 'قطر و ضخامت (مثال: قطر تا 150mm، ضخامت تا 8mm)'
      }
    ]
  },
  {
    id: 'gear_cutting',
    name: 'دنده زنی',
    machines: [
      {
        id: 'hob_machine',
        name: 'دستگاه هاپ',
        description: 'دستگاه هاپ زنی',
        placeholder: 'قطر و ماژول (مثال: قطر تا 500mm، ماژول تا 10)'
      },
      {
        id: 'shaper_machine',
        name: 'دستگاه شیپر',
        description: 'دستگاه شیپرینگ',
        placeholder: 'قطر و ماژول (مثال: قطر تا 400mm)'
      }
    ]
  },
  {
    id: 'welding',
    name: 'جوشکاری',
    machines: [
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
        id: 'simple_welder',
        name: 'دستگاه جوش ساده',
        description: 'دستگاه جوشکاری دستی',
        placeholder: 'قدرت و نوع (مثال: 250A، MMA)'
      }
    ]
  },
  {
    id: 'edm',
    name: 'اسپارگ',
    machines: [
      {
        id: 'spark_machine',
        name: 'دستگاه اسپارگ',
        description: 'دستگاه تخلیه الکتریکی',
        placeholder: 'نوع و ابعاد (مثال: Sinker EDM، میز 400x300mm)'
      },
      {
        id: 'wire_edm',
        name: 'دستگاه اسپارک CNC',
        description: 'دستگاه وایر EDM',
        placeholder: 'ابعاد و دقت (مثال: میز 500x400mm، دقت ±0.01mm)'
      }
    ]
  },
  {
    id: 'tool_grinding',
    name: 'ابزار سازی',
    machines: [
      {
        id: 'tool_grinder',
        name: 'دستگاه ابزار تیز کنی',
        description: 'دستگاه تیز کردن ابزار',
        placeholder: 'نوع و دقت (مثال: Universal، دقت ±0.01mm)'
      }
    ]
  },
  {
    id: 'coating',
    name: 'پوشش دهی',
    machines: [
      {
        id: 'electrostatic_coating',
        name: 'رنگ الکترو استاتیک',
        description: 'دستگاه رنگ الکترو استاتیک',
        placeholder: 'ابعاد و نوع (مثال: محفظه 3000x2000x2500mm)'
      }
    ]
  },
  {
    id: 'molding',
    name: 'قالب سازی',
    machines: [
      {
        id: 'plastic_injection',
        name: 'تزریق پلاستیک',
        description: 'دستگاه تزریق پلاستیک',
        placeholder: 'نوع و ظرفیت (مثال: ظرفیت 500g)'
      },
      {
        id: 'special_casting',
        name: 'ریخته گری ویژه',
        description: 'تجهیزات ریخته گری ویژه',
        placeholder: 'نوع و ظرفیت (مثال: ریخته گری دقیق)'
      },
      {
        id: 'sand_casting',
        name: 'ریخته گری ماسه',
        description: 'تجهیزات ریخته گری ماسه',
        placeholder: 'ابعاد و نوع (مثال: ظرفیت تا 500kg)'
      },
      {
        id: 'die_casting',
        name: 'دایکاست',
        description: 'دستگاه دایکاست',
        placeholder: 'نوع و ظرفیت (مثال: Hot Chamber، 100T)'
      },
      {
        id: 'progressive',
        name: 'پروگرسیو',
        description: 'قالب پروگرسیو',
        placeholder: 'ابعاد و تعداد مرحله (مثال: 5 مرحله)'
      }
    ]
  },
  {
    id: 'heat_treatment',
    name: 'عملیات حرارتی',
    machines: [
      {
        id: 'induction_ht',
        name: 'عملیات حرارتی القایی',
        description: 'دستگاه عملیات حرارتی القایی',
        placeholder: 'قدرت و نوع (مثال: 50kW، Medium Frequency)'
      },
      {
        id: 'bulk_ht',
        name: 'عملیات حرارتی حجمی',
        description: 'کوره عملیات حرارتی',
        placeholder: 'ابعاد و دما (مثال: محفظه 1000x800x600mm، تا 1200°C)'
      }
    ]
  }
];

export interface SelectedMachine {
  id: string;
  machineType: MachineType;
  capabilityId: string;
  description: string;
  quantity: number;
  isCustom?: boolean;
  customName?: string;
}

export const getCapabilityById = (id: string): Capability | undefined => {
  return CAPABILITIES_WITH_MACHINES.find(cap => cap.id === id);
};

export const getMachineTypeById = (capabilityId: string, machineId: string): MachineType | undefined => {
  const capability = getCapabilityById(capabilityId);
  return capability?.machines.find(machine => machine.id === machineId);
};

