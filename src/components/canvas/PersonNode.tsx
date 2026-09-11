import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Person } from '../../types/familyTree';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Info, 
  Calendar, 
  Sparkles,
  ArrowLeftRight
} from 'lucide-react';

export interface PersonNodeData {
  person: Person;
  isSelected?: boolean;
  hasSpouse?: boolean;
  onSelectPerson?: (person: Person) => void;
  onEditPerson?: (person: Person) => void;
  onDeletePerson?: (person: Person) => void;
  onQuickAdd?: (person: Person, defaultType?: string) => void;
  onSwapSpouseOrder?: (person: Person) => void;
}

export const PersonNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as PersonNodeData;
  const { person, hasSpouse, onSelectPerson, onEditPerson, onDeletePerson, onQuickAdd, onSwapSpouseOrder } = nodeData;

  if (!person) return null;

  const isFemale = person.gender === 'female';
  const isMale = person.gender === 'male';

  const defaultBg = isFemale 
    ? 'bg-rose-50/85 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60' 
    : isMale 
    ? 'bg-sky-50/85 dark:bg-sky-950/40 border-sky-200 dark:border-sky-900/60' 
    : 'bg-slate-50/85 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800';

  const defaultAccent = isFemale
    ? 'bg-rose-500 text-rose-50'
    : isMale
    ? 'bg-sky-500 text-sky-50'
    : 'bg-slate-500 text-slate-50';

  const customBgStyle = person.cardColor?.background
    ? { backgroundColor: person.cardColor.background }
    : undefined;

  const customBorderStyle = person.cardColor?.border
    ? { borderColor: person.cardColor.border }
    : undefined;

  const customTextStyle = person.cardColor?.text
    ? { color: person.cardColor.text }
    : undefined;

  const birthYear = person.birthDate ? person.birthDate.substring(0, 4) : '';
  const deathYear = person.deathDate ? person.deathDate.substring(0, 4) : '';
  const dateRange = birthYear ? (person.isLiving ? `d. ${birthYear}` : `${birthYear} - ${deathYear || '?'}`) : '';

  return (
    <div
      onClick={() => onSelectPerson?.(person)}
      style={{ ...customBgStyle, ...customBorderStyle }}
      className={`relative group w-[240px] rounded-2xl p-3.5 backdrop-blur-md shadow-sm border transition-all duration-200 cursor-pointer hover:shadow-xl hover:-translate-y-0.5 ${
        selected
          ? 'ring-2 ring-sky-500 ring-offset-2 dark:ring-offset-slate-950 shadow-sky-500/20 shadow-lg border-sky-400 dark:border-sky-500'
          : defaultBg
      }`}
    >
      {/* Universal Handles on all 4 sides for both Source and Target */}
      {/* Top handles */}
      <Handle
        type="target"
        position={Position.Top}
        id="top-target"
        className="!w-2.5 !h-2.5 !-top-1.5 !bg-sky-500 !border-2 !border-white dark:!border-slate-900 z-10"
      />
      <Handle
        type="source"
        position={Position.Top}
        id="top-source"
        className="!w-2.5 !h-2.5 !-top-1.5 !bg-sky-500 !border-2 !border-white dark:!border-slate-900 z-10"
      />

      {/* Bottom handles */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-source"
        className="!w-2.5 !h-2.5 !-bottom-1.5 !bg-sky-500 !border-2 !border-white dark:!border-slate-900 z-10"
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom-target"
        className="!w-2.5 !h-2.5 !-bottom-1.5 !bg-sky-500 !border-2 !border-white dark:!border-slate-900 z-10"
      />

      {/* Left handles */}
      <Handle
        type="target"
        position={Position.Left}
        id="left-target"
        className="!w-2.5 !h-2.5 !-left-1.5 !bg-rose-500 !border-2 !border-white dark:!border-slate-900 z-10"
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left-source"
        className="!w-2.5 !h-2.5 !-left-1.5 !bg-rose-500 !border-2 !border-white dark:!border-slate-900 z-10"
      />

      {/* Right handles */}
      <Handle
        type="source"
        position={Position.Right}
        id="right-source"
        className="!w-2.5 !h-2.5 !-right-1.5 !bg-rose-500 !border-2 !border-white dark:!border-slate-900 z-10"
      />
      <Handle
        type="target"
        position={Position.Right}
        id="right-target"
        className="!w-2.5 !h-2.5 !-right-1.5 !bg-rose-500 !border-2 !border-white dark:!border-slate-900 z-10"
      />

      {/* Quick Action Floating Bar */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="absolute -top-3.5 right-2 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center gap-1 bg-white/95 dark:bg-slate-800/95 shadow-md border border-slate-200 dark:border-slate-700 rounded-full px-1.5 py-0.5 z-20"
      >
        {hasSpouse && (
          <button
            title="Eşlerin Yerini Değiştir (Sağ/Sol)"
            onClick={() => onSwapSpouseOrder?.(person)}
            className="p-1 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-700 rounded-full transition-colors"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          title="Hızlı İlişki Ekle"
          onClick={() => onQuickAdd?.(person)}
          className="p-1 text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-slate-700 rounded-full transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
        <button
          title="Kişiyi Düzenle"
          onClick={() => onEditPerson?.(person)}
          className="p-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>
        <button
          title="Kişiyi Sil"
          onClick={() => onDeletePerson?.(person)}
          className="p-1 text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-700 rounded-full transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-start gap-3">
        <div className="relative flex-shrink-0">
          {person.photo ? (
            <img
              src={person.photo}
              alt={person.firstName}
              className="w-12 h-12 rounded-xl object-cover border-2 border-white dark:border-slate-800 shadow-sm"
            />
          ) : (
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base shadow-sm ${defaultAccent}`}
            >
              {person.firstName[0]?.toUpperCase() || 'K'}
              {person.lastName[0]?.toUpperCase() || ''}
            </div>
          )}
          {!person.isLiving && (
            <span
              title="Vefat etti"
              className="absolute -bottom-1 -right-1 text-[10px] bg-slate-800 text-slate-200 px-1 py-0.2 rounded border border-slate-600"
            >
              †
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 
              style={customTextStyle}
              className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate leading-tight tracking-tight"
            >
              {person.firstName} {person.lastName}
            </h3>
          </div>

          {person.nickname && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 italic truncate">
              "{person.nickname}"
            </p>
          )}

          {dateRange && (
            <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              <Calendar className="w-3 h-3 flex-shrink-0 opacity-70" />
              <span>{dateRange}</span>
            </div>
          )}
        </div>
      </div>

      {person.role && (
        <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 px-2 py-0.5 rounded-md truncate max-w-full">
            <Sparkles className="w-2.5 h-2.5 text-amber-500 flex-shrink-0" />
            <span className="truncate">{person.role}</span>
          </span>

          <button
            title="Detayları Görüntüle"
            onClick={(e) => {
              e.stopPropagation();
              onSelectPerson?.(person);
            }}
            className="text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors p-0.5"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
});

PersonNode.displayName = 'PersonNode';

