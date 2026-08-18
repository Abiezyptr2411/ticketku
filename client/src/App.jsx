import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './store/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Home from './pages/Home';
import SearchTrain from './pages/SearchTrain';
import TrainDetail from './pages/TrainDetail';
import Passenger from './pages/Passenger';
import SelectSeat from './pages/SelectSeat';
import OrderSummary from './pages/OrderSummary';
import Payment from './pages/Payment';
import ETicket from './pages/ETicket';
import MyTickets from './pages/MyTickets';
import AdminDashboard from './pages/AdminDashboard';
import EditProfile from './pages/EditProfile';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return children;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== 'ADMIN') {
    return <Navigate to="/" />;
  }
  
  return children;
}

function App() {
  return (
    <div className="min-h-screen bg-background text-text-primary">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><SearchTrain /></ProtectedRoute>} />
        <Route path="/train/:id" element={<ProtectedRoute><TrainDetail /></ProtectedRoute>} />
        <Route path="/passenger" element={<ProtectedRoute><Passenger /></ProtectedRoute>} />
        <Route path="/seat" element={<ProtectedRoute><SelectSeat /></ProtectedRoute>} />
        <Route path="/summary" element={<ProtectedRoute><OrderSummary /></ProtectedRoute>} />
        <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
        <Route path="/e-ticket" element={<ProtectedRoute><ETicket /></ProtectedRoute>} />
        <Route path="/my-tickets" element={<ProtectedRoute><MyTickets /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      </Routes>
    </div>
  );
}

export default App;
