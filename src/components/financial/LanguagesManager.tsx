import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';

interface Language {
  id_lang: string;
  id_prj: string | null;
  desc_lang: string | null;
  created_at?: string;
}

interface Props {
  onBack: () => void;
}

const LanguagesManager = ({ onBack }: Props) => {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [projects, setProjects] = useState<{ id_prj: string; desc_prj: string | null }[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Omit<Language, 'created_at'>>({
    id_lang: '',
    id_prj: null,
    desc_lang: ''
  });

  useEffect(() => {
    loadLanguages();
    loadProjects();
  }, []);

  const loadLanguages = async () => {
    const { data, error } = await (supabase as any)
      .from('lang')
      .select('*')
      .order('id_lang');

    if (error) {
      toast({
        title: 'Error loading languages',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      setLanguages(data || []);
    }
  };

  const loadProjects = async () => {
    const { data, error } = await (supabase as any)
      .from('project')
      .select('id_prj, desc_prj')
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
    if (!formData.id_lang || !formData.id_prj) {
      toast({
        title: 'Validation Error',
        description: 'Language ID and Project ID are required',
        variant: 'destructive'
      });
      return;
    }

    try {
      if (editing !== null) {
        const { error } = await (supabase as any)
          .from('lang')
          .update({
            id_prj: formData.id_prj,
            desc_lang: formData.desc_lang
          })
          .eq('id_lang', formData.id_lang);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Language updated successfully'
        });
      } else {
        const { error } = await (supabase as any)
          .from('lang')
          .insert({
            id_lang: formData.id_lang,
            id_prj: formData.id_prj,
            desc_lang: formData.desc_lang
          });

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Language created successfully'
        });
      }

      setShowForm(false);
      setEditing(null);
      setFormData({ id_lang: '', id_prj: null, desc_lang: '' });
      loadLanguages();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (id_lang: string) => {
    if (!confirm('Are you sure you want to delete this language?')) return;

    const { error } = await (supabase as any)
      .from('lang')
      .delete()
      .eq('id_lang', id_lang);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Success',
        description: 'Language deleted successfully'
      });
      loadLanguages();
    }
  };

  return (
    <div>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-end mb-6">
          <Button
            onClick={() => {
              setShowForm(true);
              setEditing(null);
              setFormData({ id_lang: '', id_prj: null, desc_lang: '' });
            }}
          >
            New Language
          </Button>
        </div>

        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{editing !== null ? 'Edit Language' : 'New Language'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="id_lang">Language ID</Label>
                  <Input
                    id="id_lang"
                    type="text"
                    value={formData.id_lang}
                    onChange={(e) => setFormData({ ...formData, id_lang: e.target.value })}
                    disabled={editing !== null}
                    placeholder="Ex: PT"
                  />
                </div>
                <div>
                  <Label htmlFor="id_prj">Project ID</Label>
                  <Select
                    value={formData.id_prj || ''}
                    onValueChange={(value) => setFormData({ ...formData, id_prj: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um projeto" />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      {projects.map((project) => (
                        <SelectItem key={project.id_prj} value={project.id_prj}>
                          {project.id_prj} {project.desc_prj && `- ${project.desc_prj}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="desc_lang">Description</Label>
                  <Textarea
                    id="desc_lang"
                    value={formData.desc_lang || ''}
                    onChange={(e) => setFormData({ ...formData, desc_lang: e.target.value })}
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
                  <TableHead>Project ID</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {languages.map((language) => (
                  <TableRow key={language.id_lang}>
                    <TableCell>{language.id_lang}</TableCell>
                    <TableCell>{language.id_prj || '-'}</TableCell>
                    <TableCell>{language.desc_lang || '-'}</TableCell>
                    <TableCell>{language.created_at ? new Date(language.created_at).toLocaleDateString() : '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setEditing(language.id_lang);
                            setFormData({
                              id_lang: language.id_lang,
                              id_prj: language.id_prj,
                              desc_lang: language.desc_lang
                            });
                            setShowForm(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(language.id_lang)}
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

export default LanguagesManager;
