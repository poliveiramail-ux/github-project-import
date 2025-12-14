import React, { useState, useEffect, useMemo } from 'react';
import { Menu, Plus, Save, CheckCircle, XCircle, Lock, ChevronDown, ChevronRight, Loader2, X, FunctionSquare, FileSpreadsheet, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
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
  status: string | null;
}

interface Variable {
  uniqueId: string;
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
  id_sim_cfg_var: string;
  value?: number;
  value_orig?: number;
  row_index: number;
  page_name?: string;
  rollup?: string;
}

interface Props {
  onMenuClick: () => void;
}

interface MonthYear {
  month: number;
  year: number;
  label: string;
}

// Data structure to hold variables per version
interface VersionData {
  versionId: string;
  versionName: string;
  variables: Variable[];
  periods: MonthYear[];
}

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const getUniqueId = (accountNum: string, month: number, year: number, lang?: string, lob?: string, versionId?: string): string => {
  return `${accountNum}_${month}_${year}_${lang || 'null'}_${lob || 'null'}_${versionId || 'null'}`;
};

export default function SimulationForm_v2({ onMenuClick }: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [lobs, setLobs] = useState<Array<{ id_lob: string; name: string }>>([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedLob, setSelectedLob] = useState('');
  const [simulationLevelValue, setSimulationLevelValue] = useState<string>('');
  const [simulationLevelOptions, setSimulationLevelOptions] = useState<{
    projects: Array<{ id: string; label: string }>;
    languages: Array<{ id: string; label: string }>;
    lobs: Array<{ id: string; label: string }>;
  }>({ projects: [], languages: [], lobs: [] });
  
  // Multi-version support
  const [versions, setVersions] = useState<SimulationVersion[]>([]);
  const [selectedVersionIds, setSelectedVersionIds] = useState<string[]>([]);
  const [versionDataMap, setVersionDataMap] = useState<Map<string, VersionData>>(new Map());
  
  const [variableValues, setVariableValues] = useState<Map<string, number>>(new Map());
  const [expandedRows, setExpandedRows] = useState(new Set<string>());
  const [loading, setLoading] = useState(true);
  const [showNewVersionModal, setShowNewVersionModal] = useState(false);
  const [newVersionName, setNewVersionName] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [showVersionChoice, setShowVersionChoice] = useState(false);
  const [versionCreationType, setVersionCreationType] = useState<'last' | 'template'>('template');
  const [blockedVariables, setBlockedVariables] = useState<Set<string>>(new Set());
  const [activePage, setActivePage] = useState<string>('Main');
  const { toast } = useToast();

  // Combine all variables from selected versions for page names
  const allVariables = useMemo(() => {
    const vars: Variable[] = [];
    versionDataMap.forEach(vd => vars.push(...vd.variables));
    return vars;
  }, [versionDataMap]);

  // Get unique page names from all variables
  const pageNames = useMemo(() => {
    const pages = new Set<string>();
    allVariables.forEach(v => {
      if (v.page_name) {
        pages.add(v.page_name);
      }
    });
    return Array.from(pages).sort();
  }, [allVariables]);

  // Get combined periods from all selected versions
  const combinedPeriods = useMemo(() => {
    const periodsMap = new Map<string, MonthYear>();
    versionDataMap.forEach(vd => {
      vd.periods.forEach(p => {
        const key = `${p.year}-${p.month}`;
        if (!periodsMap.has(key)) {
          periodsMap.set(key, p);
        }
      });
    });
    return Array.from(periodsMap.values()).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });
  }, [versionDataMap]);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadVersions(selectedProject);
    } else {
      setVersions([]);
      setSelectedVersionIds([]);
      setVersionDataMap(new Map());
      setLanguages([]);
      setSelectedLanguage('');
      setLobs([]);
      setSelectedLob('');
    }
  }, [selectedProject]);

  useEffect(() => {
    if (selectedProject && selectedVersionIds.length > 0) {
      loadLanguagesFromVersions(selectedProject, selectedVersionIds);
    } else {
      setLanguages([]);
      setSelectedLanguage('');
      setLobs([]);
      setSelectedLob('');
    }
  }, [selectedProject, selectedVersionIds]);

  useEffect(() => {
    if (selectedProject && selectedVersionIds.length > 0 && selectedLanguage) {
      loadLobsFromVersions(selectedProject, selectedVersionIds, selectedLanguage);
    } else {
      setLobs([]);
      setSelectedLob('');
    }
  }, [selectedProject, selectedVersionIds, selectedLanguage]);

  const loadProjects = async () => {
    const { data } = await supabase.from('project').select('id_prj, desc_prj').order('id_prj');
    setProjects((data || []).map(p => ({ id_prj: p.id_prj, desc_prj: p.desc_prj })));
    setLoading(false);
  };

  const loadSimulationLevelOptions = async (projectId: string) => {
    if (!projectId) {
      setSimulationLevelOptions({ projects: [], languages: [], lobs: [] });
      return;
    }

    const { data: langData } = await supabase
      .from('lang')
      .select('id_lang, desc_lang')
      .eq('id_prj', projectId);

    const { data: lobData } = await supabase
      .from('lob')
      .select('id_lob, name, id_lang');

    const projectLangs = new Set((langData || []).map(l => l.id_lang));
    const projectLobs = (lobData || []).filter(l => projectLangs.has(l.id_lang));

    setSimulationLevelOptions({
      projects: [{ id: `PROJECT:${projectId}`, label: projectId }],
      languages: (langData || []).map(l => ({ 
        id: `LANGUAGE:${l.id_lang}`, 
        label: l.desc_lang || l.id_lang 
      })),
      lobs: projectLobs.map(l => ({ 
        id: `LOB:${l.id_lob}`, 
        label: l.name || l.id_lob 
      }))
    });
  };

  const loadLanguagesFromVersions = async (projectId: string, versionIds: string[]) => {
    const { data } = await (supabase as any)
      .from('simulation')
      .select('id_lang')
      .eq('id_proj', projectId)
      .in('id_sim_ver', versionIds)
      .not('id_lang', 'is', null);
    
    if (data) {
      const uniqueLangs = Array.from(
        new Set(data.map((item: any) => item.id_lang as string).filter(Boolean))
      ) as string[];
      
      setLanguages(uniqueLangs.map((lang: string) => ({
        id_lang: lang,
        desc_lang: lang
      })));
    }
  };

  const loadLobsFromVersions = async (projectId: string, versionIds: string[], languageId: string) => {
    const isLangDrillDown = languageId === 'DRILLDOWN' || languageId === '';
    
    let query = (supabase as any)
      .from('simulation')
      .select('id_lob')
      .eq('id_proj', projectId)
      .in('id_sim_ver', versionIds)
      .not('id_lob', 'is', null);
    
    if (!isLangDrillDown && languageId) {
      query = query.eq('id_lang', languageId);
    }
    
    const { data } = await query;
    
    if (data) {
      const uniqueLobs = Array.from(
        new Set(data.map((item: any) => item.id_lob as string).filter(Boolean))
      ) as string[];
      
      setLobs(uniqueLobs.map((lob: string) => ({
        id_lob: lob,
        name: lob
      })));
    }
  };

  const loadVersions = async (projectId: string) => {
    if (!projectId) {
      setVersions([]);
      return;
    }

    const { data: simData } = await (supabase as any)
      .from('simulation')
      .select('id_sim_ver')
      .eq('id_proj', projectId);
    
    if (simData && simData.length > 0) {
      const uniqueVersionIds = Array.from(
        new Set(simData.map((item: any) => item.id_sim_ver))
      );
      
      const { data: versionData } = await (supabase as any)
        .from('simulation_versions')
        .select('id_sim_ver, name, created_at, id_prj, status')
        .in('id_sim_ver', uniqueVersionIds)
        .order('created_at', { ascending: false });
      
      if (versionData) {
        const mappedData = versionData.map((v: any) => ({
          id: v.id_sim_ver,
          name: v.name,
          id_prj: v.id_prj,
          id_lang: '',
          created_at: v.created_at,
          status: v.status
        }));
        
        setVersions(mappedData);
        
        if (mappedData.length > 0) {
          // Select first version by default
          setSelectedVersionIds([mappedData[0].id]);
          loadVersionData(mappedData[0].id, mappedData[0].name, '', '');
        }
      }
    } else {
      setVersions([]);
      setSelectedVersionIds([]);
      setVersionDataMap(new Map());
    }
  };

  const loadVersionData = async (versionId: string, versionName: string, languageFilter?: string, lobFilter?: string) => {
    clearFormulaCache();
    
    if (!selectedProject || !versionId) {
      return;
    }

    const langToUse = languageFilter !== undefined ? languageFilter : selectedLanguage;
    const lobToUse = lobFilter !== undefined ? lobFilter : selectedLob;
    
    const isLangRollUp = langToUse === 'ROLLUP';
    const isLobRollUp = lobToUse === 'ROLLUP';
    const isLangDrillDown = langToUse === 'DRILLDOWN' || langToUse === '';
    const isLobDrillDown = lobToUse === 'DRILLDOWN' || lobToUse === '';

    // Load blocked variables
    let configVarsQuery = (supabase as any)
      .from('simulation_configs_variables')
      .select('id_sim_cfg_var, account_num, blocked, parent_account_id, id_lang, id_lob')
      .eq('id_proj', selectedProject);
    
    if (langToUse && !isLangRollUp && !isLangDrillDown) {
      configVarsQuery = configVarsQuery.or(`id_lang.eq.${langToUse},id_lang.is.null`);
    }
    if (lobToUse && !isLobRollUp && !isLobDrillDown) {
      configVarsQuery = configVarsQuery.or(`id_lob.eq.${lobToUse},id_lob.is.null`);
    }
    
    const { data: configVars } = await configVarsQuery;
    
    const blockedSet = new Set<string>();
    if (configVars) {
      configVars.forEach((cv: any) => {
        if (cv.blocked) {
          blockedSet.add(cv.account_num);
        }
      });
    }
    setBlockedVariables(blockedSet);

    // Load simulation data
    const { data: allData } = await (supabase as any)
      .from('simulation')
      .select('*')
      .eq('id_sim_ver', versionId)
      .eq('id_proj', selectedProject)
      .order('account_num');
    
    let data = allData;
    
    if (langToUse && !isLangRollUp && !isLangDrillDown) {
      data = allData?.filter((v: any) => v.id_lang === langToUse) || [];
    }
    
    if (lobToUse && !isLobRollUp && !isLobDrillDown) {
      data = data?.filter((v: any) => v.id_lob === lobToUse) || [];
    }
    
    // Include parents
    if ((langToUse && !isLangRollUp && !isLangDrillDown) || (lobToUse && !isLobRollUp && !isLobDrillDown)) {
      if (data && allData) {
        const dataIds = new Set(data.map((v: any) => v.parent_account_id));
        const includedIds = new Set(data.map((v: any) => v.id_sim_cfg_var));
        
        const parentsToAdd: any[] = [];
        dataIds.forEach(parentId => {
          if (parentId && !includedIds.has(parentId)) {
            const parent = allData.find((v: any) => v.id_sim_cfg_var === parentId);
            if (parent) {
              parentsToAdd.push(parent);
              includedIds.add(parent.id_sim_cfg_var);
            }
          }
        });
        
        if (parentsToAdd.length > 0) {
          data = [...data, ...parentsToAdd];
        }
      }
    }
    
    if (data) {
      const vars = data.map((v: any) => ({
        ...v,
        uniqueId: getUniqueId(v.account_num, v.month || 1, v.year || new Date().getFullYear(), v.id_lang, v.id_lob, versionId),
        account_code: v.account_num,
        calculation_type: (v.calculation_type === 'AUTO' ? 'MANUAL' : v.calculation_type || 'MANUAL') as 'MANUAL' | 'FORMULA',
        month: v.month || 1,
        year: v.year || new Date().getFullYear(),
        lob: v.id_lob,
        id_lang: v.id_lang,
        level: parseInt(v.level || '0', 10),
        parent_account_id: v.parent_account_id || null,
        id_sim_cfg_var: v.id_sim_cfg_var,
        row_index: v.row_index || 0,
        value: v.value !== undefined ? v.value : 0,
        value_orig: v.value_orig !== undefined ? v.value_orig : 0,
        page_name: v.page_name || 'Main',
        rollup: typeof v.rollup === 'boolean' ? (v.rollup ? 'true' : 'false') : (v.rollup || 'true'),
        version_id: versionId
      })) as Variable[];
      
      // Extract periods
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
      
      // Store in map
      setVersionDataMap(prev => {
        const newMap = new Map(prev);
        newMap.set(versionId, {
          versionId,
          versionName,
          variables: vars,
          periods: sortedPeriods
        });
        return newMap;
      });
    }
    
    setExpandedRows(new Set());
  };

  const loadAllSelectedVersions = async (versionIds: string[], languageFilter?: string, lobFilter?: string) => {
    // Clear existing data
    setVersionDataMap(new Map());
    
    // Load each version
    for (const versionId of versionIds) {
      const version = versions.find(v => v.id === versionId);
      if (version) {
        await loadVersionData(versionId, version.name, languageFilter, lobFilter);
      }
    }
  };

  const handleProjectChange = (projectId: string) => {
    setSelectedProject(projectId);
    setSelectedLanguage('');
    setVersions([]);
    setSelectedVersionIds([]);
    setVersionDataMap(new Map());
    setSimulationLevelValue('');
    if (projectId) {
      loadVersions(projectId);
      loadSimulationLevelOptions(projectId);
    } else {
      setSimulationLevelOptions({ projects: [], languages: [], lobs: [] });
    }
  };

  const handleSimulationLevelChange = (value: string) => {
    setSimulationLevelValue(value);
  };

  const handleLanguageChange = (languageId: string) => {
    const actualLanguage = (languageId === 'DRILLDOWN' || languageId === 'ROLLUP') ? languageId : languageId;
    setSelectedLanguage(actualLanguage);
    
    const lobToUse = actualLanguage === 'ROLLUP' ? 'ROLLUP' : selectedLob;
    if (actualLanguage === 'ROLLUP' && selectedLob !== 'ROLLUP') {
      setSelectedLob('ROLLUP');
    }
    
    if (selectedVersionIds.length > 0) {
      loadAllSelectedVersions(selectedVersionIds, actualLanguage, lobToUse);
    }
  };

  const handleLobChange = (lobId: string) => {
    const actualLob = (lobId === 'DRILLDOWN' || lobId === 'ROLLUP') ? lobId : lobId;
    setSelectedLob(actualLob);
    if (selectedVersionIds.length > 0 && activePage !== 'Simulation') {
      loadAllSelectedVersions(selectedVersionIds, selectedLanguage, actualLob);
    }
  };

  const handleVersionToggle = (versionId: string) => {
    setSelectedVersionIds(prev => {
      let newSelection: string[];
      if (prev.includes(versionId)) {
        newSelection = prev.filter(id => id !== versionId);
        // Remove from map
        setVersionDataMap(prevMap => {
          const newMap = new Map(prevMap);
          newMap.delete(versionId);
          return newMap;
        });
      } else {
        newSelection = [...prev, versionId];
        // Load this version
        const version = versions.find(v => v.id === versionId);
        if (version) {
          loadVersionData(versionId, version.name, selectedLanguage, selectedLob);
        }
      }
      return newSelection;
    });
  };

  const handleClearSelections = () => {
    setSelectedProject('');
    setSelectedLanguage('');
    setSelectedLob('');
    setVersions([]);
    setSelectedVersionIds([]);
    setVersionDataMap(new Map());
    setVariableValues(new Map());
  };

  const handleSave = async () => {
    if (selectedVersionIds.length === 0) {
      toast({ title: 'Atenção', description: 'Nenhuma versão selecionada' });
      return;
    }

    setSaveStatus('saving');

    try {
      const updates: Promise<any>[] = [];
      
      variableValues.forEach((value, key) => {
        const [accountCode, year, month, language, lob, versionId] = key.split('-');
        
        const versionData = versionDataMap.get(versionId);
        if (!versionData) return;
        
        const variable = versionData.variables.find(v => 
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
              .eq('account_num', variable.account_code)
              .eq('month', variable.month)
              .eq('year', variable.year)
              .eq('id_sim_ver', versionId)
              .eq('id_lang', variable.id_lang || null)
              .eq('id_lob', variable.lob || null)
          );
        }
      });
      
      if (updates.length > 0) {
        await Promise.all(updates);
      }
      
      await loadAllSelectedVersions(selectedVersionIds, selectedLanguage, selectedLob);
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

  const hasChildren = (uniqueId: string, variables: Variable[]) => {
    const thisVar = variables.find(v => v.uniqueId === uniqueId);
    if (!thisVar) return false;
    return variables.some(v => v.parent_account_id === thisVar.id_sim_cfg_var);
  };

  const isLeafAccount = (accountCode: string, allVars: Variable[]) => {
    const variable = allVars.find(v => v.account_code === accountCode);
    if (!variable) return true;
    return !hasChildren(variable.uniqueId, allVars);
  };

  const getValue = (variable: Variable, year: number, month: number, versionId: string): number => {
    const versionData = versionDataMap.get(versionId);
    if (!versionData) return 0;
    
    const variables = versionData.variables;
    const isLangRollUp = selectedLanguage === 'ROLLUP';
    const isLobRollUp = selectedLob === 'ROLLUP';
    
    if (isLangRollUp || isLobRollUp) {
      if (variable.rollup === 'false') {
        const matchingVar = variables.find(v => 
          v.account_code === variable.account_code && 
          v.year === year && 
          v.month === month
        );
        return matchingVar?.value || 0;
      }
      
      // For RollUp, aggregate all variables with same name (ignoring lang/lob when in rollup mode)
      const matchingVars = variables.filter(v => {
        if (v.name !== variable.name) return false;
        if (v.year !== year) return false;
        if (v.month !== month) return false;
        if ((v.page_name || 'Main') !== (variable.page_name || 'Main')) return false;
        if (v.page_name === 'Simulation') return false;
        if (v.rollup === 'false' || v.rollup === 'hidden') return false;
        // When in DrillDown for language, match by actual language (not ROLLUP)
        if (!isLangRollUp && variable.id_lang !== 'ROLLUP' && v.id_lang !== variable.id_lang) return false;
        // When in DrillDown for LOB, match by actual LOB (not ROLLUP) 
        if (!isLobRollUp && variable.lob !== 'ROLLUP' && v.lob !== variable.lob) return false;
        return true;
      });
      
      return matchingVars.reduce((sum, v) => sum + (v.value || 0), 0);
    }
    
    const key = `${variable.account_code}-${year}-${month}-${variable.id_lang}-${variable.lob}-${versionId}`;
    
    if (variableValues.has(key)) {
      return variableValues.get(key) || 0;
    }
    
    const matchingVar = variables.find(v => 
      v.account_code === variable.account_code && 
      v.year === year && 
      v.month === month && 
      v.lob === variable.lob &&
      v.id_lang === variable.id_lang
    );
    
    return matchingVar?.value || 0;
  };

  const getOriginalValue = (variable: Variable, year: number, month: number, versionId: string): number => {
    const versionData = versionDataMap.get(versionId);
    if (!versionData) return 0;
    
    const variables = versionData.variables;
    const isLangRollUp = selectedLanguage === 'ROLLUP';
    const isLobRollUp = selectedLob === 'ROLLUP';
    
    if (isLangRollUp || isLobRollUp) {
      if (variable.rollup === 'false') {
        const matchingVar = variables.find(v => 
          v.account_code === variable.account_code && 
          v.year === year && 
          v.month === month
        );
        return matchingVar?.value_orig || 0;
      }
      
      const matchingVars = variables.filter(v => {
        if (v.name !== variable.name) return false;
        if (v.year !== year) return false;
        if (v.month !== month) return false;
        if ((v.page_name || 'Main') !== (variable.page_name || 'Main')) return false;
        if (v.page_name === 'Simulation') return false;
        if (v.rollup === 'false' || v.rollup === 'hidden') return false;
        if (!isLangRollUp && variable.id_lang !== 'ROLLUP' && v.id_lang !== variable.id_lang) return false;
        if (!isLobRollUp && variable.lob !== 'ROLLUP' && v.lob !== variable.lob) return false;
        return true;
      });
      
      return matchingVars.reduce((sum, v) => sum + (v.value_orig || 0), 0);
    }
    
    const matchingVar = variables.find(v => 
      v.account_code === variable.account_code && 
      v.year === year && 
      v.month === month && 
      v.lob === variable.lob &&
      v.id_lang === variable.id_lang
    );
    return matchingVar?.value_orig || 0;
  };

  const updateValue = (accountCode: string, year: number, month: number, language: string, lob: string, versionId: string, value: string) => {
    const key = `${accountCode}-${year}-${month}-${language}-${lob}-${versionId}`;
    setVariableValues(prev => {
      const newMap = new Map(prev);
      newMap.set(key, parseFloat(value) || 0);
      return newMap;
    });
  };

  const getTotal = (variable: Variable, versionId: string) => {
    return combinedPeriods.reduce((sum, period) => 
      sum + getValue(variable, period.year, period.month, versionId), 0
    );
  };

  const getOriginalTotal = (variable: Variable, versionId: string) => {
    return combinedPeriods.reduce((sum, period) => 
      sum + getOriginalValue(variable, period.year, period.month, versionId), 0
    );
  };

  const toggleExpandedRow = (varKey: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(varKey)) {
        newSet.delete(varKey);
      } else {
        newSet.add(varKey);
      }
      return newSet;
    });
  };

  // Get unique variables across all versions for display (based on name + lang + lob combination)
  const getVisibleVariables = () => {
    const pageFilteredVars = allVariables.filter(v => 
      v.page_name && 
      v.page_name === activePage && 
      v.rollup !== 'hidden'
    );
    
    if (activePage === 'Simulation') {
      let filteredVars = pageFilteredVars;
      
      if (simulationLevelValue) {
        const [levelType, levelId] = simulationLevelValue.split(':');
        
        if (levelType === 'PROJECT') {
          filteredVars = pageFilteredVars.filter(v => !v.id_lang && !v.lob);
        } else if (levelType === 'LANGUAGE' && levelId) {
          filteredVars = pageFilteredVars.filter(v => v.id_lang === levelId && !v.lob);
        } else if (levelType === 'LOB' && levelId) {
          filteredVars = pageFilteredVars.filter(v => v.lob === levelId);
        }
      } else {
        filteredVars = pageFilteredVars.filter(v => !v.id_lang && !v.lob);
      }
      
      // Dedupe by account_code + lang + lob
      const uniqueVarsMap = new Map<string, Variable>();
      filteredVars.forEach(v => {
        const uniqueKey = `${v.account_code}_${v.id_lang || 'null'}_${v.lob || 'null'}`;
        if (!uniqueVarsMap.has(uniqueKey)) {
          uniqueVarsMap.set(uniqueKey, v);
        }
      });
      
      return Array.from(uniqueVarsMap.values()).sort((a, b) => a.row_index - b.row_index);
    }
    
    const isLangRollUp = selectedLanguage === 'ROLLUP';
    const isLobRollUp = selectedLob === 'ROLLUP';
    
    if (isLangRollUp || isLobRollUp) {
      const uniqueVarsForDisplayMap = new Map<string, Variable>();
      
      pageFilteredVars.forEach(v => {
        const langPart = !isLangRollUp ? (v.id_lang || 'null') : 'all';
        const displayKey = `${v.name}_${langPart}`;
        
        if (!uniqueVarsForDisplayMap.has(displayKey)) {
          const displayVar: Variable = {
            ...v,
            uniqueId: `rollup_${v.name}_${langPart}`,
            id_lang: isLangRollUp ? 'ROLLUP' : v.id_lang,
            lob: isLobRollUp ? 'ROLLUP' : v.lob,
          };
          uniqueVarsForDisplayMap.set(displayKey, displayVar);
        }
      });
      
      return Array.from(uniqueVarsForDisplayMap.values()).sort((a, b) => a.row_index - b.row_index);
    }
    
    // Dedupe by account_code + lang + lob (ignore version)
    const uniqueVarsMap = new Map<string, Variable>();
    pageFilteredVars.forEach(v => {
      const uniqueKey = `${v.account_code}_${v.id_lang || 'null'}_${v.lob || 'null'}`;
      if (!uniqueVarsMap.has(uniqueKey)) {
        uniqueVarsMap.set(uniqueKey, v);
      }
    });
    
    return Array.from(uniqueVarsMap.values()).sort((a, b) => a.row_index - b.row_index);
  };

  const selectedVersionsData = Array.from(versionDataMap.values());

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
              <h1 className="text-xl font-bold">SimulationForm V2</h1>
              {selectedVersionIds.length > 1 && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                  {selectedVersionIds.length} versões selecionadas
                </span>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearSelections}
                disabled={!selectedProject}
                className="text-xs h-7"
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={selectedVersionIds.length === 0 || saveStatus === 'saving'}
                variant={saveStatus === 'success' ? 'default' : saveStatus === 'error' ? 'destructive' : 'default'}
                className="text-xs h-7"
              >
                {saveStatus === 'saving' && <><Loader2 className="h-3 w-3 mr-1 animate-spin" />Saving...</>}
                {saveStatus === 'success' && <><CheckCircle className="h-3 w-3 mr-1" />Saved</>}
                {saveStatus === 'error' && <><XCircle className="h-3 w-3 mr-1" />Error</>}
                {saveStatus === 'idle' && <><Save className="h-3 w-3 mr-1" />Save</>}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <div>
              <Label className="text-xs">Project</Label>
              <Select value={selectedProject} onValueChange={handleProjectChange}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(p => (
                    <SelectItem key={p.id_prj} value={p.id_prj} className="text-xs">
                      {p.id_prj}{p.desc_prj ? ` - ${p.desc_prj}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Versions</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-8 text-xs justify-between"
                    disabled={!selectedProject}
                  >
                    <span className="truncate">
                      {selectedVersionIds.length === 0 
                        ? 'Select versions' 
                        : selectedVersionIds.length === 1
                          ? versions.find(v => v.id === selectedVersionIds[0])?.name || 'Version'
                          : `${selectedVersionIds.length} versions`
                      }
                    </span>
                    <ChevronDown className="h-3 w-3 ml-2 shrink-0" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2 bg-popover" align="start">
                  <div className="space-y-1 max-h-60 overflow-y-auto">
                    {versions.map(v => (
                      <div
                        key={v.id}
                        className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted cursor-pointer"
                        onClick={() => handleVersionToggle(v.id)}
                      >
                        <Checkbox
                          checked={selectedVersionIds.includes(v.id)}
                          className="h-4 w-4"
                        />
                        <span className="text-xs flex-1 truncate">{v.name}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(v.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label className="text-xs">Language</Label>
              <Select value={selectedLanguage || 'DRILLDOWN'} onValueChange={handleLanguageChange} disabled={selectedVersionIds.length === 0}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRILLDOWN" className="text-xs">DrillDown</SelectItem>
                  <SelectItem value="ROLLUP" className="text-xs">RollUp</SelectItem>
                  {languages.map(l => (
                    <SelectItem key={l.id_lang} value={l.id_lang} className="text-xs">
                      {l.id_lang}{l.desc_lang ? ` - ${l.desc_lang}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">LOB</Label>
              <Select 
                value={selectedLanguage === 'ROLLUP' ? 'ROLLUP' : (selectedLob || 'DRILLDOWN')} 
                onValueChange={handleLobChange} 
                disabled={selectedVersionIds.length === 0 || selectedLanguage === 'ROLLUP'}
              >
                <SelectTrigger className={`h-8 text-xs ${selectedLanguage === 'ROLLUP' ? 'opacity-50' : ''}`}>
                  <SelectValue placeholder="LOB" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRILLDOWN" className="text-xs">DrillDown</SelectItem>
                  <SelectItem value="ROLLUP" className="text-xs">RollUp</SelectItem>
                  {lobs.map(l => (
                    <SelectItem key={l.id_lob} value={l.id_lob} className="text-xs">
                      {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Simulation Level</Label>
              <Select 
                value={simulationLevelValue} 
                onValueChange={handleSimulationLevelChange} 
                disabled={!selectedProject}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  {simulationLevelOptions.projects.length > 0 && (
                    <>
                      <SelectItem value="__header_project" disabled className="font-semibold text-muted-foreground text-[10px]">
                        — Project —
                      </SelectItem>
                      {simulationLevelOptions.projects.map(p => (
                        <SelectItem key={p.id} value={p.id} className="text-xs">
                          {p.label}
                        </SelectItem>
                      ))}
                    </>
                  )}
                  {simulationLevelOptions.languages.length > 0 && (
                    <>
                      <SelectItem value="__header_language" disabled className="font-semibold text-muted-foreground text-[10px]">
                        — Language —
                      </SelectItem>
                      {simulationLevelOptions.languages.map(l => (
                        <SelectItem key={l.id} value={l.id} className="text-xs">
                          {l.label}
                        </SelectItem>
                      ))}
                    </>
                  )}
                  {simulationLevelOptions.lobs.length > 0 && (
                    <>
                      <SelectItem value="__header_lob" disabled className="font-semibold text-muted-foreground text-[10px]">
                        — LOB —
                      </SelectItem>
                      {simulationLevelOptions.lobs.map(l => (
                        <SelectItem key={l.id} value={l.id} className="text-xs">
                          {l.label}
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Page Tabs */}
      <div className="container mx-auto px-6 pt-4">
        {pageNames.length > 1 && (
          <div className="flex items-center border-b overflow-x-auto pb-0">
            <div className="flex items-center gap-1 flex-1">
              {pageNames.filter(p => p !== 'Simulation').map(pageName => (
                <button
                  key={pageName}
                  onClick={() => setActivePage(pageName)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
                    activePage === pageName
                      ? 'border-primary text-primary bg-background'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  {pageName}
                </button>
              ))}
            </div>
            {pageNames.includes('Simulation') && (
              <button
                onClick={() => setActivePage('Simulation')}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ml-auto ${
                  activePage === 'Simulation'
                    ? 'border-primary text-primary bg-background'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <FileSpreadsheet className="h-4 w-4" />
                Simulation
              </button>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="container mx-auto p-6 pt-4">
        {selectedVersionIds.length > 0 ? (
          <Card className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                {/* Version header row */}
                <tr className="bg-muted/50 border-b">
                  <th className="px-2 py-1 text-left font-semibold w-16 text-xs" rowSpan={2}>Lang</th>
                  <th className="px-2 py-1 text-left font-semibold w-20 text-xs" rowSpan={2}>LOB</th>
                  <th className="px-2 py-1 text-left font-semibold min-w-[140px] text-xs" rowSpan={2}>Account</th>
                  {selectedVersionsData.map(vd => (
                    <th 
                      key={vd.versionId} 
                      className="px-2 py-1 text-center font-semibold text-xs border-l bg-primary/5"
                      colSpan={combinedPeriods.length + 1}
                    >
                      {vd.versionName}
                    </th>
                  ))}
                </tr>
                {/* Period header row */}
                <tr className="bg-muted border-b">
                  {selectedVersionsData.map(vd => (
                    <React.Fragment key={`header-${vd.versionId}`}>
                      {combinedPeriods.map(period => (
                        <th 
                          key={`${vd.versionId}-${period.year}-${period.month}`} 
                          className="px-3 py-1.5 text-right font-semibold min-w-[80px] text-xs border-l first:border-l-0"
                        >
                          {period.label}
                        </th>
                      ))}
                      <th 
                        key={`${vd.versionId}-total`} 
                        className="px-3 py-1.5 text-right font-semibold min-w-[80px] text-xs bg-muted/80"
                      >
                        Total
                      </th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {getVisibleVariables().map((variable, varIndex) => {
                  const varKey = `${varIndex}_${variable.account_code}_${variable.id_lang || 'null'}_${variable.lob || 'null'}`;
                  const isParent = hasChildren(variable.uniqueId, allVariables);
                  const isExpanded = expandedRows.has(varKey);
                  const calcType = variable.calculation_type || 'AUTO';
                  const isBlocked = blockedVariables.has(variable.account_code);
                  
                  // Check if any selected version is not Draft - block editing on Simulation tab
                  const isSimulationTabLocked = activePage === 'Simulation' && selectedVersionIds.some(vId => {
                    const version = versions.find(v => v.id === vId);
                    return version && version.status !== 'Draft';
                  });
                  
                  const isEditable = isLeafAccount(variable.account_code, allVariables) && 
                                    calcType !== 'FORMULA' &&
                                    !isBlocked &&
                                    !isSimulationTabLocked;
                  
                  return (
                    <tr key={varKey} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="px-2 py-1 text-xs">
                        {variable.id_lang || '-'}
                      </td>
                      <td className="px-2 py-1 text-xs">
                        {variable.lob || '-'}
                      </td>
                      <td className="px-2 py-1">
                        <div 
                          className="flex items-center gap-2"
                          style={{ paddingLeft: `${variable.level * 20}px` }}
                        >
                          {isParent ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 hover:bg-muted"
                              onClick={() => toggleExpandedRow(varKey)}
                              title={isExpanded ? "Collapse" : "Expand"}
                            >
                              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </Button>
                          ) : (
                            <div className="w-6" />
                          )}
                          
                          <span className={isParent ? 'font-semibold text-xs' : 'text-xs'}>
                            {variable.name}
                          </span>
                        </div>
                      </td>
                      
                      {selectedVersionsData.map(vd => {
                        // Find variable in this version's data - when in RollUp mode, find by name instead of exact match
                        const isLangRollUp = selectedLanguage === 'ROLLUP';
                        const isLobRollUp = selectedLob === 'ROLLUP';
                        
                        let versionVar = vd.variables.find(v => {
                          if (isLangRollUp && isLobRollUp) {
                            return v.name === variable.name;
                          } else if (isLangRollUp) {
                            return v.name === variable.name && (variable.lob === 'ROLLUP' || v.lob === variable.lob);
                          } else if (isLobRollUp) {
                            return v.name === variable.name && (variable.id_lang === 'ROLLUP' || v.id_lang === variable.id_lang);
                          }
                          return v.account_code === variable.account_code && 
                            v.id_lang === variable.id_lang &&
                            v.lob === variable.lob;
                        });
                        
                        return (
                          <React.Fragment key={`cells-${vd.versionId}`}>
                            {combinedPeriods.map((period) => {
                              const value = versionVar ? getValue(versionVar, period.year, period.month, vd.versionId) : 0;
                              const originalValue = versionVar ? getOriginalValue(versionVar, period.year, period.month, vd.versionId) : 0;
                              const compareSymbol = value === originalValue ? '=' : value < originalValue ? '<' : '>';
                              
                              return (
                                <td key={`${vd.versionId}-${period.year}-${period.month}`} className="px-3 py-1 text-right border-l first:border-l-0">
                                  <div className="flex flex-col items-end gap-0.5">
                                    {versionVar && isEditable ? (
                                      <>
                                        <Input
                                          type="number"
                                          step="0.0001"
                                          value={value}
                                          onChange={(e) => updateValue(variable.account_code, period.year, period.month, variable.id_lang, variable.lob, vd.versionId, e.target.value)}
                                          className="w-full text-right h-6 text-xs bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/30 focus:ring-green-500"
                                        />
                                        <span className="text-[9px] text-muted-foreground leading-none">
                                          {compareSymbol} {originalValue.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                                        </span>
                                      </>
                                    ) : (
                                      <>
                                        <span className={isParent || calcType === 'FORMULA' ? 'font-semibold text-xs' : 'text-xs'}>
                                          {value.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                                        </span>
                                        <span className="text-[9px] text-muted-foreground leading-none">
                                          {compareSymbol} {originalValue.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </td>
                              );
                            })}
                            <td className="px-3 py-1 text-right bg-muted/30">
                              <div className="flex flex-col items-end gap-0.5">
                                <span className="font-semibold text-xs">
                                  {versionVar ? getTotal(versionVar, vd.versionId).toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : '-'}
                                </span>
                                <span className="text-[9px] text-muted-foreground leading-none">
                                  {(() => {
                                    if (!versionVar) return '-';
                                    const totalValue = getTotal(versionVar, vd.versionId);
                                    const totalOriginal = getOriginalTotal(versionVar, vd.versionId);
                                    const sym = totalValue === totalOriginal ? '=' : totalValue < totalOriginal ? '<' : '>';
                                    return `${sym} ${totalOriginal.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
                                  })()}
                                </span>
                              </div>
                            </td>
                          </React.Fragment>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        ) : (
          <Card className="p-12 text-center text-muted-foreground">
            Select a project and versions to start
          </Card>
        )}
      </div>
    </div>
  );
}
