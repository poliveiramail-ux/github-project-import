import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import ProjectsManager from './ProjectsManager';
import LanguagesManager from './LanguagesManager';
import ProgramsManager from './ProgramsManager';
import HierarchyManager from './HierarchyManager';

interface Props {
  onBack: () => void;
}

const MasterDataManager = ({ onBack }: Props) => {
  const [activeTab, setActiveTab] = useState('all');

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Master Data Manager</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="languages">Languages</TabsTrigger>
            <TabsTrigger value="programs">LOBs</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <HierarchyManager onBack={onBack} />
          </TabsContent>

          <TabsContent value="projects" className="mt-6">
            <ProjectsManager onBack={onBack} />
          </TabsContent>

          <TabsContent value="languages" className="mt-6">
            <LanguagesManager onBack={onBack} />
          </TabsContent>

          <TabsContent value="programs" className="mt-6">
            <ProgramsManager onBack={onBack} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MasterDataManager;