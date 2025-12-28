import { FileText, Clock, Settings, X, LayoutDashboard, Table, Calendar, Grid3X3, Columns, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface MenuItem { id: string; label: string; icon: React.ReactNode; }

interface Props { isOpen: boolean; onClose: () => void; onNavigate: (view: string) => void; }

export default function SideMenu({ isOpen, onClose, onNavigate }: Props) {
  const formItems: MenuItem[] = [
    { id: 'simulation', label: 'SimulationForm V1', icon: <Clock className="h-5 w-5" /> },
    { id: 'simulation_v2', label: 'SimulationForm V2', icon: <Clock className="h-5 w-5" /> },
    { id: 'simulation_v3', label: 'Dashboard Cards', icon: <LayoutDashboard className="h-5 w-5" /> },
  ];

  const layoutItems: MenuItem[] = [
    { id: 'month_grouped', label: 'Month-Grouped', icon: <Columns className="h-5 w-5" /> },
    { id: 'month_cards', label: 'Month Cards', icon: <Grid3X3 className="h-5 w-5" /> },
    { id: 'collapsible_months', label: 'Collapsible Months', icon: <Table className="h-5 w-5" /> },
    { id: 'calendar_grid', label: 'Calendar Grid', icon: <Calendar className="h-5 w-5" /> },
    { id: 'pivot', label: 'Pivot Table', icon: <BarChart3 className="h-5 w-5" /> },
    { id: 'enhanced', label: 'Enhanced Layout', icon: <Table className="h-5 w-5" /> },
  ];

  const otherItems: MenuItem[] = [
    { id: 'versions', label: 'VersionsManager', icon: <Clock className="h-5 w-5" /> },
    { id: 'configurations', label: 'ConfigurationForm', icon: <Settings className="h-5 w-5" /> },
    { id: 'masterdata', label: 'MasterDataManager', icon: <FileText className="h-5 w-5" /> },
    { id: 'dashboards', label: 'Dashboards', icon: <LayoutDashboard className="h-5 w-5" /> },
  ];

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 animate-in fade-in" onClick={onClose} />
      <div className="fixed left-0 top-0 h-full w-72 bg-card shadow-lg z-50 animate-in slide-in-from-left overflow-y-auto">
        <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-card">
          <h2 className="font-bold text-lg">Menu</h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
        </div>
        <nav className="p-4 space-y-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Forms</p>
            <div className="space-y-1">
              {formItems.map(item => (
                <Button key={item.id} variant="ghost" className="w-full justify-start gap-3 text-sm" onClick={() => { onNavigate(item.id); onClose(); }}>
                  {item.icon}<span>{item.label}</span>
                </Button>
              ))}
            </div>
          </div>
          <Separator />
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Layout Options</p>
            <div className="space-y-1">
              {layoutItems.map(item => (
                <Button key={item.id} variant="ghost" className="w-full justify-start gap-3 text-sm" onClick={() => { onNavigate(item.id); onClose(); }}>
                  {item.icon}<span>{item.label}</span>
                </Button>
              ))}
            </div>
          </div>
          <Separator />
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Other</p>
            <div className="space-y-1">
              {otherItems.map(item => (
                <Button key={item.id} variant="ghost" className="w-full justify-start gap-3 text-sm" onClick={() => { onNavigate(item.id); onClose(); }}>
                  {item.icon}<span>{item.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}
