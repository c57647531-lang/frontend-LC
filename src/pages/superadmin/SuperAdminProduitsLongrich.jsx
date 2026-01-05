// src/pages/superadmin/SuperAdminProduitsLongrich.jsx
import { useState } from 'react';
import {
  Button,
  Card,
  Table,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Switch,
} from 'antd';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';
import { useAuthHeader } from '../../hooks/useAuthHeader';
import toast from 'react-hot-toast';

const { Option } = Select;

const CATEGORIES_LONGRICH = [
  'Hygiène bucco-dentaire',
  'Soins corporels',
  'Nutrition',
  'Compléments',
  'Autres',
];

const SuperAdminProduitsLongrich = () => {
  const authHeader = useAuthHeader();
  const queryClient = useQueryClient();
  const [selectedBoutiqueId, setSelectedBoutiqueId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const { data: boutiques = [] } = useQuery({
    queryKey: ['superadmin-boutiques'],
    queryFn: async () => {
      const res = await api.get('/superadmin/boutiques', { headers: authHeader });
      return res.data;
    },
  });

  const { data: produits = [], isLoading } = useQuery({
    queryKey: ['superadmin-produits-longrich', selectedBoutiqueId],
    enabled: !!selectedBoutiqueId,
    queryFn: async () => {
      const res = await api.get(`/superadmin/boutiques/${selectedBoutiqueId}/produits`, {
        headers: authHeader,
      });
      return res.data;
    },
  });

  const refetchProduits = () =>
    queryClient.invalidateQueries({
      queryKey: ['superadmin-produits-longrich', selectedBoutiqueId],
    });

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
      if (!selectedBoutiqueId && !editing?.BoutiqueId) {
        toast.error('Sélectionnez une boutique');
        return;
      }

      if (editing) {
        await api.put(`/superadmin/produits-longrich/${editing.id}`, values, {
          headers: authHeader,
        });
        toast.success('Produit mis à jour');
      } else {
        await api.post(
          '/superadmin/produits-longrich',
          { ...values, boutiqueId: selectedBoutiqueId },
          { headers: authHeader },
        );
        toast.success('Produit créé');
      }
      setModalVisible(false);
      refetchProduits();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Erreur enregistrement');
    }
  };

  const handleDelete = async (produit) => {
    try {
      await api.delete(`/superadmin/produits-longrich/${produit.id}`, { headers: authHeader });
      toast.success('Produit supprimé');
      refetchProduits();
    } catch {
      toast.error('Erreur suppression');
    }
  };

  const handleDuplicate = async (sourceBoutiqueId) => {
    try {
      if (!selectedBoutiqueId || !sourceBoutiqueId) {
        toast.error('Sélectionnez les boutiques source et cible');
        return;
      }
      await api.post(
        `/superadmin/boutiques/${selectedBoutiqueId}/duplicate-produits/${sourceBoutiqueId}`,
        {},
        { headers: authHeader },
      );
      toast.success('Produits dupliqués');
      refetchProduits();
    } catch {
      toast.error('Erreur duplication');
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
        enPromo ? <Tag color="gold">Promo {record.prixPromo} FCFA</Tag> : <Tag>—</Tag>,
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
          <Button size="small" onClick={() => openEditModal(record)}>
            Éditer
          </Button>
          <Button size="small" danger onClick={() => handleDelete(record)}>
            Supprimer
          </Button>
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
          loading={isLoading && !!selectedBoutiqueId}
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
                <Option key={c} value={c}>
                  {c}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="prixPartenaire"
            label="Prix partenaire"
            rules={[{ required: true }]}
          >
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

          <Form.Item name="enPromo" label="En promo" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default SuperAdminProduitsLongrich;
