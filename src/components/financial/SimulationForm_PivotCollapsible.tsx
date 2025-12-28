import React, { useState, useEffect, useMemo } from 'react';
import { Menu, Loader2, ChevronDown, ChevronRight, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface Project { id_prj: string; desc_prj: string | null; }
interface Language { id_lang: string; desc_lang: string | null; }
interface SimulationVersion { id: string; name: string; }
interface Variable {
  uniqueId: string;
  version_id: string;
  account_code: string;
  name: string;
  month: number;
  year: number;
  id_lang: string | null;
  id_lob: string | null;
  level: number;
  id_sim_cfg_var: string;
  parent_account_id: string | null;
  value: number | null;
  row_index: number;
  page_name: string | null;
}

interface Props { onMenuClick: () => void; }

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function SimulationForm_PivotCollapsible({ onMenuClick }: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [versions, setVersions] = useState<SimulationVersion[]>([]);
  const [selectedVersionIds, setSelectedVersionIds] = useState<string[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [lobs, setLobs] = useState<Array<{ id_lob: string; name: string }>>([]);
  const [selectedLob, setSelectedLob] = useState('');
  const [variables, setVariables] = useState<Variable[]>([]);
  const [variableValues, setVariableValues] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving'>('idle');
  const [activePage, setActivePage] = useState('Main');
  const [showDelta, setShowDelta] = useState(true);
  const [collapsedParents, setCollapsedParents] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => { loadProjects(); }, []);
  useEffect(() => { if (selectedProject) loadVersions(); else reset(); }, [selectedProject]);
  useEffect(() => { if (selectedProject && selectedVersionIds.length > 0) loadLanguages(); }, [selectedProject, selectedVersionIds]);
  useEffect(() => { if (selectedProject && selectedVersionIds.length > 0 && selectedLanguage) loadLobs(); }, [selectedProject, selectedVersionIds, selectedLanguage]);
  useEffect(() => { if (selectedProject && selectedVersionIds.length > 0) loadData(); }, [selectedProject, selectedVersionIds, selectedLanguage, selectedLob]);

  const reset = () => { setVersions([]); setSelectedVersionIds([]); setLanguages([]); setSelectedLanguage(''); setLobs([]); setSelectedLob(''); setVariables([]); setCollapsedParents(new Set()); };

  const loadProjects = async () => {
    const { data } = await supabase.from('project').select('id_prj, desc_prj').order('id_prj');
    setProjects(data || []);
    setLoading(false);
  };

  const loadVersions = async () => {
    const { data: simData } = await supabase.from('simulation').select('id_sim_ver').eq('id_proj', selectedProject);
    if (simData?.length) {
      const uniqueIds = [...new Set(simData.map(i => i.id_sim_ver))];
      const { data } = await supabase.from('simulation_versions').select('id_sim_ver, name').in('id_sim_ver', uniqueIds).order('created_at', { ascending: false });
      if (data) {
        setVersions(data.map(v => ({ id: v.id_sim_ver, name: v.name })));
        if (data.length >= 2) setSelectedVersionIds([data[0].id_sim_ver, data[1].id_sim_ver]);
        else if (data.length > 0) setSelectedVersionIds([data[0].id_sim_ver]);
      }
    } else reset();
  };

  const loadLanguages = async () => {
    const { data } = await supabase.from('simulation').select('id_lang').eq('id_proj', selectedProject).in('id_sim_ver', selectedVersionIds).not('id_lang', 'is', null);
    if (data) {
      const uniqueLangs = [...new Set(data.map(d => d.id_lang).filter(Boolean))] as string[];
      setLanguages(uniqueLangs.map(l => ({ id_lang: l, desc_lang: l })));
    }
  };

  const loadLobs = async () => {
    let query = supabase.from('simulation').select('id_lob').eq('id_proj', selectedProject).in('id_sim_ver', selectedVersionIds).not('id_lob', 'is', null);
    if (selectedLanguage && selectedLanguage !== 'DRILLDOWN') query = query.eq('id_lang', selectedLanguage);
    const { data } = await query;
    if (data) {
      const uniqueLobs = [...new Set(data.map(d => d.id_lob).filter(Boolean))] as string[];
      setLobs(uniqueLobs.map(l => ({ id_lob: l, name: l })));
    }
  };

  const loadData = async () => {
    if (!selectedProject || selectedVersionIds.length === 0) { setVariables([]); return; }
    setDataLoading(true);
    
    let query = supabase.from('simulation').select('*').eq('id_proj', selectedProject).in('id_sim_ver', selectedVersionIds).order('row_index');
    if (selectedLanguage && selectedLanguage !== 'DRILLDOWN') query = query.eq('id_lang', selectedLanguage);
    if (selectedLob && selectedLob !== 'DRILLDOWN') query = query.eq('id_lob', selectedLob);
    
    const { data } = await query;
    if (data) {
      setVariables(data.map(v => ({
        uniqueId: `${v.account_num}_${v.month}_${v.year}_${v.id_lang}_${v.id_lob}_${v.id_sim_ver}`,
        version_id: v.id_sim_ver,
        account_code: v.account_num,
        name: v.name,
        month: v.month,
        year: v.year,
        id_lang: v.id_lang,
        id_lob: v.id_lob,
        level: parseInt(v.level || '0', 10),
        id_sim_cfg_var: v.id_sim_cfg_var,
        parent_account_id: v.parent_account_id,
        value: v.value,
        row_index: v.row_index,
        page_name: v.page_name || 'Main'
      })));
    }
    setDataLoading(false);
  };

  const handleVersionToggle = (id: string) => setSelectedVersionIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const pageNames = useMemo(() => [...new Set(variables.map(v => v.page_name).filter(Boolean))].sort() as string[], [variables]);
  const months = useMemo(() => [...new Set(variables.map(v => v.month))].sort((a, b) => a - b), [variables]);
  const selectedVersions = useMemo(() => versions.filter(v => selectedVersionIds.includes(v.id)), [versions, selectedVersionIds]);

  // Get unique variables for display (one per account/lang/lob combination)
  // Ordered hierarchically: parents followed by their children sorted by account_num
  const uniqueVars = useMemo(() => {
    const pageVars = variables.filter(v => v.page_name === activePage);
    const map = new Map<string, Variable>();
    pageVars.forEach(v => {
      const key = `${v.account_code}_${v.id_lang}_${v.id_lob}`;
      if (!map.has(key) || v.month === months[0]) map.set(key, v);
    });
    const allVars = Array.from(map.values());
    
    // Build a map of id_sim_cfg_var to variable for quick lookup
    const varById = new Map<string, Variable>();
    allVars.forEach(v => varById.set(v.id_sim_cfg_var, v));
    
    // Group children by parent_account_id
    // A variable is a root if: no parent_account_id OR parent_account_id equals its own id_sim_cfg_var (self-reference)
    const childrenByParent = new Map<string, Variable[]>();
    const rootVars: Variable[] = [];
    
    allVars.forEach(v => {
      const isRoot = !v.parent_account_id || v.parent_account_id === v.id_sim_cfg_var;
      if (isRoot) {
        rootVars.push(v);
      } else {
        const children = childrenByParent.get(v.parent_account_id) || [];
        children.push(v);
        childrenByParent.set(v.parent_account_id, children);
      }
    });
    
    // Sort children by account_num within each parent group
    childrenByParent.forEach((children, parentId) => {
      children.sort((a, b) => a.account_code.localeCompare(b.account_code));
    });
    
    // Sort root vars by account_num
    rootVars.sort((a, b) => a.account_code.localeCompare(b.account_code));
    
    // Build ordered list: recursively add parent then children
    const orderedVars: Variable[] = [];
    const addVarWithChildren = (v: Variable) => {
      orderedVars.push(v);
      const children = childrenByParent.get(v.id_sim_cfg_var) || [];
      children.forEach(child => addVarWithChildren(child));
    };
    
    rootVars.forEach(v => addVarWithChildren(v));
    
    return orderedVars;
  }, [variables, activePage, months]);

  // Build parent-child relationships using id_sim_cfg_var as parent reference
  const parentChildMap = useMemo(() => {
    const map = new Map<string, string[]>();
    uniqueVars.forEach(v => {
      // Skip self-references and null parents
      const isRoot = !v.parent_account_id || v.parent_account_id === v.id_sim_cfg_var;
      if (!isRoot) {
        const parentKey = v.parent_account_id;
        const children = map.get(parentKey) || [];
        children.push(v.id_sim_cfg_var);
        map.set(parentKey, children);
      }
    });
    return map;
  }, [uniqueVars]);

  // Find which variables are parents (have children)
  const parentVarIds = useMemo(() => {
    const parents = new Set<string>();
    uniqueVars.forEach(v => {
      if (parentChildMap.has(v.id_sim_cfg_var)) {
        parents.add(v.id_sim_cfg_var);
      }
    });
    return parents;
  }, [uniqueVars, parentChildMap]);

  // Get all descendants of a collapsed parent
  const getDescendants = (parentId: string, visited = new Set<string>()): Set<string> => {
    if (visited.has(parentId)) return new Set();
    visited.add(parentId);
    
    const descendants = new Set<string>();
    const children = parentChildMap.get(parentId) || [];
    
    children.forEach(childKey => {
      descendants.add(childKey);
      const childDescendants = getDescendants(childKey, visited);
      childDescendants.forEach(d => descendants.add(d));
    });
    
    return descendants;
  };

  // Determine which rows are visible (not hidden by collapsed parents)
  const visibleVars = useMemo(() => {
    const hiddenIds = new Set<string>();
    
    collapsedParents.forEach(parentId => {
      const descendants = getDescendants(parentId);
      descendants.forEach(d => hiddenIds.add(d));
    });
    
    return uniqueVars.filter(v => !hiddenIds.has(v.id_sim_cfg_var));
  }, [uniqueVars, collapsedParents, parentChildMap]);

  const toggleCollapse = (varId: string) => {
    setCollapsedParents(prev => {
      const next = new Set(prev);
      if (next.has(varId)) next.delete(varId);
      else next.add(varId);
      return next;
    });
  };

  const expandAll = () => setCollapsedParents(new Set());
  const collapseAll = () => setCollapsedParents(new Set(parentVarIds));

  const getValue = (accountCode: string, lang: string | null, lob: string | null, month: number, versionId: string): number | null => {
    const key = `${accountCode}-${lang}-${lob}-${month}-${versionId}`;
    if (variableValues.has(key)) return variableValues.get(key)!;
    const v = variables.find(x => x.account_code === accountCode && x.id_lang === lang && x.id_lob === lob && x.month === month && x.version_id === versionId);
    return v?.value ?? null;
  };

  const updateValue = (accountCode: string, lang: string | null, lob: string | null, month: number, versionId: string, value: number) => {
    const key = `${accountCode}-${lang}-${lob}-${month}-${versionId}`;
    setVariableValues(prev => new Map(prev).set(key, value));
  };

  const colsPerMonth = selectedVersions.length + (showDelta && selectedVersions.length === 2 ? 1 : 0);

  const handleSave = async () => {
    if (variableValues.size === 0) { toast({ title: 'Nada para guardar' }); return; }
    setSaveStatus('saving');
    try {
      for (const [key, value] of variableValues) {
        const [accountCode, lang, lob, month, versionId] = key.split('-');
        await supabase.from('simulation').update({ value }).eq('account_num', accountCode).eq('month', parseInt(month)).eq('id_sim_ver', versionId).eq('id_lang', lang === 'null' ? null : lang).eq('id_lob', lob === 'null' ? null : lob);
      }
      const count = variableValues.size;
      setVariableValues(new Map());
      await loadData();
      toast({ title: 'Sucesso', description: `${count} valores guardados` });
    } catch (e) {
      toast({ title: 'Erro', description: 'Erro ao guardar', variant: 'destructive' });
    }
    setSaveStatus('idle');
  };

  if (loading) return <div className="flex items-center justify-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b sticky top-0 z-20">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3 flex-wrap">
          <Button variant="ghost" size="icon" onClick={onMenuClick}><Menu className="h-5 w-5" /></Button>
          <h1 className="text-lg font-bold">Pivot Collapsible</h1>
          
          <div className="flex items-center gap-2">
            <Label className="text-xs">Project:</Label>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="h-8 w-32 text-xs"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{projects.map(p => <SelectItem key={p.id_prj} value={p.id_prj} className="text-xs">{p.id_prj}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Label className="text-xs">Versions:</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-8 w-32 text-xs justify-between" disabled={!selectedProject}>
                  {selectedVersionIds.length === 0 ? 'Select' : `${selectedVersionIds.length} sel.`}<ChevronDown className="h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2 bg-popover">
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {versions.map(v => (
                    <div key={v.id} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-muted cursor-pointer" onClick={() => handleVersionToggle(v.id)}>
                      <Checkbox checked={selectedVersionIds.includes(v.id)} className="h-4 w-4" />
                      <span className="text-xs truncate">{v.name}</span>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center gap-2">
            <Label className="text-xs">Language:</Label>
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="h-8 w-28 text-xs"><SelectValue placeholder="All" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="DRILLDOWN" className="text-xs">All</SelectItem>
                {languages.map(l => <SelectItem key={l.id_lang} value={l.id_lang} className="text-xs">{l.desc_lang || l.id_lang}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Label className="text-xs">LOB:</Label>
            <Select value={selectedLob} onValueChange={setSelectedLob}>
              <SelectTrigger className="h-8 w-28 text-xs"><SelectValue placeholder="All" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="DRILLDOWN" className="text-xs">All</SelectItem>
                {lobs.map(l => <SelectItem key={l.id_lob} value={l.id_lob} className="text-xs">{l.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {selectedVersions.length === 2 && (
            <div className="flex items-center gap-2">
              <Checkbox id="showDelta" checked={showDelta} onCheckedChange={(v) => setShowDelta(!!v)} />
              <Label htmlFor="showDelta" className="text-xs cursor-pointer">Show Delta</Label>
            </div>
          )}

          <div className="flex items-center gap-1 ml-2">
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={expandAll}>Expand All</Button>
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={collapseAll}>Collapse All</Button>
          </div>

          <Button variant="default" size="sm" className="ml-auto h-8" onClick={handleSave} disabled={saveStatus === 'saving' || variableValues.size === 0}>
            <Save className="h-4 w-4 mr-1" />{saveStatus === 'saving' ? 'Saving...' : 'Save'}
          </Button>
        </div>

        {pageNames.length > 1 && (
          <div className="container mx-auto px-4 pb-2">
            <Tabs value={activePage} onValueChange={setActivePage}>
              <TabsList className="h-8">
                {pageNames.map(p => <TabsTrigger key={p} value={p} className="text-xs h-7">{p}</TabsTrigger>)}
              </TabsList>
            </Tabs>
          </div>
        )}
      </header>

      <main className="container mx-auto p-4">
        {dataLoading ? (
          <div className="py-12 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>
        ) : visibleVars.length === 0 ? (
          <Card className="p-12 text-center text-muted-foreground">Select project and versions to view data</Card>
        ) : (
          <Card className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                {/* Month headers */}
                <tr className="bg-muted/50 border-b">
                  <th className="px-2 py-2 text-left font-semibold sticky left-0 bg-muted/50 z-10 min-w-[180px]" rowSpan={2}>Variable</th>
                  <th className="px-2 py-2 text-left font-semibold min-w-[50px]" rowSpan={2}>Lang</th>
                  <th className="px-2 py-2 text-left font-semibold min-w-[50px]" rowSpan={2}>LOB</th>
                  {months.map(m => (
                    <th key={m} className="px-1 py-2 text-center font-semibold border-l bg-primary/5" colSpan={colsPerMonth}>
                      {monthNames[m - 1]}
                    </th>
                  ))}
                  <th className="px-1 py-2 text-center font-semibold border-l bg-muted" colSpan={colsPerMonth}>Total</th>
                </tr>
                {/* Version sub-headers */}
                <tr className="bg-muted border-b">
                  {months.map(m => (
                    <React.Fragment key={`vh-${m}`}>
                      {selectedVersions.map(v => (
                        <th key={`${m}-${v.id}`} className="px-1 py-1 text-right font-medium min-w-[70px] border-l text-[10px]">
                          {v.name.substring(0, 8)}
                        </th>
                      ))}
                      {showDelta && selectedVersions.length === 2 && (
                        <th className="px-1 py-1 text-right font-medium min-w-[50px] border-l text-[10px] text-primary">Δ</th>
                      )}
                    </React.Fragment>
                  ))}
                  {/* Total sub-headers */}
                  {selectedVersions.map(v => (
                    <th key={`total-${v.id}`} className="px-1 py-1 text-right font-medium min-w-[70px] border-l text-[10px] bg-muted">
                      {v.name.substring(0, 8)}
                    </th>
                  ))}
                  {showDelta && selectedVersions.length === 2 && (
                    <th className="px-1 py-1 text-right font-medium min-w-[50px] border-l text-[10px] text-primary bg-muted">Δ</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {visibleVars.map((uv, idx) => {
                  const rowTotals = selectedVersions.map(v => months.reduce((sum, m) => sum + (getValue(uv.account_code, uv.id_lang, uv.id_lob, m, v.id) || 0), 0));
                  const totalDelta = selectedVersions.length === 2 ? rowTotals[0] - rowTotals[1] : null;
                  const isParent = parentVarIds.has(uv.id_sim_cfg_var);
                  const isCollapsed = collapsedParents.has(uv.id_sim_cfg_var);
                  
                  return (
                    <tr key={idx} className={`border-b hover:bg-muted/30 ${isParent ? 'bg-muted/20 font-medium' : ''}`}>
                      <td className="px-2 py-1 sticky left-0 bg-card z-10" style={{ paddingLeft: `${8 + uv.level * 16}px` }}>
                        <div className="flex items-center gap-1">
                          {isParent ? (
                            <button
                              onClick={() => toggleCollapse(uv.id_sim_cfg_var)}
                              className="p-0.5 hover:bg-muted rounded flex-shrink-0"
                            >
                              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </button>
                          ) : (
                            <span className="w-5" />
                          )}
                          <span className={isParent ? 'font-semibold' : ''}>{uv.name}</span>
                        </div>
                      </td>
                      <td className="px-2 py-1 text-muted-foreground">{uv.id_lang || '-'}</td>
                      <td className="px-2 py-1 text-muted-foreground">{uv.id_lob || '-'}</td>
                      {months.map(m => {
                        const values = selectedVersions.map(v => getValue(uv.account_code, uv.id_lang, uv.id_lob, m, v.id));
                        const delta = selectedVersions.length === 2 && values[0] !== null && values[1] !== null ? values[0]! - values[1]! : null;
                        return (
                          <React.Fragment key={`cells-${m}`}>
                            {selectedVersions.map((v, i) => (
                              <td key={`${m}-${v.id}`} className="px-1 py-0.5 border-l">
                                <Input
                                  type="number"
                                  value={values[i] ?? ''}
                                  onChange={e => updateValue(uv.account_code, uv.id_lang, uv.id_lob, m, v.id, parseFloat(e.target.value) || 0)}
                                  className="h-7 text-xs text-right w-full"
                                />
                              </td>
                            ))}
                            {showDelta && selectedVersions.length === 2 && (
                              <td className={`px-1 py-1.5 text-right border-l font-medium text-[10px] ${delta !== null && delta > 0 ? 'text-green-600 bg-green-50' : delta !== null && delta < 0 ? 'text-red-600 bg-red-50' : ''}`}>
                                {delta !== null ? (delta > 0 ? '+' : '') + delta.toLocaleString('pt-PT', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : '-'}
                              </td>
                            )}
                          </React.Fragment>
                        );
                      })}
                      {/* Totals */}
                      {rowTotals.map((total, i) => (
                        <td key={`total-${i}`} className="px-1 py-1.5 text-right border-l bg-muted/50 font-medium">
                          {total.toLocaleString('pt-PT', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                        </td>
                      ))}
                      {showDelta && selectedVersions.length === 2 && totalDelta !== null && (
                        <td className={`px-1 py-1.5 text-right border-l font-semibold text-[10px] ${totalDelta > 0 ? 'text-green-600 bg-green-100' : totalDelta < 0 ? 'text-red-600 bg-red-100' : 'bg-muted/50'}`}>
                          {(totalDelta > 0 ? '+' : '') + totalDelta.toLocaleString('pt-PT', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        )}
      </main>
    </div>
  );
}
