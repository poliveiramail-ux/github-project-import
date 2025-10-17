import { useState } from 'react';
import DynamicSimulator from '@/components/financial/DynamicSimulator';
import SimulationForm from '@/components/financial/SimulationForm';
import VersionsManager from '@/components/financial/VersionsManager';
import ConfigurationForm from '@/components/financial/ConfigurationForm';
import ProgramsManager from '@/components/financial/ProgramsManager';
import SideMenu from '@/components/financial/SideMenu';

const Index = () => {
  const [currentView, setCurrentView] = useState('simulator');
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div>
      <SideMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={setCurrentView}
      />
      
      {currentView === 'simulator' && (
        <DynamicSimulator onMenuClick={() => setMenuOpen(true)} />
      )}
      
      {currentView === 'simulation' && (
        <SimulationForm onMenuClick={() => setMenuOpen(true)} />
      )}
      
      {currentView === 'versions' && (
        <VersionsManager onBack={() => setCurrentView('simulator')} />
      )}
      
      {currentView === 'configurations' && (
        <ConfigurationForm onBack={() => setCurrentView('simulator')} />
      )}
      
      {currentView === 'programs' && (
        <ProgramsManager onBack={() => setCurrentView('simulator')} />
      )}
    </div>
  );
};

export default Index;
