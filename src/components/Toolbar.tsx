import React, { useState, useRef } from 'react';
import { Person, FamilyTreeData } from '../types/familyTree';
import { 
  TreePine, 
  UserPlus, 
  HeartHandshake, 
  LayoutGrid, 
  Maximize2, 
  RotateCcw, 
  RotateCw, 
  Upload, 
  Settings as SettingsIcon, 
  Sun, 
  Moon, 
  Search, 
  Users, 
  FolderDown, 
  Sparkles, 
  ChevronDown,
  FileJson,
  FileImage,
  Crosshair
} from 'lucide-react';
import { exportFamilyTreeToJson, validateAndImportFamilyTree, exportTreeAsImage } from '../utils/exportImport';
import { createTestFamilyData, createThreeGenFamilyData, createLargeFamilyData, createEmptyFamilyData } from '../utils/sampleData';

interface ToolbarProps {
  treeData: FamilyTreeData;
  onAddNewPerson: () => void;
  onAddNewRelationship: () => void;
  onAutoLayout: () => void;
  onCenterTree: () => void;
  onFitView: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onLoadTree: (tree: FamilyTreeData) => void;
  onOpenSettings: () => void;
  onTogglePeopleList: () => void;
  isPeopleListOpen: boolean;
  onSelectPerson: (person: Person) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  canvasContainerRef: React.RefObject<HTMLDivElement | null>;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  treeData,
  onAddNewPerson,
  onAddNewRelationship,
  onAutoLayout,
  onCenterTree,
  onFitView,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onLoadTree,
  onOpenSettings,
  onTogglePeopleList,
  isPeopleListOpen,
  onSelectPerson,
  isDarkMode,
  onToggleDarkMode,
  canvasContainerRef
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const searchResults = searchQuery.trim()
    ? treeData.persons.filter(p =>
        `${p.firstName} ${p.lastName} ${p.role || ''}`.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        const res = validateAndImportFamilyTree(text);
        if (res.success && res.data) {
          onLoadTree(res.data);
          alert('Aile ağacı başarıyla içe aktarıldı!');
        } else {
          alert(res.error || 'İçe aktarma başarısız oldu.');
        }
      };
      reader.readAsText(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExportImage = async (format: 'png' | 'svg') => {
    if (!canvasContainerRef.current) return;
    try {
      await exportTreeAsImage(canvasContainerRef.current, format, treeData.name || 'aile-agaci');
    } catch {
      alert('Görsel dışa aktarılırken bir hata oluştu.');
    }
    setIsExportOpen(false);
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl px-4 flex items-center justify-between z-40 relative select-none">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white shadow-md shadow-sky-500/20">
          <TreePine className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {treeData.name || 'Aile Ağacı'}
            </h1>
            <span className="text-[10px] font-bold bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 px-2 py-0.5 rounded-full">
              {treeData.persons.length} Kişi
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium">
            Gelişmiş Aile İlişkileri Yönetimi
          </p>
        </div>
      </div>

      <div className="hidden lg:flex items-center gap-2.5">
        <div className="relative">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Ağaçta kişi ara... (örn: Zekiye)"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              className="w-56 pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:w-72 transition-all focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          {isSearchOpen && searchQuery.trim() && (
            <div className="absolute top-10 left-0 w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 z-50 animate-scale-in">
              {searchResults.length > 0 ? (
                searchResults.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSelectPerson(p);
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="w-full p-2 text-left hover:bg-sky-50 dark:hover:bg-slate-700/60 rounded-xl transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {p.firstName} {p.lastName}
                      </div>
                      <div className="text-[10px] text-slate-400">{p.role || 'Rol belirtilmemiş'}</div>
                    </div>
                    <Crosshair className="w-3.5 h-3.5 text-sky-500" />
                  </button>
                ))
              ) : (
                <div className="text-center py-3 text-xs text-slate-400">Sonuç bulunamadı.</div>
              )}
            </div>
          )}
        </div>

        <button
          onClick={onAddNewPerson}
          className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md shadow-sky-500/20 flex items-center gap-1.5 transition-all"
        >
          <UserPlus className="w-3.5 h-3.5" />
          Kişi Ekle
        </button>

        <button
          onClick={onAddNewRelationship}
          disabled={treeData.persons.length < 2}
          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold rounded-xl shadow-md shadow-purple-500/20 flex items-center gap-1.5 transition-all"
        >
          <HeartHandshake className="w-3.5 h-3.5" />
          İlişki Ekle
        </button>

