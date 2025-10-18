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

interface Language {
  id_lang: number;
  id_prj: number | null;
  description: string;
  created_at?: string;
}

interface Props {
  onBack: () => void;
}

const LanguagesManager = ({ onBack }: Props) => {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [editing, setEditing] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Omit<Language, 'created_at'>>({
    id_lang: 0,
    id_prj: null,
    description: ''
  });

  useEffect(() => {
    loadLanguages();
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

  const handleSave = async () => {
    if (!formData.id_lang || !formData.description) {
      toast({
        title: 'Validation Error',
        description: 'Language ID and description are required',
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
            description: formData.description
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
            description: formData.description
          });

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Language created successfully'
        });
      }

      setShowForm(false);
      setEditing(null);
      setFormData({ id_lang: 0, id_prj: null, description: '' });
      loadLanguages();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (id_lang: number) => {
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Languages</h2>
          <Button
            onClick={() => {
              setShowForm(true);
              setEditing(null);
              setFormData({ id_lang: 0, id_prj: null, description: '' });
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
                    type="number"
                    value={formData.id_lang}
                    onChange={(e) => setFormData({ ...formData, id_lang: parseInt(e.target.value) || 0 })}
                    disabled={editing !== null}
                  />
                </div>
                <div>
                  <Label htmlFor="id_prj">Project ID</Label>
                  <Input
                    id="id_prj"
                    type="number"
                    value={formData.id_prj || ''}
                    onChange={(e) => setFormData({ ...formData, id_prj: e.target.value ? parseInt(e.target.value) : null })}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                    <TableCell>{language.description}</TableCell>
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
                              description: language.description
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
