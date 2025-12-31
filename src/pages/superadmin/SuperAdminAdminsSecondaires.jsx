import { useEffect, useState } from 'react';
import { Button, Card, Table, Tag, Modal, Form, Input, Checkbox } from 'antd';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_URL } from '../../constants/constants';
import { getAuthHeader } from '../../hooks/useSuperAdminAuth';

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
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [permModalVisible, setPermModalVisible] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [form] = Form.useForm();
  const [permForm] = Form.useForm();

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/superadmin/admins-secondaires`, {
        headers: getAuthHeader(),
      });
      setAdmins(res.data || []);
    } catch (e) {
      console.error(e);
      toast.error("Erreur lors du chargement des admins secondaires");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const openCreateModal = () => {
    form.resetFields();
    setModalVisible(true);
  };

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      await axios.post(`${API_URL}/superadmin/admins-secondaires`, values, {
        headers: getAuthHeader(),
      });
      toast.success("Admin secondaire créé");
      setModalVisible(false);
      fetchAdmins();
    } catch (e) {
      if (e?.response?.data?.message) toast.error(e.response.data.message);
    }
  };

  const openPermModal = (admin) => {
    setCurrentAdmin(admin);
    const perms = (admin.AdminSecondairePermissions || []).map(
      (ap) => ap.Permission?.nom
    );
    permForm.setFieldsValue({ permissions: perms });
    setPermModalVisible(true);
  };

  const handleUpdatePerms = async () => {
    try {
      const { permissions } = await permForm.validateFields();
      await axios.put(
        `${API_URL}/superadmin/admins-secondaires/${currentAdmin.id}/permissions`,
        { permissions },
        { headers: getAuthHeader() }
      );
      toast.success("Permissions mises à jour");
      setPermModalVisible(false);
      fetchAdmins();
    } catch (e) {
      if (e?.response?.data?.message) toast.error(e.response.data.message);
    }
  };

  const handleSuspend = async (admin) => {
    try {
      await axios.post(
        `${API_URL}/superadmin/admins-secondaires/${admin.id}/suspend`,
        {},
        { headers: getAuthHeader() }
      );
      toast.success("Admin suspendu");
      fetchAdmins();
    } catch (e) {
      toast.error("Erreur lors de la suspension");
    }
  };

  const handleDelete = async (admin) => {
    try {
      await axios.delete(
        `${API_URL}/superadmin/admins-secondaires/${admin.id}`,
        { headers: getAuthHeader() }
      );
      toast.success("Admin supprimé");
      fetchAdmins();
    } catch (e) {
      toast.error("Erreur lors de la suppression");
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
        const perms = (record.AdminSecondairePermissions || []).map(
          (ap) => ap.Permission?.nom
        );
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
        extra={<Button type="primary" onClick={openCreateModal}>Créer un admin secondaire</Button>}
      >
        <Table
          columns={columns}
          dataSource={admins}
          rowKey="id"
          loading={loading}
        />
      </Card>

      {/* Modal création admin secondaire */}
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

      {/* Modal permissions */}
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
