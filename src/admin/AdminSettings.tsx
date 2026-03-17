import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AdminSettings() {
  const { token } = useAuth();
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(setSettings);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(settings)
      });
      setMessage('Settings updated successfully');
    } catch (error) {
      setMessage('Failed to update settings');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold text-zinc-800 mb-6">Site Settings</h2>
      
      {message && (
        <div className={`p-4 mb-6 rounded-md ${message.includes('success') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg border border-zinc-200 p-8 space-y-8">
        <div>
          <h3 className="text-lg font-medium text-zinc-900 mb-4 border-b pb-2">General Information</h3>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-zinc-700">Site Name</label>
              <input type="text" name="siteName" value={settings.siteName || ''} onChange={handleChange} className="mt-1 block w-full border border-zinc-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-zinc-600 focus:border-zinc-600 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700">Contact Email</label>
              <input type="email" name="contactEmail" value={settings.contactEmail || ''} onChange={handleChange} className="mt-1 block w-full border border-zinc-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-zinc-600 focus:border-zinc-600 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700">Contact Phone</label>
              <input type="text" name="contactPhone" value={settings.contactPhone || ''} onChange={handleChange} className="mt-1 block w-full border border-zinc-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-zinc-600 focus:border-zinc-600 sm:text-sm" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-zinc-700">Address</label>
              <input type="text" name="address" value={settings.address || ''} onChange={handleChange} className="mt-1 block w-full border border-zinc-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-zinc-600 focus:border-zinc-600 sm:text-sm" />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-zinc-900 mb-4 border-b pb-2">Homepage Content</h3>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-zinc-700">Hero Headline</label>
              <input type="text" name="heroHeadline" value={settings.heroHeadline || ''} onChange={handleChange} className="mt-1 block w-full border border-zinc-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-zinc-600 focus:border-zinc-600 sm:text-sm" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-zinc-700">Hero Subheadline</label>
              <textarea name="heroSubheadline" rows={3} value={settings.heroSubheadline || ''} onChange={handleChange} className="mt-1 block w-full border border-zinc-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-zinc-600 focus:border-zinc-600 sm:text-sm"></textarea>
            </div>
          </div>
        </div>

        <div className="pt-5 flex justify-end">
          <button type="submit" disabled={loading} className="bg-zinc-800 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-600 disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
