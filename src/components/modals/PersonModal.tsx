import React, { useState, useEffect } from 'react';
import { Person, Gender } from '../../types/familyTree';
import { X, User, Sparkles, MapPin, Palette, Check, Image } from 'lucide-react';

interface PersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (personData: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialPerson?: Person | null;
}

export const PersonModal: React.FC<PersonModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialPerson
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'dates' | 'appearance' | 'bio'>('basic');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<Gender>('unspecified');
  const [role, setRole] = useState('');
  const [nickname, setNickname] = useState('');
  
  const [birthDate, setBirthDate] = useState('');
  const [deathDate, setDeathDate] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [isLiving, setIsLiving] = useState(true);

  const [photo, setPhoto] = useState('');
  const [cardBgColor, setCardBgColor] = useState('');
  const [cardBorderColor, setCardBorderColor] = useState('');
  const [cardTextColor, setCardTextColor] = useState('');
  
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialPerson) {
      setFirstName(initialPerson.firstName || '');
      setLastName(initialPerson.lastName || '');
      setGender(initialPerson.gender || 'unspecified');
      setRole(initialPerson.role || '');
      setNickname(initialPerson.nickname || '');
      setBirthDate(initialPerson.birthDate || '');
      setDeathDate(initialPerson.deathDate || '');
      setBirthPlace(initialPerson.birthPlace || '');
      setIsLiving(initialPerson.isLiving !== false);
      setPhoto(initialPerson.photo || '');
      setCardBgColor(initialPerson.cardColor?.background || '');
      setCardBorderColor(initialPerson.cardColor?.border || '');
      setCardTextColor(initialPerson.cardColor?.text || '');
      setDescription(initialPerson.description || '');
    } else {
      setFirstName('');
      setLastName('');
      setGender('unspecified');
      setRole('');
      setNickname('');
      setBirthDate('');
      setDeathDate('');
      setBirthPlace('');
      setIsLiving(true);
      setPhoto('');
      setCardBgColor('');
      setCardBorderColor('');
      setCardTextColor('');
      setDescription('');
    }
    setError('');
    setActiveTab('basic');
  }, [initialPerson, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) {
      setError('Lütfen kişinin adını giriniz.');
      setActiveTab('basic');
      return;
    }

    const cardColor = (cardBgColor || cardBorderColor || cardTextColor) ? {
      background: cardBgColor || undefined,
      border: cardBorderColor || undefined,
      text: cardTextColor || undefined
    } : undefined;

    onSave({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      gender,
      role: role.trim(),
      nickname: nickname.trim() || undefined,
      birthDate: birthDate || undefined,
      deathDate: isLiving ? undefined : (deathDate || undefined),
      birthPlace: birthPlace.trim() || undefined,
      isLiving,
      photo: photo.trim() || undefined,
      cardColor,
      description: description.trim() || undefined,
      positionX: initialPerson?.positionX,
      positionY: initialPerson?.positionY
    });

    onClose();
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden animate-scale-in">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 font-semibold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {initialPerson ? 'Kişi Bilgilerini Düzenle' : 'Yeni Kişi Ekle'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Aile üyesinin temel ve detaylı bilgilerini tanımlayın.
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

        <div className="flex border-b border-slate-100 dark:border-slate-800 px-6 bg-white dark:bg-slate-900">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'basic'
                ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Temel Bilgiler
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('dates')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'dates'
                ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Tarih & Yaşam
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('appearance')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'appearance'
                ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Görünüm & Renk
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bio')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'bio'
                ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Biyografi & Notlar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          {activeTab === 'basic' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    İsim <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Zekiye"
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
                    placeholder="Örn: Yılmaz"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                  <span>Rol / Görev / Ünvan</span>
                  <span className="text-[11px] font-normal text-slate-400">(İlişkiden bağımsız kişisel bilgi)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Örn: 3 çocuk annesi, Baba, Doktor, Ailenin büyüğü"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                  <Sparkles className="w-4 h-4 text-amber-500 absolute left-3 top-2.5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Cinsiyet
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as Gender)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="female">Kadın</option>
                    <option value="male">Erkek</option>
                    <option value="other">Diğer</option>
                    <option value="unspecified">Belirtilmemiş</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Lakap
                  </label>
                  <input
                    type="text"
                    placeholder="Örn: Paşa, Zekoş"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dates' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                <input
                  type="checkbox"
                  id="isLiving"
                  checked={isLiving}
                  onChange={(e) => setIsLiving(e.target.checked)}
                  className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                />
                <label htmlFor="isLiving" className="text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                  Kişi şu anda hayatta (Yaşıyor)
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Doğum Tarihi
                  </label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                {!isLiving && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Ölüm Tarihi
                    </label>
                    <input
                      type="date"
                      value={deathDate}
                      onChange={(e) => setDeathDate(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Doğum Yeri / Memleket
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Örn: İstanbul, Üsküdar"
                    value={birthPlace}
                    onChange={(e) => setBirthPlace(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Fotoğraf / Avatar
                </label>
                <div className="flex items-center gap-4">
                  {photo ? (
                    <img
                      src={photo}
                      alt="Preview"
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-sky-500 shadow-sm"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400">
                      <Image className="w-6 h-6" />
                    </div>
                  )}

                  <div className="space-y-2 flex-1">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 transition-colors">
                      <Image className="w-3.5 h-3.5" />
                      Dosya Seç
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                    {photo && (
                      <button
                        type="button"
                        onClick={() => setPhoto('')}
                        className="ml-2 text-xs text-rose-500 hover:underline"
                      >
                        Fotoğrafı Kaldır
                      </button>
                    )}
                    <input
                      type="text"
                      placeholder="veya Fotoğraf URL'si yapıştırın"
                      value={photo.startsWith('data:') ? '' : photo}
                      onChange={(e) => setPhoto(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-sky-500" />
                  Özel Kart Renkleri (İsteğe bağlı)
                </h4>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Arka Plan</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={cardBgColor || '#f8fafc'}
                        onChange={(e) => setCardBgColor(e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 dark:border-slate-700 p-0.5 bg-transparent"
                      />
                      {cardBgColor && (
                        <button
                          type="button"
                          onClick={() => setCardBgColor('')}
                          className="text-[10px] text-slate-400 hover:text-slate-600"
                        >
                          Sıfırla
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Kenarlık</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={cardBorderColor || '#e2e8f0'}
                        onChange={(e) => setCardBorderColor(e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 dark:border-slate-700 p-0.5 bg-transparent"
                      />
                      {cardBorderColor && (
                        <button
                          type="button"
                          onClick={() => setCardBorderColor('')}
                          className="text-[10px] text-slate-400 hover:text-slate-600"
                        >
                          Sıfırla
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Metin</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={cardTextColor || '#0f172a'}
                        onChange={(e) => setCardTextColor(e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 dark:border-slate-700 p-0.5 bg-transparent"
                      />
                      {cardTextColor && (
                        <button
                          type="button"
                          onClick={() => setCardTextColor('')}
                          className="text-[10px] text-slate-400 hover:text-slate-600"
                        >
                          Sıfırla
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bio' && (
            <div className="space-y-3 animate-fade-in">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Kişi Biyografisi ve Özel Notlar
              </label>
              <textarea
                rows={5}
                placeholder="Bu aile üyesinin anıları, hikayesi, mesleki başarıları ve diğer notları..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
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
              {initialPerson ? 'Değişiklikleri Kaydet' : 'Kişiyi Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

