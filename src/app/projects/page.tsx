import { createClient } from '@/lib/supabase/server';
import { Topbar } from '@/components/shared/topbar';
import Link from 'next/link';
import { FolderOpen, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CreateProjectDialog } from '@/components/projects/create-project-dialog';

export default async function ProjectsPage() {
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from('projects')
    .select('id, code, name, description')
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-gradient-to-br from-uzzai-primary/5 via-white to-uzzai-secondary/5">
      <Topbar />

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-uzzai-primary/10 rounded-2xl flex items-center justify-center">
              <FolderOpen className="w-8 h-8 text-uzzai-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Selecione um Projeto</h1>
          <p className="text-gray-500 mt-2">Escolha o projeto que deseja gerenciar</p>
        </div>

        {!projects || projects.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Nenhum projeto encontrado</p>
              <p className="text-sm text-gray-400 mt-1">
                Crie um novo projeto para comecar.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}/dashboard`}
                className="group"
              >
                <Card className="h-full border-2 border-transparent hover:border-uzzai-primary/30 hover:shadow-md transition-all cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="font-mono text-xs shrink-0">
                            {project.code}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg leading-snug group-hover:text-uzzai-primary transition-colors">
                          {project.name}
                        </CardTitle>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-uzzai-primary group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                    </div>
                  </CardHeader>
                  {project.description && (
                    <CardContent className="pt-0">
                      <CardDescription className="text-sm line-clamp-2">
                        {project.description}
                      </CardDescription>
                    </CardContent>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <CreateProjectDialog />
        </div>
      </main>
    </div>
  );
}

