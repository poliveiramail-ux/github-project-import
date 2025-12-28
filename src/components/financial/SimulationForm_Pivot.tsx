import React, { useState, useEffect, useMemo } from 'react';
import { Menu, Loader2, ChevronDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';

interface Project { id_prj: string; desc_prj: string | null; }
interface SimulationVersion { id: string; name: string; }
interface Dashboard { id: string; name: string; }
interface Variable { name: string; id_lang: string | null; id_lob: string | null; version_id: string; month: number; year: number; value: number | null; }

interface Props { onMenuClick: () => void; }

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function SimulationForm_Pivot({ onMenuClick }: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [versions, setVersions] = useState<SimulationVersion[]>([]);
  const [selectedVersionIds, setSelectedVersionIds] = useState<string[]>([]);
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [selectedDashboard, setSelectedDashboard] = useState('');
  const [variables, setVariables] = useState<Variable[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [showDelta, setShowDelta] = useState(true);

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
        if (data.length >= 2) setSelectedVersionIds([data[0].id_sim_ver, data[1].id_sim_ver]);
        else if (data.length > 0) setSelectedVersionIds([data[0].id_sim_ver]);
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

  // Calculate columns: for each month, show versions + delta (if 2 versions)
  const colsPerMonth = selectedVersions.length + (showDelta && selectedVersions.length === 2 ? 1 : 0);

  if (loading) return <div className="flex items-center justify-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4 flex-wrap">
          <Button variant="ghost" size="icon" onClick={onMenuClick}><Menu className="h-5 w-5" /></Button>
          <h1 className="text-lg font-bold">Pivot Table</h1>
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
          {selectedVersions.length === 2 && (
            <div className="flex items-center gap-2 ml-auto">
              <Checkbox id="showDelta" checked={showDelta} onCheckedChange={(v) => setShowDelta(!!v)} />
              <Label htmlFor="showDelta" className="text-xs cursor-pointer">Show Delta</Label>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto p-4">
        {dataLoading ? (
          <div className="py-12 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>
        ) : !selectedDashboard || uniqueVars.length === 0 ? (
          <Card className="p-12 text-center text-muted-foreground">Select a dashboard to view data</Card>
        ) : (
          <Card className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                {/* Month headers */}
                <tr className="bg-muted/50 border-b">
                  <th className="px-2 py-2 text-left font-semibold sticky left-0 bg-muted/50 z-10 min-w-[140px]" rowSpan={2}>Variable</th>
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
                        <th key={`${m}-${v.id}`} className="px-1 py-1 text-right font-medium min-w-[55px] border-l text-[10px]">
                          {v.name.substring(0, 6)}
                        </th>
                      ))}
                      {showDelta && selectedVersions.length === 2 && (
                        <th className="px-1 py-1 text-right font-medium min-w-[50px] border-l text-[10px] text-primary">Δ</th>
                      )}
                    </React.Fragment>
                  ))}
                  {/* Total sub-headers */}
                  {selectedVersions.map(v => (
                    <th key={`total-${v.id}`} className="px-1 py-1 text-right font-medium min-w-[55px] border-l text-[10px] bg-muted">
                      {v.name.substring(0, 6)}
                    </th>
                  ))}
                  {showDelta && selectedVersions.length === 2 && (
                    <th className="px-1 py-1 text-right font-medium min-w-[50px] border-l text-[10px] text-primary bg-muted">Δ</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {uniqueVars.map((uv, idx) => {
                  const rowTotals = selectedVersions.map(v => months.reduce((sum, m) => sum + (getValue(uv.name, uv.id_lang, uv.id_lob, m, v.id) || 0), 0));
                  const totalDelta = selectedVersions.length === 2 ? rowTotals[0] - rowTotals[1] : null;
                  
                  return (
                    <tr key={idx} className="border-b hover:bg-muted/30">
                      <td className="px-2 py-1.5 font-medium sticky left-0 bg-card z-10">{uv.name}</td>
                      <td className="px-2 py-1.5 text-muted-foreground">{uv.id_lang || '-'}</td>
                      <td className="px-2 py-1.5 text-muted-foreground">{uv.id_lob || '-'}</td>
                      {months.map(m => {
                        const values = selectedVersions.map(v => getValue(uv.name, uv.id_lang, uv.id_lob, m, v.id));
                        const delta = selectedVersions.length === 2 && values[0] !== null && values[1] !== null ? values[0]! - values[1]! : null;
                        return (
                          <React.Fragment key={`cells-${m}`}>
                            {values.map((val, i) => (
                              <td key={i} className="px-1 py-1.5 text-right border-l">
                                {val !== null ? val.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
                              </td>
                            ))}
                            {showDelta && selectedVersions.length === 2 && (
                              <td className={`px-1 py-1.5 text-right border-l font-medium ${delta !== null && delta > 0 ? 'text-green-600 bg-green-50' : delta !== null && delta < 0 ? 'text-red-600 bg-red-50' : ''}`}>
                                {delta !== null ? (delta > 0 ? '+' : '') + delta.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
                              </td>
                            )}
                          </React.Fragment>
                        );
                      })}
                      {/* Row totals */}
                      {rowTotals.map((total, i) => (
                        <td key={`rt-${i}`} className="px-1 py-1.5 text-right font-semibold border-l bg-muted/30">
                          {total.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      ))}
                      {showDelta && selectedVersions.length === 2 && (
                        <td className={`px-1 py-1.5 text-right font-bold border-l ${totalDelta !== null && totalDelta > 0 ? 'text-green-600' : totalDelta !== null && totalDelta < 0 ? 'text-red-600' : ''}`}>
                          {totalDelta !== null ? (totalDelta > 0 ? '+' : '') + totalDelta.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
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
