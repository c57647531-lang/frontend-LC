// src/pages/superadmin/SuperAdminDashboard.jsx
import { Card, Col, Row, Statistic } from 'antd';
import { ShopOutlined, TeamOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import { useAuthHeader } from '../../hooks/useAuthHeader';

const SuperAdminDashboard = () => {
  const authHeader = useAuthHeader();

  const { data: boutiques = [] } = useQuery({
    queryKey: ['superadmin-boutiques'],
    queryFn: async () => {
      const res = await api.get('/superadmin/boutiques', { headers: authHeader });
      return res.data;
    },
  });

  const { data: adminsSecondaires = [] } = useQuery({
    queryKey: ['superadmin-admins-secondaires'],
    queryFn: async () => {
      const res = await api.get('/superadmin/admins-secondaires', { headers: authHeader });
      return res.data;
    },
  });

  const { data: stats = [] } = useQuery({
    queryKey: ['superadmin-stats-ca'],
    queryFn: async () => {
      const res = await api.get('/superadmin/stats/ca', { headers: authHeader });
      return res.data;
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold mb-2">Tableau de bord Super Admin 🎄</h1>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Boutiques actives"
              value={boutiques.filter((b) => b.active).length}
              prefix={<ShopOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Admins secondaires"
              value={adminsSecondaires.length}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Boutiques (CA suivi)"
              value={stats.length}
              prefix={<AppstoreOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SuperAdminDashboard;
