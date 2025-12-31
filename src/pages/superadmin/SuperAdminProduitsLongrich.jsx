import { useEffect, useState } from 'react';
import { Button, Card, Table, Tag, Modal, Form, Input, Select, InputNumber, Switch } from 'antd';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_URL, CATEGORIES_LONGRICH } from '../../constants/constants';
import { getAuthHeader } from '../../hooks/useSuperAdminAuth';

const { Option } = Select;

const SuperAdminProduitsLongrich = () => {
  const [boutiques, setBoutiques] = useState([]);
  const [produits, setProduits] = useState([]);
  const [selectedBoutiqueId, setSelectedBoutiqueId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const fetchBoutiques = async () => {
    try {
      const res = await axios.get(`${API_URL}/superadmin/boutiques`, {
        headers: getAuthHeader(),
      });
      setBoutiques(res.data || []);
    } catch (e) {
      toast.error('Erreur chargement boutiques');
    }
  };

  const fetchProduits = async (boutiqueId) => {
    if (!boutiqueId) return;
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/superadmin/boutiques/${boutiqueId}/produits`, {
        headers: getAuthHeader(),
      });
      setProduits(res.data || []);
    } catch (e) {
      toast.error('Erreur chargement produits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoutiques();
  }, []);

  useEffect(() => {
    fetchProduits(selectedBoutiqueId);
  }, [selectedBoutiqueId]);

  const openCreateModal = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ enPromo: false });
    setModalVisible(true);
  };

  const openEditModal = (produit) => {
    setEditing(produit);
    form.setFieldsValue({
      nom: produit.nom,
      categorie: produit.categorie,
      prixPartenaire: Number(produit.prixPartenaire),
      prixClient: Number(produit.prixClient),
      prixPromo: produit.prixPromo ? Number(produit.prixPromo) : undefined,
      quantiteStock: produit.quantiteStock,
      enPromo: produit.enPromo,
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (!selectedBoutiqueId) {
        toast.error('Sélectionnez une boutique');
        return;
      }

      if (editing) {
        await axios.put(
          `${API_URL}/superadmin/produits-longrich/${editing.id}`,
          values,
          { headers: getAuthHeader() }
        );
        toast.success('Produit mis à jour');
      } else {
        await axios.post(
          `${API_URL}/superadmin/produits-longrich`,
          { ...values, boutiqueId: selectedBoutiqueId },
          { headers: getAuthHeader() }
        );
        toast.success('Produit créé');
      }
      setModalVisible(false);
      fetchProduits(selectedBoutiqueId);
    } catch (e) {
      if (e?.response?.data?.message) toast.error(e.response.data.message);
    }
  };

  const handleDelete = async (produit) => {
    try {
      await axios.delete(
        `${API_URL}/superadmin/produits-longrich/${produit.id}`,
        { headers: getAuthHeader() }
      );
      toast.success('Produit supprimé');
      fetchProduits(selectedBoutiqueId);
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleDuplicate = async (sourceBoutiqueId) => {
    try {
      if (!selectedBoutiqueId || !sourceBoutiqueId) {
        toast.error('Sélectionnez les boutiques source et cible');
        return;
      }
      await axios.post(
        `${API_URL}/superadmin/boutiques/${selectedBoutiqueId}/duplicate-produits/${sourceBoutiqueId}`,
        {},
        { headers: getAuthHeader() }
      );
      toast.success('Produits dupliqués');
      fetchProduits(selectedBoutiqueId);
    } catch {
      toast.error('Erreur duplication produits');
    }
  };

  const columns = [
    { title: 'Nom', dataIndex: 'nom', key: 'nom' },
    { title: 'Catégorie', dataIndex: 'categorie', key: 'categorie' },
    { title: 'Prix partenaire', dataIndex: 'prixPartenaire', key: 'prixPartenaire' },
    { title: 'Prix client', dataIndex: 'prixClient', key: 'prixClient' },
    {
      title: 'Promo',
      dataIndex: 'enPromo',
      key: 'enPromo',
      render: (enPromo, record) =>
        enPromo ? (
          <Tag color="gold">Promo {record.prixPromo} FCFA</Tag>
        ) : (
          <Tag>—</Tag>
        ),
    },
    {
      title: 'Stock',
      dataIndex: 'quantiteStock',
      key: 'quantiteStock',
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
        title="Produits Longrich"
        extra={
          <div className="flex flex-wrap gap-2 items-center">
            <Select
              placeholder="Sélectionner une boutique"
              style={{ minWidth: 220 }}
              value={selectedBoutiqueId || undefined}
              onChange={setSelectedBoutiqueId}
            >
              {boutiques.map((b) => (
                <Option key={b.id} value={b.id}>
                  {b.nom} ({b.ville})
                </Option>
              ))}
            </Select>
            <Button type="primary" onClick={openCreateModal} disabled={!selectedBoutiqueId}>
              Ajouter un produit
            </Button>
            <Select
              placeholder="Dupliquer depuis boutique..."
              style={{ minWidth: 220 }}
              onChange={(sourceId) => handleDuplicate(sourceId)}
              allowClear
            >
              {boutiques
                .filter((b) => b.id !== selectedBoutiqueId)
                .map((b) => (
                  <Option key={b.id} value={b.id}>
                    {b.nom} ({b.ville})
                  </Option>
                ))}
            </Select>
          </div>
        }
      >
        <Table
          columns={columns}
          dataSource={produits}
          rowKey="id"
          loading={loading}
        />
      </Card>

      <Modal
        title={editing ? 'Modifier produit Longrich' : 'Ajouter produit Longrich'}
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

          <Form.Item name="categorie" label="Catégorie" rules={[{ required: true }]}>
            <Select>
              {CATEGORIES_LONGRICH.map((c) => (
                <Option key={c} value={c}>{c}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="prixPartenaire" label="Prix partenaire" rules={[{ required: true }]}>
            <InputNumber min={0} className="w-full" />
          </Form.Item>

          <Form.Item name="prixClient" label="Prix client" rules={[{ required: true }]}>
            <InputNumber min={0} className="w-full" />
          </Form.Item>

          <Form.Item name="prixPromo" label="Prix promo (si promo)">
            <InputNumber min={0} className="w-full" />
          </Form.Item>

          <Form.Item name="quantiteStock" label="Quantité stock">
            <InputNumber min={0} className="w-full" />
          </Form.Item>

          <Form.Item
            name="enPromo"
            label="En promo"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default SuperAdminProduitsLongrich;
