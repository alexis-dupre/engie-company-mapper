'use client';

/**
 * Page de création d'un nouveau groupe - Version simplifiée inline
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

type GroupTag = 'TOP20' | 'TOP50' | 'CLIENT_DILITRUST';
type DiliTrustModule = 'BP' | 'CLM' | 'LEM' | 'ELM' | 'DATAROOM';

export default function NewGroupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<GroupTag[]>([]);
  const [modules, setModules] = useState<DiliTrustModule[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const [jsonData, setJsonData] = useState<any>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        setJsonData(data);
        setError(null);

        // Auto-fill name if available
        if (data.company?.name) {
          setName(data.company.name);
        }
      } catch (err) {
        setError('Fichier JSON invalide');
        setJsonData(null);
      }
    };
    reader.readAsText(file);
  };

  const handleTagToggle = (tag: GroupTag) => {
    setTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleModuleToggle = (module: DiliTrustModule) => {
    setModules(prev =>
      prev.includes(module) ? prev.filter(m => m !== module) : [...prev, module]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          tags,
          dilitrustModules: modules,
          isPublic,
          data: jsonData,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Échec de la création');
      }

      setSuccess(true);
      setTimeout(() => router.push('/admin/dashboard'), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-8">
          <div className="text-center">
            <span className="text-4xl mb-4 block">✅</span>
            <h2 className="text-xl font-bold text-green-900">Groupe créé avec succès!</h2>
            <p className="text-green-700 mt-2">Redirection...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Nouveau Groupe
        </h1>
        <p className="text-gray-600 mb-8">
          Uploadez un fichier JSON pour créer un nouveau groupe d'entreprises
        </p>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-gray-200 space-y-6">
          {/* Upload JSON */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fichier de données JSON *
            </label>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
            {jsonData && (
              <p className="text-sm text-green-600 mt-2">✓ Fichier chargé</p>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom du groupe *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {(['TOP20', 'TOP50', 'CLIENT_DILITRUST'] as GroupTag[]).map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    tags.includes(tag)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* DiliTrust Modules */}
          {tags.includes('CLIENT_DILITRUST') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modules DiliTrust
              </label>
              <div className="flex flex-wrap gap-2">
                {(['BP', 'CLM', 'LEM', 'ELM', 'DATAROOM'] as DiliTrustModule[]).map(module => (
                  <button
                    key={module}
                    type="button"
                    onClick={() => handleModuleToggle(module)}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      modules.includes(module)
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {module}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Public */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-4 h-4 text-blue-600"
            />
            <label htmlFor="isPublic" className="text-sm font-medium text-gray-700">
              Rendre ce groupe public
            </label>
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isLoading || !jsonData}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
            >
              {isLoading ? 'Création...' : 'Créer le groupe'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/dashboard')}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
