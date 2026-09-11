import React, { useState, useEffect } from 'react';
import { Person, RelationshipTypeDefinition } from '../../types/familyTree';
import { X, UserPlus, Users, Heart, ArrowDown, UserCheck, Check, Info, Plus, Trash2, Sparkles } from 'lucide-react';

interface QuickAddRelationModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourcePerson: Person | null;
  allPersons: Person[];
  customTypes?: RelationshipTypeDefinition[];
  onAddExistingRelation: (sourceId: string, targetId: string, type: string) => void;
  onAddMultipleExistingRelations?: (items: Array<{ sourceId: string; targetId: string; type: string }>) => void;
  onCreateAndRelate: (
    personData: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>,
    existingPersonId: string,
    type: string,
    direction?: 'existing_is_source' | 'new_is_source'
  ) => void;
  onCreateMultipleAndRelate?: (
    personsData: Array<Omit<Person, 'id' | 'createdAt' | 'updatedAt'>>,
    existingPersonId: string,
    type: string,
    direction?: 'existing_is_source' | 'new_is_source'
  ) => void;
}

interface ChildEntry {
  id: string;
  firstName: string;
  lastName: string;
  gender: 'female' | 'male';
  role: string;
}

export const QuickAddRelationModal: React.FC<QuickAddRelationModalProps> = ({
  isOpen,
  onClose,
  sourcePerson,
  allPersons,
  customTypes = [],
  onAddExistingRelation,
  onAddMultipleExistingRelations,
  onCreateAndRelate,
  onCreateMultipleAndRelate
}) => {
  const [mode, setMode] = useState<'create_new' | 'select_existing'>('create_new');
  const [selectedRelType, setSelectedRelType] = useState('child');
  
  // Single relation fields (for spouse, parent, sibling, etc.)
  const [selectedExistingId, setSelectedExistingId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | 'unspecified'>('female');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');

  // Multi-child fields (when selectedRelType === 'child')
  const [childrenList, setChildrenList] = useState<ChildEntry[]>([
    { id: '1', firstName: '', lastName: '', gender: 'female', role: 'Çocuk' }
  ]);
  const [selectedExistingChildIds, setSelectedExistingChildIds] = useState<string[]>([]);

  useEffect(() => {
    if (sourcePerson) {
      setLastName(sourcePerson.lastName);
      setChildrenList([
        { id: `c-${Date.now()}-1`, firstName: '', lastName: sourcePerson.lastName, gender: 'female', role: 'Çocuk' }
      ]);
      setSelectedExistingChildIds([]);
      setError('');
    }
  }, [sourcePerson, isOpen]);

  if (!isOpen || !sourcePerson) return null;

  const availablePersons = allPersons.filter(p => p.id !== sourcePerson.id);
  const isChildMode = selectedRelType === 'child';

  const handleTypeSelect = (typeId: string) => {
    setSelectedRelType(typeId);
    if (typeId === 'spouse') {
      setGender(sourcePerson.gender === 'male' ? 'female' : 'male');
      setLastName(sourcePerson.lastName);
      setRole('Eş');
    } else if (typeId === 'child') {
      setLastName(sourcePerson.lastName);
      setRole('Çocuk');
    } else if (typeId === 'sibling') {
      setLastName(sourcePerson.lastName);
      setRole('Kardeş');
    } else if (typeId === 'parent') {
      setLastName(sourcePerson.lastName);
      setRole('Ebeveyn');
    }
  };

  // Multi-child list operations
  const handleAddChildRow = () => {
    setChildrenList(prev => [
      ...prev,
      {
        id: `c-${Date.now()}-${prev.length + 1}`,
        firstName: '',
        lastName: sourcePerson.lastName,
        gender: prev.length % 2 === 0 ? 'female' : 'male',
        role: 'Çocuk'
      }
    ]);
  };

  const handleRemoveChildRow = (id: string) => {
    if (childrenList.length <= 1) return;
    setChildrenList(prev => prev.filter(c => c.id !== id));
  };

  const handleUpdateChild = (id: string, field: keyof ChildEntry, value: string) => {
    setChildrenList(prev =>
      prev.map(c => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleToggleExistingChild = (id: string) => {
    setSelectedExistingChildIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const getPreviewText = () => {
    if (isChildMode) {
      if (mode === 'create_new') {
        const count = childrenList.length;
        const names = childrenList.map(c => c.firstName || 'İsimsiz').join(', ');
        return `${sourcePerson.firstName}'e ${count} adet çocuk eklenecektir (${names}). Otomatik olarak eşine de bağlanacak ve kardeş olacaklardır.`;
      } else {
        const count = selectedExistingChildIds.length;
        return `${sourcePerson.firstName}'e seçilen ${count} kişi çocuk olarak bağlanacaktır.`;
      }
    }

    const targetName = mode === 'create_new' 
      ? (firstName ? `${firstName} ${lastName}` : 'Yeni Kişi')
      : (availablePersons.find(p => p.id === selectedExistingId)?.firstName || 'Seçilen Kişi');

    if (selectedRelType === 'spouse') {
      return `${sourcePerson.firstName}, ${targetName} ile "EŞ" olarak yan yana bağlanacaktır.`;
    }
    if (selectedRelType === 'parent') {
      return `${targetName}, ${sourcePerson.firstName}'in "ANNE/BABASI" olarak üst seviyeye eklenecektir.`;
    }
    if (selectedRelType === 'sibling') {
      return `${targetName}, ${sourcePerson.firstName}'in "KARDEŞİ" olarak aynı seviyeye eklenecektir.`;
    }
    return `${sourcePerson.firstName} ile ${targetName} ilişkilendirilecektir.`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isChildMode) {
        if (mode === 'create_new') {
          const validChildren = childrenList.filter(c => c.firstName.trim());
          if (validChildren.length === 0) {
            setError('Lütfen en az bir çocuğun ismini giriniz.');
            return;
          }

          const childrenPayload = validChildren.map(c => ({
            firstName: c.firstName.trim(),
            lastName: (c.lastName || sourcePerson.lastName).trim(),
            gender: c.gender,
            role: c.role.trim() || 'Çocuk',
            isLiving: true
          }));

          if (onCreateMultipleAndRelate) {
            onCreateMultipleAndRelate(childrenPayload, sourcePerson.id, 'child', 'existing_is_source');
          } else {
            childrenPayload.forEach(p => {
              onCreateAndRelate(p, sourcePerson.id, 'child', 'existing_is_source');
            });
          }
        } else {
          if (selectedExistingChildIds.length === 0) {
            setError('Lütfen en az bir çocuk seçiniz.');
            return;
          }

          if (onAddMultipleExistingRelations) {
            const items = selectedExistingChildIds.map(tId => ({
              sourceId: sourcePerson.id,
              targetId: tId,
              type: 'child'
            }));
            onAddMultipleExistingRelations(items);
          } else {
            selectedExistingChildIds.forEach(tId => {
              onAddExistingRelation(sourcePerson.id, tId, 'child');
            });
          }
        }

        onClose();
        return;
      }

      if (mode === 'select_existing') {
        if (!selectedExistingId) {
          setError('Lütfen bağlanacak mevcut kişiyi seçiniz.');
          return;
        }

        let sId = sourcePerson.id;
        let tId = selectedExistingId;
        let type = selectedRelType;

        if (selectedRelType === 'parent') {
          sId = selectedExistingId;
          tId = sourcePerson.id;
          type = 'child';
        }

        onAddExistingRelation(sId, tId, type);
      } else {
        if (!firstName.trim()) {
          setError('Lütfen yeni kişinin adını giriniz.');
          return;
        }

        let direction: 'existing_is_source' | 'new_is_source' = 'existing_is_source';
        let typeToSave = selectedRelType;

        if (selectedRelType === 'parent') {
          direction = 'new_is_source';
          typeToSave = 'child';
        }

        onCreateAndRelate(
          {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            gender,
            role: role.trim(),
            isLiving: true
          },
          sourcePerson.id,
          typeToSave,
          direction
        );
      }

      onClose();
    } catch (err: any) {
      setError(err.message || 'İlişki eklenirken hata oluştu.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className={`bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full ${isChildMode ? 'max-w-2xl' : 'max-w-lg'} overflow-hidden animate-scale-in`}>
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
              {isChildMode ? <ArrowDown className="w-5 h-5" /> : <Heart className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {isChildMode ? 'Çocuk / Çocuklar Ekle' : 'Hızlı İlişki Ekle'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-sky-600 dark:text-sky-400">{sourcePerson.firstName} {sourcePerson.lastName}</span> için aile bağı tanımlayın.
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

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              İlişki Türü:
            </label>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleTypeSelect('child')}
                className={`p-2.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  selectedRelType === 'child'
                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 shadow-sm ring-2 ring-sky-300 dark:ring-sky-900'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <ArrowDown className="w-4 h-4 text-sky-500" />
                Çocuk Ekle
              </button>

              <button
                type="button"
                onClick={() => handleTypeSelect('spouse')}
                className={`p-2.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  selectedRelType === 'spouse'
                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 shadow-sm ring-2 ring-rose-300 dark:ring-rose-900'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Heart className="w-4 h-4 text-rose-500" />
                Eş Ekle
              </button>

              <button
                type="button"
                onClick={() => handleTypeSelect('sibling')}
                className={`p-2.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  selectedRelType === 'sibling'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 shadow-sm ring-2 ring-emerald-300 dark:ring-emerald-900'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Users className="w-4 h-4 text-emerald-500" />
                Kardeş Ekle
              </button>

              <button
                type="button"
                onClick={() => handleTypeSelect('parent')}
                className={`p-2.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  selectedRelType === 'parent'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 shadow-sm ring-2 ring-purple-300 dark:ring-purple-900'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <UserCheck className="w-4 h-4 text-purple-500" />
                Anne/Baba
              </button>
            </div>

            {customTypes.length > 0 && (
              <div className="mt-2">
                <select
                  value={selectedRelType}
                  onChange={(e) => handleTypeSelect(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  <option value="child">Çocuk</option>
                  <option value="spouse">Eş</option>
                  <option value="sibling">Kardeş</option>
                  <option value="parent">Anne / Baba</option>
                  <optgroup label="Özel İlişki Türleri">
                    {customTypes.map(ct => (
                      <option key={ct.id} value={ct.id}>{ct.label}</option>
                    ))}
                  </optgroup>
                </select>
              </div>
            )}
          </div>

          {/* Dynamic Preview Helper */}
          <div className="p-3 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900 rounded-2xl flex items-start gap-2 text-xs text-sky-900 dark:text-sky-200">
            <Info className="w-4 h-4 text-sky-600 dark:text-sky-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">{getPreviewText()}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Hedef Kişi:
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
              <button
                type="button"
                onClick={() => setMode('create_new')}
                className={`py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  mode === 'create_new'
                    ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                {isChildMode ? 'Yeni Çocuk(lar) Oluştur' : 'Yeni Kişi Oluştur'}
              </button>

              <button
                type="button"
                onClick={() => setMode('select_existing')}
                disabled={availablePersons.length === 0}
                className={`py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  mode === 'select_existing'
                    ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 disabled:opacity-40'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Mevcut Kişiyi Seç ({availablePersons.length})
              </button>
            </div>
          </div>

          {/* Form Content: Multi-Child UI or Single UI */}
          {isChildMode && mode === 'create_new' ? (
            <div className="space-y-3.5 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Eklenecek Çocuklar ({childrenList.length}):
                </span>
                <button
                  type="button"
                  onClick={handleAddChildRow}
                  className="px-3 py-1 bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + Başka Çocuk Ekle
                </button>
              </div>

              <div className="space-y-2.5 max-h-[35vh] overflow-y-auto pr-1">
                {childrenList.map((child, index) => (
                  <div
                    key={child.id}
                    className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        {index + 1}. Çocuk
                      </span>
                      {childrenList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveChildRow(child.id)}
                          className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 p-1 rounded-lg transition-colors"
                          title="Bu çocuğu çıkar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-4">
                        <input
                          type="text"
                          required
                          placeholder="İsim *"
                          value={child.firstName}
                          onChange={(e) => handleUpdateChild(child.id, 'firstName', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-semibold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="text"
                          placeholder="Soyisim"
                          value={child.lastName}
                          onChange={(e) => handleUpdateChild(child.id, 'lastName', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                        />
                      </div>
                      <div className="col-span-2">
                        <select
                          value={child.gender}
                          onChange={(e) => handleUpdateChild(child.id, 'gender', e.target.value as any)}
                          className="w-full px-1.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs"
                        >
                          <option value="female">Kız</option>
                          <option value="male">Erkek</option>
                        </select>
                      </div>
                      <div className="col-span-3">
                        <input
                          type="text"
                          placeholder="Rol (örn: Büyük Kız)"
                          value={child.role}
                          onChange={(e) => handleUpdateChild(child.id, 'role', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : isChildMode && mode === 'select_existing' ? (
            <div className="space-y-3 animate-fade-in">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Çocuk olarak bağlanacak kişileri seçin (Birden fazla seçebilirsiniz):
              </label>
              <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700">
                {availablePersons.map(p => (
                  <label
                    key={p.id}
                    className="flex items-center gap-2.5 p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 cursor-pointer hover:bg-sky-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedExistingChildIds.includes(p.id)}
                      onChange={() => handleToggleExistingChild(p.id)}
                      className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                    />
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {p.firstName} {p.lastName} {p.role ? `(${p.role})` : ''}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ) : mode === 'select_existing' ? (
            <div className="space-y-3 animate-fade-in">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Ağaçtan Kişi Seçin:
              </label>
              <select
                value={selectedExistingId}
                onChange={(e) => setSelectedExistingId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
                <option value="">-- Kişi Seçin --</option>
                {availablePersons.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName} {p.role ? `(${p.role})` : ''}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-3 animate-fade-in">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    İsim <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="İsim"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Soyisim
                  </label>
                  <input
                    type="text"
                    placeholder="Soyisim"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Rol / Görev
                  </label>
                  <input
                    type="text"
                    placeholder="Örn: Eş, Anne"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Cinsiyet
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="female">Kadın</option>
                    <option value="male">Erkek</option>
                    <option value="other">Diğer</option>
                    <option value="unspecified">Belirtilmemiş</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
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
              {isChildMode && mode === 'create_new'
                ? `${childrenList.filter(c => c.firstName.trim()).length || 1} Çocuğu Ekle`
                : mode === 'create_new'
                ? 'Oluştur ve İlişkilendir'
                : 'İlişkiyi Bağla'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

