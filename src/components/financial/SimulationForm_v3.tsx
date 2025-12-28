import React, { useState, useEffect, useMemo } from 'react';
import { Menu, Loader2, LayoutDashboard, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

interface Project {
  id_prj: string;
  desc_prj: string | null;
}

interface SimulationVersion {
  id: string;
  name: string;
  created_at: string;
}

interface Dashboard {
  id: string;
  name: string;
}

interface Variable {
  id_sim_cfg_var: string;
  name: string;
  account_num: string;
  id_lang: string | null;
  id_lob: string | null;
  version_id: string;
  month: number;
  year: number;
  value: number | null;
}

interface Props {
  onMenuClick: () => void;
}

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function SimulationForm_v3({ onMenuClick }: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [versions, setVersions] = useState<SimulationVersion[]>([]);
  const [selectedVersionIds, setSelectedVersionIds] = useState<string[]>([]);
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [selectedDashboard, setSelectedDashboard] = useState('');
  const [variables, setVariables] = useState<Variable[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadProjects();
    loadDashboards();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadVersions(selectedProject);
    } else {
      setVersions([]);
      setSelectedVersionIds([]);
    }
  }, [selectedProject]);

  useEffect(() => {
    if (selectedDashboard && selectedProject && selectedVersionIds.length > 0) {
      loadDashboardVariables();
    } else {
      setVariables([]);
    }
  }, [selectedDashboard, selectedProject, selectedVersionIds]);

  const loadProjects = async () => {
    const { data } = await supabase.from('project').select('id_prj, desc_prj').order('id_prj');
    setProjects(data || []);
    setLoading(false);
  };

  const loadDashboards = async () => {
    const { data } = await supabase.from('dashboards').select('id, name').order('name');
    setDashboards(data || []);
  };

  const loadVersions = async (projectId: string) => {
    const { data: simData } = await supabase
      .from('simulation')
      .select('id_sim_ver')
      .eq('id_proj', projectId);

    if (simData && simData.length > 0) {
      const uniqueVersionIds = [...new Set(simData.map(item => item.id_sim_ver))];
      const { data: versionData } = await supabase
        .from('simulation_versions')
        .select('id_sim_ver, name, created_at')
        .in('id_sim_ver', uniqueVersionIds)
        .order('created_at', { ascending: false });

      if (versionData) {
        setVersions(versionData.map(v => ({ id: v.id_sim_ver, name: v.name, created_at: v.created_at })));
        if (versionData.length > 0) {
          setSelectedVersionIds([versionData[0].id_sim_ver]);
        }
      }
    } else {
      setVersions([]);
      setSelectedVersionIds([]);
    }
  };

  const loadDashboardVariables = async () => {
    if (!selectedDashboard || !selectedProject || selectedVersionIds.length === 0) {
      setVariables([]);
      return;
    }

    setDataLoading(true);

    const { data: varLinks } = await supabase
      .from('variable_dashboards')
      .select('variable_id')
      .eq('dashboard_id', selectedDashboard);

    if (!varLinks?.length) {
      setVariables([]);
      setDataLoading(false);
      return;
    }

    const variableIds = varLinks.map(v => v.variable_id);

    const { data: simData } = await supabase
      .from('simulation')
      .select('*')
      .eq('id_proj', selectedProject)
      .in('id_sim_ver', selectedVersionIds)
      .in('id_sim_cfg_var', variableIds)
      .order('row_index');

    if (simData) {
      const vars = simData.map(v => ({
        id_sim_cfg_var: v.id_sim_cfg_var,
        name: v.name,
        account_num: v.account_num,
        id_lang: v.id_lang,
        id_lob: v.id_lob,
        version_id: v.id_sim_ver,
        month: v.month,
        year: v.year,
        value: v.value
      }));
      setVariables(vars);
    }

    setDataLoading(false);
  };

  const handleVersionToggle = (versionId: string) => {
    setSelectedVersionIds(prev => {
      if (prev.includes(versionId)) {
        return prev.filter(id => id !== versionId);
      } else {
        return [...prev, versionId];
      }
    });
  };

  // Group variables by name and calculate totals
  const variableCards = useMemo(() => {
    const grouped = new Map<string, { name: string; total: number; values: Variable[]; trend: 'up' | 'down' | 'neutral' }>();

    variables.forEach(v => {
      const key = `${v.name}_${v.id_lang || 'null'}_${v.id_lob || 'null'}`;
      if (!grouped.has(key)) {
        grouped.set(key, { name: v.name, total: 0, values: [], trend: 'neutral' });
      }
      const group = grouped.get(key)!;
      group.values.push(v);
      group.total += v.value || 0;
    });

    // Calculate trend based on last two values
    grouped.forEach(group => {
      const sortedValues = group.values.sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      });
      if (sortedValues.length >= 2) {
        const latest = sortedValues[0].value || 0;
        const previous = sortedValues[1].value || 0;
        group.trend = latest > previous ? 'up' : latest < previous ? 'down' : 'neutral';
      }
    });

    return Array.from(grouped.values());
  }, [variables]);

  // Waterfall chart data
  const waterfallData = useMemo(() => {
    const data: Array<{ name: string; value: number; isTotal?: boolean }> = [];
    let runningTotal = 0;

    variableCards.forEach(card => {
      runningTotal += card.total;
      data.push({ name: card.name, value: card.total });
    });

    if (data.length > 0) {
      data.push({ name: 'Total', value: runningTotal, isTotal: true });
    }

    return data.map((item, index) => {
      if (item.isTotal) {
        return { ...item, start: 0, end: item.value, isPositive: item.value >= 0 };
      }
      const previousTotal = data.slice(0, index).reduce((sum, d) => sum + (d.isTotal ? 0 : d.value), 0);
      return {
        ...item,
        start: item.value >= 0 ? previousTotal : previousTotal + item.value,
        end: Math.abs(item.value),
        isPositive: item.value >= 0
      };
    });
  }, [variableCards]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Compact Header with Inline Selectors */}
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4 flex-wrap">
            <Button variant="ghost" size="icon" onClick={onMenuClick}>
              <Menu className="h-5 w-5" />
            </Button>
            
            <h1 className="text-lg font-bold whitespace-nowrap">Dashboard Cards</h1>
            
            <div className="flex items-center gap-2 flex-1 flex-wrap">
              {/* Project Selector */}
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground whitespace-nowrap">Project:</Label>
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger className="h-8 w-40 text-xs">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map(p => (
                      <SelectItem key={p.id_prj} value={p.id_prj} className="text-xs">
                        {p.id_prj}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Versions Selector */}
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground whitespace-nowrap">Versions:</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="h-8 w-40 text-xs justify-start" disabled={!selectedProject}>
                      {selectedVersionIds.length === 0 
                        ? 'Select' 
                        : `${selectedVersionIds.length} selected`}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-2 bg-popover" align="start">
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {versions.map(v => (
                        <div
                          key={v.id}
                          className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted cursor-pointer"
                          onClick={() => handleVersionToggle(v.id)}
                        >
                          <Checkbox checked={selectedVersionIds.includes(v.id)} className="h-4 w-4" />
                          <span className="text-xs truncate">{v.name}</span>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Dashboard Selector */}
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground whitespace-nowrap">Dashboard:</Label>
                <Select value={selectedDashboard} onValueChange={setSelectedDashboard}>
                  <SelectTrigger className="h-8 w-48 text-xs">
                    <SelectValue placeholder="Select Dashboard" />
                  </SelectTrigger>
                  <SelectContent>
                    {dashboards.map(d => (
                      <SelectItem key={d.id} value={d.id} className="text-xs">
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {dataLoading ? (
          <div className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
            <p className="text-muted-foreground text-sm">Loading data...</p>
          </div>
        ) : !selectedDashboard ? (
          <Card className="p-12">
            <div className="text-center text-muted-foreground">
              <LayoutDashboard className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">Select a project, versions and dashboard to view KPIs</p>
            </div>
          </Card>
        ) : variableCards.length === 0 ? (
          <Card className="p-12">
            <div className="text-center text-muted-foreground">
              <p>No variables linked to this dashboard for the selected filters.</p>
            </div>
          </Card>
        ) : (
          <>
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {variableCards.map((card, idx) => (
                <Card key={idx} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                      <span className="truncate">{card.name}</span>
                      {card.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500 shrink-0" />}
                      {card.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500 shrink-0" />}
                      {card.trend === 'neutral' && <Minus className="h-4 w-4 text-muted-foreground shrink-0" />}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-2xl font-bold ${card.total >= 0 ? 'text-foreground' : 'text-destructive'}`}>
                      {card.total.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {card.values.length} data points
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Waterfall Chart Card */}
            {waterfallData.length > 0 && (
              <Card className="p-6">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-lg">Waterfall Analysis</CardTitle>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={waterfallData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 11 }} 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        interval={0}
                      />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip 
                        formatter={(value: number) => value.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        contentStyle={{ fontSize: 12 }}
                      />
                      <ReferenceLine y={0} stroke="#666" />
                      <Bar dataKey="start" stackId="waterfall" fill="transparent" />
                      <Bar dataKey="end" stackId="waterfall">
                        {waterfallData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`}
                            fill={entry.isTotal ? 'hsl(var(--primary))' : entry.isPositive ? 'hsl(142, 76%, 36%)' : 'hsl(0, 84%, 60%)'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  );
}
