import { useState, useEffect } from 'react';
import { ArrowLeft, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface Program {
  id_lob: string;
  name: string;
}

interface SimulationConfig {
  id: string;
  name: string;
  created_at: string;
}

interface SimulationVersion {
  id: string;
  name: string;
  program_id: string;
  config_id: string;
  created_at: string;
}

interface Props {
  onBack: () => void;
}

export default function VersionsManager({ onBack }: Props) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [configs, setConfigs] = useState<SimulationConfig[]>([]);
  const [versions, setVersions] = useState<SimulationVersion[]>([]);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedConfig, setSelectedConfig] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPrograms();
    loadConfigs();
  }, []);

  useEffect(() => {
    if (selectedProgram && selectedConfig) {
      loadVersions();
    } else {
      setVersions([]);
    }
  }, [selectedProgram, selectedConfig]);

  const loadPrograms = async () => {
    const { data } = await (supabase as any).from('lob').select('*').order('id_lob');
    setPrograms(data || []);
  };

  const loadConfigs = async () => {
    const { data } = await supabase.from('simulation_configs').select('*').order('created_at', { ascending: false });
    setConfigs(data || []);
  };

  const loadVersions = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('simulation_versions')
      .select('*')
      .eq('program_id', selectedProgram)
      .eq('config_id', selectedConfig)
      .order('created_at', { ascending: false });
    
    setVersions(data || []);
    setLoading(false);
  };

  const handleDelete = async (versionId: string, versionName: string) => {
    if (!window.confirm(`Tem certeza que deseja eliminar a versão "${versionName}"?\n\nTodas as variáveis associadas serão eliminadas.`)) {
      return;
    }

    const { error } = await supabase
      .from('simulation_versions')
      .delete()
      .eq('id', versionId);

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
        <h2 className="text-3xl font-bold">Gestão de Simulações</h2>
      </div>

      <Card className="p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Programa</Label>
            <Select value={selectedProgram} onValueChange={setSelectedProgram}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um programa" />
              </SelectTrigger>
              <SelectContent>
                {programs.map(p => (
                  <SelectItem key={p.id_lob} value={p.id_lob}>{p.id_lob} - {p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Configuração</Label>
            <Select value={selectedConfig} onValueChange={setSelectedConfig}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma configuração" />
              </SelectTrigger>
              <SelectContent>
                {configs.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">A carregar versões...</p>
        </div>
      ) : selectedProgram && selectedConfig ? (
        <Card>
          {versions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Nome da Versão</th>
                    <th className="px-4 py-3 text-left font-semibold">Data de Criação</th>
                    <th className="px-4 py-3 text-left font-semibold">Programa</th>
                    <th className="px-4 py-3 text-left font-semibold">Configuração</th>
                    <th className="px-4 py-3 text-right font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {versions.map(version => {
                    const program = programs.find(p => p.id_lob === version.program_id);
                    const config = configs.find(c => c.id === version.config_id);
                    
                    return (
                      <tr key={version.id} className="border-t hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-3 font-medium">{version.name}</td>
                        <td className="px-4 py-3">
                          {new Date(version.created_at).toLocaleString('pt-PT')}
                        </td>
                        <td className="px-4 py-3 font-mono text-sm">{program?.id_lob}</td>
                        <td className="px-4 py-3">{config?.name}</td>
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
              Nenhuma versão encontrada para este programa e configuração.
            </div>
          )}
        </Card>
      ) : (
        <Card className="p-12 text-center text-muted-foreground">
          Selecione um programa e uma configuração para ver as versões.
        </Card>
      )}
    </div>
  );
}
