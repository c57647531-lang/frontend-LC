// src/pages/superadmin/components/QuickCreateAdminWidget.jsx
import { useState } from 'react';
import { Card, Form, Input, Button, Space } from 'antd';
import api from '../../../lib/axios';
import { useAuthHeader } from '../../../hooks/useAuthHeader';
import toast from 'react-hot-toast';

const QuickCreateAdminWidget = ({ onAdminCreated }) => {
  const authHeader = useAuthHeader();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      await api.post('/superadmin/admins', values, { headers: authHeader });
      toast.success('Admin créé avec succès');
      form.resetFields();
      onAdminCreated?.();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Erreur création admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="➕ Créer rapidement un Admin" className="mb-4">
      <Form form={form} layout="vertical">
        <Form.Item name="nom" label="Nom" rules={[{ required: true }]}>
          <Input placeholder="Nom complet" />
        </Form.Item>
        <Form.Item name="email" label="Email">
          <Input placeholder="email@example.com" type="email" />
        </Form.Item>
        <Form.Item name="telephone" label="Téléphone" rules={[{ required: true }]}>
          <Input placeholder="+237 6xx xxx xxx" />
        </Form.Item>
        <Form.Item name="password" label="Mot de passe" rules={[{ required: true, min: 6 }]}>
          <Input.Password placeholder="Minimum 6 caractères" />
        </Form.Item>
        <Button type="primary" onClick={handleCreate} loading={loading} block>
          Créer l'admin
        </Button>
      </Form>
    </Card>
  );
};

export default QuickCreateAdminWidget;
