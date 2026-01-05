// src/pages/superadmin/SuperAdminAdmins.jsx
import { useState } from 'react';
import { Button, Card, Table, Tag, Modal, Form, Input } from 'antd';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';
import { useAuthHeader } from '../../hooks/useAuthHeader';
import toast from 'react-hot-toast';

const SuperAdminAdmins = () => {
  const authHeader = useAuthHeader();
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const { data: admins = [], isLoading } = useQuery({
    queryKey: ['superadmin-admins'],
    queryFn: async () => {
      const res = await api.get('/superadmin/admins', { headers: authHeader });
      return res.data;
    },
  });

  const refetchAdmins = () =>
    queryClient.invalidateQueries({ queryKey: ['superadmin-admins'] });

  const openCreateModal = () => {
    setEditing(null);
    form.resetFields();
    setModalVisible(true);
  };

  const openEditModal = (admin) => {
    setEditing(admin);
    form.setFieldsValue({
      nom: admin.nom,
      email: admin.email,
      telephone: admin.telephone,
      password: '',
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        if (!values.password) delete values.password;
        await api.put(`/superadmin/admins/${editing.id}`, values, { headers: authHeader });
        toast.success('Admin mis à jour');
      } else {
        await api.post('/superadmin/admins', values, { headers: authHeader });
        toast.success('Admin créé');
      }
      setModalVisible(false);
      refetchAdmins();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Erreur enregistrement');
    }
  };

  const handleSuspend = async (admin) => {
    try {
      await api.post(`/superadmin/admins/${admin.id}/suspend`, {}, { headers: authHeader });
      toast.success('Admin suspendu');
      refetchAdmins();
    } catch {
      toast.error('Erreur suspension');
    }
  };

  const handleDelete = async (admin) => {
    try {
      await api.delete(`/superadmin/admins/${admin.id}`, { headers: authHeader });
      toast.success('Admin supprimé');
      refetchAdmins();
    } catch {
      toast.error('Erreur suppression');
    }
  };

  const columns = [
    { title: 'Nom', dataIndex: 'nom', key: 'nom' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Téléphone', dataIndex: 'telephone', key: 'telephone' },
    {
      title: 'Statut',
      dataIndex: 'suspendu',
      key: 'suspendu',
      render: (suspendu) =>
        suspendu ? <Tag color="red">Suspendu</Tag> : <Tag color="green">Actif</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="space-x-2">
          <Button size="small" onClick={() => openEditModal(record)}>
            Éditer
          </Button>
          <Button size="small" danger onClick={() => handleSuspend(record)}>
            Suspendre
          </Button>
          <Button size="small" onClick={() => handleDelete(record)}>
            Supprimer
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Card
        title="Admins (boutiquiers)"
        extra={
          <Button type="primary" onClick={openCreateModal}>
            Créer un admin
          </Button>
        }
      >
        <Table columns={columns} dataSource={admins} rowKey="id" loading={isLoading} />
      </Card>

      <Modal
        title={editing ? 'Modifier un admin' : 'Créer un admin'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        okText="Enregistrer"
        cancelText="Annuler"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="nom" label="Nom" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input />
          </Form.Item>
          <Form.Item name="telephone" label="Téléphone" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label={editing ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe'}
            rules={editing ? [] : [{ required: true, min: 6 }]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default SuperAdminAdmins;
