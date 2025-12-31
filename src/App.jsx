import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import SuperAdminLayout from './layouts/SuperAdminLayout';
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import SuperAdminAdminsSecondaires from './pages/superadmin/SuperAdminAdminsSecondaires';
import SuperAdminBoutiques from './pages/superadmin/SuperAdminBoutiques';
import SuperAdminProduitsLongrich from './pages/superadmin/SuperAdminProduitsLongrich';

// on ajoutera plus tard : LoginPage, RegisterSuperAdmin, Admin*, Livreur*, Client*

const queryClient = new QueryClient();

function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#DC2626',
          colorSuccess: '#059669',
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            {/* Super Admin uniquement pour l’instant */}
            <Route path="/superadmin/*" element={<SuperAdminLayout />}>
              <Route index element={<SuperAdminDashboard />} />
              <Route path="admins-secondaires" element={<SuperAdminAdminsSecondaires />} />
              <Route path="boutiques" element={<SuperAdminBoutiques />} />
              <Route path="produits-longrich" element={<SuperAdminProduitsLongrich />} />
            </Route>

            {/* Default */}
            <Route path="*" element={<Navigate to="/superadmin" />} />
          </Routes>
          <Toaster position="top-right" />
        </BrowserRouter>
      </QueryClientProvider>
    </ConfigProvider>
  );
}

export default App;
