import { useAuth } from "@/_core/hooks/useAuth";
import { Redirect, useLocation } from "wouter";
import { Loader2 } from "lucide-react";

interface AdminRouteProps {
  children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(255,201,153,0.2),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(191,235,255,0.22),_transparent_24%),linear-gradient(180deg,_#fcfdff_0%,_#f5f7fb_100%)]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="text-gray-400">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Redirect to="/login" />;
  }

  // Check if user has admin role
  if (user.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Acesso Negado</h1>
          <p className="text-gray-400 mb-6">
            Você não tem permissão para acessar esta área. Esta seção é restrita a administradores.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setLocation("/dashboard")}
              className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Ir para meu Dashboard
            </button>
            <button
              onClick={() => setLocation("/")}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Voltar para Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated and has admin role
  return <>{children}</>;
}
