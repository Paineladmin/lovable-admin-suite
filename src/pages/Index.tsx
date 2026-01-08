import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import { AppLayout } from '@/components/layout/AppLayout';

const Index = () => {
  const { isAuthenticated, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <AppLayout onSignOut={signOut}>
      <Dashboard />
    </AppLayout>
  );
};

export default Index;
