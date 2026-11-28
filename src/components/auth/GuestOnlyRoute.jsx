import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';

function GuestOnlyRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="card">Ielādējas...</div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default GuestOnlyRoute;
