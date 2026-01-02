import { useEffect, useState } from 'react';
import { Button, Card, Table, Tag, Modal, Form, Input, Checkbox } from 'antd';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';
import { useAuthHeader } from '../../hooks/useAuthHeader';
import toast from 'react-hot-toast';

const ALL_PERMISSIONS = [
  { value: 'create_admin', label: 'Créer admin' },
  { value: 'suspend_admin', label: 'Suspendre admin' },
  { value: 'delete_admin', label: 'Supprimer admin' },
  { value: 'create_boutique', label: 'Créer boutique' },
  { value: 'activate_boutique', label: 'Activer boutique' },
  { value: 'delete_boutique', label: 'Supprimer boutique' },
  { value: 'manage_produits_longrich', label: 'Gérer produits Longrich' },
  { value: 'duplicate_produits', label: 'Dupliquer produits' },
  { value: 'manage_autres_produits', label: 'Gérer autres produits' },
  { value: 'view_stats_ca', label: 'Voir CA' },
  { value: 'manage_commandes', label: 'Gérer commandes' },
  { value: 'confirm_livraisons', label: 'Confirmer livraisons' },
];

const SuperAdminAdminsSecondaires = () => {
  const authHeader = useAuthHeader();
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  const [permModalVisible, setPermModalVisible] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [form] = Form.useForm();
  const [permForm] = Form.useForm();

  const { data: admins = [], isLoading } = useQuery({
    queryKey: ['superadmin-admins-secondaires'],
    queryFn: async () => {
      const res = await api.get('/superadmin/admins-secondaires', { headers: authHeader });
      return res.data;
    },
  });

  const refetchAdmins = () =>
    queryClient.invalidateQueries({ queryKey: ['superadmin-admins-secondaires'] });

  const openCreateModal = () => {
    form.resetFields();
    setModalVisible(true);
  };

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      await api.post('/superadmin/admins-secondaires', values, { headers: authHeader });
      toast.success('Admin secondaire créé');
      setModalVisible(false);
      refetchAdmins();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Erreur création');
    }
  };

  const openPermModal = (admin) => {
    setCurrentAdmin(admin);
    const perms =
      admin.AdminSecondairePermissions?.map((ap) => ap.Permission?.nom).filter(Boolean) || [];
    permForm.setFieldsValue({ permissions: perms });
    setPermModalVisible(true);
  };

  const handleUpdatePerms = async () => {
    try {
      const { permissions } = await permForm.validateFields();
      await api.put(
        `/superadmin/admins-secondaires/${currentAdmin.id}/permissions`,
        { permissions },
        { headers: authHeader },
      );
      toast.success('Permissions mises à jour');
      setPermModalVisible(false);
      refetchAdmins();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Erreur permissions');
    }
  };

  const handleSuspend = async (admin) => {
    try {
      await api.post(`/superadmin/admins-secondaires/${admin.id}/suspend`, {}, { headers: authHeader });
      toast.success('Admin suspendu');
      refetchAdmins();
    } catch {
      toast.error('Erreur suspension');
    }
  };

  const handleDelete = async (admin) => {
    try {
      await api.delete(`/superadmin/admins-secondaires/${admin.id}`, { headers: authHeader });
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
      title: 'Permissions',
      key: 'permissions',
      render: (_, record) => {
        const perms =
          record.AdminSecondairePermissions?.map((ap) => ap.Permission?.nom).filter(Boolean) || [];
        if (!perms.length) return <span className="text-gray-400">Aucune</span>;
        return perms.map((p) => (
          <Tag key={p} color="blue">
            {p}
          </Tag>
        ));
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="space-x-2">
          <Button size="small" onClick={() => openPermModal(record)}>
            Permissions
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
        title="Admins secondaires"
        extra={
          <Button type="primary" onClick={openCreateModal}>
            Créer un admin secondaire
          </Button>
        }
      >
        <Table columns={columns} dataSource={admins} rowKey="id" loading={isLoading} />
      </Card>

      <Modal
        title="Créer un admin secondaire"
        open={modalVisible}
        onOk={handleCreate}
        onCancel={() => setModalVisible(false)}
        okText="Enregistrer"
        cancelText="Annuler"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="nom" label="Nom" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="telephone" label="Téléphone" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="Mot de passe" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="permissions" label="Permissions initiales">
            <Checkbox.Group
              options={ALL_PERMISSIONS.map((p) => ({
                label: p.label,
                value: p.value,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`Permissions de ${currentAdmin?.nom || ''}`}
        open={permModalVisible}
        onOk={handleUpdatePerms}
        onCancel={() => setPermModalVisible(false)}
        okText="Mettre à jour"
        cancelText="Annuler"
      >
        <Form form={permForm} layout="vertical">
          <Form.Item name="permissions" label="Permissions">
            <Checkbox.Group
              options={ALL_PERMISSIONS.map((p) => ({
                label: p.label,
                value: p.value,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default SuperAdminAdminsSecondaires;
