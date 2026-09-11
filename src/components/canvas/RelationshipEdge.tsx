import { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getStraightPath,
  getSmoothStepPath,
  EdgeProps
} from '@xyflow/react';
import { Relationship, RelationshipTypeDefinition } from '../../types/familyTree';
import { Heart, Users } from 'lucide-react';

export interface RelationshipEdgeData {
  relationship: Relationship;
  typeDef: RelationshipTypeDefinition;
  showLabels?: boolean;
  onSelectEdge?: (rel: Relationship) => void;
  onDeleteEdge?: (relId: string) => void;
  parentIndex?: number;
  parentCount?: number;
  spouseSourceX?: number;
}

export const RelationshipEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
  selected
}: EdgeProps) => {
  const edgeData = data as unknown as RelationshipEdgeData | undefined;
  const rel = edgeData?.relationship;
  const typeDef = edgeData?.typeDef;
  const showLabels = edgeData?.showLabels !== false;

  const isSpouse = rel?.type === 'spouse';
  const isSibling = rel?.type === 'sibling';
  const isChildEdge = rel?.type === 'child' || rel?.type === 'step_child' || rel?.type === 'adopted';
  const isParentEdge = rel?.type === 'parent';

  let edgePath: string;
  let labelX: number;
  let labelY: number;

  if (isSpouse) {
    // Eşler: Düz yatay çizgi
    [edgePath, labelX, labelY] = getStraightPath({ sourceX, sourceY, targetX, targetY });
  } else if (isSibling) {
    // Kardeşler: Yan kulakçıklar arasında düz yatay çizgi
    [edgePath, labelX, labelY] = getStraightPath({ sourceX, sourceY, targetX, targetY });
  } else if (isChildEdge) {
    // Klasik soyağacı dallanması (2. Görseldeki Tam Yapı):
    // 1. Ebeveynden Level 1 (Evlilik Barı) seviyesine in
    // 2. Çiftin merkezine (X_couple) git
    // 3. Çift merkezinden Level 2 (Çocuk Dağıtım Barı) seviyesine dikey in
    // 4. Dağıtım barında çocuğun X koordinatına git
    // 5. Çocuğun üst noktasına dikey in
    const verticalGap = Math.max(40, targetY - sourceY);
    const yMarriage = sourceY + verticalGap * 0.22;
    const yDist = sourceY + verticalGap * 0.52;

    // Eğer eş bilgisi varsa çiftin orta X'ini kullan, yoksa ebeveynin kendi X'i
    const spouseX = edgeData?.spouseSourceX;
    const xCouple = spouseX !== undefined ? (sourceX + spouseX) / 2 : sourceX;

    edgePath = [
      'M', sourceX, sourceY,
      'L', sourceX, yMarriage,
      'L', xCouple, yMarriage,
      'L', xCouple, yDist,
      'L', targetX, yDist,
      'L', targetX, targetY
    ].join(' ');

    labelX = targetX;
    labelY = yDist + (targetY - yDist) * 0.5;
  } else if (isParentEdge) {
    // Çocuk -> Ebeveyn
    const verticalGap = Math.max(40, sourceY - targetY);
    const yDist = targetY + verticalGap * 0.52;
    const yMarriage = targetY + verticalGap * 0.22;

    edgePath = [
      'M', sourceX, sourceY,
      'L', sourceX, yDist,
      'L', targetX, yDist,
      'L', targetX, yMarriage,
      'L', targetX, targetY
    ].join(' ');

    labelX = sourceX;
    labelY = yDist + (sourceY - yDist) * 0.5;
  } else {
    // Diğer akrabalıklar: Yumuşak basamaklı bağlantı
    [edgePath, labelX, labelY] = getSmoothStepPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
      borderRadius: 8
    });
  }

  const color = rel?.color || typeDef?.color || (isSibling ? '#10b981' : '#0ea5e9');
  const lineWidth = rel?.lineWidth || typeDef?.lineWidth || 2.5;
  const lineStyle = rel?.lineStyle || typeDef?.lineStyle || 'solid';

  let strokeDasharray: string | undefined = undefined;
  if (lineStyle === 'dashed') strokeDasharray = '6,5';
  if (lineStyle === 'dotted') strokeDasharray = '2,4';

  const label = rel?.customLabel || typeDef?.label || rel?.type || 'İlişki';

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: selected ? '#0284c7' : color,
          strokeWidth: selected ? lineWidth + 2 : lineWidth,
          strokeDasharray,
          opacity: selected ? 1 : 0.95,
          strokeLinecap: 'round',
          strokeLinejoin: 'round'
        }}
      />

      {showLabels && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: 'translate(-50%, -50%) translate(' + labelX + 'px,' + labelY + 'px)',
              pointerEvents: 'all',
              whiteSpace: 'nowrap'
            }}
            className="nodrag nopan group flex items-center gap-1 z-10"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (rel) edgeData?.onSelectEdge?.(rel);
              }}
              className={'px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap flex items-center gap-1 shadow-sm border transition-all duration-150 backdrop-blur-md ' + (
                selected
                  ? 'bg-sky-600 text-white border-sky-400 ring-2 ring-sky-300'
                  : 'bg-white/95 dark:bg-slate-900/95 text-slate-700 dark:text-slate-200 border-slate-200/80 dark:border-slate-800 hover:scale-105'
              )}
              style={{
                borderColor: color
              }}
            >
              {isSpouse && <Heart className="w-2.5 h-2.5 text-rose-500 fill-rose-500" />}
              {isSibling && <Users className="w-2.5 h-2.5 text-emerald-500" />}
              <span style={{ color: selected ? '#ffffff' : color }}>{label.toUpperCase()}</span>
            </button>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});

RelationshipEdge.displayName = 'RelationshipEdge';
