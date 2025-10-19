import { useState, useEffect } from 'react';
import { Menu, Plus, Save, CheckCircle, XCircle, Lock, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface Project {
  id_prj: string;
  desc_prj: string | null;
}

interface Language {
  id_lang: string;
  desc_lang: string | null;
}

interface SimulationVersion {
  id: string;
  name: string;
  id_prj: string;
  id_lang: string;
  created_at: string;
}

interface Variable {
  id_sim: string;
  version_id: string;
  account_code: string;
  name: string;
  calculation_type: 'AUTO' | 'MANUAL' | 'FORMULA';
  formula: string | null;
  month: number;
  year: number;
}

interface VariableValue {
  variable_id: string;
  account_code: string;
  month: number;
  year: number;
  value: number;
}

interface Props {
  onMenuClick: () => void;
}

interface MonthYear {
  month: number;
  year: number;
  label: string;
}

const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export default function SimulationForm({ onMenuClick }: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [variables, setVariables] = useState<Variable[]>([]);
  const [variableValues, setVariableValues] = useState<Map<string, number>>(new Map());
  const [versions, setVersions] = useState<SimulationVersion[]>([]);
  const [currentVersionId, setCurrentVersionId] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState(new Set<string>());
  const [loading, setLoading] = useState(true);
  const [showNewVersionModal, setShowNewVersionModal] = useState(false);
  const [newVersionName, setNewVersionName] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [periods, setPeriods] = useState<MonthYear[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadLanguages(selectedProject);
    } else {
      setLanguages([]);
      setSelectedLanguage('');
    }
  }, [selectedProject]);

  const loadProjects = async () => {
    const { data } = await supabase.from('project').select('id_prj, desc_prj').order('id_prj');
    setProjects((data || []).map(p => ({ id_prj: p.id_prj, desc_prj: p.desc_prj })));
    setLoading(false);
  };

  const loadLanguages = async (projectId: string) => {
    const { data } = await supabase
      .from('lang')
      .select('id_lang, desc_lang')
      .eq('id_prj', projectId)
      .order('id_lang');
    setLanguages((data || []).map(l => ({ id_lang: l.id_lang, desc_lang: l.desc_lang })));
  };

  const loadVersions = async (projectId: string, languageId: string) => {
    const { data } = await (supabase as any)
      .from('simulation_versions')
      .select('*')
      .eq('id_prj', projectId)
      .eq('id_lang', languageId)
      .order('created_at', { ascending: false });
    
    const mappedData = (data || []).map((v: any) => ({
      id: v.id_sim_ver,
      name: v.name,
      id_prj: projectId,
      id_lang: languageId,
      created_at: v.created_at
    }));
    setVersions(mappedData);
    
    if (mappedData && mappedData.length > 0) {
      loadVersion(mappedData[0].id);
    } else {
      setVariables([]);
      setVariableValues(new Map());
      setPeriods([]);
      setCurrentVersionId(null);
    }
  };

  const loadVersion = async (versionId: string) => {
    const { data } = await (supabase as any)
      .from('simulation')
      .select('*')
      .eq('version_id', versionId)
      .order('account_code');
    
    if (data) {
      const monthColumns = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      
      const vars = data.map((v: any) => ({
        ...v,
        calculation_type: (v.calculation_type || 'AUTO') as 'AUTO' | 'MANUAL' | 'FORMULA',
        month: v.month || 1,
        year: v.year || new Date().getFullYear()
      })) as Variable[];
      
      setVariables(vars);
      
      // Extract unique periods and sort them
      const uniquePeriods = new Map<string, MonthYear>();
      vars.forEach(v => {
        const key = `${v.year}-${v.month}`;
        if (!uniquePeriods.has(key)) {
          uniquePeriods.set(key, {
            month: v.month,
            year: v.year,
            label: `${monthNames[v.month - 1]}/${v.year}`
          });
        }
      });
      
      const sortedPeriods = Array.from(uniquePeriods.values()).sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
      });
      
      setPeriods(sortedPeriods);
      
      // Build value map from the actual month column values
      const valueMap = new Map<string, number>();
      data.forEach((v: any) => {
        const monthIndex = (v.month || 1) - 1;
        const monthColumn = monthColumns[monthIndex];
        const key = `${v.account_code}-${v.year || new Date().getFullYear()}-${v.month || 1}`;
        valueMap.set(key, v[monthColumn] || 0);
      });
      setVariableValues(valueMap);
    }
    
    setCurrentVersionId(versionId);
    setExpandedRows(new Set());
  };

  const handleProjectChange = (projectId: string) => {
    setSelectedProject(projectId);
    setSelectedLanguage('');
    setVersions([]);
    setCurrentVersionId(null);
  };

  const handleLanguageChange = (languageId: string) => {
    setSelectedLanguage(languageId);
    if (selectedProject && languageId) {
      loadVersions(selectedProject, languageId);
    }
  };

  const handleCreateVersion = async () => {
    if (!newVersionName.trim()) {
      toast({ title: 'Atenção', description: 'Digite um nome para a versão' });
      return;
    }

    if (!selectedProject || !selectedLanguage) {
      toast({ title: 'Atenção', description: 'Selecione projeto e linguagem' });
      return;
    }

    try {
      // Get variables directly from simulation_configs_variables with matching id_proj and id_lang
      const { data: baseVars } = await (supabase as any)
        .from('simulation_configs_variables')
        .select('*')
        .eq('id_proj', selectedProject)
        .eq('id_lang', selectedLanguage)
        .order('account_num');

      if (!baseVars || baseVars.length === 0) {
        toast({ 
          title: 'Aviso', 
          description: 'Nenhuma variável encontrada para este projeto e linguagem.' 
        });
        return;
      }

      // Create new version
      const { data: newVersion, error: versionError } = await (supabase as any)
        .from('simulation_versions')
        .insert([{
          name: newVersionName,
          id_prj: selectedProject,
          id_lang: selectedLanguage
        }])
        .select();

      if (versionError || !newVersion?.[0]) {
        throw new Error('Erro ao criar versão');
      }

      const versionId = newVersion[0].id_sim_ver;

      // Create variables for each month of the current year
      const currentYear = new Date().getFullYear();
      const variablesToInsert = [];
      
      for (let month = 1; month <= 12; month++) {
        baseVars.forEach((baseVar: any, index) => {
          variablesToInsert.push({
            version_id: versionId,
            row_index: index + 1,
            account_num: baseVar.account_num,
            name: baseVar.name,
            calculation_type: baseVar.calculation_type || 'AUTO',
            formula: baseVar.formula || null,
            month: month,
            year: currentYear,
            id_lob: baseVar.id_lob,
            id_lang: selectedLanguage
          });
        });
      }

      const { error: varsError } = await (supabase as any)
        .from('simulation')
        .insert(variablesToInsert);

      if (varsError) throw varsError;

      setShowNewVersionModal(false);
      setNewVersionName('');
      loadVersions(selectedProject, selectedLanguage);
      toast({ title: 'Sucesso', description: 'Versão criada com sucesso' });
    } catch (error) {
      console.error('Error creating version:', error);
      toast({ title: 'Erro', description: 'Erro ao criar versão', variant: 'destructive' });
    }
  };

  const handleSave = async () => {
    if (!currentVersionId) {
      toast({ title: 'Atenção', description: 'Nenhuma versão selecionada' });
      return;
    }

    setSaveStatus('saving');

    try {
      const monthColumns = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      
      // Group variables by account_code, month, and year to update each record
      for (const variable of variables) {
        if (isLeafAccount(variable.account_code, variables)) {
          const monthIndex = variable.month - 1;
          const monthColumn = monthColumns[monthIndex];
          const key = `${variable.account_code}-${variable.year}-${variable.month}`;
          const value = variableValues.get(key) || 0;
          
          await (supabase as any)
            .from('simulation')
            .update({ [monthColumn]: value })
            .eq('id_sim', variable.id_sim);
        }
      }
      
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
      toast({ title: 'Sucesso', description: 'Dados guardados' });
    } catch (error) {
      console.error('Error saving:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
      toast({ title: 'Erro', description: 'Erro ao guardar', variant: 'destructive' });
    }
  };

  const isLeafAccount = (accountCode: string, allVars: Variable[]) => {
    return !allVars.some(v => 
      v.account_code.startsWith(accountCode + '.') && 
      v.account_code.split('.').length === accountCode.split('.').length + 1
    );
  };

  const getChildAccounts = (accountCode: string, allVars: Variable[]) => {
    return allVars.filter(v => 
      v.account_code.startsWith(accountCode + '.') && 
      v.account_code.split('.').length === accountCode.split('.').length + 1
    );
  };

  const calculateParentValue = (accountCode: string, year: number, month: number): number => {
    const children = getChildAccounts(accountCode, variables);
    return children.reduce((sum, child) => {
      if (isLeafAccount(child.account_code, variables)) {
        return sum + (getValue(child, year, month) || 0);
      } else {
        return sum + calculateParentValue(child.account_code, year, month);
      }
    }, 0);
  };

  const evaluateFormula = (formula: string, year: number, month: number): number => {
    if (!formula) return 0;
    
    try {
      let processedFormula = formula;
      const references = formula.match(/\[([^\]]+)\]/g);
      
      if (references) {
        for (const ref of references) {
          const accountCode = ref.slice(1, -1);
          const variable = variables.find(v => v.account_code === accountCode);
          if (variable) {
            const value = getValue(variable, year, month);
            processedFormula = processedFormula.replace(ref, String(value));
          } else {
            processedFormula = processedFormula.replace(ref, '0');
          }
        }
      }
      
      const result = new Function('return ' + processedFormula)();
      return isNaN(result) ? 0 : result;
    } catch (error) {
      console.error('Error evaluating formula:', formula, error);
      return 0;
    }
  };

  const getValue = (variable: Variable, year: number, month: number): number => {
    const calcType = variable.calculation_type || 'AUTO';
    const key = `${variable.account_code}-${year}-${month}`;
    
    if (calcType === 'MANUAL') {
      return variableValues.get(key) || 0;
    } else if (calcType === 'FORMULA') {
      return evaluateFormula(variable.formula || '', year, month);
    } else if (calcType === 'AUTO') {
      if (!isLeafAccount(variable.account_code, variables)) {
        return calculateParentValue(variable.account_code, year, month);
      } else {
        return variableValues.get(key) || 0;
      }
    }
    
    return variableValues.get(key) || 0;
  };

  const updateValue = (accountCode: string, year: number, month: number, value: string) => {
    const key = `${accountCode}-${year}-${month}`;
    setVariableValues(prev => {
      const newMap = new Map(prev);
      newMap.set(key, parseFloat(value) || 0);
      return newMap;
    });
  };

  const getTotal = (variable: Variable) => {
    return periods.reduce((sum, period) => 
      sum + getValue(variable, period.year, period.month), 0
    );
  };

  const toggleExpandedRow = (accountCode: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(accountCode)) {
        newSet.delete(accountCode);
      } else {
        newSet.add(accountCode);
      }
      return newSet;
    });
  };

  const getVisibleVariables = () => {
    // Get unique variables by account_code
    const uniqueVarsMap = new Map<string, Variable>();
    variables.forEach(v => {
      if (!uniqueVarsMap.has(v.account_code)) {
        uniqueVarsMap.set(v.account_code, v);
      }
    });
    
    const uniqueVars = Array.from(uniqueVarsMap.values());
    
    return uniqueVars.filter(variable => {
      const level = variable.account_code.split('.').length - 1;
      if (level === 0) return true;
      
      const parentCode = variable.account_code.substring(0, variable.account_code.lastIndexOf('.'));
      return expandedRows.has(parentCode);
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">A carregar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <style>{`
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>
      
      {/* Header */}
      <div className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={onMenuClick}>
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-3xl font-bold">Simulação (Mês/Ano)</h1>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => setShowNewVersionModal(true)}
                disabled={!selectedProject || !selectedLanguage}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Versão
              </Button>
              <Button
                onClick={handleSave}
                disabled={!currentVersionId || saveStatus === 'saving'}
                variant={saveStatus === 'success' ? 'default' : saveStatus === 'error' ? 'destructive' : 'default'}
              >
                {saveStatus === 'saving' && (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                )}
                {saveStatus === 'success' && (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Saved
                  </>
                )}
                {saveStatus === 'error' && (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Error
                  </>
                )}
                {saveStatus === 'idle' && (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Projeto</Label>
              <Select value={selectedProject} onValueChange={handleProjectChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um projeto" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(p => (
                    <SelectItem key={p.id_prj} value={p.id_prj}>
                      {p.id_prj}{p.desc_prj ? ` - ${p.desc_prj}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Linguagem</Label>
              <Select value={selectedLanguage} onValueChange={handleLanguageChange} disabled={!selectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma linguagem" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map(l => (
                    <SelectItem key={l.id_lang} value={l.id_lang}>
                      {l.id_lang}{l.desc_lang ? ` - ${l.desc_lang}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Versão</Label>
              <Select value={currentVersionId || ''} onValueChange={loadVersion} disabled={!selectedLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma versão" />
                </SelectTrigger>
                <SelectContent>
                  {versions.map(v => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name} ({new Date(v.created_at).toLocaleDateString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="container mx-auto p-6">
        {currentVersionId ? (
          <Card className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted border-b">
                  <th className="px-4 py-3 text-left font-semibold min-w-[300px]">Conta</th>
                  {periods.map(period => (
                    <th key={`${period.year}-${period.month}`} className="px-4 py-3 text-right font-semibold min-w-[100px]">
                      {period.label}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right font-semibold min-w-[100px]">Total</th>
                </tr>
              </thead>
              <tbody>
                {getVisibleVariables().map(variable => {
                  const level = variable.account_code.split('.').length - 1;
                  const hasChildren = !isLeafAccount(variable.account_code, variables);
                  const isExpanded = expandedRows.has(variable.account_code);
                  const calcType = variable.calculation_type || 'AUTO';
                  const isEditable = isLeafAccount(variable.account_code, variables) && 
                                    calcType !== 'FORMULA' &&
                                    (calcType === 'MANUAL' || calcType === 'AUTO');
                  
                  return (
                    <tr key={variable.account_code} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-2">
                        <div 
                          className="flex items-center gap-2"
                          style={{ paddingLeft: `${level * 20}px` }}
                        >
                          {hasChildren ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => toggleExpandedRow(variable.account_code)}
                            >
                              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </Button>
                          ) : (
                            <div className="w-6" />
                          )}
                          
                          <span className="font-mono text-sm text-muted-foreground">
                            {variable.account_code}
                          </span>
                          <span className={hasChildren ? 'font-semibold' : ''}>
                            {variable.name}
                          </span>
                          
                          {calcType === 'FORMULA' && (
                            <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-0.5 rounded" title={variable.formula || ''}>
                              ƒ {variable.formula}
                            </span>
                          )}
                          {!isEditable && calcType !== 'FORMULA' && <Lock className="h-3 w-3 text-muted-foreground" />}
                        </div>
                      </td>
                      
                      {periods.map((period) => {
                        const value = getValue(variable, period.year, period.month);
                        
                        return (
                          <td key={`${period.year}-${period.month}`} className="px-4 py-2 text-right">
                            {isEditable ? (
                              <Input
                                type="number"
                                step="0.01"
                                value={value}
                                onChange={(e) => updateValue(variable.account_code, period.year, period.month, e.target.value)}
                                className="w-full text-right"
                              />
                            ) : (
                              <span className={hasChildren || calcType === 'FORMULA' ? 'font-semibold' : ''}>
                                {value.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            )}
                          </td>
                        );
                      })}
                      
                      <td className="px-4 py-2 text-right font-semibold">
                        {getTotal(variable).toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        ) : (
          <Card className="p-12 text-center text-muted-foreground">
            Selecione um projeto e uma linguagem para começar
          </Card>
        )}
      </div>

      {/* Modal Nova Versão */}
      <Dialog open={showNewVersionModal} onOpenChange={setShowNewVersionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Versão</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Nome da Versão</Label>
              <Input
                value={newVersionName}
                onChange={(e) => setNewVersionName(e.target.value)}
                placeholder="Ex: Cenário Base 2025"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowNewVersionModal(false);
              setNewVersionName('');
            }}>
              Cancelar
            </Button>
            <Button onClick={handleCreateVersion}>Criar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
