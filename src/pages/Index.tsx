import { useState } from 'react';
import SimulationForm from '@/components/financial/SimulationForm';
import SimulationForm_v2 from '@/components/financial/SimulationForm_v2';
import SimulationForm_v3 from '@/components/financial/SimulationForm_v3';
import SimulationForm_MonthGrouped from '@/components/financial/SimulationForm_MonthGrouped';
import SimulationForm_MonthCards from '@/components/financial/SimulationForm_MonthCards';
import SimulationForm_CollapsibleMonths from '@/components/financial/SimulationForm_CollapsibleMonths';
import SimulationForm_CalendarGrid from '@/components/financial/SimulationForm_CalendarGrid';
import SimulationForm_Pivot from '@/components/financial/SimulationForm_Pivot';
import SimulationForm_Enhanced from '@/components/financial/SimulationForm_Enhanced';
import VersionsManager from '@/components/financial/VersionsManager';
import ConfigurationForm from '@/components/financial/ConfigurationForm';
import MasterDataManager from '@/components/financial/MasterDataManager';
import DashboardsView from '@/components/financial/DashboardsView';
import SideMenu from '@/components/financial/SideMenu';

const Index = () => {
  const [currentView, setCurrentView] = useState('simulation_v2');
  const [menuOpen, setMenuOpen] = useState(false);

  const handleMenuClick = () => setMenuOpen(true);

  return (
    <div>
      <SideMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} onNavigate={setCurrentView} />
      
      {currentView === 'simulation' && <SimulationForm onMenuClick={handleMenuClick} />}
      {currentView === 'simulation_v2' && <SimulationForm_v2 onMenuClick={handleMenuClick} />}
      {currentView === 'simulation_v3' && <SimulationForm_v3 onMenuClick={handleMenuClick} />}
      {currentView === 'month_grouped' && <SimulationForm_MonthGrouped onMenuClick={handleMenuClick} />}
      {currentView === 'month_cards' && <SimulationForm_MonthCards onMenuClick={handleMenuClick} />}
      {currentView === 'collapsible_months' && <SimulationForm_CollapsibleMonths onMenuClick={handleMenuClick} />}
      {currentView === 'calendar_grid' && <SimulationForm_CalendarGrid onMenuClick={handleMenuClick} />}
      {currentView === 'pivot' && <SimulationForm_Pivot onMenuClick={handleMenuClick} />}
      {currentView === 'enhanced' && <SimulationForm_Enhanced onMenuClick={handleMenuClick} />}
      {currentView === 'versions' && <VersionsManager onBack={() => setCurrentView('simulation')} />}
      {currentView === 'configurations' && <ConfigurationForm onBack={() => setCurrentView('simulation')} />}
      {currentView === 'masterdata' && <MasterDataManager onBack={() => setCurrentView('simulation')} />}
      {currentView === 'dashboards' && <DashboardsView onBack={() => setCurrentView('simulation_v2')} onMenuClick={handleMenuClick} />}
    </div>
  );
};

export default Index;
