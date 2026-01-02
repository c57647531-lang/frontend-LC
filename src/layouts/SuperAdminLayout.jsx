// src/layouts/SuperAdminLayout.jsx
import { Layout, Menu, Dropdown } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  DashboardOutlined,
  TeamOutlined,
  ShopOutlined,
  AppstoreOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';

const { Header, Sider, Content } = Layout;

const SuperAdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const selectedKey = (() => {
    if (location.pathname.startsWith('/superadmin/admins-secondaires')) return 'adminsSecondaires';
    if (location.pathname.startsWith('/superadmin/admins')) return 'admins';
    if (location.pathname.startsWith('/superadmin/boutiques')) return 'boutiques';
    if (location.pathname.startsWith('/superadmin/produits-longrich')) return 'produits';
    return 'dashboard';
  })();

  const menu = (
    <Menu
      items={[
        {
          key: 'logout',
          icon: <LogoutOutlined />,
          label: 'Se déconnecter',
          onClick: () => {
            logout();
            navigate('/login');
          },
        },
      ]}
    />
  );

  return (
    <Layout className="min-h-screen">
      <Sider breakpoint="lg" collapsedWidth="0">
        <div className="h-16 flex items-center justify-center text-white font-bold text-lg">
          🎄 LONGRICH
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={(info) => {
            if (info.key === 'dashboard') navigate('/superadmin');
            if (info.key === 'adminsSecondaires') navigate('/superadmin/admins-secondaires');
            if (info.key === 'admins') navigate('/superadmin/admins');
            if (info.key === 'boutiques') navigate('/superadmin/boutiques');
            if (info.key === 'produits') navigate('/superadmin/produits-longrich');
          }}
          items={[
            { key: 'dashboard', icon: <DashboardOutlined />, label: 'Tableau de bord' },
            { key: 'adminsSecondaires', icon: <TeamOutlined />, label: 'Admins secondaires' },
            { key: 'admins', icon: <TeamOutlined />, label: 'Admins (boutiquiers)' },
            { key: 'boutiques', icon: <ShopOutlined />, label: 'Boutiques' },
            { key: 'produits', icon: <AppstoreOutlined />, label: 'Produits Longrich' },
          ]}
        />
      </Sider>
      <Layout>
        <Header className="bg-white shadow flex items-center justify-between px-4">
          <div className="font-semibold">Super Admin – Panel de contrôle</div>
          <Dropdown overlay={menu} placement="bottomRight">
            <div className="cursor-pointer">
              <div className="text-sm font-semibold">{user?.user?.nom || 'Super Admin'}</div>
              <div className="text-xs text-gray-500">{user?.user?.email}</div>
            </div>
          </Dropdown>
        </Header>
        <Content className="p-4 bg-slate-50">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default SuperAdminLayout;
