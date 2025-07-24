import { LayoutDashboard, Package, LineChart, Settings } from 'lucide-react';

// Tabs configuration
export const TABS_DATA = [
  { name: 'Dashboard', icon: <LayoutDashboard size={16} /> },
  { name: 'Products', icon: <Package size={16} /> },
  { name: 'Analytics', icon: <LineChart size={16} /> },
  { name: 'Settings', icon: <Settings size={16} /> },
];

// Premium minimal color system with enhanced contrast for both themes
export const colorMap = {
  indigo: { 
    bg: 'bg-indigo-50', 
    text: 'text-indigo-700', 
    gradFrom: 'from-indigo-600', 
    gradTo: 'to-indigo-500',
    darkBg: 'dark:bg-indigo-950/40',
    darkText: 'dark:text-indigo-300'
  },
  violet: { 
    bg: 'bg-violet-50', 
    text: 'text-violet-700', 
    gradFrom: 'from-violet-600', 
    gradTo: 'to-violet-500',
    darkBg: 'dark:bg-violet-950/40',
    darkText: 'dark:text-violet-300'
  },
  emerald: { 
    bg: 'bg-emerald-50', 
    text: 'text-emerald-700', 
    gradFrom: 'from-emerald-600', 
    gradTo: 'to-emerald-500',
    darkBg: 'dark:bg-emerald-950/40',
    darkText: 'dark:text-emerald-300'
  },
  amber: { 
    bg: 'bg-amber-50', 
    text: 'text-amber-700', 
    gradFrom: 'from-amber-600', 
    gradTo: 'to-amber-500',
    darkBg: 'dark:bg-amber-950/40',
    darkText: 'dark:text-amber-300'
  },
  blue: { 
    bg: 'bg-blue-50', 
    text: 'text-blue-700', 
    gradFrom: 'from-blue-600', 
    gradTo: 'to-blue-500',
    darkBg: 'dark:bg-blue-950/40',
    darkText: 'dark:text-blue-300'
  },
  slate: { 
    bg: 'bg-slate-50', 
    text: 'text-slate-700', 
    gradFrom: 'from-slate-600', 
    gradTo: 'to-slate-500',
    darkBg: 'dark:bg-slate-800/30',
    darkText: 'dark:text-slate-200'
  },
}; 