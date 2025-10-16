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
  id: string;
  name: string;
  created_at: string;
}

interface ConfigVariable {
  id: string;
  config_id: string;
  account_code: string;
  name: string;
  calculation_type: 'AUTO' | 'MANUAL' | 'FORMULA';
  formula: string | null;
}

interface Props {
  onBack: () => void;
}

export default function ConfigurationForm({ onBack }: Props) {
  const [configs, setConfigs] = useState<SimulationConfig[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<SimulationConfig | null>(null);
  const [configName, setConfigName] = useState('');
  const [variables, setVariables] = useState<ConfigVariable[]>([]);
  const [editingVar, setEditingVar] = useState<Partial<ConfigVariable> | null>(null);
  const [expandedVars, setExpandedVars] = useState(new Set<string>());
  const { toast } = useToast();

  useEffect(() => {
    loadConfigs();
  }, []);

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
      .eq('config_id', configId)
      .order('account_code');
    setVariables(data || []);
  };

  const handleSaveConfig = async () => {
    if (!configName.trim()) {
      toast({ title: 'Atenção', description: 'Digite um nome para a configuração' });
      return;
    }

    if (selectedConfig) {
      const { error } = await supabase
        .from('simulation_configs')
        .update({ name: configName })
        .eq('id', selectedConfig.id);
      
      if (error) {
        toast({ title: 'Erro', description: 'Erro ao atualizar configuração', variant: 'destructive' });
        return;
      }
    } else {
      const { data, error } = await supabase
        .from('simulation_configs')
        .insert([{ name: configName }])
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
    loadVariables(config.id);
  };

  const handleNewConfig = () => {
    setSelectedConfig(null);
    setConfigName('');
    setVariables([]);
  };

  const handleDeleteConfig = async (id: string) => {
    if (!window.confirm('Eliminar esta configuração e todas as suas variáveis?')) return;

    const { error } = await supabase
      .from('simulation_configs')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast({ title: 'Erro', description: 'Erro ao eliminar configuração', variant: 'destructive' });
      return;
    }
    if (selectedConfig?.id === id) {
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

    if (!editingVar?.account_code || !editingVar?.name) {
      toast({ title: 'Atenção', description: 'Código e Nome são obrigatórios' });
      return;
    }

    if (editingVar.id) {
      const { error } = await supabase
        .from('simulation_configs_variables')
        .update({
          account_code: editingVar.account_code,
          name: editingVar.name,
          calculation_type: editingVar.calculation_type || 'AUTO',
          formula: editingVar.formula || null
        })
        .eq('id', editingVar.id);
      
      if (error) {
        toast({ title: 'Erro', description: 'Erro ao atualizar variável', variant: 'destructive' });
        return;
      }
    } else {
      const { error } = await supabase
        .from('simulation_configs_variables')
        .insert([{
          config_id: selectedConfig.id,
          account_code: editingVar.account_code,
          name: editingVar.name,
          calculation_type: editingVar.calculation_type || 'AUTO',
          formula: editingVar.formula || null
        }]);
      
      if (error) {
        toast({ title: 'Erro', description: 'Erro ao criar variável', variant: 'destructive' });
        return;
      }
    }
    setEditingVar(null);
    loadVariables(selectedConfig.id);
    toast({ title: 'Sucesso', description: 'Variável guardada' });
  };

  const handleDeleteVariable = async (id: string) => {
    if (!window.confirm('Eliminar esta variável?')) return;

    const { error } = await supabase
      .from('simulation_configs_variables')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast({ title: 'Erro', description: 'Erro ao eliminar variável', variant: 'destructive' });
      return;
    }
    if (selectedConfig) loadVariables(selectedConfig.id);
    toast({ title: 'Sucesso', description: 'Variável eliminada' });
  };

  const getIndentLevel = (accountCode: string) => {
    return accountCode.split('.').length - 1;
  };

  const hasChildren = (accountCode: string) => {
    return variables.some(v => 
      v.account_code.startsWith(accountCode + '.') && 
      v.account_code.split('.').length === accountCode.split('.').length + 1
    );
  };

  const toggleExpanded = (accountCode: string) => {
    setExpandedVars(prev => {
      const newSet = new Set(prev);
      if (newSet.has(accountCode)) {
        newSet.delete(accountCode);
      } else {
        newSet.add(accountCode);
      }
      return newSet;
    });
  };

  const isVisible = (variable: ConfigVariable) => {
    const level = getIndentLevel(variable.account_code);
    if (level === 0) return true;
    
    const parentCode = variable.account_code.substring(0, variable.account_code.lastIndexOf('.'));
    return expandedVars.has(parentCode);
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
                key={config.id}
                className={`p-3 border rounded-lg cursor-pointer flex justify-between items-center transition-colors ${
                  selectedConfig?.id === config.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
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
                    handleDeleteConfig(config.id);
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
                      onClick={() => setEditingVar({ account_code: '', name: '', calculation_type: 'AUTO' })}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Nova Variável
                    </Button>
                  </div>

                  {editingVar && (
                    <Card className="p-4 mb-4 bg-muted">
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <Label>Código</Label>
                          <Input
                            value={editingVar.account_code || ''}
                            onChange={(e) => setEditingVar({ ...editingVar, account_code: e.target.value })}
                            placeholder="Ex: 1.1.1"
                          />
                        </div>
                        <div>
                          <Label>Nome</Label>
                          <Input
                            value={editingVar.name || ''}
                            onChange={(e) => setEditingVar({ ...editingVar, name: e.target.value })}
                            placeholder="Ex: Vendas PT"
                          />
                        </div>
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
                    {variables.filter(isVisible).map(variable => {
                      const level = getIndentLevel(variable.account_code);
                      const children = hasChildren(variable.account_code);
                      const isExpanded = expandedVars.has(variable.account_code);
                      
                      return (
                        <div
                          key={variable.id}
                          className="flex items-center gap-2 p-2 border rounded-lg hover:bg-muted transition-colors"
                          style={{ paddingLeft: `${level * 20 + 8}px` }}
                        >
                          {children ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => toggleExpanded(variable.account_code)}
                            >
                              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </Button>
                          ) : (
                            <div className="w-6" />
                          )}
                          
                          <span className="font-mono text-sm text-muted-foreground">{variable.account_code}</span>
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
                            onClick={() => handleDeleteVariable(variable.id)}
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
        </Card>
      </div>
    </div>
  );
}
