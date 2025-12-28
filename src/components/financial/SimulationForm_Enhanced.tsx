import React, { useState, useEffect, useMemo } from 'react';
import { Menu, Loader2, ChevronDown, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

interface Project { id_prj: string; desc_prj: string | null; }
interface SimulationVersion { id: string; name: string; }
interface Dashboard { id: string; name: string; }
interface Variable { name: string; id_lang: string | null; id_lob: string | null; version_id: string; month: number; year: number; value: number | null; }

interface Props { onMenuClick: () => void; }

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const quarters = [
  { label: 'Q1', months: [1, 2, 3] },
  { label: 'Q2', months: [4, 5, 6] },
  { label: 'Q3', months: [7, 8, 9] },
  { label: 'Q4', months: [10, 11, 12] },
];

export default function SimulationForm_Enhanced({ onMenuClick }: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [versions, setVersions] = useState<SimulationVersion[]>([]);
  const [selectedVersionIds, setSelectedVersionIds] = useState<string[]>([]);
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [selectedDashboard, setSelectedDashboard] = useState('');
  const [variables, setVariables] = useState<Variable[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [collapsedQuarters, setCollapsedQuarters] = useState<Set<string>>(new Set());
  const [hoveredColumn, setHoveredColumn] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(true);

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
  const toggleQuarter = (q: string) => setCollapsedQuarters(prev => { const next = new Set(prev); if (next.has(q)) next.delete(q); else next.add(q); return next; });

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

  const getQuarterTotal = (name: string, lang: string | null, lob: string | null, qMonths: number[], versionId: string) => {
    return qMonths.reduce((sum, m) => sum + (getValue(name, lang, lob, m, versionId) || 0), 0);
  };

  // Visible months based on collapsed quarters
  const visibleMonths = months.filter(m => {
    const q = quarters.find(q => q.months.includes(m));
    return q ? !collapsedQuarters.has(q.label) : true;
  });

  if (loading) return <div className="flex items-center justify-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4 flex-wrap">
          <Button variant="ghost" size="icon" onClick={onMenuClick}><Menu className="h-5 w-5" /></Button>
          <h1 className="text-lg font-bold">Enhanced Layout</h1>
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
          <div className="flex items-center gap-1 ml-auto">
            {quarters.map(q => (
              <Button key={q.label} variant={collapsedQuarters.has(q.label) ? 'secondary' : 'outline'} size="sm" className="text-xs h-7 px-2" onClick={() => toggleQuarter(q.label)}>
                {collapsedQuarters.has(q.label) ? <ChevronRight className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
                {q.label}
              </Button>
            ))}
          </div>
          {selectedVersions.length === 2 && (
            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setShowComparison(!showComparison)}>
              {showComparison ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
              Compare
            </Button>
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
                {/* Quarter headers */}
                <tr className="bg-muted/30 border-b">
                  <th className="px-2 py-1 sticky left-0 bg-muted/30 z-10" colSpan={3}></th>
                  {quarters.filter(q => q.months.some(m => months.includes(m))).map(q => {
                    const qMonths = q.months.filter(m => months.includes(m));
                    const isCollapsed = collapsedQuarters.has(q.label);
                    const colSpan = isCollapsed ? selectedVersions.length : qMonths.length * selectedVersions.length;
                    return (
                      <th key={q.label} className="px-2 py-1 text-center border-l bg-primary/10" colSpan={colSpan}>
                        <Button variant="ghost" size="sm" className="h-5 text-xs font-semibold p-1" onClick={() => toggleQuarter(q.label)}>
                          {isCollapsed ? <ChevronRight className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
                          {q.label}
                        </Button>
                      </th>
                    );
                  })}
                  <th className="px-2 py-1 text-center border-l bg-muted" colSpan={selectedVersions.length}>Total</th>
                </tr>
                {/* Month headers */}
                <tr className="bg-muted/50 border-b">
                  <th className="px-2 py-2 text-left font-semibold sticky left-0 bg-muted/50 z-10 min-w-[120px]">Variable</th>
                  <th className="px-2 py-2 text-left font-semibold min-w-[50px]">Lang</th>
                  <th className="px-2 py-2 text-left font-semibold min-w-[50px]">LOB</th>
                  {quarters.filter(q => q.months.some(m => months.includes(m))).map(q => {
                    const qMonths = q.months.filter(m => months.includes(m));
                    const isCollapsed = collapsedQuarters.has(q.label);
                    if (isCollapsed) {
                      return selectedVersions.map(v => (
                        <th key={`${q.label}-${v.id}`} className="px-2 py-2 text-right font-semibold border-l bg-primary/5 min-w-[60px]" title={`${q.label} - ${v.name}`}>
                          {v.name.substring(0, 5)}
                        </th>
                      ));
                    }
                    return qMonths.map(m => selectedVersions.map(v => (
                      <th 
                        key={`${m}-${v.id}`} 
                        className={`px-2 py-2 text-right font-semibold border-l min-w-[60px] transition-colors ${hoveredColumn === `${m}-${v.id}` ? 'bg-primary/20' : ''}`}
                        onMouseEnter={() => setHoveredColumn(`${m}-${v.id}`)}
                        onMouseLeave={() => setHoveredColumn(null)}
                      >
                        <div className="text-[10px] text-muted-foreground">{monthNames[m - 1]}</div>
                        <div className="text-[9px]">{v.name.substring(0, 5)}</div>
                      </th>
                    )));
                  })}
                  {selectedVersions.map(v => (
                    <th key={`total-${v.id}`} className="px-2 py-2 text-right font-semibold border-l bg-muted min-w-[70px]">{v.name.substring(0, 6)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {uniqueVars.map((uv, idx) => {
                  const rowTotals = selectedVersions.map(v => months.reduce((sum, m) => sum + (getValue(uv.name, uv.id_lang, uv.id_lob, m, v.id) || 0), 0));
                  return (
                    <tr key={idx} className="border-b hover:bg-muted/30">
                      <td className="px-2 py-1.5 font-medium sticky left-0 bg-card z-10">{uv.name}</td>
                      <td className="px-2 py-1.5 text-muted-foreground">{uv.id_lang || '-'}</td>
                      <td className="px-2 py-1.5 text-muted-foreground">{uv.id_lob || '-'}</td>
                      {quarters.filter(q => q.months.some(m => months.includes(m))).map(q => {
                        const qMonths = q.months.filter(m => months.includes(m));
                        const isCollapsed = collapsedQuarters.has(q.label);
                        if (isCollapsed) {
                          return selectedVersions.map(v => {
                            const qTotal = getQuarterTotal(uv.name, uv.id_lang, uv.id_lob, qMonths, v.id);
                            return (
                              <td key={`${q.label}-${v.id}`} className="px-2 py-1.5 text-right border-l bg-primary/5 font-medium">
                                {qTotal.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                            );
                          });
                        }
                        return qMonths.map(m => selectedVersions.map((v, vIdx) => {
                          const val = getValue(uv.name, uv.id_lang, uv.id_lob, m, v.id);
                          const prevVal = showComparison && vIdx === 1 && selectedVersions.length === 2 ? getValue(uv.name, uv.id_lang, uv.id_lob, m, selectedVersions[0].id) : null;
                          const diff = prevVal !== null && val !== null ? val - prevVal : null;
                          return (
                            <td 
                              key={`${m}-${v.id}`} 
                              className={`px-2 py-1.5 text-right border-l transition-colors ${hoveredColumn === `${m}-${v.id}` ? 'bg-primary/10' : ''}`}
                              onMouseEnter={() => setHoveredColumn(`${m}-${v.id}`)}
                              onMouseLeave={() => setHoveredColumn(null)}
                            >
                              <div>{val !== null ? val.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}</div>
                              {showComparison && diff !== null && (
                                <div className={`text-[9px] ${diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                                  {diff > 0 ? '+' : ''}{diff.toLocaleString('pt-PT', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                                </div>
                              )}
                            </td>
                          );
                        }));
                      })}
                      {rowTotals.map((total, i) => (
                        <td key={`rt-${i}`} className="px-2 py-1.5 text-right font-semibold border-l bg-muted/30">
                          {total.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      ))}
                    </tr>
                  );
                })}
                {/* Month totals row */}
                <tr className="bg-muted/50 border-t-2 font-semibold">
                  <td className="px-2 py-2 sticky left-0 bg-muted/50 z-10">Total</td>
                  <td className="px-2 py-2" colSpan={2}></td>
                  {quarters.filter(q => q.months.some(m => months.includes(m))).map(q => {
                    const qMonths = q.months.filter(m => months.includes(m));
                    const isCollapsed = collapsedQuarters.has(q.label);
                    if (isCollapsed) {
                      return selectedVersions.map(v => {
                        const total = uniqueVars.reduce((sum, uv) => sum + getQuarterTotal(uv.name, uv.id_lang, uv.id_lob, qMonths, v.id), 0);
                        return <td key={`mt-${q.label}-${v.id}`} className="px-2 py-2 text-right border-l bg-primary/5">{total.toLocaleString('pt-PT', { maximumFractionDigits: 0 })}</td>;
                      });
                    }
                    return qMonths.map(m => selectedVersions.map(v => {
                      const total = uniqueVars.reduce((sum, uv) => sum + (getValue(uv.name, uv.id_lang, uv.id_lob, m, v.id) || 0), 0);
                      return <td key={`mt-${m}-${v.id}`} className="px-2 py-2 text-right border-l">{total.toLocaleString('pt-PT', { maximumFractionDigits: 0 })}</td>;
                    }));
                  })}
                  {selectedVersions.map(v => {
                    const grandTotal = uniqueVars.reduce((sum, uv) => sum + months.reduce((s, m) => s + (getValue(uv.name, uv.id_lang, uv.id_lob, m, v.id) || 0), 0), 0);
                    return <td key={`gt-${v.id}`} className="px-2 py-2 text-right border-l bg-muted">{grandTotal.toLocaleString('pt-PT', { maximumFractionDigits: 0 })}</td>;
                  })}
                </tr>
              </tbody>
            </table>
          </Card>
        )}
      </main>
    </div>
  );
}
