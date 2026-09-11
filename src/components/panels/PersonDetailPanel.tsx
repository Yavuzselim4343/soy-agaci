import React from 'react';
import { Person, Relationship, RelationshipTypeDefinition } from '../../types/familyTree';
import { getPersonRelations } from '../../utils/relationships';
import { 
  X, 
  User, 
  Edit3, 
  Trash2, 
  Plus, 
  Heart, 
  Calendar, 
  MapPin, 
  FileText, 
  Users, 
  ArrowDown, 
  ArrowUp,
  Sparkles,
  ExternalLink,
  ArrowLeftRight
} from 'lucide-react';

interface PersonDetailPanelProps {
  person: Person | null;
  allPersons: Person[];
  relationships: Relationship[];
  customTypes: RelationshipTypeDefinition[];
  onClose: () => void;
  onEdit: (person: Person) => void;
  onDelete: (person: Person) => void;
  onQuickAdd: (person: Person) => void;
  onSelectPerson: (person: Person) => void;
  onSwapSpouseOrder?: (person: Person) => void;
}

export const PersonDetailPanel: React.FC<PersonDetailPanelProps> = ({
  person,
  allPersons,
  relationships,
  customTypes,
  onClose,
  onEdit,
  onDelete,
  onQuickAdd,
  onSelectPerson,
  onSwapSpouseOrder
}) => {
  if (!person) return null;

  const relations = getPersonRelations(person.id, allPersons, relationships, customTypes);

  const isFemale = person.gender === 'female';
  const isMale = person.gender === 'male';

  return (
    <div className="w-80 sm:w-96 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-l border-slate-200 dark:border-slate-800 h-full flex flex-col shadow-2xl z-30 animate-fade-in">
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <User className="w-4 h-4 text-sky-500" />
          Kişi Profili & İlişkileri
        </h3>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80">
          {person.photo ? (
            <img
              src={person.photo}
              alt={person.firstName}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-sky-500 shadow-sm"
            />
          ) : (
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-xl shadow-sm ${
              isFemale ? 'bg-rose-500 text-white' : isMale ? 'bg-sky-500 text-white' : 'bg-slate-500 text-white'
            }`}>
              {person.firstName[0]?.toUpperCase()}
              {person.lastName[0]?.toUpperCase()}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 truncate">
              {person.firstName} {person.lastName}
            </h2>

            {person.nickname && (
              <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                "{person.nickname}"
              </p>
            )}

            {person.role && (
              <div className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-900 px-2 py-0.5 rounded-lg max-w-full truncate">
                <Sparkles className="w-3 h-3 text-amber-500 flex-shrink-0" />
                <span className="truncate">{person.role}</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onQuickAdd(person)}
            className="px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-sky-500/20 flex flex-col items-center gap-1 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            İlişki Ekle
          </button>
          <button
            onClick={() => onEdit(person)}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center gap-1 transition-all active:scale-95"
          >
            <Edit3 className="w-4 h-4 text-slate-500" />
            Düzenle
          </button>
          <button
            onClick={() => onDelete(person)}
            className="px-3 py-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-xl border border-rose-200 dark:border-rose-900 flex flex-col items-center gap-1 transition-all active:scale-95"
          >
            <Trash2 className="w-4 h-4 text-rose-500" />
            Kişiyi Sil
          </button>
        </div>

        <div className="space-y-2.5 p-3.5 bg-slate-50/70 dark:bg-slate-800/30 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 text-xs">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Doğum / Yaşam:
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {person.birthDate ? person.birthDate : 'Belirtilmedi'}
              {person.deathDate ? ` - ${person.deathDate} (†)` : (person.isLiving ? ' (Yaşıyor)' : ' (†)')}
            </span>
          </div>

          {person.birthPlace && (
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5 font-medium">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Doğum Yeri:
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {person.birthPlace}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Cinsiyet:
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {person.gender === 'female' ? 'Kadın' : person.gender === 'male' ? 'Erkek' : 'Belirtilmemiş'}
            </span>
          </div>
        </div>

        {person.description && (
          <div className="space-y-1.5 p-3.5 bg-slate-50/70 dark:bg-slate-800/30 rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Biyografi & Notlar
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
              {person.description}
            </p>
          </div>
        )}

        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Aile Bağları & Akrabalıklar
          </h4>

          {/* Spouses */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                Eşi ({relations.spouses.length})
              </div>
              {relations.spouses.length > 0 && onSwapSpouseOrder && (
                <button
                  onClick={() => onSwapSpouseOrder(person)}
                  title="Eşlerin Yerini Değiştir (Sağ / Sol)"
                  className="text-[10px] px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-900 flex items-center gap-1 transition-colors"
                >
                  <ArrowLeftRight className="w-3 h-3" />
                  Yer Değiştir
                </button>
              )}
            </div>
            {relations.spouses.length > 0 ? (
              <div className="space-y-1">
                {relations.spouses.map(spouse => (
                  <button
                    key={spouse.id}
                    onClick={() => onSelectPerson(spouse)}
                    className="w-full px-3 py-2 text-left text-xs bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-100/70 dark:hover:bg-rose-900/40 rounded-xl border border-rose-200/60 dark:border-rose-900/40 flex items-center justify-between transition-colors group"
                  >
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {spouse.firstName} {spouse.lastName}
                    </span>
                    <ExternalLink className="w-3 h-3 text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 italic">Kayıtlı eş bulunmuyor.</p>
            )}
          </div>

          {/* Children */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1">
              <ArrowDown className="w-3 h-3" />
              Çocukları ({relations.children.length})
            </div>
            {relations.children.length > 0 ? (
              <div className="space-y-1">
                {relations.children.map(child => (
                  <button
                    key={child.id}
                    onClick={() => onSelectPerson(child)}
                    className="w-full px-3 py-2 text-left text-xs bg-sky-50/50 dark:bg-sky-950/20 hover:bg-sky-100/70 dark:hover:bg-sky-900/40 rounded-xl border border-sky-200/60 dark:border-sky-900/40 flex items-center justify-between transition-colors group"
                  >
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {child.firstName} {child.lastName} {child.role ? `(${child.role})` : ''}
                    </span>
                    <ExternalLink className="w-3 h-3 text-sky-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 italic">Kayıtlı çocuk bulunmuyor.</p>
            )}
          </div>

          {/* Parents */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
              <ArrowUp className="w-3 h-3" />
              Ebeveynleri (Anne / Baba) ({relations.parents.length})
            </div>
            {relations.parents.length > 0 ? (
              <div className="space-y-1">
                {relations.parents.map(parent => (
                  <button
                    key={parent.id}
                    onClick={() => onSelectPerson(parent)}
                    className="w-full px-3 py-2 text-left text-xs bg-purple-50/50 dark:bg-purple-950/20 hover:bg-purple-100/70 dark:hover:bg-purple-900/40 rounded-xl border border-purple-200/60 dark:border-purple-900/40 flex items-center justify-between transition-colors group"
                  >
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {parent.firstName} {parent.lastName}
                    </span>
                    <ExternalLink className="w-3 h-3 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 italic">Kayıtlı anne/baba bulunmuyor.</p>
            )}
          </div>

          {/* Siblings */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Users className="w-3 h-3" />
              Kardeşleri ({relations.siblings.length})
            </div>
            {relations.siblings.length > 0 ? (
              <div className="space-y-1">
                {relations.siblings.map(sibling => (
                  <button
                    key={sibling.id}
                    onClick={() => onSelectPerson(sibling)}
                    className="w-full px-3 py-2 text-left text-xs bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/40 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40 flex items-center justify-between transition-colors group"
                  >
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {sibling.firstName} {sibling.lastName}
                    </span>
                    <ExternalLink className="w-3 h-3 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 italic">Kayıtlı kardeş bulunmuyor.</p>
            )}
          </div>

          {/* Cousins */}
          {relations.cousins && relations.cousins.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                <Users className="w-3 h-3" />
                Kuzenleri ({relations.cousins.length})
              </div>
              <div className="space-y-1">
                {relations.cousins.map(cousin => (
                  <button
                    key={cousin.id}
                    onClick={() => onSelectPerson(cousin)}
                    className="w-full px-3 py-2 text-left text-xs bg-indigo-50/50 dark:bg-indigo-950/20 hover:bg-indigo-100/70 dark:hover:bg-indigo-900/40 rounded-xl border border-indigo-200/60 dark:border-indigo-900/40 flex items-center justify-between transition-colors group"
                  >
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {cousin.firstName} {cousin.lastName}
                    </span>
                    <ExternalLink className="w-3 h-3 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Other relations */}
          {relations.others.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Diğer Akrabalıklar ({relations.others.length})
              </div>
              <div className="space-y-1">
                {relations.others.map((other, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSelectPerson(other.person)}
                    className="w-full px-3 py-2 text-left text-xs bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-100/70 dark:hover:bg-amber-900/40 rounded-xl border border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between transition-colors group"
                  >
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {other.person.firstName} {other.person.lastName}
                      </span>
                      <span className="ml-1.5 text-[10px] text-amber-700 dark:text-amber-300 font-medium">
                        ({other.relationshipLabel})
                      </span>
                    </div>
                    <ExternalLink className="w-3 h-3 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

