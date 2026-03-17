import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit, Trash2, X } from 'lucide-react';

export default function AdminServices() {
  const { token } = useAuth();
  const [services, setServices] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    description: '',
    icon: '',
    content: '',
    published: true
  });

  const fetchServices = () => {
    fetch('/api/admin/services', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(setServices);
  };

  useEffect(() => {
    fetchServices();
  }, [token]);

  const handleOpenModal = (service?: any) => {
    if (service) {
      setEditingId(service.id);
      setFormData({
        slug: service.slug,
        title: service.title,
        description: service.description,
        icon: service.icon || '',
        content: service.content || '',
        published: !!service.published
      });
    } else {
      setEditingId(null);
      setFormData({ slug: '', title: '', description: '', icon: '', content: '', published: true });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/admin/services/${editingId}` : '/api/admin/services';
    const method = editingId ? 'PUT' : 'POST';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(formData)
    });

    setIsModalOpen(false);
    fetchServices();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this service?')) {
      await fetch(`/api/admin/services/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchServices();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-zinc-800">Manage Services</h2>
        <button onClick={() => handleOpenModal()} className="bg-zinc-800 text-white px-4 py-2 rounded-md hover:bg-zinc-900 flex items-center">
          <Plus className="w-4 h-4 mr-2" /> Add Service
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden border border-zinc-200">
        <table className="min-w-full divide-y divide-zinc-200">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Slug</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-zinc-200">
            {services.map((service) => (
              <tr key={service.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900">{service.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">{service.slug}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${service.published ? 'bg-green-100 text-green-800' : 'bg-zinc-100 text-zinc-800'}`}>
                    {service.published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleOpenModal(service)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(service.id)} className="text-red-600 hover:text-red-900">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-zinc-900/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-zinc-200">
              <h3 className="text-xl font-bold text-zinc-900">{editingId ? 'Edit Service' : 'Add Service'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-500">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Title</label>
                  <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border-zinc-300 rounded-md shadow-sm focus:ring-zinc-600 focus:border-zinc-600 border p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Slug</label>
                  <input type="text" required value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="w-full border-zinc-300 rounded-md shadow-sm focus:ring-zinc-600 focus:border-zinc-600 border p-2" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Short Description</label>
                <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={2} className="w-full border-zinc-300 rounded-md shadow-sm focus:ring-zinc-600 focus:border-zinc-600 border p-2"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Full Content (HTML/Markdown)</label>
                <textarea required value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} rows={6} className="w-full border-zinc-300 rounded-md shadow-sm focus:ring-zinc-600 focus:border-zinc-600 border p-2"></textarea>
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="published" checked={formData.published} onChange={e => setFormData({...formData, published: e.target.checked})} className="h-4 w-4 text-zinc-800 focus:ring-zinc-600 border-zinc-300 rounded" />
                <label htmlFor="published" className="ml-2 block text-sm text-zinc-900">Published</label>
              </div>
              <div className="pt-4 flex justify-end">
                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-white py-2 px-4 border border-zinc-300 rounded-md shadow-sm text-sm font-medium text-zinc-700 hover:bg-zinc-50 mr-3">Cancel</button>
                <button type="submit" className="bg-zinc-800 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-zinc-900">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
