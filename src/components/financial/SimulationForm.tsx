import { useState, useEffect } from 'react';
import { Menu, Plus, Save, CheckCircle, XCircle, Lock, ChevronDown, ChevronRight, Loader2, X, FunctionSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  clearFormulaCache, 
  isOrFormula, 
  evaluateOrFormula 
} from '@/lib/formulaOrEvaluator';

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
  calculation_type: 'MANUAL' | 'FORMULA';
  formula: string | null;
  month: number;
  year: number;
  lob: string;
  id_lang: string;
  level: number;
  parent_account_id?: string | null;
  value?: number;
  value_orig?: number;
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
  const [lobs, setLobs] = useState<Array<{ id_lob: string; name: string }>>([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedLob, setSelectedLob] = useState('');
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
  const [showVersionChoice, setShowVersionChoice] = useState(false);
  const [versionCreationType, setVersionCreationType] = useState<'last' | 'template'>('template');
  const [blockedVariables, setBlockedVariables] = useState<Set<string>>(new Set());
  const [configVarMap, setConfigVarMap] = useState<Map<string, string>>(new Map()); // config_id -> sim_id
  const [simToConfigMap, setSimToConfigMap] = useState<Map<string, string>>(new Map()); // sim_id -> config_id
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

  useEffect(() => {
    if (selectedProject && selectedLanguage) {
      loadLobs(selectedProject, selectedLanguage);
    } else {
      setLobs([]);
      setSelectedLob('');
    }
  }, [selectedProject, selectedLanguage]);

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

  const loadLobs = async (projectId: string, languageId: string) => {
    const { data } = await (supabase as any)
      .from('lob')
      .select('id_lob, name')
      .eq('id_lang', languageId)
      .order('id_lob');
    
    setLobs((data || []).map((l: any) => ({ id_lob: l.id_lob, name: l.name })));
  };

  const loadVersions = async (projectId: string) => {
    if (!projectId) {
      setVersions([]);
      return;
    }

    const { data } = await (supabase as any)
      .from('simulation_versions')
      .select('*')
      .eq('id_prj', projectId)
      .order('created_at', { ascending: false });
    
    const mappedData = (data || []).map((v: any) => ({
      id: v.id_sim_ver,
      name: v.name,
      id_prj: v.id_prj,
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

  const loadVersion = async (versionId: string, languageFilter?: string, lobFilter?: string) => {
    // Clear formula cache when loading new version
    clearFormulaCache();
    
    // Don't load any data if project or version is not selected
    if (!selectedProject || !versionId) {
      setVariables([]);
      setVariableValues(new Map());
      setPeriods([]);
      setCurrentVersionId(null);
      setBlockedVariables(new Set());
      return;
    }

    // Use parameters or fall back to state
    const langToUse = languageFilter !== undefined ? languageFilter : selectedLanguage;
    const lobToUse = lobFilter !== undefined ? lobFilter : selectedLob;

    console.log('Loading version with filters:', { versionId, langToUse, lobToUse, selectedProject });

    // Load blocked variables and config structure from config
    const { data: configVars } = await (supabase as any)
      .from('simulation_configs_variables')
      .select('id_sim_cfg_var, account_num, blocked, parent_account_id')
      .eq('id_proj', selectedProject);
    
    const blockedSet = new Set<string>();
    const configMap = new Map<string, any>(); // config_id -> config variable
    
    if (configVars) {
      configVars.forEach((cv: any) => {
        if (cv.blocked) {
          blockedSet.add(cv.account_num);
        }
        configMap.set(cv.id_sim_cfg_var, cv);
      });
    }
    setBlockedVariables(blockedSet);

    // Always load all data first
    const { data: allData } = await (supabase as any)
      .from('simulation')
      .select('*')
      .eq('version_id', versionId)
      .eq('id_proj', selectedProject)
      .order('account_num');
    
    console.log('All data loaded from DB:', allData?.length, 'records');
    
    // Filter data based on selections while keeping hierarchy
    let data = allData;
    if (langToUse || lobToUse) {
      const filteredVars = allData?.filter((v: any) => {
        // Keep all variables that match the filters
        const langMatch = !langToUse || v.id_lang === langToUse || v.id_lang === null;
        const lobMatch = !lobToUse || v.id_lob === lobToUse || v.id_lob === null;
        return langMatch && lobMatch;
      }) || [];
      
      console.log('After initial filter:', filteredVars.length, 'records');
      
      // Get all parent_account_ids from filtered variables
      const parentIds = new Set<string>();
      filteredVars.forEach((v: any) => {
        if (v.parent_account_id) {
          parentIds.add(v.parent_account_id);
        }
      });
      
      console.log('Parent IDs to fetch:', parentIds.size);
      
      // Recursively add all ancestors
      const addAncestors = (parentId: string) => {
        const parent = allData?.find((v: any) => v.id_sim === parentId);
        if (parent && !filteredVars.some((v: any) => v.id_sim === parent.id_sim)) {
          console.log('Adding ancestor:', parent.account_num, parent.name);
          filteredVars.push(parent);
          if (parent.parent_account_id) {
            addAncestors(parent.parent_account_id);
          }
        }
      };
      
      parentIds.forEach(parentId => addAncestors(parentId));
      
      console.log('After adding ancestors:', filteredVars.length, 'records');
      
      data = filteredVars;
    }
    
    if (data) {
      const vars = data.map((v: any) => ({
        ...v,
        account_code: v.account_num,
        calculation_type: (v.calculation_type === 'AUTO' ? 'MANUAL' : v.calculation_type || 'MANUAL') as 'MANUAL' | 'FORMULA',
        month: v.month || 1,
        year: v.year || new Date().getFullYear(),
        lob: v.id_lob,
        id_lang: v.id_lang,
        level: parseInt(v.level || '0', 10),
        parent_account_id: v.parent_account_id || null,
        value: v.value !== undefined ? v.value : 0,
        value_orig: v.value_orig !== undefined ? v.value_orig : 0
      })) as Variable[];
      
      console.log('First 3 variables with values:', vars.slice(0, 3).map(v => ({ 
        code: v.account_code, 
        name: v.name, 
        value: v.value,
        value_orig: v.value_orig,
        month: v.month,
        year: v.year
      })));
      
      console.log('Final variables to set:', vars.length, 'records');
      console.log('Sample variables:', vars.slice(0, 5).map(v => ({ 
        code: v.account_code, 
        name: v.name, 
        level: v.level, 
        parent: v.parent_account_id,
        lob: v.lob,
        lang: v.id_lang
      })));
      
      setVariables(vars);
      
      // Create bidirectional maps between config and sim variables
      const configToSimMap = new Map<string, string>();
      const simToConfigMapNew = new Map<string, string>();
      
      console.log('Creating bidirectional maps from', configVars?.length, 'config vars');
      configVars?.forEach((cv: any) => {
        // Find first sim variable with this account_code
        const simVar = vars.find(v => v.account_code === cv.account_num);
        if (simVar) {
          configToSimMap.set(cv.id_sim_cfg_var, simVar.id_sim);
          simToConfigMapNew.set(simVar.id_sim, cv.id_sim_cfg_var);
          console.log('Mapped:', cv.account_num, '- config', cv.id_sim_cfg_var, '<-> sim', simVar.id_sim);
        }
      });
      
      setConfigVarMap(configToSimMap);
      setSimToConfigMap(simToConfigMapNew);
      console.log('Maps created:', configToSimMap.size, 'mappings');
      
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
      
      // variableValues Map will only contain user edits, not initial DB values
      // getValue will read from variables array for DB values
    }
    
    console.log('Setting version:', versionId);
    console.log('Total variables loaded:', data?.length);
    
    setCurrentVersionId(versionId);
    
    // Iniciar com todas as variáveis colapsadas (set vazio)
    // As variáveis raiz serão visíveis por terem parent_account_id null
    console.log('Resetting expanded rows to empty set');
    setExpandedRows(new Set());
  };

  const handleProjectChange = (projectId: string) => {
    setSelectedProject(projectId);
    setSelectedLanguage('');
    setVersions([]);
    setCurrentVersionId(null);
    if (projectId) {
      loadVersions(projectId);
    }
  };

  const handleLanguageChange = (languageId: string) => {
    const actualLanguage = languageId === 'ALL' ? '' : languageId;
    setSelectedLanguage(actualLanguage);
    // Clear LOB selection when language changes
    setSelectedLob('');
    if (currentVersionId) {
      loadVersion(currentVersionId, actualLanguage, '');
    }
  };

  const handleLobChange = (lobId: string) => {
    const actualLob = lobId === 'ALL' ? '' : lobId;
    setSelectedLob(actualLob);
    if (currentVersionId) {
      loadVersion(currentVersionId, selectedLanguage, actualLob);
    }
  };

  const handleClearSelections = () => {
    setSelectedProject('');
    setSelectedLanguage('');
    setSelectedLob('');
    setVersions([]);
    setCurrentVersionId(null);
    setVariables([]);
    setVariableValues(new Map());
    setPeriods([]);
  };

  const handleNewVersionClick = async () => {
    if (!selectedProject) {
      toast({ title: 'Atenção', description: 'Selecione um projeto' });
      return;
    }

    // Check if there are existing versions for this project
    const { data: existingVersions } = await (supabase as any)
      .from('simulation_versions')
      .select('id_sim_ver')
      .eq('id_prj', selectedProject)
      .limit(1);

    if (existingVersions && existingVersions.length > 0) {
      // Show choice dialog
      setShowVersionChoice(true);
    } else {
      // No versions exist, go directly to create from template
      setShowNewVersionModal(true);
    }
  };

  const createVersionFromLastVersion = async (versionName: string) => {
    try {
      // Get the last version
      const { data: lastVersionData } = await (supabase as any)
        .from('simulation_versions')
        .select('id_sim_ver')
        .eq('id_prj', selectedProject)
        .order('created_at', { ascending: false })
        .limit(1);

      if (!lastVersionData || lastVersionData.length === 0) {
        throw new Error('Nenhuma versão anterior encontrada');
      }

      const lastVersionId = lastVersionData[0].id_sim_ver;

      // Create new version
      const { data: newVersion, error: versionError } = await (supabase as any)
        .from('simulation_versions')
        .insert([{
          name: versionName,
          id_prj: selectedProject
        }])
        .select();

      if (versionError || !newVersion?.[0]) {
        throw new Error('Erro ao criar versão');
      }

      const versionId = newVersion[0].id_sim_ver;

      // Get all records from the last simulation
      const { data: lastSimData } = await (supabase as any)
        .from('simulation')
        .select('*')
        .eq('version_id', lastVersionId)
        .order('account_num');

      if (!lastSimData || lastSimData.length === 0) {
        throw new Error('Nenhum dado encontrado na última versão');
      }

      // Copy all data
      const variablesToInsert = lastSimData.map((record: any) => ({
        version_id: versionId,
        row_index: record.row_index,
        account_num: record.account_num,
        name: record.name,
        calculation_type: record.calculation_type === 'AUTO' ? 'MANUAL' : (record.calculation_type || 'MANUAL'),
        formula: record.formula || null,
        value: record.value || 0,
        value_orig: record.value_orig || 0,
        month: record.month,
        year: record.year,
        id_lob: record.id_lob,
        id_proj: selectedProject,
        id_lang: record.id_lang,
        value_type: record.value_type || 'number',
        level: record.level,
        parent_account_id: record.parent_account_id
      }));

      const { error: varsError } = await (supabase as any)
        .from('simulation')
        .insert(variablesToInsert);

      if (varsError) {
        console.error('Error inserting variables:', varsError);
        throw varsError;
      }

      loadVersions(selectedProject);
      toast({ title: 'Sucesso', description: 'Versão criada com sucesso a partir da última versão' });
    } catch (error) {
      console.error('Error creating version from last:', error);
      toast({ title: 'Erro', description: 'Erro ao criar versão', variant: 'destructive' });
      throw error;
    }
  };

  const createVersionFromTemplate = async (versionName: string) => {
    try {
      // Get the simulation config for this project
      const { data: configData } = await (supabase as any)
        .from('simulation_configs')
        .select('id_sim_cfg')
        .eq('id_prj', selectedProject)
        .eq('is_active', true)
        .limit(1);

      if (!configData || configData.length === 0) {
        throw new Error('Nenhuma configuração ativa encontrada para este projeto');
      }

      const configId = configData[0].id_sim_cfg;

      // Get config variables
      const { data: configVars } = await (supabase as any)
        .from('simulation_configs_variables')
        .select('*')
        .eq('id_sim_cfg', configId)
        .order('row_index');

      if (!configVars || configVars.length === 0) {
        throw new Error('Nenhuma variável encontrada no template');
      }

      // Create new version
      const { data: newVersion, error: versionError } = await (supabase as any)
        .from('simulation_versions')
        .insert([{
          name: versionName,
          id_prj: selectedProject
        }])
        .select();

      if (versionError || !newVersion?.[0]) {
        throw new Error('Erro ao criar versão');
      }

      const versionId = newVersion[0].id_sim_ver;

      // Create 3 months for each config variable (no duplication by LOB or language)
      const variablesToInsert: any[] = [];
      const monthsToCreate = [1, 2, 3]; // Jan, Feb, Mar
      const yearToUse = new Date().getFullYear();

      // Store config var ID temporarily for parent mapping
      const tempConfigMapping: any[] = [];
      configVars.forEach((configVar: any, index: number) => {
        monthsToCreate.forEach((month) => {
          const valueType = configVar.value_type === 'percentage' ? 'percentage' : 'number';
          const recordData = {
            version_id: versionId,
            row_index: (index * 3) + month,
            account_num: configVar.account_num,
            name: configVar.name,
            calculation_type: configVar.calculation_type === 'AUTO' ? 'MANUAL' : (configVar.calculation_type || 'MANUAL'),
            formula: configVar.formula || null,
            value: 0,
            value_orig: 0,
            month: month,
            year: yearToUse,
            id_lob: configVar.id_lob,
            id_proj: selectedProject,
            id_lang: configVar.id_lang,
            value_type: valueType,
            level: configVar.level,
            parent_account_id: configVar.parent_account_id
          };
          
          variablesToInsert.push(recordData);
          tempConfigMapping.push({
            ...recordData,
            _config_id: configVar.id_sim_cfg_var
          });
        });
      });

      if (variablesToInsert.length === 0) {
        throw new Error('Não há dados para criar');
      }

      // Insert all variables
      const { data: insertedVars, error: varsError } = await (supabase as any)
        .from('simulation')
        .insert(variablesToInsert)
        .select('id_sim, account_num, month, year, id_lob, id_lang');

      if (varsError) {
        console.error('Error inserting variables:', varsError);
        throw varsError;
      }

      // Second pass: Update parent_account_id relationships
      const updates: Promise<any>[] = [];
      
      for (const insertedVar of insertedVars || []) {
        // Find the temp mapping for this inserted var
        const tempMapping = tempConfigMapping.find((tm: any) => 
          tm.account_num === insertedVar.account_num &&
          tm.month === insertedVar.month &&
          tm.year === insertedVar.year &&
          tm.id_lob === insertedVar.id_lob &&
          tm.id_lang === insertedVar.id_lang
        );
        
        if (tempMapping && tempMapping.parent_account_id) {
          // Find the parent config var
          const parentConfigVar = configVars.find((cv: any) => cv.id_sim_cfg_var === tempMapping.parent_account_id);
          
          if (parentConfigVar) {
            // Find the corresponding parent simulation var (same account_num, month, year, lob, lang)
            const parentSimVar = insertedVars.find((sv: any) => 
              sv.account_num === parentConfigVar.account_num &&
              sv.month === insertedVar.month &&
              sv.year === insertedVar.year &&
              sv.id_lob === insertedVar.id_lob &&
              sv.id_lang === insertedVar.id_lang
            );

            if (parentSimVar) {
              updates.push(
                (supabase as any)
                  .from('simulation')
                  .update({ parent_account_id: parentSimVar.id_sim })
                  .eq('id_sim', insertedVar.id_sim)
              );
            }
          }
        }
      }

      // Execute all updates in parallel
      if (updates.length > 0) {
        await Promise.all(updates);
      }

      loadVersions(selectedProject);
      toast({ title: 'Sucesso', description: 'Versão criada com sucesso a partir do template' });
    } catch (error) {
      console.error('Error creating version from template:', error);
      toast({ title: 'Erro', description: 'Erro ao criar versão', variant: 'destructive' });
      throw error;
    }
  };

  const handleCreateVersion = async () => {
    if (!newVersionName.trim()) {
      toast({ title: 'Atenção', description: 'Digite um nome para a versão' });
      return;
    }

    if (!selectedProject) {
      toast({ title: 'Atenção', description: 'Selecione um projeto' });
      return;
    }

    try {
      if (versionCreationType === 'last') {
        await createVersionFromLastVersion(newVersionName);
      } else {
        await createVersionFromTemplate(newVersionName);
      }

      setShowNewVersionModal(false);
      setShowVersionChoice(false);
      setNewVersionName('');
    } catch (error) {
      // Error already handled in the called functions
    }
  };

  const handleSave = async () => {
    if (!currentVersionId) {
      toast({ title: 'Atenção', description: 'Nenhuma versão selecionada' });
      return;
    }

    setSaveStatus('saving');

    try {
      // Update each edited value from variableValues Map
      const updates: Promise<any>[] = [];
      
      variableValues.forEach((value, key) => {
        // Parse the key: accountCode-year-month-language-lob
        const [accountCode, year, month, language, lob] = key.split('-');
        
        // Find the matching variable
        const variable = variables.find(v => 
          v.account_code === accountCode && 
          v.year === parseInt(year) && 
          v.month === parseInt(month) && 
          v.id_lang === language &&
          v.lob === lob
        );
        
        if (variable) {
          updates.push(
            (supabase as any)
              .from('simulation')
              .update({ value: value })
              .eq('id_sim', variable.id_sim)
          );
        }
      });
      
      if (updates.length > 0) {
        await Promise.all(updates);
      }
      
      // Reload the version to update the UI with saved values
      await loadVersion(currentVersionId, selectedLanguage, selectedLob);
      
      // Clear the edited values map since they're now saved
      setVariableValues(new Map());
      
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
      toast({ title: 'Sucesso', description: `${updates.length} valores guardados` });
    } catch (error) {
      console.error('Error saving:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
      toast({ title: 'Erro', description: 'Erro ao guardar', variant: 'destructive' });
    }
  };

  const hasChildren = (varId: string) => {
    const thisVar = variables.find(v => v.id_sim === varId);
    if (!thisVar) return false;
    
    // Find the config ID for this sim variable using simToConfigMap
    const thisConfigId = simToConfigMap.get(thisVar.id_sim);
    if (!thisConfigId) return false;
    
    // Check if any variable has this config ID as parent
    return variables.some(v => v.parent_account_id === thisConfigId);
  };

  const isLeafAccount = (accountCode: string, allVars: Variable[]) => {
    const variable = allVars.find(v => v.account_code === accountCode);
    if (!variable) return true;
    return !hasChildren(variable.id_sim);
  };

  const getChildAccounts = (accountCode: string, allVars: Variable[]) => {
    const variable = allVars.find(v => v.account_code === accountCode);
    if (!variable) return [];
    
    // Find the config ID for this sim variable
    const thisConfigId = simToConfigMap.get(variable.id_sim);
    if (!thisConfigId) return [];
    
    // Find all variables whose parent_account_id matches this config ID
    return allVars.filter(v => v.parent_account_id === thisConfigId);
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

  const evaluateFormula = (formula: string, year: number, month: number, accountCode?: string): number => {
    if (!formula) return 0;
    
    try {
      // Helper function to get value for account reference
      const getAccountValue = (accCode: string, targetYear?: number, targetMonth?: number): number | null => {
        const variable = variables.find(v => v.account_code === accCode);
        if (!variable) return null;
        const value = getValue(variable, targetYear ?? year, targetMonth ?? month);
        return value;
      };

      // Check if this is an OR formula
      if (isOrFormula(formula)) {
        // Use the OR evaluator with cache
        return evaluateOrFormula(
          accountCode || 'unknown',
          formula,
          (subFormula) => evaluateSimpleFormula(subFormula, year, month, getAccountValue),
          getAccountValue
        );
      }

      // Regular formula evaluation
      return evaluateSimpleFormula(formula, year, month, getAccountValue);
    } catch (error) {
      console.error('Error evaluating formula:', formula, error);
      return 0;
    }
  };

  const evaluateSimpleFormula = (
    formula: string, 
    year: number, 
    month: number, 
    getAccountValue: (accountCode: string, targetYear?: number, targetMonth?: number) => number | null
  ): number => {
    try {
      let processedFormula = formula;

      // Process temporal functions
      processedFormula = processedFormula.replace(/PREV_MONTH\(\[([^\]]+)\]\)/g, (_, accountCode) => {
        const prevMonth = month === 1 ? 12 : month - 1;
        const prevYear = month === 1 ? year - 1 : year;
        return String(getAccountValue(accountCode, prevYear, prevMonth));
      });

      processedFormula = processedFormula.replace(/PREV_YEAR\(\[([^\]]+)\]\)/g, (_, accountCode) => {
        return String(getAccountValue(accountCode, year - 1, month));
      });

      processedFormula = processedFormula.replace(/YTD\(\[([^\]]+)\]\)/g, (_, accountCode) => {
        const variable = variables.find(v => v.account_code === accountCode);
        if (!variable) return '0';
        let sum = 0;
        for (let m = 1; m <= month; m++) {
          sum += getValue(variable, year, m);
        }
        return String(sum);
      });

      // Process mathematical functions with multiple arguments
      processedFormula = processedFormula.replace(/SUM\(([^)]+)\)/g, (_, args) => {
        const values = args.split(',').map((arg: string) => {
          const trimmed = arg.trim();
          if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
            return getAccountValue(trimmed.slice(1, -1));
          }
          return parseFloat(trimmed) || 0;
        });
        return String(values.reduce((a: number, b: number) => a + b, 0));
      });

      processedFormula = processedFormula.replace(/AVG\(([^)]+)\)/g, (_, args) => {
        const values = args.split(',').map((arg: string) => {
          const trimmed = arg.trim();
          if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
            return getAccountValue(trimmed.slice(1, -1));
          }
          return parseFloat(trimmed) || 0;
        });
        return String(values.reduce((a: number, b: number) => a + b, 0) / values.length);
      });

      processedFormula = processedFormula.replace(/MAX\(([^)]+)\)/g, (_, args) => {
        const values = args.split(',').map((arg: string) => {
          const trimmed = arg.trim();
          if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
            return getAccountValue(trimmed.slice(1, -1));
          }
          return parseFloat(trimmed) || 0;
        });
        return String(Math.max(...values));
      });

      processedFormula = processedFormula.replace(/MIN\(([^)]+)\)/g, (_, args) => {
        const values = args.split(',').map((arg: string) => {
          const trimmed = arg.trim();
          if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
            return getAccountValue(trimmed.slice(1, -1));
          }
          return parseFloat(trimmed) || 0;
        });
        return String(Math.min(...values));
      });

      // Process single-argument math functions
      processedFormula = processedFormula.replace(/ABS\(([^)]+)\)/g, (_, arg) => {
        const value = arg.trim().startsWith('[') 
          ? getAccountValue(arg.trim().slice(1, -1))
          : parseFloat(arg);
        return String(Math.abs(value));
      });

      processedFormula = processedFormula.replace(/SQRT\(([^)]+)\)/g, (_, arg) => {
        const value = arg.trim().startsWith('[') 
          ? getAccountValue(arg.trim().slice(1, -1))
          : parseFloat(arg);
        return String(Math.sqrt(value));
      });

      processedFormula = processedFormula.replace(/ROUND\(([^,]+),\s*(\d+)\)/g, (_, value, decimals) => {
        const val = value.trim().startsWith('[') 
          ? getAccountValue(value.trim().slice(1, -1))
          : parseFloat(value);
        const dec = parseInt(decimals);
        return String(Math.round(val * Math.pow(10, dec)) / Math.pow(10, dec));
      });

      processedFormula = processedFormula.replace(/POW\(([^,]+),\s*([^)]+)\)/g, (_, base, exp) => {
        const baseVal = base.trim().startsWith('[') 
          ? getAccountValue(base.trim().slice(1, -1))
          : parseFloat(base);
        const expVal = exp.trim().startsWith('[') 
          ? getAccountValue(exp.trim().slice(1, -1))
          : parseFloat(exp);
        return String(Math.pow(baseVal, expVal));
      });

      // Process IF function
      processedFormula = processedFormula.replace(/IF\(([^,]+),\s*([^,]+),\s*([^)]+)\)/g, (_, condition, trueVal, falseVal) => {
        // Replace account references in condition
        let processedCondition = condition;
        const condRefs = condition.match(/\[([^\]]+)\]/g);
        if (condRefs) {
          for (const ref of condRefs) {
            const accountCode = ref.slice(1, -1);
            processedCondition = processedCondition.replace(ref, String(getAccountValue(accountCode)));
          }
        }
        
        const isTrue = new Function('return ' + processedCondition)();
        const resultVal = isTrue ? trueVal.trim() : falseVal.trim();
        
        if (resultVal.startsWith('[') && resultVal.endsWith(']')) {
          return String(getAccountValue(resultVal.slice(1, -1)));
        }
        return resultVal;
      });

      // Process remaining account references
      const references = processedFormula.match(/\[([^\]]+)\]/g);
      if (references) {
        for (const ref of references) {
          const accountCode = ref.slice(1, -1);
          const value = getAccountValue(accountCode);
          processedFormula = processedFormula.replace(ref, String(value ?? 0));
        }
      }
      
      const result = new Function('return ' + processedFormula)();
      return isNaN(result) ? 0 : result;
    } catch (error) {
      console.error('Error evaluating simple formula:', formula, error);
      return 0;
    }
  };

  const getValue = (variable: Variable, year: number, month: number): number => {
    const calcType = variable.calculation_type || 'MANUAL';
    const key = `${variable.account_code}-${year}-${month}-${variable.id_lang}-${variable.lob}`;
    
    if (calcType === 'FORMULA') {
      return evaluateFormula(variable.formula || '', year, month, variable.account_code);
    } else {
      // Check if user has edited this value in the Map first
      if (variableValues.has(key)) {
        return variableValues.get(key) || 0;
      }
      
      // Otherwise, read from the database value field
      const matchingVar = variables.find(v => 
        v.account_code === variable.account_code && 
        v.year === year && 
        v.month === month && 
        v.lob === variable.lob &&
        v.id_lang === variable.id_lang
      );
      console.log('getValue for', variable.account_code, year, month, ':', matchingVar?.value, '(orig:', matchingVar?.value_orig, ')');
      return matchingVar?.value || 0;
    }
  };

  const getOriginalValue = (variable: Variable, year: number, month: number): number => {
    // Find the original record to get value_orig
    const matchingVar = variables.find(v => 
      v.account_code === variable.account_code && 
      v.year === year && 
      v.month === month && 
      v.lob === variable.lob &&
      v.id_lang === variable.id_lang
    );
    return matchingVar?.value_orig || 0;
  };

  const updateValue = (accountCode: string, year: number, month: number, language: string, lob: string, value: string) => {
    const key = `${accountCode}-${year}-${month}-${language}-${lob}`;
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

  const getOriginalTotal = (variable: Variable) => {
    return periods.reduce((sum, period) => 
      sum + getOriginalValue(variable, period.year, period.month), 0
    );
  };

  const toggleExpandedRow = (varId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(varId)) {
        newSet.delete(varId);
      } else {
        newSet.add(varId);
      }
      console.log('Toggled expansion for:', varId, 'New size:', newSet.size);
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
    
    // Identify root variables (where parent_account_id equals own config ID)
    const rootVars: Variable[] = [];
    uniqueVars.forEach(variable => {
      const thisConfigId = simToConfigMap.get(variable.id_sim);
      if (variable.parent_account_id === thisConfigId) {
        rootVars.push(variable);
      }
    });
    
    // Sort roots by account_num
    rootVars.sort((a, b) => {
      const aNum = a.account_code || '';
      const bNum = b.account_code || '';
      return aNum.localeCompare(bNum, undefined, { numeric: true });
    });
    
    // Build visible list hierarchically
    const visible: Variable[] = [];
    const visited = new Set<string>(); // Track visited to prevent infinite loops
    
    const addVariableAndChildren = (variable: Variable) => {
      // Prevent cycles by checking if already visited
      if (visited.has(variable.id_sim)) {
        return;
      }
      
      visited.add(variable.id_sim);
      visible.push(variable);
      
      // If this variable is expanded, add its children
      if (expandedRows.has(variable.id_sim)) {
        // Get this variable's config ID
        const thisConfigId = simToConfigMap.get(variable.id_sim);
        if (thisConfigId) {
          // Find all children (variables whose parent_account_id equals this config ID)
          const children = uniqueVars.filter(v => 
            v.parent_account_id === thisConfigId && 
            !visited.has(v.id_sim) // Skip already visited children
          );
          
          // Sort children by account_num
          children.sort((a, b) => {
            const aNum = a.account_code || '';
            const bNum = b.account_code || '';
            return aNum.localeCompare(bNum, undefined, { numeric: true });
          });
          
          // Recursively add each child
          children.forEach(child => addVariableAndChildren(child));
        }
      }
    };
    
    // Start with root variables
    rootVars.forEach(root => addVariableAndChildren(root));
    
    return visible;
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
              <h1 className="text-3xl font-bold">SimulationForm</h1>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleClearSelections}
                disabled={!selectedProject}
              >
                <X className="h-4 w-4 mr-2" />
                Limpar
              </Button>
              <Button
                variant="secondary"
                onClick={handleNewVersionClick}
                disabled={!selectedProject}
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

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <Label>Versão</Label>
              <Select value={currentVersionId || ''} onValueChange={loadVersion} disabled={!selectedProject}>
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

            <div>
              <Label>Linguagem</Label>
              <Select value={selectedLanguage || 'ALL'} onValueChange={handleLanguageChange} disabled={!currentVersionId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma linguagem" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  {languages.map(l => (
                    <SelectItem key={l.id_lang} value={l.id_lang}>
                      {l.id_lang}{l.desc_lang ? ` - ${l.desc_lang}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>LOB</Label>
              <Select value={selectedLob || 'ALL'} onValueChange={handleLobChange} disabled={!selectedLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um LOB" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  {lobs.map(l => (
                    <SelectItem key={l.id_lob} value={l.id_lob}>
                      {l.name || l.id_lob}
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
                  <th className="px-4 py-2 text-left font-semibold min-w-[300px] text-sm">Conta</th>
                  {periods.map(period => (
                    <th key={`${period.year}-${period.month}`} className="px-4 py-2 text-right font-semibold min-w-[100px] text-sm">
                      {period.label}
                    </th>
                  ))}
                  <th className="px-4 py-2 text-right font-semibold min-w-[100px] text-sm">Total</th>
                </tr>
              </thead>
              <tbody>
                {getVisibleVariables().map(variable => {
                  const isParent = hasChildren(variable.id_sim);
                  const isExpanded = expandedRows.has(variable.id_sim);
                  const calcType = variable.calculation_type || 'AUTO';
                  const isBlocked = blockedVariables.has(variable.account_code);
                  const isEditable = isLeafAccount(variable.account_code, variables) && 
                                    calcType !== 'FORMULA' &&
                                    !isBlocked;
                  
                  return (
                    <tr key={variable.id_sim} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-1">
                        <div 
                          className="flex items-center gap-2"
                          style={{ paddingLeft: `${variable.level * 20}px` }}
                        >
                          {isParent ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 hover:bg-muted"
                              onClick={() => toggleExpandedRow(variable.id_sim)}
                              title={isExpanded ? "Colapsar" : "Expandir"}
                            >
                              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </Button>
                          ) : (
                            <div className="w-6" />
                          )}
                          
                          <span className="font-mono text-xs text-muted-foreground">
                            {variable.account_code}
                          </span>
                          <span className={isParent ? 'font-semibold text-sm' : 'text-sm'}>
                            {variable.name}
                          </span>
                          
                          {calcType === 'FORMULA' && (
                            <div className="flex items-center gap-1">
                              <FunctionSquare className="h-3.5 w-3.5 text-blue-500" />
                              <span className="text-xs bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded font-mono" title={variable.formula || ''}>
                                fx
                              </span>
                            </div>
                          )}
                          {isBlocked && <Lock className="h-3 w-3 text-muted-foreground" />}
                          {!isEditable && calcType !== 'FORMULA' && !isBlocked && <Lock className="h-3 w-3 text-muted-foreground" />}
                        </div>
                      </td>
                      
                      {periods.map((period) => {
                        const value = getValue(variable, period.year, period.month);
                        const originalValue = getOriginalValue(variable, period.year, period.month);
                        const compareSymbol = value === originalValue ? '=' : value < originalValue ? '<' : '>';
                        
                        return (
                          <td key={`${period.year}-${period.month}`} className="px-4 py-1 text-right">
                            <div className="flex flex-col items-end gap-0.5">
                              {isEditable ? (
                                <>
                                  <Input
                                    type="number"
                                    step="0.0001"
                                    value={value}
                                    onChange={(e) => updateValue(variable.account_code, period.year, period.month, variable.id_lang, variable.lob, e.target.value)}
                                    className="w-full text-right h-7 text-sm bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/30 focus:ring-green-500"
                                  />
                                  <span className="text-[10px] text-muted-foreground leading-none">
                                    {compareSymbol} {originalValue.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <span className={hasChildren || calcType === 'FORMULA' ? 'font-semibold text-sm' : 'text-sm'}>
                                    {value.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                                  </span>
                                  {originalValue !== value && (
                                    <span className="text-[10px] text-muted-foreground leading-none">
                                      {compareSymbol} {originalValue.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        );
                      })}
                      
                      <td className="px-4 py-1 text-right">
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="font-semibold text-sm">
                            {getTotal(variable).toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                          </span>
                          <span className="text-[10px] text-muted-foreground leading-none">
                            {(() => {
                              const totalValue = getTotal(variable);
                              const totalOriginal = getOriginalTotal(variable);
                              const compareSymbol = totalValue === totalOriginal ? '=' : totalValue < totalOriginal ? '<' : '>';
                              return `${compareSymbol} ${totalOriginal.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
                            })()}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        ) : (
          <Card className="p-12 text-center text-muted-foreground">
            Selecione um projeto, linguagem e versão para começar
          </Card>
        )}
      </div>

      {/* Dialog: Choice between last version or template */}
      <Dialog open={showVersionChoice} onOpenChange={setShowVersionChoice}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Nova Versão</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Como deseja criar a nova versão?
            </p>
            <div className="grid gap-4">
              <Button
                variant="outline"
                className="h-auto p-4 justify-start"
                onClick={() => {
                  setVersionCreationType('last');
                  setShowVersionChoice(false);
                  setShowNewVersionModal(true);
                }}
              >
                <div className="text-left">
                  <div className="font-semibold">Usar última versão</div>
                  <div className="text-sm text-muted-foreground">
                    Copia todos os campos e dados da última versão existente
                  </div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 justify-start"
                onClick={() => {
                  setVersionCreationType('template');
                  setShowVersionChoice(false);
                  setShowNewVersionModal(true);
                }}
              >
                <div className="text-left">
                  <div className="font-semibold">Criar do template</div>
                  <div className="text-sm text-muted-foreground">
                    Usa o template configurado para o projeto
                  </div>
                </div>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Nova Versão */}
      <Dialog open={showNewVersionModal} onOpenChange={(open) => {
        setShowNewVersionModal(open);
        if (!open) setNewVersionName('');
      }}>
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
