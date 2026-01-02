import { Card, Form, Input, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const RegisterSuperAdmin = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { login } = useAuth();

  const onFinish = async (values) => {
    try {
      const res = await api.post('/superadmin/register', values);
      toast.success('Super Admin créé');
      login(res.data); // { token, role: 'superadmin', superadmin: {...} }
      navigate('/superadmin', { replace: true });
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Erreur inscription');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-100 via-white to-emerald-100">
      <Card className="w-full max-w-md shadow-2xl">
        <h1 className="text-2xl font-bold mb-2 text-center">🎄 Création Super Admin</h1>
        <p className="text-center mb-6 text-sm text-gray-500">
          Première utilisation de la plateforme LONGRICH.
        </p>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="nom" label="Nom complet" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="Mot de passe" rules={[{ required: true, min: 6 }]}>
            <Input.Password />
          </Form.Item>
          <Button type="primary" htmlType="submit" className="w-full mt-2">
            S’inscrire et accéder au panel
          </Button>
          <Button
            type="link"
            className="w-full text-center mt-2"
            onClick={() => navigate('/login')}
          >
            Déjà un compte ? Se connecter
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default RegisterSuperAdmin;
