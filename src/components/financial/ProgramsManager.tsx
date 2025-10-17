import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit3, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface Program {
  id_lob: string;
  name: string;
}

interface Props {
  onBack: () => void;
}

export default function ProgramsManager({ onBack }: Props) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ id_lob: '', name: '' });
  const { toast } = useToast();

  useEffect(() => {
    loadPrograms();
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

  const handleSave = async () => {
    if (!formData.id_lob || !formData.name) {
      toast({ title: 'Atenção', description: 'Preencha o ID e o Nome do programa' });
      return;
    }

    if (editingProgram) {
      const { error } = await (supabase as any)
        .from('lob')
        .update({ name: formData.name })
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
    setFormData({ id_lob: '', name: '' });
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
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-3xl font-bold">Gestão de Programas</h2>
        </div>
        <Button onClick={() => {
          setShowForm(true);
          setEditingProgram(null);
          setFormData({ id_lob: '', name: '' });
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Programa
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 mb-6">
          <h3 className="font-bold mb-4">{editingProgram ? 'Editar Programa' : 'Novo Programa'}</h3>
          <div className="space-y-4">
            <div>
              <Label>ID do Programa</Label>
              <Input
                value={formData.id_lob}
                onChange={(e) => setFormData({ ...formData, id_lob: e.target.value })}
                disabled={!!editingProgram}
                placeholder="Ex: PROG-2025"
              />
            </div>
            <div>
              <Label>Nome</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Programa Financeiro 2025"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave}>Guardar</Button>
              <Button variant="outline" onClick={() => {
                setShowForm(false);
                setEditingProgram(null);
                setFormData({ id_lob: '', name: '' });
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
                <th className="px-4 py-3 text-left font-semibold">Nome</th>
                <th className="px-4 py-3 text-right font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {programs.map(program => (
                <tr key={program.id_lob} className="border-t hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 font-mono">{program.id_lob}</td>
                  <td className="px-4 py-3">{program.name}</td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingProgram(program);
                        setFormData({ id_lob: program.id_lob, name: program.name });
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
  );
}
