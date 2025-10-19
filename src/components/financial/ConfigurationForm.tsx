import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit3, Trash2, ArrowUpDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';

interface SimulationConfig {
  id_sim_cfg: string;
  name: string;
  description: string | null;
  id_prj: string | null;
  id_lang?: string | null;
  created_at: string;
}

interface ConfigVariable {
  id_sim_cfg_var: string;
  id_sim_cfg: string;
  name: string;
  calculation_type: 'AUTO' | 'MANUAL' | 'FORMULA';
  formula: string | null;
  row_index: number;
  id_lob: string | null;
  id_lang?: string | null;
  blocked?: boolean;
  value_type?: string;
  account_num: string;
}

interface Props {
  onBack: () => void;
}

export default function ConfigurationForm({ onBack }: Props) {
  const [configs, setConfigs] = useState<SimulationConfig[]>([]);
  const [projects, setProjects] = useState<{ id_prj: string; desc_prj: string | null }[]>([]);
  const [programs, setPrograms] = useState<{ id_lob: string; name: string }[]>([]);
  const [languages, setLanguages] = useState<{ id_lang: string; desc_lang: string | null }[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<SimulationConfig | null>(null);
  const [configName, setConfigName] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedLanguageId, setSelectedLanguageId] = useState('');
  const [variables, setVariables] = useState<ConfigVariable[]>([]);
  const [editingVar, setEditingVar] = useState<Partial<ConfigVariable> | null>(null);
  const [expandedVars, setExpandedVars] = useState(new Set<string>());
  const { toast } = useToast();

  useEffect(() => {
    loadConfigs();
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      loadPrograms(selectedProjectId);
      loadLanguages(selectedProjectId);
    } else {
      setPrograms([]);
      setLanguages([]);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    if (selectedProjectId && selectedLanguageId) {
      loadConfigByProjectAndLanguage();
    }
  }, [selectedProjectId, selectedLanguageId]);

  const loadConfigByProjectAndLanguage = async () => {
    const { data } = await supabase
      .from('simulation_configs')
      .select('*')
      .eq('id_prj', selectedProjectId)
      .eq('id_lang', selectedLanguageId)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (data && data.length > 0) {
      handleSelectConfig(data[0]);
    } else {
      setVariables([]);
      setSelectedConfig(null);
    }
  };

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

  const loadPrograms = async (projectId: string) => {
    const { data, error } = await supabase
      .from('lob')
      .select('id_lob, name, lang!inner(id_prj)')
      .eq('lang.id_prj', projectId)
      .order('name');
    
    if (error) {
      toast({ title: 'Erro', description: 'Erro ao carregar programas', variant: 'destructive' });
      return;
    }
    setPrograms(data || []);
  };

  const loadLanguages = async (projectId: string) => {
    const { data, error } = await supabase
      .from('lang')
      .select('id_lang, desc_lang')
      .eq('id_prj', projectId)
      .order('id_lang');
    
    if (error) {
      toast({ title: 'Erro', description: 'Erro ao carregar linguagens', variant: 'destructive' });
      return;
    }
    setLanguages(data || []);
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
      calculation_type: (v.calculation_type || 'AUTO') as 'AUTO' | 'MANUAL' | 'FORMULA',
      id_lob: (v as any).id_lob || null,
      id_lang: (v as any).id_lang || null,
      account_num: (v as any).account_num || ''
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

    if (!selectedLanguageId) {
      toast({ title: 'Atenção', description: 'Selecione uma linguagem' });
      return;
    }

    if (selectedConfig) {
      const { error } = await supabase
        .from('simulation_configs')
        .update({ name: configName, id_prj: selectedProjectId, id_lang: selectedLanguageId })
        .eq('id_sim_cfg', selectedConfig.id_sim_cfg);
      
      if (error) {
        toast({ title: 'Erro', description: 'Erro ao atualizar configuração', variant: 'destructive' });
        return;
      }
    } else {
      const { data, error } = await supabase
        .from('simulation_configs')
        .insert([{ name: configName, id_prj: selectedProjectId, id_lang: selectedLanguageId }])
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
    setSelectedLanguageId(config.id_lang || '');
    loadVariables(config.id_sim_cfg);
  };

  const handleNewConfig = () => {
    setSelectedConfig(null);
    setConfigName('');
    setSelectedProjectId('');
    setSelectedLanguageId('');
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

    if (!editingVar?.account_num) {
      toast({ title: 'Atenção', description: 'Número da conta é obrigatório' });
      return;
    }

    if (!editingVar?.name) {
      toast({ title: 'Atenção', description: 'Nome é obrigatório' });
      return;
    }

    if (!editingVar?.id_lob) {
      toast({ title: 'Atenção', description: 'Programa (LOB) é obrigatório' });
      return;
    }

    if (editingVar.id_sim_cfg_var) {
      const { error } = await supabase
        .from('simulation_configs_variables')
        .update({
          account_num: editingVar.account_num,
          name: editingVar.name,
          calculation_type: editingVar.calculation_type || 'AUTO',
          formula: editingVar.formula || null,
          id_lob: editingVar.id_lob || null,
          id_lang: editingVar.id_lang || null,
          blocked: editingVar.blocked || false,
          value_type: editingVar.value_type || 'number'
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
          account_num: editingVar.account_num,
          name: editingVar.name,
          calculation_type: editingVar.calculation_type || 'AUTO',
          formula: editingVar.formula || null,
          id_lob: editingVar.id_lob || null,
          id_lang: editingVar.id_lang || null,
          blocked: editingVar.blocked || false,
          value_type: editingVar.value_type || 'number',
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


  const getHierarchyLevel = (accountNum: string): number => {
    // Conta os pontos no account_num para determinar o nível (ex: "1" = 0, "1.1" = 1, "1.1.1" = 2)
    if (!accountNum) return 0;
    return (accountNum.match(/\./g) || []).length;
  };

  const handleSortByAccountNum = async () => {
    if (!selectedConfig) return;
    
    // Função para ordenar hierarquicamente
    const sortHierarchically = (a: ConfigVariable, b: ConfigVariable) => {
      const aParts = a.account_num.split('.').map(Number);
      const bParts = b.account_num.split('.').map(Number);
      
      for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
        const aVal = aParts[i] || 0;
        const bVal = bParts[i] || 0;
        if (aVal !== bVal) return aVal - bVal;
      }
      return 0;
    };

    const sortedVariables = [...variables].sort(sortHierarchically);
    
    // Atualizar row_index na base de dados
    for (let i = 0; i < sortedVariables.length; i++) {
      await supabase
        .from('simulation_configs_variables')
        .update({ row_index: i + 1 })
        .eq('id_sim_cfg_var', sortedVariables[i].id_sim_cfg_var);
    }
    
    loadVariables(selectedConfig.id_sim_cfg);
    toast({ title: 'Sucesso', description: 'Variáveis ordenadas por número de conta' });
  };


  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-3xl font-bold">Simulation Templates</h2>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          {/* Dropdown de Seleção de Configuração */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Selecionar Template</Label>
              <Button size="sm" variant="outline" onClick={handleNewConfig}>
                <Plus className="h-4 w-4 mr-1" />
                Novo Template
              </Button>
            </div>
            <div className="flex gap-2">
              <Select
                value={selectedConfig?.id_sim_cfg || ''}
                onValueChange={(value) => {
                  const config = configs.find(c => c.id_sim_cfg === value);
                  if (config) handleSelectConfig(config);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um template existente" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  {configs.map((config) => (
                    <SelectItem key={config.id_sim_cfg} value={config.id_sim_cfg}>
                      {config.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedConfig && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteConfig(selectedConfig.id_sim_cfg)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-bold text-lg mb-4">
              {selectedConfig ? 'Editar Template' : 'Novo Template'}
            </h3>
            
            <div className="space-y-6">
            <div>
              <Label>Projeto *</Label>
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
              <Label>Linguagem *</Label>
              <Select
                value={selectedLanguageId}
                onValueChange={(value) => setSelectedLanguageId(value)}
                disabled={!selectedProjectId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma linguagem" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  {languages.map((language) => (
                    <SelectItem key={language.id_lang} value={language.id_lang}>
                      {language.id_lang} {language.desc_lang && `- ${language.desc_lang}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Nome da Configuração *</Label>
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
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleSortByAccountNum}
                      >
                        <ArrowUpDown className="h-4 w-4 mr-1" />
                        Ordenar por Conta
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setEditingVar({ 
                          id_sim_cfg_var: '', 
                          id_sim_cfg: selectedConfig.id_sim_cfg, 
                          name: '', 
                          calculation_type: 'AUTO', 
                          formula: null, 
                          row_index: 0, 
                          account_num: '',
                          id_lob: null,
                          id_lang: selectedLanguageId || null
                        })}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Nova Variável
                      </Button>
                    </div>
                  </div>

                   {editingVar && (
                    <Card className="p-4 mb-4 bg-muted">
                      <div className="mb-3">
                        <Label>Número da Conta *</Label>
                        <Input
                          value={editingVar.account_num || ''}
                          onChange={(e) => setEditingVar({ ...editingVar, account_num: e.target.value })}
                          placeholder="Ex: 1, 1.1, 1.1.1"
                        />
                      </div>
                      <div className="mb-3">
                        <Label>Nome</Label>
                        <Input
                          value={editingVar.name || ''}
                          onChange={(e) => setEditingVar({ ...editingVar, name: e.target.value })}
                          placeholder="Ex: Vendas PT"
                        />
                      </div>
                      <div className="mb-3">
                        <Label>Programa (LOB) *</Label>
                        <Select
                          value={editingVar.id_lob || undefined}
                          onValueChange={(value) => setEditingVar({ ...editingVar, id_lob: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um programa" />
                          </SelectTrigger>
                          <SelectContent className="bg-background z-50">
                            {programs.map((program) => (
                              <SelectItem key={program.id_lob} value={program.id_lob}>
                                {program.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="mb-3">
                        <Label>Linguagem</Label>
                        <Select
                          value={editingVar.id_lang || undefined}
                          onValueChange={(value) => setEditingVar({ ...editingVar, id_lang: value })}
                          disabled
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={editingVar.id_lang || "Automático do template"} />
                          </SelectTrigger>
                          <SelectContent className="bg-background z-50">
                            {languages.map((language) => (
                              <SelectItem key={language.id_lang} value={language.id_lang}>
                                {language.id_lang} {language.desc_lang && `- ${language.desc_lang}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="mb-3">
                        <Label>Tipo de Valor</Label>
                        <Select
                          value={editingVar.value_type || 'number'}
                          onValueChange={(value) => setEditingVar({ ...editingVar, value_type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-background z-50">
                            <SelectItem value="number">Número</SelectItem>
                            <SelectItem value="text">Texto</SelectItem>
                            <SelectItem value="percentage">Percentagem</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="mb-3 flex items-center space-x-2">
                        <Checkbox
                          id="blocked"
                          checked={editingVar.blocked || false}
                          onCheckedChange={(checked) => setEditingVar({ ...editingVar, blocked: checked as boolean })}
                        />
                        <Label htmlFor="blocked" className="cursor-pointer">
                          Bloqueada (não editável)
                        </Label>
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
                          <SelectContent className="bg-background z-50">
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
                     {variables.map((variable, index) => {
                       const level = getHierarchyLevel(variable.account_num);
                       
                       return (
                          <div
                            key={variable.id_sim_cfg_var}
                            className="flex items-center gap-2 p-2 border rounded-lg hover:bg-muted transition-colors"
                            style={{ marginLeft: `${level * 1.5}rem` }}
                          >
                            {level > 0 && (
                              <span className="text-muted-foreground text-sm">└─</span>
                            )}
                            <span className="text-sm font-mono text-muted-foreground">{variable.account_num}</span>
                           <span className="flex-1">{variable.name}</span>
                           {variable.blocked && <span className="text-xs" title="Bloqueada">🔒</span>}
                           <span className="text-xs" title={
                             variable.calculation_type === 'FORMULA' ? 'Fórmula' : 
                             variable.calculation_type === 'MANUAL' ? 'Manual' : 'Automático'
                           }>
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
                       );
                     })}
                   </div>
                </div>
              </>
            )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
