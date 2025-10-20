import { useState, useEffect } from 'react';
import { ArrowLeft, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface Project {
  id_prj: string;
  desc_prj: string | null;
}

interface SimulationVersion {
  id: string;
  name: string;
  id_prj: string;
  id_lang: string | null;
  created_at: string;
}

interface Props {
  onBack: () => void;
}

export default function VersionsManager({ onBack }: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [versions, setVersions] = useState<SimulationVersion[]>([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadVersions();
    } else {
      setVersions([]);
    }
  }, [selectedProject]);

  const loadProjects = async () => {
    const { data } = await supabase.from('project').select('*').order('id_prj');
    setProjects(data || []);
  };

  const loadVersions = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('simulation_versions')
      .select('*')
      .eq('id_prj', selectedProject)
      .order('created_at', { ascending: false });
    
    const mappedData = (data || []).map((v: any) => ({
      id: v.id_sim_ver,
      name: v.name,
      id_prj: v.id_prj,
      id_lang: v.id_lang,
      created_at: v.created_at
    }));
    setVersions(mappedData);
    setLoading(false);
  };

  const handleDelete = async (versionId: string, versionName: string) => {
    if (!window.confirm(`Tem certeza que deseja eliminar a versão "${versionName}"?\n\nTodas as variáveis associadas serão eliminadas.`)) {
      return;
    }

    const { error } = await (supabase as any)
      .from('simulation_versions')
      .delete()
      .eq('id_sim_ver', versionId);

    if (error) {
      toast({ title: 'Erro', description: 'Erro ao eliminar versão', variant: 'destructive' });
      return;
    }

    loadVersions();
    toast({ title: 'Sucesso', description: 'Versão eliminada' });
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-3xl font-bold">VersionsManager</h2>
      </div>

      <Card className="p-6 mb-6">
        <div>
          <Label>Projeto</Label>
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um projeto" />
            </SelectTrigger>
            <SelectContent>
              {projects.map(p => (
                <SelectItem key={p.id_prj} value={p.id_prj}>
                  {p.id_prj} {p.desc_prj ? `- ${p.desc_prj}` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">A carregar versões...</p>
        </div>
      ) : selectedProject ? (
        <Card>
          {versions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Nome da Versão</th>
                    <th className="px-4 py-3 text-left font-semibold">Data de Criação</th>
                    <th className="px-4 py-3 text-left font-semibold">Projeto</th>
                    <th className="px-4 py-3 text-left font-semibold">Idioma</th>
                    <th className="px-4 py-3 text-right font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {versions.map(version => {
                    const project = projects.find(p => p.id_prj === version.id_prj);
                    
                    return (
                      <tr key={version.id} className="border-t hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-3 font-medium">{version.name}</td>
                        <td className="px-4 py-3">
                          {new Date(version.created_at).toLocaleString('pt-PT')}
                        </td>
                        <td className="px-4 py-3 font-mono text-sm">{project?.id_prj}</td>
                        <td className="px-4 py-3">{version.id_lang || '-'}</td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(version.id, version.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-muted-foreground">
              Nenhuma versão encontrada para este projeto.
            </div>
          )}
        </Card>
      ) : (
        <Card className="p-12 text-center text-muted-foreground">
          Selecione um projeto para ver as versões.
        </Card>
      )}
    </div>
  );
}
