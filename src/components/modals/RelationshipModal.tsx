import React, { useState, useEffect } from 'react';
import { Person, Relationship, RelationshipTypeDefinition, LineStyle } from '../../types/familyTree';
import { getRelationshipType } from '../../utils/relationships';
import { X, HeartHandshake, Trash2, Check, Info } from 'lucide-react';

interface RelationshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sourceId: string, targetId: string, type: string, options?: {
    customLabel?: string;
    color?: string;
    lineStyle?: LineStyle;
    lineWidth?: number;
  }) => void;
  onDelete?: (relId: string) => void;
  allPersons: Person[];
  customTypes: RelationshipTypeDefinition[];
  initialRelationship?: Relationship | null;
  defaultSourceId?: string;
}

export const RelationshipModal: React.FC<RelationshipModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  allPersons,
  customTypes,
  initialRelationship,
  defaultSourceId
}) => {
  const [sourceId, setSourceId] = useState('');
  const [targetId, setTargetId] = useState('');
  const [relType, setRelType] = useState('spouse');
  const [customLabel, setCustomLabel] = useState('');
  const [color, setColor] = useState('');
  const [lineStyle, setLineStyle] = useState<LineStyle>('solid');
  const [lineWidth, setLineWidth] = useState(2);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialRelationship) {
      setSourceId(initialRelationship.sourcePersonId);
      setTargetId(initialRelationship.targetPersonId);
      setRelType(initialRelationship.type);
      setCustomLabel(initialRelationship.customLabel || '');
      setColor(initialRelationship.color || '');
      setLineStyle(initialRelationship.lineStyle || 'solid');
      setLineWidth(initialRelationship.lineWidth || 2);
    } else {
      const p1 = defaultSourceId || (allPersons[0]?.id || '');
      const p2 = allPersons.find(p => p.id !== p1)?.id || '';
      setSourceId(p1);
      setTargetId(p2);
      setRelType('spouse');
      setCustomLabel('');
      setColor('');
      setLineStyle('solid');
      setLineWidth(2);
    }
    setError('');
  }, [initialRelationship, defaultSourceId, allPersons, isOpen]);

  if (!isOpen) return null;

  const person1 = allPersons.find(p => p.id === sourceId);
  const person2 = allPersons.find(p => p.id === targetId);
  const currentTypeMeta = getRelationshipType(relType, customTypes);

  const getSemanticPreview = () => {
    const name1 = person1 ? `${person1.firstName} ${person1.lastName}` : '1. Kişi';
    const name2 = person2 ? `${person2.firstName} ${person2.lastName}` : '2. Kişi';

    switch (relType) {
      case 'spouse':
        return `${name1} ile ${name2} birbiriyle "EŞ" olacaktır (Yan yana konumlanır).`;
      case 'child':
        return `${name1}, ${name2}'nin "ÇOCUĞU" olacaktır (${name1} altta, ${name2} üstte konumlanır).`;
      case 'parent':
        return `${name1}, ${name2}'nin "ANNE/BABASI" olacaktır (${name1} üstte, ${name2} altta konumlanır).`;
      case 'sibling':
        return `${name1} ile ${name2} "KARDEŞ" olacaktır (Aynı seviyede konumlanır).`;
      default:
        return `${name1}, ${name2}'nin "${currentTypeMeta.label}" ilişkisinde olacaktır.`;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceId || !targetId) {
      setError('Lütfen her iki kişiyi de seçiniz.');
      return;
    }
    if (sourceId === targetId) {
      setError('Bir kişi kendisiyle ilişkilendirilemez.');
      return;
    }

    try {
      let finalSourceId = sourceId;
      let finalTargetId = targetId;
      let finalType = relType;

      if (relType === 'child') {
        finalSourceId = targetId;
        finalTargetId = sourceId;
        finalType = 'child';
      } else if (relType === 'parent') {
        finalSourceId = sourceId;
        finalTargetId = targetId;
        finalType = 'child';
      }

      onSave(finalSourceId, finalTargetId, finalType, {
        customLabel: customLabel.trim() || undefined,
        color: color || undefined,
        lineStyle,
        lineWidth
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'İlişki kaydedilirken hata oluştu.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden animate-scale-in">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {initialRelationship ? 'İlişkiyi Düzenle' : 'İlişki Tanımla'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                İki aile üyesi arasındaki bağı ve hiyerarşiyi belirleyin.
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Kişi
              </label>
              <select
                value={sourceId}
                onChange={(e) => setSourceId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
                {allPersons.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName} {p.role ? `(${p.role})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Diğer Kişi
              </label>
              <select
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
                {allPersons.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName} {p.role ? `(${p.role})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              İlişki Türü
            </label>
            <select
              value={relType}
              onChange={(e) => {
                setRelType(e.target.value);
                const t = getRelationshipType(e.target.value, customTypes);
                setColor(t.color);
                setLineStyle(t.lineStyle);
                setLineWidth(t.lineWidth);
              }}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
            >
              <optgroup label="Temel Aile Bağları">
                <option value="spouse">Eşi</option>
                <option value="child">Çocuğu</option>
                <option value="parent">Anne / Babası</option>
                <option value="sibling">Kardeşi</option>
              </optgroup>
              <optgroup label="Geniş Aile & Akrabalık">
                <option value="grandfather">Dedesi</option>
                <option value="grandmother">Ninesi</option>
                <option value="grandchild">Torunu</option>
                <option value="uncle">Amcası / Dayısı</option>
                <option value="aunt">Halası / Teyzesi</option>
                <option value="nephew_niece">Yeğeni</option>
                <option value="cousin">Kuzeni</option>
                <option value="step_child">Üvey Çocuğu</option>
                <option value="adopted">Evlatlığı</option>
                <option value="other">Diğer / Özel</option>
              </optgroup>
              {customTypes.length > 0 && (
                <optgroup label="Özel Tanımlı İlişkiler">
                  {customTypes.map(t => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          <div className="p-3 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900 rounded-2xl flex items-start gap-2 text-xs text-sky-900 dark:text-sky-200">
            <Info className="w-4 h-4 text-sky-600 dark:text-sky-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">{getSemanticPreview()}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Özel Çizgi Etiketi (İsteğe bağlı)
            </label>
            <input
              type="text"
              placeholder={`Varsayılan: ${currentTypeMeta.label}`}
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Çizgi Görünümü & Ayarları
            </h4>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Çizgi Rengi</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color || currentTypeMeta.color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 dark:border-slate-700 p-0.5 bg-transparent"
                  />
                  {color && (
                    <button
                      type="button"
                      onClick={() => setColor('')}
                      className="text-[10px] text-slate-400 hover:text-slate-600"
                    >
                      Sıfırla
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Çizgi Tipi</label>
                <select
                  value={lineStyle}
                  onChange={(e) => setLineStyle(e.target.value as LineStyle)}
                  className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
                >
                  <option value="solid">Düz (Solid)</option>
                  <option value="dashed">Kesikli (Dashed)</option>
                  <option value="dotted">Noktalı (Dotted)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Kalınlık ({lineWidth}px)</label>
                <input
                  type="range"
                  min={1}
                  max={6}
                  value={lineWidth}
                  onChange={(e) => setLineWidth(Number(e.target.value))}
                  className="w-full accent-sky-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            {initialRelationship && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(initialRelationship.id);
                  onClose();
                }}
                className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                İlişkiyi Sil
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 active:scale-95 rounded-xl shadow-md shadow-sky-500/25 transition-all flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Kaydet
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

