import { useState, useEffect } from 'react';
import { Edit3, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Lob {
  id_lob: string;
  name: string;
  desc_lob: string | null;
}

interface Lang {
  id_lang: string;
  desc_lang: string | null;
  lobs: Lob[];
  expanded: boolean;
}

interface Project {
  id_prj: string;
  desc_prj: string | null;
  langs: Lang[];
  expanded: boolean;
}

interface Props {
  onBack: () => void;
}

type EditType = 'project' | 'lang' | 'lob';

export default function HierarchyManager({ onBack }: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [editDialog, setEditDialog] = useState(false);
  const [editType, setEditType] = useState<EditType>('project');
  const [editData, setEditData] = useState({
    id: '',
    name: '',
    desc: '',
    parentId: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    loadHierarchy();
  }, []);

  const loadHierarchy = async () => {
    const { data: projectsData, error: projError } = await (supabase as any)
      .from('project')
      .select('*')
      .order('id_prj');

    if (projError) {
      toast({ title: 'Erro', description: 'Erro ao carregar projetos', variant: 'destructive' });
      return;
    }

    const { data: langsData, error: langError } = await (supabase as any)
      .from('lang')
      .select('*')
      .order('id_lang');

    if (langError) {
      toast({ title: 'Erro', description: 'Erro ao carregar languages', variant: 'destructive' });
      return;
    }

    const { data: lobsData, error: lobError } = await (supabase as any)
      .from('lob')
      .select('*')
      .order('id_lob');

    if (lobError) {
      toast({ title: 'Erro', description: 'Erro ao carregar lobs', variant: 'destructive' });
      return;
    }

    const hierarchy = projectsData.map((proj: any) => ({
      ...proj,
      expanded: false,
      langs: langsData
        .filter((lang: any) => lang.id_prj === proj.id_prj)
        .map((lang: any) => ({
          ...lang,
          expanded: false,
          lobs: lobsData.filter((lob: any) => lob.id_lang === lang.id_lang),
        })),
    }));

    setProjects(hierarchy);
  };

  const toggleProject = (projId: string) => {
    setProjects(projects.map(p => 
      p.id_prj === projId ? { ...p, expanded: !p.expanded } : p
    ));
  };

  const toggleLang = (projId: string, langId: string) => {
    setProjects(projects.map(p => 
      p.id_prj === projId ? {
        ...p,
        langs: p.langs.map(l => 
          l.id_lang === langId ? { ...l, expanded: !l.expanded } : l
        )
      } : p
    ));
  };

  const handleEdit = (type: EditType, id: string, name: string, desc: string, parentId = '') => {
    setEditType(type);
    setEditData({ id, name, desc, parentId });
    setEditDialog(true);
  };

  const handleSave = async () => {
    if (editType === 'project') {
      const { error } = await (supabase as any)
        .from('project')
        .update({ desc_prj: editData.desc })
        .eq('id_prj', editData.id);
      
      if (error) {
        toast({ title: 'Erro', description: 'Erro ao atualizar projeto', variant: 'destructive' });
        return;
      }
    } else if (editType === 'lang') {
      const { error } = await (supabase as any)
        .from('lang')
        .update({ desc_lang: editData.desc })
        .eq('id_lang', editData.id);
      
      if (error) {
        toast({ title: 'Erro', description: 'Erro ao atualizar language', variant: 'destructive' });
        return;
      }
    } else if (editType === 'lob') {
      const { error } = await (supabase as any)
        .from('lob')
        .update({ name: editData.name, desc_lob: editData.desc })
        .eq('id_lob', editData.id);
      
      if (error) {
        toast({ title: 'Erro', description: 'Erro ao atualizar lob', variant: 'destructive' });
        return;
      }
    }

    setEditDialog(false);
    loadHierarchy();
    toast({ title: 'Sucesso', description: 'Atualizado com sucesso' });
  };

  const handleDelete = async (type: EditType, id: string, name: string) => {
    if (!window.confirm(`Tem certeza que deseja eliminar ${name}?`)) return;

    let error;
    if (type === 'project') {
      ({ error } = await (supabase as any).from('project').delete().eq('id_prj', id));
    } else if (type === 'lang') {
      ({ error } = await (supabase as any).from('lang').delete().eq('id_lang', id));
    } else if (type === 'lob') {
      ({ error } = await (supabase as any).from('lob').delete().eq('id_lob', id));
    }

    if (error) {
      toast({ title: 'Erro', description: 'Erro ao eliminar', variant: 'destructive' });
      return;
    }

    loadHierarchy();
    toast({ title: 'Sucesso', description: 'Eliminado com sucesso' });
  };

  return (
    <div>
      <div className="max-w-6xl mx-auto">
        <Card className="p-6">
          <div className="space-y-2">
            {projects.map(project => (
              <div key={project.id_prj} className="border rounded-lg">
                <div className="flex items-center justify-between p-3 bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex items-center gap-2 flex-1">
                    <button onClick={() => toggleProject(project.id_prj)} className="p-1">
                      {project.expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                    <div>
                      <span className="font-semibold">{project.id_prj}</span>
                      {project.desc_prj && <span className="text-sm text-muted-foreground ml-2">- {project.desc_prj}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit('project', project.id_prj, project.id_prj, project.desc_prj || '')}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete('project', project.id_prj, project.id_prj)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {project.expanded && (
                  <div className="pl-8 py-2">
                    {project.langs.map(lang => (
                      <div key={lang.id_lang} className="border rounded-lg mb-2">
                        <div className="flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-2 flex-1">
                            <button onClick={() => toggleLang(project.id_prj, lang.id_lang)} className="p-1">
                              {lang.expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </button>
                            <div>
                              <span className="font-medium">{lang.id_lang}</span>
                              {lang.desc_lang && <span className="text-sm text-muted-foreground ml-2">- {lang.desc_lang}</span>}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit('lang', lang.id_lang, lang.id_lang, lang.desc_lang || '', project.id_prj)}
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete('lang', lang.id_lang, lang.id_lang)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {lang.expanded && (
                          <div className="pl-8 py-2">
                            {lang.lobs.map(lob => (
                              <div key={lob.id_lob} className="flex items-center justify-between p-2 hover:bg-muted/30 rounded transition-colors mb-1">
                                <div>
                                  <span className="font-medium">{lob.id_lob}</span>
                                  <span className="text-sm ml-2">{lob.name}</span>
                                  {lob.desc_lob && <span className="text-sm text-muted-foreground ml-2">- {lob.desc_lob}</span>}
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEdit('lob', lob.id_lob, lob.name, lob.desc_lob || '', lang.id_lang)}
                                  >
                                    <Edit3 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDelete('lob', lob.id_lob, lob.name)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar {editType === 'project' ? 'Projeto' : editType === 'lang' ? 'Language' : 'Lob'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>ID</Label>
              <Input value={editData.id} disabled />
            </div>
            {editType === 'lob' && (
              <div>
                <Label>Nome</Label>
                <Input
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                />
              </div>
            )}
            <div>
              <Label>Descrição</Label>
              <Input
                value={editData.desc}
                onChange={(e) => setEditData({ ...editData, desc: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave}>Guardar</Button>
              <Button variant="outline" onClick={() => setEditDialog(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