        <button
          onClick={onAutoLayout}
          title="Tüm ağacı kurallara göre otomatik hizala"
          className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors"
        >
          <LayoutGrid className="w-3.5 h-3.5 text-sky-500" />
          Otomatik Düzenle
        </button>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
          <button
            onClick={onCenterTree}
            title="Ağacı Ortala"
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onFitView}
            title="Tümünü Gör (Fit View)"
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Geri Al (Ctrl + Z)"
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg disabled:opacity-30 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Yinele (Ctrl + Y)"
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg disabled:opacity-30 transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setIsPresetsOpen(!isPresetsOpen)}
            className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Örnek Şablonlar</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isPresetsOpen && (
            <div className="absolute right-0 top-10 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-1.5 z-50 animate-scale-in">
              <button
                onClick={() => {
                  onLoadTree(createTestFamilyData());
                  setIsPresetsOpen(false);
                }}
                className="w-full text-left p-2.5 hover:bg-sky-50 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Zekiye & Ahmet Ailesi (Test)
                </div>
                <div className="text-[10px] text-slate-400">
                  Çekirdek aile, 3 çocuk ve Fatma Hala
                </div>
              </button>

              <button
                onClick={() => {
                  onLoadTree(createThreeGenFamilyData());
                  setIsPresetsOpen(false);
                }}
                className="w-full text-left p-2.5 hover:bg-sky-50 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  3 Nesil Geniş Aile (Kaya)
                </div>
                <div className="text-[10px] text-slate-400">
                  Dede, Nine, Eşler, Torunlar
                </div>
              </button>

              <button
                onClick={() => {
                  onLoadTree(createLargeFamilyData(100));
                  setIsPresetsOpen(false);
                }}
                className="w-full text-left p-2.5 hover:bg-sky-50 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  100+ Kişilik Büyük Hanedan
                </div>
                <div className="text-[10px] text-slate-400">
                  Stres testi ve dev soyağacı
                </div>
              </button>

              <div className="border-t border-slate-100 dark:border-slate-700 my-1" />

              <button
                onClick={() => {
                  if (confirm('Mevcut ağacı sıfırlamak istediğinize emin misiniz?')) {
                    onLoadTree(createEmptyFamilyData());
                  }
                  setIsPresetsOpen(false);
                }}
                className="w-full text-left p-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold transition-colors"
              >
                Yeni Boş Ağaç Başlat
              </button>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setIsExportOpen(!isExportOpen)}
            className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
            title="Dışa / İçe Aktar"
          >
            <FolderDown className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </button>

          {isExportOpen && (
            <div className="absolute right-0 top-10 w-52 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-1.5 z-50 animate-scale-in">
              <button
                onClick={() => {
                  exportFamilyTreeToJson(treeData);
                  setIsExportOpen(false);
                }}
                className="w-full text-left p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2"
              >
                <FileJson className="w-4 h-4 text-emerald-500" />
                JSON Olarak İndir
              </button>

              <button
                onClick={() => {
                  fileInputRef.current?.click();
                  setIsExportOpen(false);
                }}
                className="w-full text-left p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2"
              >
                <Upload className="w-4 h-4 text-sky-500" />
                JSON Dosyasından Yükle
              </button>

              <div className="border-t border-slate-100 dark:border-slate-700 my-1" />

              <button
                onClick={() => handleExportImage('png')}
                className="w-full text-left p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2"
              >
                <FileImage className="w-4 h-4 text-purple-500" />
                PNG Resim Olarak Kaydet
              </button>
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept=".json,application/json"
            className="hidden"
          />
        </div>

        <button
          onClick={onToggleDarkMode}
          className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
          title="Temayı Değiştir"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        <button
          onClick={onOpenSettings}
          className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
          title="Ayarlar"
        >
          <SettingsIcon className="w-4 h-4" />
        </button>

        <button
          onClick={onTogglePeopleList}
          className={`p-2 rounded-xl border transition-colors flex items-center gap-1 ${
            isPeopleListOpen
              ? 'bg-sky-50 dark:bg-sky-950/50 border-sky-400 text-sky-600 dark:text-sky-300'
              : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
          }`}
          title="Kişiler Listesi"
        >
          <Users className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

