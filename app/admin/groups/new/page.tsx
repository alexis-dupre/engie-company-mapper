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
  const [file, setFile] = useState<File | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    console.log('[CLIENT] File selected:', uploadedFile.name);
    setFile(uploadedFile);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        setJsonData(data);
        setError(null);
        console.log('[CLIENT] JSON parsed successfully');

        // Auto-fill name if available
        if (data.company?.name) {
          setName(data.company.name);
          console.log('[CLIENT] Auto-filled name:', data.company.name);
        }
      } catch (err) {
        console.error('[CLIENT] JSON parse error:', err);
        setError('Fichier JSON invalide');
        setJsonData(null);
        setFile(null);
      }
    };
    reader.readAsText(uploadedFile);
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

    console.log('[CLIENT] ========== START UPLOAD ==========');
    console.log('[CLIENT] File:', file);
    console.log('[CLIENT] Group name:', name);

    if (!file) {
      console.error('[CLIENT] No file selected');
      alert('No file selected');
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);

    console.log('[CLIENT] FormData created');
    console.log('[CLIENT] FormData file:', formData.get('file'));
    console.log('[CLIENT] FormData name:', formData.get('name'));

    try {
      console.log('[CLIENT] Sending POST to /api/admin/groups...');

      const response = await fetch('/api/admin/groups', {
        method: 'POST',
        body: formData,
      });

      console.log('[CLIENT] Response received');
      console.log('[CLIENT] Response status:', response.status);
      console.log('[CLIENT] Response ok:', response.ok);

      const contentType = response.headers.get('content-type');
      console.log('[CLIENT] Content-Type:', contentType);

      let data;
      if (contentType?.includes('application/json')) {
        data = await response.json();
        console.log('[CLIENT] Response JSON:', data);
      } else {
        const text = await response.text();
        console.log('[CLIENT] Response TEXT:', text);
        throw new Error('Server returned non-JSON response: ' + text);
      }

      if (response.ok && data.success) {
        console.log('[CLIENT] ✅ SUCCESS - Redirecting to /admin');
        setSuccess(true);
        setTimeout(() => router.push('/admin/dashboard'), 1500);
      } else {
        const errorMsg = `Error ${response.status}: ${data.error || 'Unknown error'}${data.details ? ' - ' + data.details : ''}`;
        console.error('[CLIENT] ❌ ERROR:', errorMsg);
        setError(errorMsg);
        alert(errorMsg);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('[CLIENT] ❌ CAUGHT ERROR:', errorMsg);
      console.error('[CLIENT] Error object:', err);
      setError(errorMsg);
      alert('CAUGHT ERROR: ' + errorMsg);
    } finally {
      setIsLoading(false);
      console.log('[CLIENT] ========== END UPLOAD ==========');
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
