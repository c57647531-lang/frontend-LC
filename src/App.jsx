import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import SuperAdminLayout from './layouts/SuperAdminLayout';
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import SuperAdminAdminsSecondaires from './pages/superadmin/SuperAdminAdminsSecondaires';
import SuperAdminBoutiques from './pages/superadmin/SuperAdminBoutiques';
import SuperAdminProduitsLongrich from './pages/superadmin/SuperAdminProduitsLongrich';

import SuperAdminAdmins from './pages/superadmin/SuperAdminAdmins';


import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import RegisterSuperAdmin from './pages/auth/RegisterSuperAdmin';

const queryClient = new QueryClient();

function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: { colorPrimary: '#DC2626', colorSuccess: '#059669' },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            {/* Auth */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register-superadmin" element={<RegisterSuperAdmin />} />

            {/* Super Admin protégé */}
            <Route element={<ProtectedRoute allowedRoles={['superadmin']} />}>
  <Route path="/superadmin/*" element={<SuperAdminLayout />}>
    <Route index element={<SuperAdminDashboard />} />
    <Route path="admins-secondaires" element={<SuperAdminAdminsSecondaires />} />
    <Route path="admins" element={<SuperAdminAdmins />} /> {/* ⬅️ NEW */}
    <Route path="boutiques" element={<SuperAdminBoutiques />} />
    <Route path="produits-longrich" element={<SuperAdminProduitsLongrich />} />
  </Route>
</Route>

            {/* Default */}
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
          <Toaster position="top-right" />
        </BrowserRouter>
      </QueryClientProvider>
    </ConfigProvider>
  );
}

export default App;
