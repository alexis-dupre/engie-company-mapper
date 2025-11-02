'use client';

/**
 * TagManager Modal - Redesigned with modern Airbnb-inspired aesthetic
 * Includes custom tags creation feature
 */

import { useState } from 'react';
import type { TagType, DiliTrustModule, CustomTag } from '../types/company';

interface TagManagerProps {
  companyId: string;
  companyName: string;
  currentTags: CustomTag[];
  onClose: () => void;
  onSave: (tag: CustomTag) => Promise<void>;
  onDelete: (tagType: TagType, customName?: string) => Promise<void>;
}

const TAG_LABELS: Record<Exclude<TagType, 'CUSTOM'>, string> = {
  TOP20: 'TOP 20',
  TOP50: 'TOP 50',
  CLIENT_DILITRUST: 'Client DiliTrust',
};

const TAG_GRADIENTS: Record<Exclude<TagType, 'CUSTOM'>, string> = {
  TOP20: 'from-yellow-400 to-orange-500',
  TOP50: 'from-green-400 to-emerald-500',
  CLIENT_DILITRUST: 'from-purple-400 to-pink-500',
};

const PRESET_COLORS = [
  { name: 'Rouge', gradient: 'from-red-400 to-rose-500' },
  { name: 'Orange', gradient: 'from-orange-400 to-amber-500' },
  { name: 'Jaune', gradient: 'from-yellow-400 to-orange-500' },
  { name: 'Vert', gradient: 'from-green-400 to-emerald-500' },
  { name: 'Bleu', gradient: 'from-blue-400 to-cyan-500' },
  { name: 'Indigo', gradient: 'from-indigo-400 to-purple-500' },
  { name: 'Violet', gradient: 'from-purple-400 to-pink-500' },
  { name: 'Rose', gradient: 'from-pink-400 to-rose-500' },
];

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

  // Custom tag creation state
  const [customTagName, setCustomTagName] = useState('');
  const [customTagColor, setCustomTagColor] = useState(PRESET_COLORS[0].gradient);
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);

  const hasTag = (type: TagType, customName?: string) => {
    if (type === 'CUSTOM' && customName) {
      return currentTags.some(t => t.type === 'CUSTOM' && t.customName === customName);
    }
    return currentTags.some(t => t.type === type);
  };

  const toggleTagType = (type: Exclude<TagType, 'CUSTOM'>) => {
    if (hasTag(type)) return;

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
      for (const tagType of Array.from(selectedTagTypes)) {
        if (tagType === 'CUSTOM') continue; // Skip CUSTOM in predefined tags

        const tag: CustomTag = {
          type: tagType,
          addedAt: Date.now(),
        };

        if (tagType === 'CLIENT_DILITRUST' && selectedModules.length > 0) {
          tag.modules = selectedModules;
        }

        await onSave(tag);
      }

      setSelectedTagTypes(new Set());
      setSelectedModules([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCustomTag = async () => {
    if (!customTagName.trim()) return;

    if (hasTag('CUSTOM', customTagName)) {
      alert('Un tag avec ce nom existe déjà !');
      return;
    }

    setIsLoading(true);
    try {
      const tag: CustomTag = {
        type: 'CUSTOM',
        customName: customTagName.trim(),
        customColor: customTagColor,
        addedAt: Date.now(),
      };

      await onSave(tag);

      // Reset form
      setCustomTagName('');
      setCustomTagColor(PRESET_COLORS[0].gradient);
      setIsCreatingCustom(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTag = async (tag: CustomTag) => {
    setIsLoading(true);
    try {
      if (tag.type === 'CUSTOM' && tag.customName) {
        await onDelete('CUSTOM', tag.customName);
      } else {
        await onDelete(tag.type);
      }
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

  const getTagLabel = (tag: CustomTag) => {
    if (tag.type === 'CUSTOM' && tag.customName) {
      return tag.customName;
    }
    return TAG_LABELS[tag.type as Exclude<TagType, 'CUSTOM'>];
  };

  const getTagGradient = (tag: CustomTag) => {
    if (tag.type === 'CUSTOM' && tag.customColor) {
      return tag.customColor;
    }
    return TAG_GRADIENTS[tag.type as Exclude<TagType, 'CUSTOM'>];
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-500 to-cyan-500 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Gérer les tags</h2>
                <p className="text-sm text-white/80">{companyName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white transition-all duration-200 flex items-center justify-center"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Tags actuels */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              <h3 className="text-lg font-bold text-gray-900">Tags actifs</h3>
            </div>
            {currentTags.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <p className="text-sm font-medium text-gray-500">Aucun tag pour le moment</p>
                <p className="text-xs text-gray-400 mt-1">Ajoutez-en ci-dessous</p>
              </div>
            ) : (
              <div className="space-y-3">
                {currentTags.map((tag, index) => (
                  <div
                    key={`${tag.type}-${tag.customName || index}`}
                    className="group relative bg-white border-2 border-gray-200 hover:border-gray-300 rounded-2xl p-5 transition-all duration-200 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`inline-flex items-center px-4 py-1.5 bg-gradient-to-r ${getTagGradient(tag)} text-white text-sm font-semibold rounded-lg shadow-sm`}>
                            {getTagLabel(tag)}
                            {tag.type === 'CUSTOM' && (
                              <svg className="w-3 h-3 ml-1.5 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                              </svg>
                            )}
                          </span>
                          <span className="text-xs text-gray-400">
                            Ajouté le {new Date(tag.addedAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        {tag.modules && tag.modules.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            <span className="text-xs font-medium text-gray-600">Modules:</span>
                            {tag.modules.map((module) => (
                              <span
                                key={module}
                                className="inline-flex items-center px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-lg"
                              >
                                {module}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteTag(tag)}
                        disabled={isLoading}
                        className="ml-4 w-10 h-10 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ajouter des tags prédéfinis */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <h3 className="text-lg font-bold text-gray-900">Ajouter des tags prédéfinis</h3>
            </div>

            <div className="space-y-3 mb-6">
              {(['TOP20', 'TOP50', 'CLIENT_DILITRUST'] as Exclude<TagType, 'CUSTOM'>[]).map((type) => {
                const isAlreadyAdded = hasTag(type);
                const isSelected = selectedTagTypes.has(type);

                return (
                  <label
                    key={type}
                    className={`
                      relative flex items-center p-5 border-2 rounded-2xl cursor-pointer transition-all duration-200
                      ${isSelected ? `border-transparent bg-gradient-to-r ${TAG_GRADIENTS[type]} shadow-lg` : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'}
                      ${isAlreadyAdded ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleTagType(type)}
                      disabled={isAlreadyAdded || isLoading}
                      className="hidden"
                    />
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`
                        w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all
                        ${isSelected ? 'border-white bg-white/20' : 'border-gray-300 bg-white'}
                      `}>
                        {isSelected && (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className={`font-semibold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                        {TAG_LABELS[type]}
                      </span>
                      {isAlreadyAdded && (
                        <span className="ml-auto inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Déjà ajouté
                        </span>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Modules DiliTrust */}
            {selectedTagTypes.has('CLIENT_DILITRUST') && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6 mb-6 animate-slide-down">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <h4 className="font-bold text-gray-900">Modules DiliTrust</h4>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Sélectionnez les modules applicables pour le tag "Client DiliTrust"
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {MODULES.map((module) => {
                    const isModuleSelected = selectedModules.includes(module);
                    return (
                      <label
                        key={module}
                        className={`
                          relative flex items-center justify-center p-3 border-2 rounded-xl cursor-pointer transition-all duration-200
                          ${isModuleSelected ? 'border-purple-500 bg-purple-500 shadow-md' : 'border-purple-200 bg-white hover:border-purple-300 hover:shadow-sm'}
                        `}
                      >
                        <input
                          type="checkbox"
                          checked={isModuleSelected}
                          onChange={() => toggleModule(module)}
                          className="hidden"
                        />
                        <span className={`font-semibold text-sm ${isModuleSelected ? 'text-white' : 'text-purple-900'}`}>
                          {module}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Add predefined tags button */}
            {selectedTagTypes.size > 0 && (
              <button
                onClick={handleAddTags}
                disabled={
                  isLoading ||
                  (selectedTagTypes.has('CLIENT_DILITRUST') && selectedModules.length === 0)
                }
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-semibold transition-all duration-200"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enregistrement...
                  </span>
                ) : (
                  `Ajouter ${selectedTagTypes.size} tag${selectedTagTypes.size > 1 ? 's' : ''}`
                )}
              </button>
            )}
          </div>

          {/* Créer un tag personnalisé */}
          <div className="border-t-2 border-gray-200 pt-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <h3 className="text-lg font-bold text-gray-900">Créer un tag personnalisé</h3>
              </div>
              {!isCreatingCustom && (
                <button
                  onClick={() => setIsCreatingCustom(true)}
                  className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-semibold rounded-lg hover:shadow-md transition-all duration-200"
                >
                  Nouveau tag
                </button>
              )}
            </div>

            {isCreatingCustom && (
              <div className="bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-200 rounded-2xl p-6 animate-slide-down">
                {/* Tag name input */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nom du tag
                  </label>
                  <input
                    type="text"
                    value={customTagName}
                    onChange={(e) => setCustomTagName(e.target.value)}
                    placeholder="Ex: Client Stratégique, Prospect, etc."
                    className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors"
                    maxLength={30}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {customTagName.length}/30 caractères
                  </p>
                </div>

                {/* Color selector */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Couleur du tag
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color.gradient}
                        onClick={() => setCustomTagColor(color.gradient)}
                        className={`
                          relative h-12 rounded-xl bg-gradient-to-r ${color.gradient} transition-all duration-200
                          ${customTagColor === color.gradient ? 'ring-4 ring-pink-500 scale-110' : 'hover:scale-105'}
                        `}
                      >
                        {customTagColor === color.gradient && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <svg className="w-6 h-6 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview */}
                {customTagName && (
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Aperçu
                    </label>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-4 py-1.5 bg-gradient-to-r ${customTagColor} text-white text-sm font-semibold rounded-lg shadow-sm`}>
                        {customTagName}
                        <svg className="w-3 h-3 ml-1.5 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                      </span>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setIsCreatingCustom(false);
                      setCustomTagName('');
                      setCustomTagColor(PRESET_COLORS[0].gradient);
                    }}
                    className="flex-1 px-4 py-2 bg-white text-gray-700 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-semibold transition-all duration-200"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleAddCustomTag}
                    disabled={!customTagName.trim() || isLoading}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-semibold transition-all duration-200"
                  >
                    {isLoading ? 'Création...' : 'Créer le tag'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 font-semibold transition-all duration-200"
          >
            Fermer
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slide-up {
          animation: slideUp 0.3s ease-out;
        }
        .animate-slide-down {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
