import { FileText, Clock, Settings, X, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
}

export default function SideMenu({ isOpen, onClose, onNavigate }: Props) {
  const menuItems: MenuItem[] = [
    { id: 'simulation', label: 'SimulationForm', icon: <Clock className="h-5 w-5" /> },
    { id: 'simulation_v2', label: 'SimulationForm V2', icon: <Clock className="h-5 w-5" /> },
    { id: 'versions', label: 'VersionsManager', icon: <Clock className="h-5 w-5" /> },
    { id: 'configurations', label: 'ConfigurationForm', icon: <Settings className="h-5 w-5" /> },
    { id: 'masterdata', label: 'MasterDataManager', icon: <FileText className="h-5 w-5" /> },
    { id: 'dashboards', label: 'Dashboards', icon: <LayoutDashboard className="h-5 w-5" /> }
  ];

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 animate-in fade-in" onClick={onClose} />
      <div className="fixed left-0 top-0 h-full w-64 bg-card shadow-lg z-50 animate-in slide-in-from-left">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-bold text-lg">Menu</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="p-4 space-y-2">
          {menuItems.map(item => (
            <Button
              key={item.id}
              variant="ghost"
              className="w-full justify-start gap-3"
              onClick={() => {
                onNavigate(item.id);
                onClose();
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </Button>
          ))}
        </nav>
      </div>
    </>
  );
}
