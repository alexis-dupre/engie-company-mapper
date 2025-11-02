'use client';

/**
 * TagManager Modal - Redesigned with Notion/Shadcn aesthetic
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
        if (tagType === 'CUSTOM') continue;

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

  const getTagColor = (tag: CustomTag) => {
    if (tag.type === 'CUSTOM' && tag.customColor) {
      return `bg-gradient-to-r ${tag.customColor} text-white`;
    }
    if (tag.type === 'TOP20') return 'bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-300';
    if (tag.type === 'TOP50') return 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-300';
    if (tag.type === 'CLIENT_DILITRUST') return 'bg-violet-100 text-violet-900 dark:bg-violet-900/30 dark:text-violet-300';
    return 'bg-secondary text-secondary-foreground';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Gérer les tags</h2>
              <p className="text-sm text-muted-foreground">{companyName}</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Tags actuels */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-3">Tags actifs</h3>
            {currentTags.length === 0 ? (
              <div className="text-center py-8 bg-muted rounded-lg border border-border">
                <svg className="w-10 h-10 text-muted-foreground mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <p className="text-sm text-muted-foreground">Aucun tag pour le moment</p>
              </div>
            ) : (
              <div className="space-y-2">
                {currentTags.map((tag, index) => (
                  <div
                    key={`${tag.type}-${tag.customName || index}`}
                    className="bg-muted border border-border rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded ${getTagColor(tag)}`}>
                            {getTagLabel(tag)}
                            {tag.type === 'CUSTOM' && (
                              <svg className="w-3 h-3 ml-1 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                              </svg>
                            )}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(tag.addedAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        {tag.modules && tag.modules.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            <span className="text-xs text-muted-foreground">Modules:</span>
                            {tag.modules.map((module) => (
                              <span
                                key={module}
                                className="inline-flex items-center px-2 py-0.5 bg-secondary text-secondary-foreground text-xs rounded"
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
                        className="ml-3 w-8 h-8 rounded hover:bg-destructive/10 text-destructive transition-colors disabled:opacity-50 flex items-center justify-center"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-3">Ajouter des tags prédéfinis</h3>

            <div className="space-y-2 mb-4">
              {(['TOP20', 'TOP50', 'CLIENT_DILITRUST'] as Exclude<TagType, 'CUSTOM'>[]).map((type) => {
                const isAlreadyAdded = hasTag(type);
                const isSelected = selectedTagTypes.has(type);

                return (
                  <label
                    key={type}
                    className={`
                      relative flex items-center p-3 border rounded-lg cursor-pointer transition-colors
                      ${isSelected ? 'border-foreground bg-accent' : 'border-border bg-card hover:bg-accent'}
                      ${isAlreadyAdded ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleTagType(type)}
                      disabled={isAlreadyAdded || isLoading}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`
                        w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
                        ${isSelected ? 'border-foreground bg-foreground' : 'border-input bg-background'}
                      `}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-background" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="font-medium text-foreground text-sm">
                        {TAG_LABELS[type]}
                      </span>
                      {isAlreadyAdded && (
                        <span className="ml-auto text-xs text-muted-foreground">
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
              <div className="bg-muted border border-border rounded-lg p-4 mb-4">
                <h4 className="font-medium text-sm text-foreground mb-3">Modules DiliTrust</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {MODULES.map((module) => {
                    const isModuleSelected = selectedModules.includes(module);
                    return (
                      <label
                        key={module}
                        className={`
                          relative flex items-center justify-center p-2 border rounded cursor-pointer transition-colors
                          ${isModuleSelected ? 'border-foreground bg-foreground text-background' : 'border-border bg-card hover:bg-accent'}
                        `}
                      >
                        <input
                          type="checkbox"
                          checked={isModuleSelected}
                          onChange={() => toggleModule(module)}
                          className="sr-only"
                        />
                        <span className="font-medium text-xs">
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
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm transition-colors"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
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
          <div className="border-t border-border pt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">Créer un tag personnalisé</h3>
              {!isCreatingCustom && (
                <button
                  onClick={() => setIsCreatingCustom(true)}
                  className="px-3 py-1.5 bg-secondary text-secondary-foreground text-sm font-medium rounded hover:bg-secondary/80 transition-colors"
                >
                  Nouveau tag
                </button>
              )}
            </div>

            {isCreatingCustom && (
              <div className="bg-muted border border-border rounded-lg p-4">
                {/* Tag name input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Nom du tag
                  </label>
                  <input
                    type="text"
                    value={customTagName}
                    onChange={(e) => setCustomTagName(e.target.value)}
                    placeholder="Ex: Client Stratégique, Prospect, etc."
                    className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-sm"
                    maxLength={30}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {customTagName.length}/30 caractères
                  </p>
                </div>

                {/* Color selector */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Couleur du tag
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color.gradient}
                        onClick={() => setCustomTagColor(color.gradient)}
                        className={`
                          relative h-10 rounded-lg bg-gradient-to-r ${color.gradient} transition-all
                          ${customTagColor === color.gradient ? 'ring-2 ring-ring ring-offset-2' : ''}
                        `}
                      >
                        {customTagColor === color.gradient && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Aperçu
                    </label>
                    <span className={`inline-flex items-center px-2.5 py-1 bg-gradient-to-r ${customTagColor} text-white text-xs font-medium rounded`}>
                      {customTagName}
                      <svg className="w-3 h-3 ml-1 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </span>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsCreatingCustom(false);
                      setCustomTagName('');
                      setCustomTagColor(PRESET_COLORS[0].gradient);
                    }}
                    className="flex-1 px-3 py-2 bg-secondary text-secondary-foreground border border-border rounded-lg hover:bg-secondary/80 font-medium text-sm transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleAddCustomTag}
                    disabled={!customTagName.trim() || isLoading}
                    className="flex-1 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm transition-colors"
                  >
                    {isLoading ? 'Création...' : 'Créer le tag'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4 bg-muted">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-secondary text-secondary-foreground border border-border rounded-lg hover:bg-secondary/80 font-medium text-sm transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
