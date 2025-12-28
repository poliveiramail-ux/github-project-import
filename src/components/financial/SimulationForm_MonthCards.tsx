import React, { useState, useEffect, useMemo } from 'react';
import { Menu, Loader2, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface Project { id_prj: string; desc_prj: string | null; }
interface SimulationVersion { id: string; name: string; }
interface Dashboard { id: string; name: string; }
interface Variable { name: string; id_lang: string | null; id_lob: string | null; version_id: string; month: number; year: number; value: number | null; }

interface Props { onMenuClick: () => void; }

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function SimulationForm_MonthCards({ onMenuClick }: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [versions, setVersions] = useState<SimulationVersion[]>([]);
  const [selectedVersionIds, setSelectedVersionIds] = useState<string[]>([]);
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [selectedDashboard, setSelectedDashboard] = useState('');
  const [variables, setVariables] = useState<Variable[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => { loadProjects(); loadDashboards(); }, []);
  useEffect(() => { if (selectedProject) loadVersions(); else { setVersions([]); setSelectedVersionIds([]); } }, [selectedProject]);
  useEffect(() => { if (selectedDashboard && selectedProject && selectedVersionIds.length > 0) loadData(); else setVariables([]); }, [selectedDashboard, selectedProject, selectedVersionIds]);

  const loadProjects = async () => {
    const { data } = await supabase.from('project').select('id_prj, desc_prj').order('id_prj');
    setProjects(data || []); setLoading(false);
  };

  const loadDashboards = async () => {
    const { data } = await supabase.from('dashboards').select('id, name').order('name');
    setDashboards(data || []);
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
    } else { setVersions([]); setSelectedVersionIds([]); }
  };

  const loadData = async () => {
    setDataLoading(true);
    const { data: links } = await supabase.from('variable_dashboards').select('variable_id').eq('dashboard_id', selectedDashboard);
    if (!links?.length) { setVariables([]); setDataLoading(false); return; }
    const { data } = await supabase.from('simulation').select('*').eq('id_proj', selectedProject).in('id_sim_ver', selectedVersionIds).in('id_sim_cfg_var', links.map(v => v.variable_id)).order('row_index');
    if (data) setVariables(data.map(v => ({ name: v.name, id_lang: v.id_lang, id_lob: v.id_lob, version_id: v.id_sim_ver, month: v.month, year: v.year, value: v.value })));
    setDataLoading(false);
  };

  const handleVersionToggle = (id: string) => setSelectedVersionIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const uniqueVars = useMemo(() => {
    const map = new Map<string, { name: string; id_lang: string | null; id_lob: string | null }>();
    variables.forEach(v => { const key = `${v.name}_${v.id_lang}_${v.id_lob}`; if (!map.has(key)) map.set(key, { name: v.name, id_lang: v.id_lang, id_lob: v.id_lob }); });
    return Array.from(map.values());
  }, [variables]);

  const months = useMemo(() => [...new Set(variables.map(v => v.month))].sort((a, b) => a - b), [variables]);
  const selectedVersions = useMemo(() => versions.filter(v => selectedVersionIds.includes(v.id)), [versions, selectedVersionIds]);

  const getValue = (name: string, lang: string | null, lob: string | null, month: number, versionId: string) => {
    return variables.find(v => v.name === name && v.id_lang === lang && v.id_lob === lob && v.month === month && v.version_id === versionId)?.value ?? null;
  };

  if (loading) return <div className="flex items-center justify-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4 flex-wrap">
          <Button variant="ghost" size="icon" onClick={onMenuClick}><Menu className="h-5 w-5" /></Button>
          <h1 className="text-lg font-bold">Month Cards</h1>
          <div className="flex items-center gap-2">
            <Label className="text-xs">Project:</Label>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="h-8 w-36 text-xs"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{projects.map(p => <SelectItem key={p.id_prj} value={p.id_prj} className="text-xs">{p.id_prj}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs">Versions:</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-8 w-36 text-xs justify-between" disabled={!selectedProject}>{selectedVersionIds.length === 0 ? 'Select' : `${selectedVersionIds.length} sel.`}<ChevronDown className="h-3 w-3" /></Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2 bg-popover">
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {versions.map(v => (
                    <div key={v.id} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-muted cursor-pointer" onClick={() => handleVersionToggle(v.id)}>
                      <Checkbox checked={selectedVersionIds.includes(v.id)} className="h-4 w-4" /><span className="text-xs truncate">{v.name}</span>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs">Dashboard:</Label>
            <Select value={selectedDashboard} onValueChange={setSelectedDashboard}>
              <SelectTrigger className="h-8 w-44 text-xs"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{dashboards.map(d => <SelectItem key={d.id} value={d.id} className="text-xs">{d.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4">
        {dataLoading ? (
          <div className="py-12 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>
        ) : !selectedDashboard || uniqueVars.length === 0 ? (
          <Card className="p-12 text-center text-muted-foreground">Select a dashboard to view data</Card>
        ) : (
          <div className="flex gap-2 items-start">
            {/* Sticky sidebar with variable names */}
            <Card className="shrink-0 w-48 sticky left-0 z-10">
              <CardHeader className="py-2 px-3 border-b">
                <CardTitle className="text-xs font-semibold">Variables</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {uniqueVars.map((uv, idx) => (
                    <div key={idx} className="px-3 py-2 text-xs">
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
                  <Card key={m} className="shrink-0 w-64">
                    <CardHeader className="py-2 px-3 bg-primary/5 border-b">
                      <CardTitle className="text-sm font-semibold">{monthNames[m - 1]}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="px-2 py-1 text-left">Var</th>
                            {selectedVersions.map(v => <th key={v.id} className="px-2 py-1 text-right">{v.name.substring(0, 6)}</th>)}
                            {selectedVersions.length === 2 && <th className="px-2 py-1 text-right text-primary">Δ</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {uniqueVars.map((uv, idx) => {
                            const values = selectedVersions.map(v => getValue(uv.name, uv.id_lang, uv.id_lob, m, v.id));
                            const delta = selectedVersions.length === 2 && values[0] !== null && values[1] !== null ? (values[0]! - values[1]!) : null;
                            return (
                              <tr key={idx} className="border-b last:border-0 hover:bg-muted/30">
                                <td className="px-2 py-1.5 truncate max-w-[80px]" title={uv.name}>{uv.name.substring(0, 10)}</td>
                                {values.map((val, i) => (
                                  <td key={i} className="px-2 py-1.5 text-right">{val !== null ? val.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}</td>
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
