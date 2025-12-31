import { useEffect, useState } from 'react';
import { Button, Card, Table, Tag, Modal, Form, Input, Select, Switch } from 'antd';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_URL } from '../../constants/constants';
import { getAuthHeader } from '../../hooks/useSuperAdminAuth';

const { Option } = Select;

const SuperAdminBoutiques = () => {
  const [boutiques, setBoutiques] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bRes, aRes] = await Promise.all([
        axios.get(`${API_URL}/superadmin/boutiques`, { headers: getAuthHeader() }),
        axios.get(`${API_URL}/superadmin/admins-secondaires`, { headers: getAuthHeader() }),
      ]);
      setBoutiques(bRes.data || []);
      setAdmins(aRes.data || []);
    } catch (e) {
      console.error(e);
      toast.error('Erreur lors du chargement des boutiques');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditing(null);
    form.resetFields();
    setModalVisible(true);
  };

  const openEditModal = (boutique) => {
    setEditing(boutique);
    form.setFieldsValue({
      proprietaireId: boutique.proprietaireId,
      nom: boutique.nom,
      type: boutique.type,
      typeAutre: boutique.typeAutre,
      quartier: boutique.quartier,
      ville: boutique.ville,
      numeroTel: boutique.numeroTel,
      active: boutique.active,
      autoriseAjoutProduits: boutique.autoriseAjoutProduits,
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        await axios.put(
          `${API_URL}/superadmin/boutiques/${editing.id}`,
          values,
          { headers: getAuthHeader() }
        );
        toast.success('Boutique mise à jour');
      } else {
        await axios.post(
          `${API_URL}/superadmin/boutiques`,
          values,
          { headers: getAuthHeader() }
        );
        toast.success('Boutique créée');
      }
      setModalVisible(false);
      fetchData();
    } catch (e) {
      if (e?.response?.data?.message) toast.error(e.response.data.message);
    }
  };

  const handleDelete = async (boutique) => {
    try {
      await axios.delete(
        `${API_URL}/superadmin/boutiques/${boutique.id}`,
        { headers: getAuthHeader() }
      );
      toast.success('Boutique supprimée');
      fetchData();
    } catch (e) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const columns = [
    { title: 'Nom', dataIndex: 'nom', key: 'nom' },
    {
      title: 'Propriétaire',
      dataIndex: 'proprietaire',
      key: 'proprietaire',
      render: (p) => p?.nom || '—',
    },
    { title: 'Type', dataIndex: 'type', key: 'type' },
    { title: 'Ville', dataIndex: 'ville', key: 'ville' },
    {
      title: 'Active',
      dataIndex: 'active',
      key: 'active',
      render: (active) =>
        active ? <Tag color="green">Active</Tag> : <Tag color="orange">Inactif</Tag>,
    },
    {
      title: 'Ajout produits',
      dataIndex: 'autoriseAjoutProduits',
      key: 'autoriseAjoutProduits',
      render: (val) =>
        val ? <Tag color="blue">Autorisé</Tag> : <Tag color="default">Non</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="space-x-2">
          <Button size="small" onClick={() => openEditModal(record)}>Éditer</Button>
          <Button size="small" danger onClick={() => handleDelete(record)}>Supprimer</Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Card
        title="Boutiques"
        extra={<Button type="primary" onClick={openCreateModal}>Créer une boutique</Button>}
      >
        <Table
          columns={columns}
          dataSource={boutiques}
          rowKey="id"
          loading={loading}
        />
      </Card>

      <Modal
        title={editing ? 'Modifier la boutique' : 'Créer une boutique'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        okText="Enregistrer"
        cancelText="Annuler"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="proprietaireId"
            label="Admin secondaire propriétaire"
            rules={[{ required: true }]}
          >
            <Select placeholder="Sélectionner un admin secondaire">
              {admins.map((a) => (
                <Option key={a.id} value={a.id}>
                  {a.nom} - {a.email}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="nom" label="Nom de la boutique" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="type" label="Type" rules={[{ required: true }]}>
            <Select>
              <Option value="boutique">Boutique</Option>
              <Option value="supermarche">Supermarché</Option>
              <Option value="entreprise">Entreprise</Option>
              <Option value="autre">Autre</Option>
            </Select>
          </Form.Item>

          <Form.Item name="typeAutre" label="Type (autre)" tooltip="si type = autre">
            <Input />
          </Form.Item>

          <Form.Item name="quartier" label="Quartier">
            <Input />
          </Form.Item>

          <Form.Item name="ville" label="Ville">
            <Input />
          </Form.Item>

          <Form.Item name="numeroTel" label="Téléphone boutique" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item
            name="active"
            label="Boutique active"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="autoriseAjoutProduits"
            label="Autoriser ajout produits hors Longrich"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default SuperAdminBoutiques;
