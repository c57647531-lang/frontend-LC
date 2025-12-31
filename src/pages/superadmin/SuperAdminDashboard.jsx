import { Card, Col, Row, Statistic } from 'antd';
import { ShopOutlined, TeamOutlined, AppstoreOutlined } from '@ant-design/icons';

const SuperAdminDashboard = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold mb-2">
        Tableau de bord Super Admin 🎄
      </h1>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card className="christmas-card text-white">
            <Statistic title="Boutiques actives" value={0} prefix={<ShopOutlined />} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="christmas-card text-white">
            <Statistic title="Admins secondaires" value={0} prefix={<TeamOutlined />} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="christmas-card text-white">
            <Statistic title="Produits Longrich" value={0} prefix={<AppstoreOutlined />} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SuperAdminDashboard;
