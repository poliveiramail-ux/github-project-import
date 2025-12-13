import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Plus, Edit3, Trash2, ArrowUpDown, ChevronRight, ChevronDown, HelpCircle, AlertCircle, FunctionSquare, FileSpreadsheet } from 'lucide-react';
import FormulaHelp from './FormulaHelp';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { validateOrFormula, isOrFormula } from '@/lib/formulaOrEvaluator';

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
  calculation_type: 'MANUAL' | 'FORMULA';
  formula: string | null;
  row_index: number;
  id_lang?: string | null;
  id_lob?: string | null;
  blocked?: boolean;
  value_type?: string;
  account_num: string;
  parent_account_id?: string | null;
  level?: number;
  page_name?: string;
  data_origin?: string | null;
  rollup?: string; // 'true', 'false', or 'hidden'
}

interface Props {
  onBack: () => void;
}

export default function ConfigurationForm({ onBack }: Props) {
  const [configs, setConfigs] = useState<SimulationConfig[]>([]);
  const [projects, setProjects] = useState<{ id_prj: string; desc_prj: string | null }[]>([]);
  const [languages, setLanguages] = useState<{ id_lang: string; desc_lang: string | null }[]>([]);
  const [lobs, setLobs] = useState<{ id_lob: string; name: string; id_lang: string }[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<SimulationConfig | null>(null);
  const [configName, setConfigName] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedLanguageId, setSelectedLanguageId] = useState('');
  const [variables, setVariables] = useState<ConfigVariable[]>([]);
  const [editingVar, setEditingVar] = useState<Partial<ConfigVariable> | null>(null);
  const [expandedVars, setExpandedVars] = useState(new Set<string>());
  const [justSaved, setJustSaved] = useState(false);
  const [showFormulaHelp, setShowFormulaHelp] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const { toast } = useToast();

  // Get unique page names from variables
  const pageNames = useMemo(() => {
    const pages = new Set<string>();
    pages.add('Main'); // Always include Main
    variables.forEach(v => {
      if (v.page_name) pages.add(v.page_name);
    });
    return Array.from(pages).sort();
  }, [variables]);

  useEffect(() => {
    loadConfigs();
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      loadLanguages(selectedProjectId);
    } else {
      setLanguages([]);
      setLobs([]);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    if (languages.length > 0) {
      loadLobs();
    }
  }, [languages]);

  useEffect(() => {
    if (selectedProjectId) {
      loadConfigByProject();
    }
  }, [selectedProjectId]);

  const loadConfigByProject = async () => {
    const { data } = await supabase
      .from('simulation_configs')
      .select('*')
      .eq('id_prj', selectedProjectId)
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
      toast({ title: 'Error', description: 'Error loading projects', variant: 'destructive' });
      return;
    }
    setProjects(data || []);
  };

  const loadLanguages = async (projectId: string) => {
    const { data, error } = await supabase
      .from('lang')
      .select('id_lang, desc_lang')
      .eq('id_prj', projectId)
      .order('id_lang');
    
    if (error) {
      toast({ title: 'Error', description: 'Error loading languages', variant: 'destructive' });
      return;
    }
    setLanguages(data || []);
  };

  const loadLobs = async () => {
    // Get all LOBs from all languages in the project
    const languageIds = languages.map(l => l.id_lang);
    if (languageIds.length === 0) return;
    
    const { data, error } = await supabase
      .from('lob')
      .select('id_lob, name, id_lang')
      .in('id_lang', languageIds)
      .order('id_lob');
    
    if (error) {
      toast({ title: 'Error', description: 'Error loading LOBs', variant: 'destructive' });
      return;
    }
    setLobs(data || []);
  };

  const loadConfigs = async () => {
    const { data } = await supabase
      .from('simulation_configs')
      .select('*')
      .order('created_at', { ascending: false });
    setConfigs(data || []);
  };

  // Função para ordenar variáveis hierarquicamente
  const sortVariablesHierarchically = (vars: ConfigVariable[]): ConfigVariable[] => {
    const result: ConfigVariable[] = [];
    const processedIds = new Set<string>();

    const addWithChildren = (variable: ConfigVariable) => {
      if (processedIds.has(variable.id_sim_cfg_var)) return;
      
      result.push(variable);
      processedIds.add(variable.id_sim_cfg_var);

      // Adicionar filhas imediatamente após o pai
      const children = vars
        .filter(v => v.parent_account_id === variable.id_sim_cfg_var && v.parent_account_id !== v.id_sim_cfg_var)
        .sort((a, b) => a.account_num.localeCompare(b.account_num));
      
      children.forEach(child => addWithChildren(child));
    };

    // Começar com as contas raiz (sem pai ou com referência circular)
    const rootVars = vars
      .filter(v => !v.parent_account_id || v.parent_account_id === v.id_sim_cfg_var)
      .sort((a, b) => a.account_num.localeCompare(b.account_num));
    
    console.log('🌱 Root variables found:', rootVars.length);
    rootVars.forEach(rootVar => addWithChildren(rootVar));

    console.log('✅ Hierarchical sort complete:', result.length, 'variables processed');
    return result;
  };

  const loadVariables = async (configId: string) => {
    console.log('🔍 Loading variables for config:', configId);
    const { data, error } = await supabase
      .from('simulation_configs_variables')
      .select('*')
      .eq('id_sim_cfg', configId)
      .order('row_index');
    
    console.log('📦 Raw data from DB:', data);
    console.log('❌ Error:', error);
    
    const mappedVars = (data || []).map(v => ({
      ...v,
      calculation_type: (v.calculation_type === 'AUTO' ? 'MANUAL' : v.calculation_type || 'MANUAL') as 'MANUAL' | 'FORMULA',
      id_lang: (v as any).id_lang || null,
      account_num: (v as any).account_num || '',
      parent_account_id: (v as any).parent_account_id || null,
      level: parseInt((v as any).level || '0', 10),
      page_name: (v as any).page_name || 'Main',
      data_origin: (v as any).data_origin || null,
      rollup: typeof v.rollup === 'boolean' ? (v.rollup ? 'true' : 'false') : (v.rollup || 'true')
    }));

    console.log('🗺️ Mapped variables:', mappedVars);
    
    // Ordenar hierarquicamente antes de definir o estado
    const sorted = sortVariablesHierarchically(mappedVars);
    console.log('📊 Sorted variables:', sorted);
    setVariables(sorted);
  };

  const handleSaveConfig = async () => {
    if (!configName.trim()) {
      toast({ title: 'Attention', description: 'Enter a name for the configuration' });
      return;
    }

    if (!selectedProjectId) {
      toast({ title: 'Attention', description: 'Select a project' });
      return;
    }

    if (selectedConfig) {
      const { error } = await supabase
        .from('simulation_configs')
        .update({ name: configName, id_prj: selectedProjectId })
        .eq('id_sim_cfg', selectedConfig.id_sim_cfg);
      
      if (error) {
        toast({ title: 'Error', description: 'Error updating configuration', variant: 'destructive' });
        return;
      }
    } else {
      const { data, error } = await supabase
        .from('simulation_configs')
        .insert([{ name: configName, id_prj: selectedProjectId } as any])
        .select();
      
      if (error) {
        toast({ title: 'Error', description: 'Error creating configuration', variant: 'destructive' });
        return;
      }
      if (data && data[0]) {
        setSelectedConfig(data[0]);
      }
    }
    loadConfigs();
    toast({ title: 'Success', description: 'Configuration saved' });
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
    setSelectedLanguageId('');
    setVariables([]);
  };

  const handleDeleteConfig = async (id: string) => {
    if (!window.confirm('Delete this configuration and all its variables?')) return;

    const { error } = await supabase
      .from('simulation_configs')
      .delete()
      .eq('id_sim_cfg', id);
    
    if (error) {
      toast({ title: 'Error', description: 'Error deleting configuration', variant: 'destructive' });
      return;
    }
    if (selectedConfig?.id_sim_cfg === id) {
      handleNewConfig();
    }
    loadConfigs();
    toast({ title: 'Success', description: 'Configuration deleted' });
  };

  const handleSaveVariable = async () => {
    if (!selectedConfig) {
      toast({ title: 'Attention', description: 'Select a configuration first' });
      return;
    }

    if (!editingVar?.account_num) {
      toast({ title: 'Attention', description: 'Account number is required' });
      return;
    }

    if (!editingVar?.name) {
      toast({ title: 'Attention', description: 'Name is required' });
      return;
    }

    // Validar fórmula se for tipo FORMULA
    if (editingVar.calculation_type === 'FORMULA' && editingVar.formula) {
      const validation = validateOrFormula(
        editingVar.formula,
        editingVar.account_num,
        () => variables.map(v => ({ account_code: v.account_num, formula: v.formula }))
      );
      
      if (!validation.valid) {
        toast({ 
          title: 'Formula error', 
          description: validation.error, 
          variant: 'destructive' 
        });
        return;
      }
    }

    // Calcular o level baseado na conta pai
    const parentLevel = editingVar.parent_account_id 
      ? (variables.find(v => v.id_sim_cfg_var === editingVar.parent_account_id)?.level || 0)
      : -1;
    const calculatedLevel = parentLevel + 1;

    if (editingVar.id_sim_cfg_var) {
      const { error } = await supabase
        .from('simulation_configs_variables')
        .update({
          account_num: editingVar.account_num,
          name: editingVar.name,
          calculation_type: editingVar.calculation_type || 'MANUAL',
          formula: editingVar.formula || null,
          id_lang: editingVar.id_lang || null,
          id_lob: editingVar.id_lob || null,
          blocked: editingVar.blocked || false,
          value_type: editingVar.value_type || 'number',
          parent_account_id: editingVar.parent_account_id || null,
          level: calculatedLevel,
          page_name: editingVar.page_name || 'Main',
          data_origin: editingVar.data_origin || null,
          rollup: editingVar.rollup || 'true' as any
        })
        .eq('id_sim_cfg_var', editingVar.id_sim_cfg_var);
      
      if (error) {
        console.error('Error updating variable:', error);
        toast({ title: 'Error', description: `Error updating variable: ${error.message}`, variant: 'destructive' });
        return;
      }
    } else {
      const { error } = await supabase
        .from('simulation_configs_variables')
        .insert([{
          id_sim_cfg: selectedConfig.id_sim_cfg,
          account_num: editingVar.account_num,
          name: editingVar.name,
          calculation_type: editingVar.calculation_type || 'MANUAL',
          formula: editingVar.formula || null,
          id_lang: editingVar.id_lang || null,
          id_lob: editingVar.id_lob || null,
          blocked: editingVar.blocked || false,
          value_type: editingVar.value_type || 'number',
          row_index: variables.length + 1,
          id_proj: selectedProjectId,
          parent_account_id: editingVar.parent_account_id || null,
          level: calculatedLevel,
          page_name: editingVar.page_name || 'Main',
          data_origin: editingVar.data_origin || null,
          rollup: (editingVar.rollup || 'true') as any
        }]);
      
      if (error) {
        console.error('Error creating variable:', error);
        toast({ title: 'Error', description: `Error creating variable: ${error.message}`, variant: 'destructive' });
        return;
      }
    }
      setEditingVar(null);
    loadVariables(selectedConfig.id_sim_cfg);
    
    // Mostrar feedback visual no botão
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 3000);
  };

  const handleDeleteVariable = async (id: string) => {
    if (!window.confirm('Delete this variable?')) return;

    const { error } = await supabase
      .from('simulation_configs_variables')
      .delete()
      .eq('id_sim_cfg_var', id);
    
    if (error) {
      toast({ title: 'Error', description: 'Error deleting variable', variant: 'destructive' });
      return;
    }
    if (selectedConfig) loadVariables(selectedConfig.id_sim_cfg);
    toast({ title: 'Success', description: 'Variable deleted' });
  };


  // Filtrar variáveis que podem ser pais da variável atual
  const getAvailableParents = () => {
    if (!editingVar) return [];
    
    // Se estamos editando, excluir a própria variável e seus filhos
    if (editingVar.id_sim_cfg_var) {
      return variables.filter(v => {
        // Não pode ser pai de si mesmo
        if (v.id_sim_cfg_var === editingVar.id_sim_cfg_var) return false;
        // Não pode ser filho da variável atual (evitar loops)
        if (v.parent_account_id === editingVar.id_sim_cfg_var) return false;
        return true;
      });
    }
    
    return variables;
  };

  // Verificar se uma conta tem filhos
  const hasChildren = (varId: string) => {
    return variables.some(v => v.parent_account_id === varId);
  };

  // Toggle de expansão/colapso
  const toggleExpanded = (varId: string) => {
    setExpandedVars(prev => {
      const newSet = new Set(prev);
      if (newSet.has(varId)) {
        newSet.delete(varId);
      } else {
        newSet.add(varId);
      }
      return newSet;
    });
  };

  // Filtrar variáveis visíveis (apenas raízes e filhos de pais expandidos)
  const getVisibleVariables = () => {
    const visible = variables.filter(variable => {
      // Contas raiz são sempre visíveis (sem pai ou com referência circular)
      if (!variable.parent_account_id || variable.parent_account_id === variable.id_sim_cfg_var) return true;
      
      // Contas filhas são visíveis apenas se o pai está expandido
      return expandedVars.has(variable.parent_account_id);
    });
    console.log('👁️ Visible variables:', visible.length, 'out of', variables.length);
    console.log('📋 Variables list:', variables);
    console.log('🔓 Expanded vars:', Array.from(expandedVars));
    return visible;
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
    toast({ title: 'Success', description: 'Variables sorted by account number' });
  };


  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-3xl font-bold">ConfigurationForm</h2>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          {/* Configuration Selection Dropdown */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Select Template</Label>
              <Button size="sm" variant="outline" onClick={handleNewConfig}>
                <Plus className="h-4 w-4 mr-1" />
                New Template
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
                  <SelectValue placeholder="Select an existing template" />
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
              {selectedConfig ? 'Edit Template' : 'New Template'}
            </h3>
            
            <div className="space-y-6">
            <div>
              <Label>Project *</Label>
              <Select
                value={selectedProjectId}
                onValueChange={(value) => setSelectedProjectId(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
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
              <Label>Configuration Name *</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={configName}
                  onChange={(e) => setConfigName(e.target.value)}
                  placeholder="E.g.: Chart of Accounts 2025"
                />
                <Button onClick={handleSaveConfig}>Save</Button>
              </div>
            </div>

            {selectedConfig && (
              <>
                <div className="border-t pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold">Variables</h4>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowFormulaHelp(true)}
                      >
                        <HelpCircle className="h-4 w-4 mr-1" />
                        Formula Help
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleSortByAccountNum}
                      >
                        <ArrowUpDown className="h-4 w-4 mr-1" />
                        Sort by Account
                      </Button>
                       <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setEditingVar({ 
                          id_sim_cfg_var: '', 
                          id_sim_cfg: selectedConfig.id_sim_cfg, 
                          name: '', 
                          calculation_type: 'MANUAL', 
                          formula: null, 
                          row_index: 0, 
                          account_num: '',
                          id_lang: languages[0]?.id_lang || null,
                          id_lob: null,
                          rollup: 'true'
                        })}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        New Variable
                      </Button>
                    </div>
                  </div>

                   {editingVar && (
                    <Card className="p-4 mb-4 bg-muted">
                       <div className="mb-3">
                        <Label>Parent Account (Hierarchy)</Label>
                        <Select
                          value={editingVar.parent_account_id || 'none'}
                          onValueChange={(value) => setEditingVar({ ...editingVar, parent_account_id: value === 'none' ? null : value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Root level account" />
                          </SelectTrigger>
                          <SelectContent className="bg-background z-50">
                            <SelectItem value="none">-- Root Level Account --</SelectItem>
                            {getAvailableParents().map((variable) => (
                              <SelectItem key={variable.id_sim_cfg_var} value={variable.id_sim_cfg_var}>
                                {'  '.repeat(variable.level || 0)}{variable.account_num} - {variable.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="mb-3">
                        <Label>Account Number *</Label>
                        <Input
                          value={editingVar.account_num || ''}
                          onChange={(e) => setEditingVar({ ...editingVar, account_num: e.target.value })}
                          placeholder="E.g.: 1, 1.1, 1.1.1"
                        />
                      </div>
                      <div className="mb-3">
                        <Label>Name</Label>
                        <Input
                          value={editingVar.name || ''}
                          onChange={(e) => setEditingVar({ ...editingVar, name: e.target.value })}
                          placeholder="E.g.: Sales PT"
                        />
                      </div>
                      <div className="mb-3">
                        <Label>Language</Label>
                        <Select
                          value={editingVar.id_lang || undefined}
                          onValueChange={(value) => setEditingVar({ ...editingVar, id_lang: value === 'none' ? null : value, id_lob: null })}
                          disabled={!selectedProjectId}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a language" />
                          </SelectTrigger>
                          <SelectContent className="bg-background z-50">
                            <SelectItem value="none">-- Clear selection --</SelectItem>
                            {languages.map((language) => (
                              <SelectItem key={language.id_lang} value={language.id_lang}>
                                {language.id_lang} {language.desc_lang && `- ${language.desc_lang}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="mb-3">
                        <Label>LOB</Label>
                        <Select
                          value={editingVar.id_lob || undefined}
                          onValueChange={(value) => setEditingVar({ ...editingVar, id_lob: value === 'none' ? null : value })}
                          disabled={!editingVar.id_lang}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a LOB" />
                          </SelectTrigger>
                          <SelectContent className="bg-background z-50">
                            <SelectItem value="none">-- Clear selection --</SelectItem>
                            {lobs
                              .filter((lob: any) => !editingVar.id_lang || lob.id_lang === editingVar.id_lang)
                              .map((lob) => (
                                <SelectItem key={lob.id_lob} value={lob.id_lob}>
                                  {lob.name || lob.id_lob}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="mb-3">
                        <Label>Value Type</Label>
                        <Select
                          value={editingVar.value_type || 'number'}
                          onValueChange={(value) => setEditingVar({ ...editingVar, value_type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-background z-50">
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="percentage">Percentage</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="mb-3">
                        <Label className="flex items-center gap-2">
                          <FileSpreadsheet className="h-4 w-4" />
                          Page (Sheet)
                        </Label>
                        <div className="flex gap-2">
                          <Select
                            value={editingVar.page_name || 'Main'}
                            onValueChange={(value) => setEditingVar({ ...editingVar, page_name: value })}
                          >
                            <SelectTrigger className="flex-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-background z-50">
                              {pageNames.map((page) => (
                                <SelectItem key={page} value={page}>
                                  {page}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div className="flex gap-1">
                            <Input
                              value={newPageName}
                              onChange={(e) => setNewPageName(e.target.value)}
                              placeholder="New page..."
                              className="w-32"
                            />
                            <Button
                              type="button"
                              size="icon"
                              variant="outline"
                              onClick={() => {
                                if (newPageName.trim()) {
                                  setEditingVar({ ...editingVar, page_name: newPageName.trim() });
                                  setNewPageName('');
                                }
                              }}
                              disabled={!newPageName.trim()}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="mb-3">
                        <Label>Data Origin</Label>
                        <Input
                          value={editingVar.data_origin || ''}
                          onChange={(e) => setEditingVar({ ...editingVar, data_origin: e.target.value })}
                          placeholder="E.g.: SAP, Excel, Manual, External API..."
                        />
                      </div>
                      <div className="mb-3 flex items-center space-x-2">
                        <Checkbox
                          id="blocked"
                          checked={editingVar.blocked || false}
                          onCheckedChange={(checked) => setEditingVar({ ...editingVar, blocked: checked as boolean })}
                        />
                        <Label htmlFor="blocked" className="cursor-pointer">
                          Blocked (not editable)
                        </Label>
                      </div>
                      <div className="mb-3">
                        <Label>RollUp (value aggregation)</Label>
                        <Select
                          value={editingVar.rollup || 'true'}
                          onValueChange={(value) => setEditingVar({ ...editingVar, rollup: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-background z-50">
                            <SelectItem value="true">Yes (include in aggregation)</SelectItem>
                            <SelectItem value="false">No (show individually)</SelectItem>
                            <SelectItem value="hidden">Hidden (exclude and hide)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="mb-3">
                        <Label>Calculation Type</Label>
                        <Select
                          value={editingVar.calculation_type || 'MANUAL'}
                          onValueChange={(value: 'MANUAL' | 'FORMULA') => 
                            setEditingVar({ ...editingVar, calculation_type: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-background z-50">
                            <SelectItem value="MANUAL">Manual</SelectItem>
                            <SelectItem value="FORMULA">Formula</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {editingVar.calculation_type === 'FORMULA' && (
                        <div className="mb-3">
                          <Label className="flex items-center gap-2">
                            <FunctionSquare className="h-4 w-4" />
                            Formula (max 5 sub-formulas with OR)
                          </Label>
                          <Textarea
                            value={editingVar.formula || ''}
                            onChange={(e) => setEditingVar({ ...editingVar, formula: e.target.value })}
                            className="font-mono min-h-[100px]"
                            placeholder="E.g.: [1.1] * 1.2 OR [1.2] * 0.9 OR 50000"
                          />
                          <Alert className="mt-2">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-xs">
                              Sub-formulas are evaluated in order. The first valid one will be used.
                              Use <code className="bg-muted px-1 rounded">OR</code> to separate alternatives.
                            </AlertDescription>
                          </Alert>
                          {editingVar.formula && isOrFormula(editingVar.formula) && (
                            <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded text-xs">
                              <strong>OR Formula detected:</strong>
                              <ul className="mt-1 list-disc list-inside">
                                {editingVar.formula.split(/\s+OR\s+/i).map((sub, i) => (
                                  <li key={i} className="font-mono">{sub.trim()}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={handleSaveVariable}
                          className={justSaved ? 'bg-green-600 hover:bg-green-700' : ''}
                        >
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingVar(null)}>Cancel</Button>
                      </div>
                    </Card>
                  )}

                   <div className="space-y-1 max-h-96 overflow-y-auto">
                     {getVisibleVariables().map((variable, index) => {
                       const level = variable.level || 0;
                       const hasChildVars = hasChildren(variable.id_sim_cfg_var);
                       const isExpanded = expandedVars.has(variable.id_sim_cfg_var);
                       
                       return (
                          <div
                            key={variable.id_sim_cfg_var}
                            className="flex items-center gap-2 p-2 border rounded-lg hover:bg-muted transition-colors"
                            style={{ marginLeft: `${level * 1.5}rem` }}
                          >
                             {/* Expand/collapse button (only if has children) */}
                             {hasChildVars ? (
                               <Button
                                 variant="ghost"
                                 size="icon"
                                 className="h-6 w-6 p-0"
                                 onClick={() => toggleExpanded(variable.id_sim_cfg_var)}
                                 title={isExpanded ? "Collapse" : "Expand"}
                               >
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </Button>
                            ) : (
                              <div className="w-6" />
                            )}

                            {level > 0 && (
                              <span className="text-muted-foreground text-sm">└─</span>
                            )}
                            <span className="text-sm font-mono text-muted-foreground">{variable.account_num}</span>
                           <span className="flex-1">{variable.name}</span>
                           {variable.page_name && variable.page_name !== 'Main' && (
                             <span className="text-xs bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded flex items-center gap-1" title={`Page: ${variable.page_name}`}>
                               <FileSpreadsheet className="h-3 w-3" />
                               {variable.page_name}
                             </span>
                           )}
                           {variable.blocked && <span className="text-xs" title="Blocked">🔒</span>}
                           {variable.calculation_type === 'FORMULA' && (
                             <div className="flex items-center gap-1">
                               <FunctionSquare className="h-3.5 w-3.5 text-blue-500" />
                               <span className="text-xs bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded" title={variable.formula || ''}>
                                 fx
                               </span>
                             </div>
                           )}
                           {variable.calculation_type === 'MANUAL' && (
                             <span className="text-xs" title="Manual">✏️</span>
                           )}
                           
                           <Button
                             variant="ghost"
                             size="icon"
                             className="h-8 w-8"
                             onClick={() => setEditingVar({ 
                               id_sim_cfg_var: '', 
                               id_sim_cfg: selectedConfig.id_sim_cfg, 
                               name: '', 
                               calculation_type: 'MANUAL', 
                               formula: null, 
                               row_index: 0, 
                               account_num: '',
                               id_lang: variable.id_lang,
                               id_lob: variable.id_lob,
                               parent_account_id: variable.id_sim_cfg_var
                             })}
                             title="Add sub-account"
                           >
                             <Plus className="h-4 w-4" />
                           </Button>
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
      
      <FormulaHelp open={showFormulaHelp} onOpenChange={setShowFormulaHelp} />
    </div>
  );
}
