import React, { useState, useMemo } from 'react';
import { Person, Relationship } from '../../types/familyTree';
import { Search, X, Users, UserPlus } from 'lucide-react';

interface PeopleListPanelProps {
  persons: Person[];
  relationships: Relationship[];
  selectedPersonId?: string;
  onSelectPerson: (person: Person) => void;
  onAddNewPerson: () => void;
  onClose: () => void;
}

export const PeopleListPanel: React.FC<PeopleListPanelProps> = ({
  persons,
  relationships,
  selectedPersonId,
  onSelectPerson,
  onAddNewPerson,
  onClose
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGender, setFilterGender] = useState<'all' | 'male' | 'female'>('all');

  const filteredPersons = useMemo(() => {
    return persons.filter(p => {
      const matchSearch =
        `${p.firstName} ${p.lastName} ${p.role || ''} ${p.nickname || ''}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchGender = filterGender === 'all' || p.gender === filterGender;

      return matchSearch && matchGender;
    });
  }, [persons, searchQuery, filterGender]);

  const stats = useMemo(() => {
    const total = persons.length;
    const living = persons.filter(p => p.isLiving).length;
    const marriages = relationships.filter(r => r.type === 'spouse').length;
    const males = persons.filter(p => p.gender === 'male').length;
    const females = persons.filter(p => p.gender === 'female').length;

    return { total, living, marriages, males, females };
  }, [persons, relationships]);

  return (
    <div className="w-80 sm:w-96 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 h-full flex flex-col shadow-2xl z-30 animate-fade-in">
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-sky-500" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Kişiler Dizini ({persons.length})
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20 text-center">
        <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
          <div className="text-sm font-extrabold text-sky-600 dark:text-sky-400">{stats.total}</div>
          <div className="text-[10px] text-slate-500 font-medium">Toplam Kişi</div>
        </div>
        <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
          <div className="text-sm font-extrabold text-rose-500">{stats.marriages}</div>
          <div className="text-[10px] text-slate-500 font-medium">Evlilik / Çift</div>
        </div>
        <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
          <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">{stats.living}</div>
          <div className="text-[10px] text-slate-500 font-medium">Yaşayan</div>
        </div>
      </div>

      <div className="p-4 space-y-2.5 border-b border-slate-100 dark:border-slate-800">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="İsim, soyisim veya rol ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex gap-1.5">
          <button
            onClick={() => setFilterGender('all')}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors ${
              filterGender === 'all'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Tümü
          </button>
          <button
            onClick={() => setFilterGender('female')}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors ${
              filterGender === 'female'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Kadın ({stats.females})
          </button>
          <button
            onClick={() => setFilterGender('male')}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors ${
              filterGender === 'male'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Erkek ({stats.males})
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
        {filteredPersons.length > 0 ? (
          filteredPersons.map(person => {
            const isSelected = person.id === selectedPersonId;
            const isFemale = person.gender === 'female';

            return (
              <button
                key={person.id}
                onClick={() => onSelectPerson(person)}
                className={`w-full p-3 text-left rounded-2xl border transition-all flex items-center gap-3 ${
                  isSelected
                    ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-400 dark:border-sky-600 ring-2 ring-sky-300 dark:ring-sky-900 shadow-sm'
                    : 'bg-white dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300'
                }`}
              >
                {person.photo ? (
                  <img
                    src={person.photo}
                    alt={person.firstName}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
                  />
                ) : (
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm ${
                      isFemale
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        : 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
                    }`}
                  >
                    {person.firstName[0]?.toUpperCase()}
                    {person.lastName[0]?.toUpperCase()}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                    {person.firstName} {person.lastName}
                  </div>
                  {person.role ? (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {person.role}
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-400 italic">
                      {person.birthDate ? `d. ${person.birthDate.substring(0, 4)}` : 'Tarih yok'}
                    </div>
                  )}
                </div>
              </button>
            );
          })
        ) : (
          <div className="text-center py-10">
            <Users className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-medium">Aramanıza uygun kişi bulunamadı.</p>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={onAddNewPerson}
          className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 active:scale-98 text-white text-xs font-bold rounded-xl shadow-md shadow-sky-500/20 flex items-center justify-center gap-2 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          Yeni Kişi Ekle
        </button>
      </div>
    </div>
  );
};

