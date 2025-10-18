import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit3, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface SimulationConfig {
  id_sim_cfg: string;
  name: string;
  description: string | null;
  id_prj: string | null;
  created_at: string;
}

interface ConfigVariable {
  id_sim_cfg_var: string;
  id_sim_cfg: string;
  name: string;
  calculation_type: 'AUTO' | 'MANUAL' | 'FORMULA';
  formula: string | null;
  row_index: number;
}

interface Props {
  onBack: () => void;
}

export default function ConfigurationForm({ onBack }: Props) {
  const [configs, setConfigs] = useState<SimulationConfig[]>([]);
  const [projects, setProjects] = useState<{ id_prj: string; desc_prj: string | null }[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<SimulationConfig | null>(null);
  const [configName, setConfigName] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [variables, setVariables] = useState<ConfigVariable[]>([]);
  const [editingVar, setEditingVar] = useState<Partial<ConfigVariable> | null>(null);
  const [expandedVars, setExpandedVars] = useState(new Set<string>());
  const { toast } = useToast();

  useEffect(() => {
    loadConfigs();
    loadProjects();
  }, []);

  const loadProjects = async () => {
    const { data, error } = await supabase
      .from('project')
      .select('id_prj, desc_prj')
      .order('id_prj');
    
    if (error) {
      toast({ title: 'Erro', description: 'Erro ao carregar projetos', variant: 'destructive' });
      return;
    }
    setProjects(data || []);
  };

  const loadConfigs = async () => {
    const { data } = await supabase
      .from('simulation_configs')
      .select('*')
      .order('created_at', { ascending: false });
    setConfigs(data || []);
  };

  const loadVariables = async (configId: string) => {
    const { data } = await supabase
      .from('simulation_configs_variables')
      .select('*')
      .eq('id_sim_cfg', configId)
      .order('row_index');
    setVariables((data || []).map(v => ({
      ...v,
      calculation_type: (v.calculation_type || 'AUTO') as 'AUTO' | 'MANUAL' | 'FORMULA'
    })));
  };

  const handleSaveConfig = async () => {
    if (!configName.trim()) {
      toast({ title: 'Atenção', description: 'Digite um nome para a configuração' });
      return;
    }

    if (!selectedProjectId) {
      toast({ title: 'Atenção', description: 'Selecione um projeto' });
      return;
    }

    if (selectedConfig) {
      const { error } = await supabase
        .from('simulation_configs')
        .update({ name: configName, id_prj: selectedProjectId })
        .eq('id_sim_cfg', selectedConfig.id_sim_cfg);
      
      if (error) {
        toast({ title: 'Erro', description: 'Erro ao atualizar configuração', variant: 'destructive' });
        return;
      }
    } else {
      const { data, error } = await supabase
        .from('simulation_configs')
        .insert([{ name: configName, id_prj: selectedProjectId }])
        .select();
      
      if (error) {
        toast({ title: 'Erro', description: 'Erro ao criar configuração', variant: 'destructive' });
        return;
      }
      if (data && data[0]) {
        setSelectedConfig(data[0]);
      }
    }
    loadConfigs();
    toast({ title: 'Sucesso', description: 'Configuração guardada' });
  };

  const handleSelectConfig = (config: SimulationConfig) => {
    setSelectedConfig(config);
    setConfigName(config.name);
    setSelectedProjectId(config.id_prj || '');
    loadVariables(config.id_sim_cfg);
  };

  const handleNewConfig = () => {
    setSelectedConfig(null);
    setConfigName('');
    setSelectedProjectId('');
    setVariables([]);
  };

  const handleDeleteConfig = async (id: string) => {
    if (!window.confirm('Eliminar esta configuração e todas as suas variáveis?')) return;

    const { error } = await supabase
      .from('simulation_configs')
      .delete()
      .eq('id_sim_cfg', id);
    
    if (error) {
      toast({ title: 'Erro', description: 'Erro ao eliminar configuração', variant: 'destructive' });
      return;
    }
    if (selectedConfig?.id_sim_cfg === id) {
      handleNewConfig();
    }
    loadConfigs();
    toast({ title: 'Sucesso', description: 'Configuração eliminada' });
  };

  const handleSaveVariable = async () => {
    if (!selectedConfig) {
      toast({ title: 'Atenção', description: 'Selecione uma configuração primeiro' });
      return;
    }

    if (!editingVar?.name) {
      toast({ title: 'Atenção', description: 'Nome é obrigatório' });
      return;
    }

    if (editingVar.id_sim_cfg_var) {
      const { error } = await supabase
        .from('simulation_configs_variables')
        .update({
          name: editingVar.name,
          calculation_type: editingVar.calculation_type || 'AUTO',
          formula: editingVar.formula || null
        })
        .eq('id_sim_cfg_var', editingVar.id_sim_cfg_var);
      
      if (error) {
        toast({ title: 'Erro', description: 'Erro ao atualizar variável', variant: 'destructive' });
        return;
      }
    } else {
      const { error } = await supabase
        .from('simulation_configs_variables')
        .insert([{
          id_sim_cfg: selectedConfig.id_sim_cfg,
          name: editingVar.name,
          calculation_type: editingVar.calculation_type || 'AUTO',
          formula: editingVar.formula || null,
          row_index: variables.length + 1
        }]);
      
      if (error) {
        toast({ title: 'Erro', description: 'Erro ao criar variável', variant: 'destructive' });
        return;
      }
    }
      setEditingVar(null);
    loadVariables(selectedConfig.id_sim_cfg);
    toast({ title: 'Sucesso', description: 'Variável guardada' });
  };

  const handleDeleteVariable = async (id: string) => {
    if (!window.confirm('Eliminar esta variável?')) return;

    const { error } = await supabase
      .from('simulation_configs_variables')
      .delete()
      .eq('id_sim_cfg_var', id);
    
    if (error) {
      toast({ title: 'Erro', description: 'Erro ao eliminar variável', variant: 'destructive' });
      return;
    }
    if (selectedConfig) loadVariables(selectedConfig.id_sim_cfg);
    toast({ title: 'Sucesso', description: 'Variável eliminada' });
  };


  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-3xl font-bold">Gestão de Configurações</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Configurações */}
        <Card className="p-4 h-fit">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Configurações</h3>
            <Button size="sm" onClick={handleNewConfig}>
              <Plus className="h-4 w-4 mr-1" />
              Nova
            </Button>
          </div>
          <div className="space-y-2">
            {configs.map(config => (
              <div
                key={config.id_sim_cfg}
                className={`p-3 border rounded-lg cursor-pointer flex justify-between items-center transition-colors ${
                  selectedConfig?.id_sim_cfg === config.id_sim_cfg ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                }`}
              >
                <span onClick={() => handleSelectConfig(config)} className="flex-1">
                  {config.name}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteConfig(config.id_sim_cfg);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Detalhes da Configuração */}
        <Card className="lg:col-span-2 p-6">
          <h3 className="font-bold text-lg mb-4">
            {selectedConfig ? 'Editar Configuração' : 'Nova Configuração'}
          </h3>
          
          <div className="space-y-6">
            <div>
              <Label>Projeto</Label>
              <Select
                value={selectedProjectId}
                onValueChange={(value) => setSelectedProjectId(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um projeto" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  {projects.map((project) => (
                    <SelectItem key={project.id_prj} value={project.id_prj}>
                      {project.id_prj} {project.desc_prj && `- ${project.desc_prj}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Nome da Configuração</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={configName}
                  onChange={(e) => setConfigName(e.target.value)}
                  placeholder="Ex: Plano de Contas 2025"
                />
                <Button onClick={handleSaveConfig}>Guardar</Button>
              </div>
            </div>

            {selectedConfig && (
              <>
                <div className="border-t pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold">Variáveis</h4>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setEditingVar({ id_sim_cfg_var: '', id_sim_cfg: '', name: '', calculation_type: 'AUTO', formula: null, row_index: 0 })}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Nova Variável
                    </Button>
                  </div>

                  {editingVar && (
                    <Card className="p-4 mb-4 bg-muted">
                      <div className="mb-3">
                        <Label>Nome</Label>
                        <Input
                          value={editingVar.name || ''}
                          onChange={(e) => setEditingVar({ ...editingVar, name: e.target.value })}
                          placeholder="Ex: Vendas PT"
                        />
                      </div>
                      <div className="mb-3">
                        <Label>Tipo de Cálculo</Label>
                        <Select
                          value={editingVar.calculation_type || 'AUTO'}
                          onValueChange={(value: 'AUTO' | 'MANUAL' | 'FORMULA') => 
                            setEditingVar({ ...editingVar, calculation_type: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AUTO">Automático (soma filhas)</SelectItem>
                            <SelectItem value="MANUAL">Manual</SelectItem>
                            <SelectItem value="FORMULA">Fórmula</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {editingVar.calculation_type === 'FORMULA' && (
                        <div className="mb-3">
                          <Label>Fórmula</Label>
                          <Input
                            value={editingVar.formula || ''}
                            onChange={(e) => setEditingVar({ ...editingVar, formula: e.target.value })}
                            className="font-mono"
                            placeholder="Ex: [1.1] + [1.2]"
                          />
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveVariable}>Guardar</Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingVar(null)}>Cancelar</Button>
                      </div>
                    </Card>
                  )}

                  <div className="space-y-1 max-h-96 overflow-y-auto">
                    {variables.map(variable => (
                      <div
                        key={variable.id_sim_cfg_var}
                        className="flex items-center gap-2 p-2 border rounded-lg hover:bg-muted transition-colors"
                      >
                        <span className="flex-1">{variable.name}</span>
                        <span className="text-xs">
                          {variable.calculation_type === 'FORMULA' ? '📊' : 
                           variable.calculation_type === 'MANUAL' ? '✏️' : '🔢'}
                        </span>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setEditingVar(variable)}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDeleteVariable(variable.id_sim_cfg_var)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
