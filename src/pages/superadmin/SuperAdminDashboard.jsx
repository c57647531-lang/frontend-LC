// src/pages/superadmin/SuperAdminDashboard.jsx
import { Card, Col, Row, Statistic, Button } from 'antd';
import { ShopOutlined, TeamOutlined, AppstoreOutlined, PlusOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import { useAuthHeader } from '../../hooks/useAuthHeader';
import { useNavigate } from 'react-router-dom';

const SuperAdminDashboard = () => {
  const authHeader = useAuthHeader();
  const navigate = useNavigate();

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

  const { data: admins = [] } = useQuery({
    queryKey: ['superadmin-admins'],
    queryFn: async () => {
      const res = await api.get('/superadmin/admins', { headers: authHeader });
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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-2">Tableau de bord Super Admin 🎄</h1>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={6}>
          <Card>
            <Statistic
              title="Boutiques actives"
              value={boutiques.filter((b) => b.active).length}
              prefix={<ShopOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic
              title="Admins secondaires"
              value={adminsSecondaires.length}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic
              title="Admins (boutiquiers)"
              value={admins.length}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic
              title="Boutiques (CA suivi)"
              value={stats.length}
              prefix={<AppstoreOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Zone d’actions rapides */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card
            title="Gérer les admins secondaires"
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate('/superadmin/admins-secondaires')}
              >
                Créer
              </Button>
            }
          >
            <p className="text-sm text-gray-600">
              Création, suspension, suppression et permissions des admins secondaires.
            </p>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card
            title="Gérer les admins (boutiquiers)"
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate('/superadmin/admins')}
              >
                Créer
              </Button>
            }
          >
            <p className="text-sm text-gray-600">
              Création et gestion des comptes admins reliés aux boutiques.
            </p>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card
            title="Gérer les boutiques"
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate('/superadmin/boutiques')}
              >
                Créer
              </Button>
            }
          >
            <p className="text-sm text-gray-600">
              Création des boutiques, association à un admin et gestion des liens vitrines.
            </p>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SuperAdminDashboard;
