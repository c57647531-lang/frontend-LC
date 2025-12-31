import { Layout, Menu } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  DashboardOutlined,
  TeamOutlined,
  ShopOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

const SuperAdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const selectedKey = (() => {
    if (location.pathname.startsWith('/superadmin/admins-secondaires')) return 'admins';
    if (location.pathname.startsWith('/superadmin/boutiques')) return 'boutiques';
    if (location.pathname.startsWith('/superadmin/produits-longrich')) return 'produits';
    return 'dashboard';
  })();

  return (
    <Layout className="min-h-screen">
      <Sider breakpoint="lg" collapsedWidth="0">
        <div className="h-16 flex items-center justify-center text-white font-bold text-lg guirlande">
          🎄 LONGRICH
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={(info) => {
            if (info.key === 'dashboard') navigate('/superadmin');
            if (info.key === 'admins') navigate('/superadmin/admins-secondaires');
            if (info.key === 'boutiques') navigate('/superadmin/boutiques');
            if (info.key === 'produits') navigate('/superadmin/produits-longrich');
          }}
          items={[
            { key: 'dashboard', icon: <DashboardOutlined />, label: 'Tableau de bord' },
            { key: 'admins', icon: <TeamOutlined />, label: 'Admins secondaires' },
            { key: 'boutiques', icon: <ShopOutlined />, label: 'Boutiques' },
            { key: 'produits', icon: <AppstoreOutlined />, label: 'Produits Longrich' },
          ]}
        />
      </Sider>
      <Layout>
        <Header className="bg-white shadow flex items-center justify-between px-4">
          <div className="font-semibold">
            Super Admin – Panel de contrôle
          </div>
          <div className="text-sm text-gray-500">
            🎁 Cadeau de Noël pour vos clients
          </div>
        </Header>
        <Content className="p-4 bg-slate-50">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default SuperAdminLayout;
