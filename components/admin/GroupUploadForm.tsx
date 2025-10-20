/**
 * Formulaire d'upload et création d'un nouveau groupe
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GroupTag, DiliTrustModule } from '@/types/group';

const ALL_TAGS: GroupTag[] = ['TOP20', 'TOP50', 'CLIENT_DILITRUST'];
const ALL_MODULES: DiliTrustModule[] = ['BP', 'CLM', 'LEM', 'ELM', 'DATAROOM'];

export const GroupUploadForm: React.FC = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tags: [] as GroupTag[],
    dilitrustModules: [] as DiliTrustModule[],
    comments: '',
    isPublic: true,
  });

  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [jsonPreview, setJsonPreview] = useState<any>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const showDiliTrustModules = formData.tags.includes('CLIENT_DILITRUST');

  // Gestion de l'upload de fichier JSON
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      setJsonFile(null);
      setJsonPreview(null);
      return;
    }

    if (!file.name.endsWith('.json')) {
      setError('Le fichier doit être au format JSON');
      return;
    }

    try {
      const text = await file.text();
      const json = JSON.parse(text);

      // Validation basique
      if (!json.company || !json.metadata) {
        setError('Le fichier JSON doit contenir les propriétés "company" et "metadata"');
        return;
      }

      setJsonFile(file);
      setJsonPreview(json);
      setError('');

      // Auto-remplir le nom si vide
      if (!formData.name && json.company.name) {
        setFormData(prev => ({ ...prev, name: json.company.name }));
      }
    } catch (err) {
      setError('Fichier JSON invalide');
      setJsonFile(null);
      setJsonPreview(null);
    }
  };

  // Toggle d'un tag
  const toggleTag = (tag: GroupTag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag],
      // Reset modules DiliTrust si on enlève le tag CLIENT_DILITRUST
      dilitrustModules: tag === 'CLIENT_DILITRUST' && prev.tags.includes(tag)
        ? []
        : prev.dilitrustModules,
    }));
  };

  // Toggle d'un module DiliTrust
  const toggleModule = (module: DiliTrustModule) => {
    setFormData(prev => ({
      ...prev,
      dilitrustModules: prev.dilitrustModules.includes(module)
        ? prev.dilitrustModules.filter(m => m !== module)
        : [...prev.dilitrustModules, module],
    }));
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!jsonFile || !jsonPreview) {
      setError('Veuillez sélectionner un fichier JSON valide');
      return;
    }

    if (!formData.name.trim()) {
      setError('Le nom du groupe est requis');
      return;
    }

    if (showDiliTrustModules && formData.dilitrustModules.length === 0) {
      setError('Veuillez sélectionner au moins un module DiliTrust');
      return;
    }

    setIsLoading(true);

    try {
      const body = {
        ...formData,
        jsonData: jsonPreview,
      };

      const res = await fetch('/api/admin/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Erreur lors de la création du groupe');
        setIsLoading(false);
        return;
      }

      // Rediriger vers la page d'édition du groupe créé
      router.push(`/admin/groups/${data.data.id}`);
      router.refresh();
    } catch (err) {
      setError('Erreur de connexion au serveur');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
      {/* Informations de base */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Informations du groupe
        </h3>

        <div className="space-y-4">
          {/* Nom */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nom du groupe *
            </label>
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Engie"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Description courte du groupe..."
            />
          </div>

          {/* Visibilité publique */}
          <div className="flex items-center gap-2">
            <input
              id="isPublic"
              type="checkbox"
              checked={formData.isPublic}
              onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isPublic" className="text-sm text-gray-700">
              Groupe visible publiquement (décoché = visible uniquement en admin)
            </label>
          </div>
        </div>
      </div>

      {/* Upload JSON */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Données du groupe
        </h3>

        <div>
          <label htmlFor="jsonFile" className="block text-sm font-medium text-gray-700 mb-2">
            Fichier JSON *
          </label>
          <input
            id="jsonFile"
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              cursor-pointer"
          />
          <p className="mt-2 text-xs text-gray-500">
            Format attendu : même structure que nomination-deep-scraping.json
          </p>

          {jsonPreview && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 font-medium mb-2">
                ✓ Fichier JSON valide
              </p>
              <div className="text-xs text-green-700 space-y-1">
                <p>• Entreprise racine : {jsonPreview.company.name}</p>
                <p>• Total entreprises : {jsonPreview.metadata.totalCompaniesScraped}</p>
                <p>• Profondeur max : {jsonPreview.metadata.maxDepth}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tags */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Tags
        </h3>

        <div className="flex flex-wrap gap-2">
          {ALL_TAGS.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                formData.tags.includes(tag)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Modules DiliTrust (conditionnel) */}
      {showDiliTrustModules && (
        <div className="bg-white p-6 rounded-lg border border-blue-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Modules DiliTrust *
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Sélectionnez les modules dont le groupe est client
          </p>

          <div className="flex flex-wrap gap-2">
            {ALL_MODULES.map(module => (
              <button
                key={module}
                type="button"
                onClick={() => toggleModule(module)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  formData.dilitrustModules.includes(module)
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {module}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Commentaires généraux */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Commentaires
        </h3>

        <textarea
          rows={5}
          value={formData.comments}
          onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Commentaires généraux sur le groupe..."
        />
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isLoading || !jsonFile}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Création...' : 'Créer le groupe'}
        </button>
      </div>
    </form>
  );
};
