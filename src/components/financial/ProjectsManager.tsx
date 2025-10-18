import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';

interface Project {
  id_prj: number;
  desc: string | null;
  created_at?: string;
}

interface Props {
  onBack: () => void;
}

const ProjectsManager = ({ onBack }: Props) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [editing, setEditing] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Omit<Project, 'created_at'>>({
    id_prj: 0,
    desc: ''
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    const { data, error } = await (supabase as any)
      .from('project')
      .select('*')
      .order('id_prj');

    if (error) {
      toast({
        title: 'Error loading projects',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      setProjects(data || []);
    }
  };

  const handleSave = async () => {
    if (!formData.id_prj) {
      toast({
        title: 'Validation Error',
        description: 'Project ID is required',
        variant: 'destructive'
      });
      return;
    }

    try {
      if (editing !== null) {
        const { error } = await (supabase as any)
          .from('project')
          .update({
            desc: formData.desc
          })
          .eq('id_prj', formData.id_prj);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Project updated successfully'
        });
      } else {
        const { error } = await (supabase as any)
          .from('project')
          .insert({
            id_prj: formData.id_prj,
            desc: formData.desc
          });

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Project created successfully'
        });
      }

      setShowForm(false);
      setEditing(null);
      setFormData({ id_prj: 0, desc: '' });
      loadProjects();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (id_prj: number) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    const { error } = await (supabase as any)
      .from('project')
      .delete()
      .eq('id_prj', id_prj);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Success',
        description: 'Project deleted successfully'
      });
      loadProjects();
    }
  };

  return (
    <div>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Projects</h2>
          <Button
            onClick={() => {
              setShowForm(true);
              setEditing(null);
              setFormData({ id_prj: 0, desc: '' });
            }}
          >
            New Project
          </Button>
        </div>

        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{editing !== null ? 'Edit Project' : 'New Project'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="id_prj">Project ID</Label>
                  <Input
                    id="id_prj"
                    type="number"
                    value={formData.id_prj}
                    onChange={(e) => setFormData({ ...formData, id_prj: parseInt(e.target.value) || 0 })}
                    disabled={editing !== null}
                  />
                </div>
                <div>
                  <Label htmlFor="desc">Description</Label>
                  <Textarea
                    id="desc"
                    value={formData.desc || ''}
                    onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSave}>Save</Button>
                  <Button variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id_prj}>
                    <TableCell>{project.id_prj}</TableCell>
                    <TableCell>{project.desc || '-'}</TableCell>
                    <TableCell>{project.created_at ? new Date(project.created_at).toLocaleDateString() : '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setEditing(project.id_prj);
                            setFormData({
                              id_prj: project.id_prj,
                              desc: project.desc
                            });
                            setShowForm(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(project.id_prj)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectsManager;
