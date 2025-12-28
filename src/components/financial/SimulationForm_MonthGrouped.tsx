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
interface SimulationVersion { id: string; name: string; created_at: string; }
interface Dashboard { id: string; name: string; }
interface Variable {
  id_sim_cfg_var: string;
  name: string;
  id_lang: string | null;
  id_lob: string | null;
  version_id: string;
  month: number;
  year: number;
  value: number | null;
}

interface Props { onMenuClick: () => void; }

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function SimulationForm_MonthGrouped({ onMenuClick }: Props) {
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
    setProjects(data || []);
    setLoading(false);
  };

  const loadDashboards = async () => {
    const { data } = await supabase.from('dashboards').select('id, name').order('name');
    setDashboards(data || []);
  };

  const loadVersions = async () => {
    const { data: simData } = await supabase.from('simulation').select('id_sim_ver').eq('id_proj', selectedProject);
    if (simData?.length) {
      const uniqueIds = [...new Set(simData.map(i => i.id_sim_ver))];
      const { data } = await supabase.from('simulation_versions').select('id_sim_ver, name, created_at').in('id_sim_ver', uniqueIds).order('created_at', { ascending: false });
      if (data) {
        setVersions(data.map(v => ({ id: v.id_sim_ver, name: v.name, created_at: v.created_at })));
        if (data.length > 0) setSelectedVersionIds([data[0].id_sim_ver]);
      }
    } else { setVersions([]); setSelectedVersionIds([]); }
  };

  const loadData = async () => {
    setDataLoading(true);
    const { data: links } = await supabase.from('variable_dashboards').select('variable_id').eq('dashboard_id', selectedDashboard);
    if (!links?.length) { setVariables([]); setDataLoading(false); return; }
    const varIds = links.map(v => v.variable_id);
    const { data } = await supabase.from('simulation').select('*').eq('id_proj', selectedProject).in('id_sim_ver', selectedVersionIds).in('id_sim_cfg_var', varIds).order('row_index');
    if (data) {
      setVariables(data.map(v => ({ id_sim_cfg_var: v.id_sim_cfg_var, name: v.name, id_lang: v.id_lang, id_lob: v.id_lob, version_id: v.id_sim_ver, month: v.month, year: v.year, value: v.value })));
    }
    setDataLoading(false);
  };

  const handleVersionToggle = (id: string) => {
    setSelectedVersionIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  // Get unique variables by name
  const uniqueVars = useMemo(() => {
    const map = new Map<string, { name: string; id_lang: string | null; id_lob: string | null }>();
    variables.forEach(v => {
      const key = `${v.name}_${v.id_lang}_${v.id_lob}`;
      if (!map.has(key)) map.set(key, { name: v.name, id_lang: v.id_lang, id_lob: v.id_lob });
    });
    return Array.from(map.values());
  }, [variables]);

  // Get months available
  const months = useMemo(() => {
    const set = new Set<number>();
    variables.forEach(v => set.add(v.month));
    return Array.from(set).sort((a, b) => a - b);
  }, [variables]);

  // Get selected versions info
  const selectedVersions = useMemo(() => versions.filter(v => selectedVersionIds.includes(v.id)), [versions, selectedVersionIds]);

  const getValue = (varName: string, lang: string | null, lob: string | null, month: number, versionId: string) => {
    const v = variables.find(x => x.name === varName && x.id_lang === lang && x.id_lob === lob && x.month === month && x.version_id === versionId);
    return v?.value ?? null;
  };

  if (loading) return <div className="flex items-center justify-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4 flex-wrap">
          <Button variant="ghost" size="icon" onClick={onMenuClick}><Menu className="h-5 w-5" /></Button>
          <h1 className="text-lg font-bold">Month-Grouped Columns</h1>
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
                <Button variant="outline" className="h-8 w-36 text-xs justify-between" disabled={!selectedProject}>
                  {selectedVersionIds.length === 0 ? 'Select' : `${selectedVersionIds.length} sel.`}
                  <ChevronDown className="h-3 w-3" />
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
            <Label className="text-xs">Dashboard:</Label>
            <Select value={selectedDashboard} onValueChange={setSelectedDashboard}>
              <SelectTrigger className="h-8 w-44 text-xs"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{dashboards.map(d => <SelectItem key={d.id} value={d.id} className="text-xs">{d.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* Content */}
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
                  <th className="px-2 py-2 text-left font-semibold sticky left-0 bg-muted/50 z-10 min-w-[120px]" rowSpan={2}>Variable</th>
                  <th className="px-2 py-2 text-left font-semibold min-w-[60px]" rowSpan={2}>Lang</th>
                  <th className="px-2 py-2 text-left font-semibold min-w-[60px]" rowSpan={2}>LOB</th>
                  {months.map((m, idx) => (
                    <th 
                      key={m} 
                      className={`px-2 py-2 text-center font-semibold border-l ${idx % 2 === 0 ? 'bg-primary/5' : 'bg-secondary/30'}`}
                      colSpan={selectedVersions.length}
                    >
                      {monthNames[m - 1]}
                    </th>
                  ))}
                  <th className="px-2 py-2 text-center font-semibold border-l bg-muted" colSpan={selectedVersions.length}>Total</th>
                </tr>
                {/* Version sub-headers */}
                <tr className="bg-muted border-b">
                  {months.map((m, idx) => (
                    <React.Fragment key={`vh-${m}`}>
                      {selectedVersions.map(v => (
                        <th key={`${m}-${v.id}`} className={`px-2 py-1 text-right font-medium min-w-[70px] border-l ${idx % 2 === 0 ? 'bg-primary/5' : 'bg-secondary/30'}`}>
                          {v.name.substring(0, 8)}
                        </th>
                      ))}
                    </React.Fragment>
                  ))}
                  {selectedVersions.map(v => (
                    <th key={`total-${v.id}`} className="px-2 py-1 text-right font-medium min-w-[70px] border-l bg-muted">
                      {v.name.substring(0, 8)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {uniqueVars.map((uv, idx) => (
                  <tr key={idx} className="border-b hover:bg-muted/30">
                    <td className="px-2 py-1.5 font-medium sticky left-0 bg-card z-10">{uv.name}</td>
                    <td className="px-2 py-1.5">{uv.id_lang || '-'}</td>
                    <td className="px-2 py-1.5">{uv.id_lob || '-'}</td>
                    {months.map((m, mIdx) => (
                      <React.Fragment key={`cells-${m}`}>
                        {selectedVersions.map(v => {
                          const val = getValue(uv.name, uv.id_lang, uv.id_lob, m, v.id);
                          return (
                            <td key={`${m}-${v.id}`} className={`px-2 py-1.5 text-right border-l ${mIdx % 2 === 0 ? 'bg-primary/5' : ''}`}>
                              {val !== null ? val.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
                            </td>
                          );
                        })}
                      </React.Fragment>
                    ))}
                    {/* Totals */}
                    {selectedVersions.map(v => {
                      const total = months.reduce((sum, m) => sum + (getValue(uv.name, uv.id_lang, uv.id_lob, m, v.id) || 0), 0);
                      return (
                        <td key={`total-${v.id}`} className="px-2 py-1.5 text-right font-semibold border-l bg-muted/30">
                          {total.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </main>
    </div>
  );
}
