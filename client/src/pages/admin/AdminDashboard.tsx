import AdminLayout from "@/components/AdminLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { KeyRound, Loader2, UserCheck } from "lucide-react";

const copyByLang = {
  pt: {
    title: "Dashboard de Logins",
    subtitle: "Dados operacionais zerados. Apenas acessos cadastrados.",
    loading: "Carregando logins...",
    empty: "Nenhum login encontrado.",
    total: "Total de logins",
    active: "Ativos",
    disabled: "Desativados",
    email: "E-mail",
    role: "Perfil",
    plan: "Plano",
    status: "Status",
    lastAccess: "Ultimo acesso",
    activeStatus: "Ativo",
    disabledStatus: "Desativado",
    manageUsers: "Gerenciar usuarios",
  },
  en: {
    title: "Login Dashboard",
    subtitle: "Operational data reset. Only registered accesses are shown.",
    loading: "Loading logins...",
    empty: "No logins found.",
    total: "Total logins",
    active: "Active",
    disabled: "Disabled",
    email: "Email",
    role: "Role",
    plan: "Plan",
    status: "Status",
    lastAccess: "Last access",
    activeStatus: "Active",
    disabledStatus: "Disabled",
    manageUsers: "Manage users",
  },
  es: {
    title: "Dashboard de Logins",
    subtitle: "Datos operativos en cero. Solo accesos registrados.",
    loading: "Cargando logins...",
    empty: "No se encontraron logins.",
    total: "Total de logins",
    active: "Activos",
    disabled: "Desactivados",
    email: "Correo",
    role: "Perfil",
    plan: "Plan",
    status: "Estado",
    lastAccess: "Ultimo acceso",
    activeStatus: "Activo",
    disabledStatus: "Desactivado",
    manageUsers: "Gestionar usuarios",
  },
} as const;

function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
}

export default function AdminDashboard() {
  const { language } = useLanguage();
  const c = copyByLang[language];

  const usersQuery = trpc.emailAuth.getAllUsers.useQuery(
    { limit: 500, offset: 0 },
    { refetchOnWindowFocus: false, staleTime: 30_000 },
  );

  const users = usersQuery.data ?? [];
  const activeCount = users.filter(user => user.isActive).length;
  const disabledCount = users.length - activeCount;

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">{c.title}</h1>
            <p className="text-muted-foreground">{c.subtitle}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/kommo">
              <Button variant="outline">
                Kommo
              </Button>
            </Link>
            <Link href="/admin/asaas">
              <Button variant="outline">
                Asaas
              </Button>
            </Link>
            <Link href="/admin/usuarios">
              <Button className="bg-[#e67e22] hover:bg-[#f08e36] text-white">
                {c.manageUsers}
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-2">
              <CardDescription>{c.total}</CardDescription>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <KeyRound className="h-5 w-5 text-[#e67e22]" />
                {users.length}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-2">
              <CardDescription>{c.active}</CardDescription>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <UserCheck className="h-5 w-5 text-emerald-500" />
                {activeCount}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-2">
              <CardDescription>{c.disabled}</CardDescription>
              <CardTitle className="text-2xl">{disabledCount}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle>{c.title}</CardTitle>
            <CardDescription>{c.subtitle}</CardDescription>
          </CardHeader>
          <CardContent>
            {usersQuery.isLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                {c.loading}
              </div>
            ) : users.length === 0 ? (
              <p className="text-sm text-muted-foreground">{c.empty}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-sm">
                  <thead>
                    <tr className="border-b border-border/60 text-left text-muted-foreground">
                      <th className="pb-2 pr-4">{c.email}</th>
                      <th className="pb-2 pr-4">{c.role}</th>
                      <th className="pb-2 pr-4">{c.plan}</th>
                      <th className="pb-2 pr-4">{c.status}</th>
                      <th className="pb-2">{c.lastAccess}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-border/40">
                        <td className="py-2 pr-4">{user.email}</td>
                        <td className="py-2 pr-4">{user.role}</td>
                        <td className="py-2 pr-4">{user.plan}</td>
                        <td className="py-2 pr-4">
                          <Badge variant={user.isActive ? "default" : "secondary"}>
                            {user.isActive ? c.activeStatus : c.disabledStatus}
                          </Badge>
                        </td>
                        <td className="py-2">{formatDateTime(user.lastSignedIn)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
