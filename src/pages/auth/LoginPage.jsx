import { Card, Form, Input, Button, Tabs } from 'antd';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const { TabPane } = Tabs;

const LoginPage = () => {
  const [formSuperAdmin] = Form.useForm();
  const navigate = useNavigate();
  const { login } = useAuth();

  const onFinishSuperAdmin = async (values) => {
    try {
      const res = await api.post('/superadmin/login', values);
      toast.success('Connexion Super Admin réussie');
      login(res.data);
      navigate('/superadmin', { replace: true });
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Identifiants invalides');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-100 via-white to-emerald-100">
      <Card className="w-full max-w-lg shadow-2xl">
        <h1 className="text-2xl font-bold mb-2 text-center">🎁 Portail LONGRICH</h1>
        <p className="text-center mb-4 text-sm text-gray-500">
          Connectez-vous selon votre rôle pour gérer la plateforme.
        </p>

        <Tabs defaultActiveKey="superadmin" centered>
          <TabPane tab="Super Admin" key="superadmin">
            <Form form={formSuperAdmin} layout="vertical" onFinish={onFinishSuperAdmin}>
              <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                <Input />
              </Form.Item>
              <Form.Item name="password" label="Mot de passe" rules={[{ required: true }]}>
                <Input.Password />
              </Form.Item>
              <Button type="primary" htmlType="submit" className="w-full mt-2">
                Se connecter (Super Admin)
              </Button>
            </Form>
          </TabPane>

          {/* plus tard : Admin, Admin secondaire, Livreur */}
        </Tabs>

        <Button
          type="link"
          className="w-full text-center mt-4"
          onClick={() => navigate('/register-superadmin')}
        >
          Première utilisation ? Créer le Super Admin
        </Button>
      </Card>
    </div>
  );
};

export default LoginPage;
