import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit3, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface Program {
  id_lob: string;
  id_lang: string;
  name: string;
}

interface Props {
  onBack: () => void;
}

export default function ProgramsManager({ onBack }: Props) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [languages, setLanguages] = useState<{ id_lang: string; desc_lang: string | null }[]>([]);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ id_lob: '', id_lang: '', name: '' });
  const { toast } = useToast();

  useEffect(() => {
    loadPrograms();
    loadLanguages();
  }, []);

  const loadPrograms = async () => {
    const { data, error } = await (supabase as any)
      .from('lob')
      .select('*')
      .order('id_lob');
    
    if (error) {
      toast({ title: 'Erro', description: 'Erro ao carregar programas', variant: 'destructive' });
      return;
    }
    setPrograms(data || []);
  };

  const loadLanguages = async () => {
    const { data, error } = await (supabase as any)
      .from('lang')
      .select('id_lang, desc_lang')
      .order('id_lang');
    
    if (error) {
      toast({ title: 'Erro', description: 'Erro ao carregar languages', variant: 'destructive' });
      return;
    }
    setLanguages(data || []);
  };

  const handleSave = async () => {
    if (!formData.id_lob || !formData.id_lang || !formData.name) {
      toast({ title: 'Atenção', description: 'Preencha todos os campos obrigatórios' });
      return;
    }

    if (editingProgram) {
      const { error } = await (supabase as any)
        .from('lob')
        .update({ name: formData.name, id_lang: formData.id_lang })
        .eq('id_lob', editingProgram.id_lob);
      
      if (error) {
        toast({ title: 'Erro', description: 'Erro ao atualizar programa', variant: 'destructive' });
        return;
      }
    } else {
      const { error } = await (supabase as any)
        .from('lob')
        .insert([formData]);
      
      if (error) {
        toast({ title: 'Erro', description: 'Erro ao criar programa', variant: 'destructive' });
        return;
      }
    }
    
    setShowForm(false);
    setEditingProgram(null);
    setFormData({ id_lob: '', id_lang: '', name: '' });
    loadPrograms();
    toast({ title: 'Sucesso', description: 'Programa guardado com sucesso' });
  };

  const handleDelete = async (id_lob: string) => {
    if (!window.confirm('Tem certeza que deseja eliminar este programa?')) return;

    const { error } = await (supabase as any)
      .from('lob')
      .delete()
      .eq('id_lob', id_lob);
    
    if (error) {
      toast({ title: 'Erro', description: 'Erro ao eliminar programa', variant: 'destructive' });
      return;
    }
    loadPrograms();
    toast({ title: 'Sucesso', description: 'Programa eliminado' });
  };

  return (
    <div>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-end mb-6">
          <Button onClick={() => {
          setShowForm(true);
          setEditingProgram(null);
          setFormData({ id_lob: '', id_lang: '', name: '' });
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Lob
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 mb-6">
          <h3 className="font-bold mb-4">{editingProgram ? 'Editar Lob' : 'Novo Lob'}</h3>
          <div className="space-y-4">
            <div>
              <Label>ID do Lob</Label>
              <Input
                value={formData.id_lob}
                onChange={(e) => setFormData({ ...formData, id_lob: e.target.value })}
                disabled={!!editingProgram}
                placeholder="Ex: LOB-2025"
              />
            </div>
            <div>
              <Label>Language ID</Label>
              <Select
                value={formData.id_lang}
                onValueChange={(value) => setFormData({ ...formData, id_lang: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma language" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  {languages.map((lang) => (
                    <SelectItem key={lang.id_lang} value={lang.id_lang}>
                      {lang.id_lang} {lang.desc_lang && `- ${lang.desc_lang}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Nome</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Lob Financeiro 2025"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave}>Guardar</Button>
              <Button variant="outline" onClick={() => {
                setShowForm(false);
                setEditingProgram(null);
                setFormData({ id_lob: '', id_lang: '', name: '' });
              }}>
                Cancelar
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">ID</th>
                <th className="px-4 py-3 text-left font-semibold">Language</th>
                <th className="px-4 py-3 text-left font-semibold">Nome</th>
                <th className="px-4 py-3 text-right font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {programs.map(program => (
                <tr key={program.id_lob} className="border-t hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 font-mono">{program.id_lob}</td>
                  <td className="px-4 py-3">{program.id_lang}</td>
                  <td className="px-4 py-3">{program.name}</td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingProgram(program);
                        setFormData({ id_lob: program.id_lob, id_lang: program.id_lang, name: program.name });
                        setShowForm(true);
                      }}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(program.id_lob)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      </div>
    </div>
  );
}
