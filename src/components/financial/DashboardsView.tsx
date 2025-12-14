import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Menu, LayoutDashboard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Dashboard {
  id: string;
  name: string;
  description: string | null;
}

interface DashboardVariable {
  id_sim_cfg_var: string;
  name: string;
  account_num: string;
  id_lang: string | null;
  id_lob: string | null;
  values: { month: number; year: number; value: number | null }[];
}

interface Props {
  onBack: () => void;
  onMenuClick?: () => void;
}

export default function DashboardsView({ onBack, onMenuClick }: Props) {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [selectedDashboard, setSelectedDashboard] = useState<string | null>(null);
  const [variables, setVariables] = useState<DashboardVariable[]>([]);
  const [projects, setProjects] = useState<string[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [versions, setVersions] = useState<{ id: string; name: string }[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDashboards();
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadVersions();
    }
  }, [selectedProject]);

  useEffect(() => {
    if (selectedDashboard && selectedProject && selectedVersion) {
      loadDashboardVariables();
    }
  }, [selectedDashboard, selectedProject, selectedVersion]);

  const loadDashboards = async () => {
    const { data, error } = await supabase
      .from('dashboards')
      .select('*')
      .order('name');
    
    if (error) {
      toast({ title: 'Error', description: 'Failed to load dashboards', variant: 'destructive' });
      return;
    }
    setDashboards(data || []);
  };

  const loadProjects = async () => {
    // Load from simulation table to get projects that have simulation data
    const { data, error } = await supabase
      .from('simulation')
      .select('id_proj');
    
    if (error) return;
    const uniqueProjects = [...new Set(data?.map(d => d.id_proj) || [])];
    setProjects(uniqueProjects);
    if (uniqueProjects.length > 0) {
      setSelectedProject(uniqueProjects[0]);
    }
  };

  const loadVersions = async () => {
    const { data, error } = await supabase
      .from('simulation_versions')
      .select('id_sim_ver, name')
      .eq('id_prj', selectedProject)
      .order('created_at', { ascending: false });
    
    if (error) return;
    setVersions(data?.map(v => ({ id: v.id_sim_ver, name: v.name })) || []);
    if (data && data.length > 0) {
      setSelectedVersion(data[0].id_sim_ver);
    }
  };

  const loadDashboardVariables = async () => {
    if (!selectedDashboard || !selectedProject || !selectedVersion) return;
    
    setLoading(true);
    
    // Get variable IDs linked to this dashboard
    const { data: varLinks, error: linksError } = await supabase
      .from('variable_dashboards')
      .select('variable_id')
      .eq('dashboard_id', selectedDashboard);
    
    if (linksError || !varLinks?.length) {
      setVariables([]);
      setLoading(false);
      return;
    }

    const variableIds = varLinks.map(v => v.variable_id);

    // Get simulation data for these variables
    const { data: simData, error: simError } = await supabase
      .from('simulation')
      .select('*')
      .eq('id_proj', selectedProject)
      .eq('id_sim_ver', selectedVersion)
      .in('id_sim_cfg_var', variableIds)
      .order('row_index');

    if (simError) {
      toast({ title: 'Error', description: 'Failed to load simulation data', variant: 'destructive' });
      setLoading(false);
      return;
    }

    // Group by variable
    const grouped: Record<string, DashboardVariable> = {};
    simData?.forEach(row => {
      const key = `${row.id_sim_cfg_var}-${row.id_lang || ''}-${row.id_lob || ''}`;
      if (!grouped[key]) {
        grouped[key] = {
          id_sim_cfg_var: row.id_sim_cfg_var,
          name: row.name,
          account_num: row.account_num,
          id_lang: row.id_lang,
          id_lob: row.id_lob,
          values: []
        };
      }
      grouped[key].values.push({ month: row.month, year: row.year, value: row.value });
    });

    setVariables(Object.values(grouped));
    setLoading(false);
  };

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          {onMenuClick && (
            <Button variant="ghost" size="icon" onClick={onMenuClick}>
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <LayoutDashboard className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Dashboards</h1>
        </div>

        <div className="flex gap-4 mb-6 flex-wrap">
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map(p => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedVersion} onValueChange={setSelectedVersion}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Version" />
            </SelectTrigger>
            <SelectContent>
              {versions.map(v => (
                <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedDashboard || ''} onValueChange={setSelectedDashboard}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Dashboard" />
            </SelectTrigger>
            <SelectContent>
              {dashboards.map(d => (
                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedDashboard ? (
          <Card>
            <CardHeader>
              <CardTitle>
                {dashboards.find(d => d.id === selectedDashboard)?.name || 'Dashboard'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : variables.length === 0 ? (
                <p className="text-muted-foreground">No variables linked to this dashboard for the selected project/version.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="sticky left-0 bg-background">Language</TableHead>
                        <TableHead>LOB</TableHead>
                        <TableHead>Account</TableHead>
                        <TableHead>Name</TableHead>
                        {months.map(m => (
                          <TableHead key={m} className="text-right">{m}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {variables.map((v, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="sticky left-0 bg-background font-medium">{v.id_lang || '-'}</TableCell>
                          <TableCell>{v.id_lob || '-'}</TableCell>
                          <TableCell>{v.account_num}</TableCell>
                          <TableCell>{v.name}</TableCell>
                          {months.map((_, monthIdx) => {
                            const val = v.values.find(x => x.month === monthIdx + 1);
                            return (
                              <TableCell key={monthIdx} className="text-right">
                                {val?.value != null ? val.value.toLocaleString() : '-'}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <LayoutDashboard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select a dashboard to view its variables</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
