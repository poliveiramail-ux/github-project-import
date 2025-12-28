import React, { useState, useEffect, useMemo } from 'react';
import { Menu, Loader2, ChevronDown, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
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
  value: number | null;
  row_index: number;
  page_name: string | null;
}

interface Props { onMenuClick: () => void; }

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function SimulationForm_MonthCards({ onMenuClick }: Props) {
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
  const { toast } = useToast();

  useEffect(() => { loadProjects(); }, []);
  useEffect(() => { if (selectedProject) loadVersions(); else reset(); }, [selectedProject]);
  useEffect(() => { if (selectedProject && selectedVersionIds.length > 0) loadLanguages(); }, [selectedProject, selectedVersionIds]);
  useEffect(() => { if (selectedProject && selectedVersionIds.length > 0 && selectedLanguage) loadLobs(); }, [selectedProject, selectedVersionIds, selectedLanguage]);
  useEffect(() => { if (selectedProject && selectedVersionIds.length > 0) loadData(); }, [selectedProject, selectedVersionIds, selectedLanguage, selectedLob]);

  const reset = () => { setVersions([]); setSelectedVersionIds([]); setLanguages([]); setSelectedLanguage(''); setLobs([]); setSelectedLob(''); setVariables([]); };

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
        if (data.length > 0) setSelectedVersionIds([data[0].id_sim_ver]);
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

  const uniqueVars = useMemo(() => {
    const pageVars = variables.filter(v => v.page_name === activePage);
    const map = new Map<string, Variable>();
    pageVars.forEach(v => {
      const key = `${v.account_code}_${v.id_lang}_${v.id_lob}`;
      if (!map.has(key) || v.month === months[0]) map.set(key, v);
    });
    return Array.from(map.values()).sort((a, b) => a.row_index - b.row_index);
  }, [variables, activePage, months]);

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
          <h1 className="text-lg font-bold">Month Cards</h1>
          
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
        ) : uniqueVars.length === 0 ? (
          <Card className="p-12 text-center text-muted-foreground">Select project and versions to view data</Card>
        ) : (
          <div className="flex gap-2 items-start">
            {/* Sticky sidebar with variable names */}
            <Card className="shrink-0 w-52 sticky left-0 z-10">
              <CardHeader className="py-2 px-3 border-b">
                <CardTitle className="text-xs font-semibold">Variables</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {uniqueVars.map((uv, idx) => (
                    <div key={idx} className="px-3 py-2 text-xs" style={{ paddingLeft: `${12 + uv.level * 12}px` }}>
                      <div className="font-medium truncate">{uv.name}</div>
                      <div className="text-muted-foreground text-[10px]">{uv.id_lang || '-'} / {uv.id_lob || '-'}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Horizontal scrolling month cards */}
            <ScrollArea className="flex-1 w-full">
              <div className="flex gap-3 pb-4">
                {months.map(m => (
                  <Card key={m} className="shrink-0 w-72">
                    <CardHeader className="py-2 px-3 bg-primary/5 border-b">
                      <CardTitle className="text-sm font-semibold">{monthNames[m - 1]}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            {selectedVersions.map(v => <th key={v.id} className="px-2 py-1 text-right">{v.name.substring(0, 8)}</th>)}
                            {selectedVersions.length === 2 && <th className="px-2 py-1 text-right text-primary">Δ</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {uniqueVars.map((uv, idx) => {
                            const values = selectedVersions.map(v => getValue(uv.account_code, uv.id_lang, uv.id_lob, m, v.id));
                            const delta = selectedVersions.length === 2 && values[0] !== null && values[1] !== null ? (values[0]! - values[1]!) : null;
                            return (
                              <tr key={idx} className="border-b last:border-0 hover:bg-muted/30">
                                {selectedVersions.map((v, i) => (
                                  <td key={v.id} className="px-1 py-0.5">
                                    <Input
                                      type="number"
                                      value={values[i] ?? ''}
                                      onChange={e => updateValue(uv.account_code, uv.id_lang, uv.id_lob, m, v.id, parseFloat(e.target.value) || 0)}
                                      className="h-7 text-xs text-right w-full"
                                    />
                                  </td>
                                ))}
                                {selectedVersions.length === 2 && (
                                  <td className={`px-2 py-1.5 text-right font-medium ${delta !== null && delta > 0 ? 'text-green-600' : delta !== null && delta < 0 ? 'text-red-600' : ''}`}>
                                    {delta !== null ? (delta > 0 ? '+' : '') + delta.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
                                  </td>
                                )}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        )}
      </main>
    </div>
  );
}
