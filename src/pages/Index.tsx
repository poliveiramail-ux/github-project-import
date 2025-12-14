import { useState } from 'react';
import SimulationForm from '@/components/financial/SimulationForm';
import SimulationForm_v2 from '@/components/financial/SimulationForm_v2';
import VersionsManager from '@/components/financial/VersionsManager';
import ConfigurationForm from '@/components/financial/ConfigurationForm';
import MasterDataManager from '@/components/financial/MasterDataManager';
import SideMenu from '@/components/financial/SideMenu';

const Index = () => {
  const [currentView, setCurrentView] = useState('simulation_v2');
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div>
      <SideMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={setCurrentView}
      />
      
      {currentView === 'simulation' && (
        <SimulationForm onMenuClick={() => setMenuOpen(true)} />
      )}
      
      {currentView === 'simulation_v2' && (
        <SimulationForm_v2 onMenuClick={() => setMenuOpen(true)} />
      )}
      
      {currentView === 'versions' && (
        <VersionsManager onBack={() => setCurrentView('simulation')} />
      )}
      
      {currentView === 'configurations' && (
        <ConfigurationForm onBack={() => setCurrentView('simulation')} />
      )}
      
      {currentView === 'masterdata' && (
        <MasterDataManager onBack={() => setCurrentView('simulation')} />
      )}
    </div>
  );
};

export default Index;
