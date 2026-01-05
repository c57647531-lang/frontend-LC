// src/pages/superadmin/SuperAdminBoutiques.jsx
import { useState, useMemo } from 'react';
import { Button, Card, Table, Tag, Modal, Form, Input, Select, Switch } from 'antd';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';
import { useAuthHeader } from '../../hooks/useAuthHeader';
import toast from 'react-hot-toast';

const { Option } = Select;

// Déclaration explicite de slugify ici
const slugify = (str) =>
  (str || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const SuperAdminBoutiques = () => {
  const authHeader = useAuthHeader();
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const vitrineBaseUrl = 'https://vitrine.longrich.com';

  const { data: admins = [] } = useQuery({
    queryKey: ['superadmin-admins'],
    queryFn: async () => {
      const res = await api.get('/superadmin/admins', { headers: authHeader });
      return res.data;
    },
  });

  const { data: boutiques = [], isLoading } = useQuery({
    queryKey: ['superadmin-boutiques'],
    queryFn: async () => {
      const res = await api.get('/superadmin/boutiques', { headers: authHeader });
      return res.data;
    },
  });

  const refetchBoutiques = () =>
    queryClient.invalidateQueries({ queryKey: ['superadmin-boutiques'] });

  const openCreateModal = () => {
    setEditing(null);
    form.resetFields();
    setModalVisible(true);
  };

  const openEditModal = (boutique) => {
    setEditing(boutique);
    form.setFieldsValue({
      adminId: boutique.AdminId || boutique.Admin?.id,
      nom: boutique.nom,
      type: boutique.type,
      typeAutre: boutique.typeAutre,
      quartier: boutique.quartier,
      ville: boutique.ville,
      numeroTel: boutique.numeroTel,
      active: boutique.active,
      autoriseAjoutProduits: boutique.autoriseAjoutProduits,
      lienVitrine:
        boutique.lienVitrine &&
        boutique.lienVitrine.replace(vitrineBaseUrl, '').replace(/^\//, ''),
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      if (values.lienVitrine) {
        values.lienVitrine = slugify(values.lienVitrine);
      } else if (values.nom) {
        values.lienVitrine = slugify(values.nom);
      }

      if (editing) {
        await api.put(`/superadmin/boutiques/${editing.id}`, values, { headers: authHeader });
        toast.success('Boutique mise à jour');
      } else {
        await api.post('/superadmin/boutiques', values, { headers: authHeader });
        toast.success('Boutique créée');
      }
      setModalVisible(false);
      refetchBoutiques();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Erreur enregistrement');
    }
  };

  const handleDelete = async (boutique) => {
    try {
      await api.delete(`/superadmin/boutiques/${boutique.id}`, { headers: authHeader });
      toast.success('Boutique supprimée');
      refetchBoutiques();
    } catch {
      toast.error('Erreur suppression');
    }
  };

  const columns = [
    { title: 'Nom', dataIndex: 'nom', key: 'nom' },
    {
      title: 'Admin',
      dataIndex: 'Admin',
      key: 'Admin',
      render: (a) => a?.nom || '—',
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
      title: 'Lien vitrine',
      dataIndex: 'lienVitrine',
      key: 'lienVitrine',
      render: (lienVitrine) =>
        lienVitrine ? (
          <a
            href={
              lienVitrine.startsWith('http')
                ? lienVitrine
                : `${vitrineBaseUrl}/${lienVitrine.replace(/^\//, '')}`
            }
            target="_blank"
            rel="noreferrer"
          >
            {lienVitrine.startsWith('http')
              ? lienVitrine
              : `${vitrineBaseUrl}/${lienVitrine.replace(/^\//, '')}`}
          </a>
        ) : (
          <span className="text-gray-400">Non défini</span>
        ),
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

  const previewUrl = useMemo(() => {
    const slug = form.getFieldValue('lienVitrine');
    if (!slug) return '';
    const clean = slugify(slug);
    return `${vitrineBaseUrl}/${clean}`;
  }, [form, vitrineBaseUrl]);

  return (
    <>
      <Card
        title="Boutiques"
        extra={
          <Button type="primary" onClick={openCreateModal}>
            Créer une boutique
          </Button>
        }
      >
        <Table columns={columns} dataSource={boutiques} rowKey="id" loading={isLoading} />
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
            name="adminId"
            label="Admin (boutiquier) propriétaire"
            rules={[{ required: true }]}
          >
            <Select placeholder="Sélectionner un admin">
              {admins.map((a) => (
                <Option key={a.id} value={a.id}>
                  {a.nom} - {a.telephone}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="nom" label="Nom de la boutique" rules={[{ required: true }]}>
            <Input
              onBlur={() => {
                const nom = form.getFieldValue('nom');
                const exist = form.getFieldValue('lienVitrine');
                if (!exist && nom) {
                  form.setFieldsValue({ lienVitrine: slugify(nom) });
                }
              }}
            />
          </Form.Item>

          <Form.Item name="type" label="Type" rules={[{ required: true }]}>
            <Select>
              <Option value="boutique">Boutique</Option>
              <Option value="supermarche">Supermarché</Option>
              <Option value="entreprise">Entreprise</Option>
              <Option value="autre">Autre</Option>
            </Select>
          </Form.Item>

          <Form.Item name="typeAutre" label="Type (autre)">
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
            name="lienVitrine"
            label="Slug / URL d’accès à la boutique"
            extra={
              previewUrl && (
                <span className="text-xs text-gray-500">
                  URL finale : <strong>{previewUrl}</strong>
                </span>
              )
            }
          >
            <Input placeholder="ex: boutique-longrich-yaounde-centre" />
          </Form.Item>

          <Form.Item name="active" label="Boutique active" valuePropName="checked">
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
