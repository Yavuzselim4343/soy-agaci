import React, { useState } from 'react';
import { TreeSettings, RelationshipTypeDefinition, LineStyle } from '../../types/familyTree';
import { DEFAULT_RELATIONSHIP_TYPES } from '../../utils/relationships';
import { 
  X, 
  Settings, 
  Plus, 
  Trash2, 
  Sun, 
  Moon, 
  Laptop
} from 'lucide-react';

interface SettingsPanelProps {
  settings: TreeSettings;
  customTypes: RelationshipTypeDefinition[];
  onUpdateSettings: (newSettings: Partial<TreeSettings>) => void;
  onAddCustomType: (typeDef: RelationshipTypeDefinition) => void;
  onDeleteCustomType: (typeId: string) => void;
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  customTypes,
  onUpdateSettings,
  onAddCustomType,
  onDeleteCustomType,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'layout' | 'relationships' | 'custom_types'>('general');

  const [newTypeLabel, setNewTypeLabel] = useState('');
  const [newTypeColor, setNewTypeColor] = useState('#8b5cf6');
  const [newTypeLineStyle, setNewTypeLineStyle] = useState<LineStyle>('solid');
  const [newTypeError, setNewTypeError] = useState('');

  const handleAddCustomTypeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeLabel.trim()) {
      setNewTypeError('Lütfen ilişki adını giriniz.');
      return;
    }

    const id = `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    onAddCustomType({
      id,
      name: newTypeLabel.trim().toLowerCase().replace(/\s+/g, '_'),
      label: newTypeLabel.trim(),
      color: newTypeColor,
      lineStyle: newTypeLineStyle,
      lineWidth: 2,
      isCustom: true
    });

    setNewTypeLabel('');
    setNewTypeError('');
  };

  const handleUpdateRelStyle = (typeId: string, updates: Partial<{ color: string; lineStyle: LineStyle; lineWidth: number }>) => {
    const currentStyles = settings.customStyles || {};
    const defaultRel = DEFAULT_RELATIONSHIP_TYPES.find(d => d.id === typeId);
    const existing = currentStyles[typeId] || {
      color: defaultRel?.color || '#0ea5e9',
      lineStyle: defaultRel?.lineStyle || 'solid',
      lineWidth: defaultRel?.lineWidth || 2
    };

    onUpdateSettings({
      customStyles: {
        ...currentStyles,
        [typeId]: {
          ...existing,
          ...updates
        }
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden animate-scale-in">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Uygulama ve Ağaç Ayarları
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Görünüm, tema, ilişki çizgileri ve yerleşim kurallarını özelleştirin.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-slate-100 dark:border-slate-800 px-6 bg-white dark:bg-slate-900 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'general'
                ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Genel & Tema
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('layout')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'layout'
                ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Ağaç Yerleşimi
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('relationships')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'relationships'
                ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            İlişki Renkleri & Çizgiler
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('custom_types')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'custom_types'
                ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Özel İlişki Türleri ({customTypes.length})
          </button>
        </div>

        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-6">
          {activeTab === 'general' && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Arayüz Teması
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ theme: 'light' })}
                    className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      settings.theme === 'light'
                        ? 'border-sky-500 bg-sky-50 text-sky-700 ring-2 ring-sky-300'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Sun className="w-4 h-4 text-amber-500" />
                    Açık Tema
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ theme: 'dark' })}
                    className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      settings.theme === 'dark'
                        ? 'border-sky-500 bg-sky-950/50 text-sky-300 ring-2 ring-sky-700'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Moon className="w-4 h-4 text-indigo-400" />
                    Koyu Tema
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ theme: 'system' })}
                    className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      settings.theme === 'system'
                        ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 ring-2 ring-sky-300'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Laptop className="w-4 h-4 text-slate-400" />
                    Sistem Teması
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Çizgiler Üzerinde İlişki Etiketlerini Göster
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Eş, Çocuk, Kardeş gibi etiket rozetlerini bağlantı çizgilerinde gösterir.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showEdgeLabels}
                  onChange={(e) => onUpdateSettings({ showEdgeLabels: e.target.checked })}
                  className="w-5 h-5 text-sky-600 rounded border-slate-300 focus:ring-sky-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Çalışma Alanı Arka Plan Deseni
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['dots', 'lines', 'cross', 'none'] as const).map(variant => (
                    <button
                      key={variant}
                      type="button"
                      onClick={() => onUpdateSettings({ backgroundVariant: variant })}
                      className={`p-2.5 rounded-xl border text-xs font-bold capitalize transition-all ${
                        settings.backgroundVariant === variant
                          ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 ring-2 ring-sky-300'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {variant === 'dots' ? 'Noktalar' : variant === 'lines' ? 'Çizgiler' : variant === 'cross' ? 'Artılar' : 'Düz'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'layout' && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                  <span>Nesiller Arası Dikey Mesafe ({settings.generationDistance}px)</span>
                  <span className="text-[10px] text-slate-400">Üst ve alt kuşak aralığı</span>
                </label>
                <input
                  type="range"
                  min={120}
                  max={280}
                  step={10}
                  value={settings.generationDistance}
                  onChange={(e) => onUpdateSettings({ generationDistance: Number(e.target.value) })}
                  className="w-full accent-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                  <span>Eşler Arası Yatay Boşluk ({settings.spouseDistance}px)</span>
                  <span className="text-[10px] text-slate-400">Yan yana duran eşlerin aralığı</span>
                </label>
                <input
                  type="range"
                  min={30}
                  max={140}
                  step={5}
                  value={settings.spouseDistance}
                  onChange={(e) => onUpdateSettings({ spouseDistance: Number(e.target.value) })}
                  className="w-full accent-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                  <span>Kardeşler / Kişiler Arası Boşluk ({settings.siblingDistance}px)</span>
                  <span className="text-[10px] text-slate-400">Yatayda yan yana duran diğer bireyler</span>
                </label>
                <input
                  type="range"
                  min={30}
                  max={120}
                  step={5}
                  value={settings.siblingDistance}
                  onChange={(e) => onUpdateSettings({ siblingDistance: Number(e.target.value) })}
                  className="w-full accent-sky-500"
                />
              </div>

              <div className="p-3 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900 rounded-2xl text-xs text-sky-800 dark:text-sky-300">
                💡 Not: Mesafe ayarlarını değiştirdikten sonra üst menüdeki <b>"Otomatik Düzenle"</b> butonuna basarak ağacı yeni mesafelerle anında hizalayabilirsiniz.
              </div>
            </div>
          )}

          {activeTab === 'relationships' && (
            <div className="space-y-4 animate-fade-in">
              <p className="text-xs text-slate-500">
                Her ilişki türünün varsayılan çizgi rengini, kalınlığını ve stilini buradan belirleyin.
              </p>

              <div className="space-y-3">
                {DEFAULT_RELATIONSHIP_TYPES.map(def => {
                  const custom = settings.customStyles?.[def.id];
                  const color = custom?.color || def.color;
                  const lineStyle = custom?.lineStyle || def.lineStyle;
                  const lineWidth = custom?.lineWidth || def.lineWidth;

                  return (
                    <div
                      key={def.id}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-2.5 min-w-[120px]">
                        <span
                          className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {def.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={color}
                          onChange={(e) => handleUpdateRelStyle(def.id, { color: e.target.value })}
                          className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 dark:border-slate-700 p-0.5 bg-transparent"
                        />

                        <select
                          value={lineStyle}
                          onChange={(e) => handleUpdateRelStyle(def.id, { lineStyle: e.target.value as LineStyle })}
                          className="px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                        >
                          <option value="solid">Düz</option>
                          <option value="dashed">Kesikli</option>
                          <option value="dotted">Noktalı</option>
                        </select>

                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-400">{lineWidth}px</span>
                          <input
                            type="range"
                            min={1}
                            max={6}
                            value={lineWidth}
                            onChange={(e) => handleUpdateRelStyle(def.id, { lineWidth: Number(e.target.value) })}
                            className="w-16 accent-sky-500"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'custom_types' && (
            <div className="space-y-5 animate-fade-in">
              <form onSubmit={handleAddCustomTypeSubmit} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-sky-500" />
                  Yeni Özel İlişki Türü Tanımla
                </h4>

                {newTypeError && (
                  <p className="text-xs text-rose-500 font-medium">{newTypeError}</p>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      İlişki Adı / Etiketi
                    </label>
                    <input
                      type="text"
                      placeholder="Örn: Üvey çocuk, Evlatlık, İlk eşi"
                      value={newTypeLabel}
                      onChange={(e) => setNewTypeLabel(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                        Çizgi Rengi
                      </label>
                      <input
                        type="color"
                        value={newTypeColor}
                        onChange={(e) => setNewTypeColor(e.target.value)}
                        className="w-full h-8 rounded-lg cursor-pointer border border-slate-200 dark:border-slate-700 p-0.5 bg-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                        Çizgi Tipi
                      </label>
                      <select
                        value={newTypeLineStyle}
                        onChange={(e) => setNewTypeLineStyle(e.target.value as LineStyle)}
                        className="w-full px-2 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                      >
                        <option value="solid">Düz</option>
                        <option value="dashed">Kesikli</option>
                        <option value="dotted">Noktalı</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                  >
                    Özel İlişkiyi Ekle
                  </button>
                </div>
              </form>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Tanımlanmış Özel İlişkiler
                </h4>
                {customTypes.length > 0 ? (
                  customTypes.map(ct => (
                    <div
                      key={ct.id}
                      className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-3.5 h-3.5 rounded-full"
                          style={{ backgroundColor: ct.color }}
                        />
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {ct.label}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase">
                          ({ct.lineStyle})
                        </span>
                      </div>
                      <button
                        onClick={() => onDeleteCustomType(ct.id)}
                        className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    Henüz özel bir ilişki türü tanımlanmadı.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end bg-slate-50/50 dark:bg-slate-800/50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 active:scale-95 rounded-xl shadow-md shadow-sky-500/25 transition-all"
          >
            Tamam
          </button>
        </div>
      </div>
    </div>
  );
};

