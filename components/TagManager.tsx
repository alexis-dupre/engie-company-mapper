'use client';

import { useState } from 'react';
import type { TagType, DiliTrustModule, CustomTag } from '../types/company';

interface TagManagerProps {
  companyId: string;
  companyName: string;
  currentTags: CustomTag[];
  onClose: () => void;
  onSave: (tag: CustomTag) => Promise<void>;
  onDelete: (tagType: TagType) => Promise<void>;
}

const TAG_LABELS: Record<TagType, string> = {
  TOP20: 'TOP 20',
  TOP50: 'TOP 50',
  CLIENT_DILITRUST: 'Client DiliTrust',
};

const MODULES: DiliTrustModule[] = ['BP', 'CLM', 'LEM', 'ELM', 'DATAROOM'];

export function TagManager({
  companyId,
  companyName,
  currentTags,
  onClose,
  onSave,
  onDelete
}: TagManagerProps) {
  const [selectedTagTypes, setSelectedTagTypes] = useState<Set<TagType>>(new Set());
  const [selectedModules, setSelectedModules] = useState<DiliTrustModule[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const hasTag = (type: TagType) => currentTags.some(t => t.type === type);

  const toggleTagType = (type: TagType) => {
    if (hasTag(type)) return; // Ne pas permettre d'ajouter un tag déjà présent

    setSelectedTagTypes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      return newSet;
    });
  };

  const handleAddTags = async () => {
    if (selectedTagTypes.size === 0) return;

    setIsLoading(true);
    try {
      // Ajouter chaque tag sélectionné
      for (const tagType of Array.from(selectedTagTypes)) {
        const tag: CustomTag = {
          type: tagType,
          addedAt: Date.now(),
        };

        // Ajouter les modules seulement pour CLIENT_DILITRUST
        if (tagType === 'CLIENT_DILITRUST' && selectedModules.length > 0) {
          tag.modules = selectedModules;
        }

        await onSave(tag);
      }

      // Reset après ajout réussi
      setSelectedTagTypes(new Set());
      setSelectedModules([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTag = async (type: TagType) => {
    setIsLoading(true);
    try {
      await onDelete(type);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleModule = (module: DiliTrustModule) => {
    setSelectedModules(prev =>
      prev.includes(module)
        ? prev.filter(m => m !== module)
        : [...prev, module]
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">🏷️ Gérer les tags</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <h3 className="font-semibold text-lg mb-2">{companyName}</h3>
            <p className="text-sm text-gray-600">ID: {companyId}</p>
          </div>

          {/* Tags actuels */}
          <div className="mb-6">
            <h4 className="font-medium mb-3">Tags actuels</h4>
            {currentTags.length === 0 ? (
              <p className="text-sm text-gray-500">Aucun tag</p>
            ) : (
              <div className="space-y-2">
                {currentTags.map((tag) => (
                  <div
                    key={tag.type}
                    className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3"
                  >
                    <div>
                      <span className="font-medium text-blue-900">
                        {TAG_LABELS[tag.type]}
                      </span>
                      {tag.modules && tag.modules.length > 0 && (
                        <div className="text-sm text-blue-700 mt-1">
                          Modules : {tag.modules.join(', ')}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteTag(tag.type)}
                      disabled={isLoading}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50"
                    >
                      Supprimer
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ajouter des tags */}
          <div>
            <h4 className="font-medium mb-3">Ajouter des tags</h4>

            <div className="space-y-3 mb-4">
              {(['TOP20', 'TOP50', 'CLIENT_DILITRUST'] as TagType[]).map((type) => (
                <label
                  key={type}
                  className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedTagTypes.has(type)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${hasTag(type) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedTagTypes.has(type)}
                    onChange={() => toggleTagType(type)}
                    disabled={hasTag(type) || isLoading}
                    className="mr-3 h-4 w-4"
                  />
                  <span className="font-medium">{TAG_LABELS[type]}</span>
                  {hasTag(type) && (
                    <span className="ml-auto text-xs text-gray-500">(déjà ajouté)</span>
                  )}
                </label>
              ))}
            </div>

            {/* Modules DiliTrust */}
            {selectedTagTypes.has('CLIENT_DILITRUST') && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <h5 className="font-medium mb-3">Modules DiliTrust</h5>
                <p className="text-xs text-gray-600 mb-3">
                  Ces modules s'appliqueront uniquement au tag "Client DiliTrust"
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {MODULES.map((module) => (
                    <label
                      key={module}
                      className="flex items-center p-2 border rounded cursor-pointer hover:bg-white"
                    >
                      <input
                        type="checkbox"
                        checked={selectedModules.includes(module)}
                        onChange={() => toggleModule(module)}
                        className="mr-2 h-4 w-4"
                      />
                      <span>{module}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleAddTags}
              disabled={
                selectedTagTypes.size === 0 ||
                isLoading ||
                (selectedTagTypes.has('CLIENT_DILITRUST') && selectedModules.length === 0)
              }
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isLoading ? 'Enregistrement...' : `Ajouter ${selectedTagTypes.size} tag(s)`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
