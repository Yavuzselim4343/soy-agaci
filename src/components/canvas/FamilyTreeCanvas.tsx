import React, { useMemo, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  Node,
  Edge,
  useReactFlow,
  ConnectionMode
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Person, Relationship, RelationshipTypeDefinition, TreeSettings } from '../../types/familyTree';
import { PersonNode, PersonNodeData } from './PersonNode';
import { RelationshipEdge, RelationshipEdgeData } from './RelationshipEdge';
import { getRelationshipType } from '../../utils/relationships';
import { UserPlus, Heart } from 'lucide-react';

const nodeTypes = {
  personNode: PersonNode
};

const edgeTypes = {
  relationshipEdge: RelationshipEdge
};

interface FamilyTreeCanvasProps {
  persons: Person[];
  relationships: Relationship[];
  customTypes: RelationshipTypeDefinition[];
  settings: TreeSettings;
  selectedPersonId?: string;
  selectedRelationshipId?: string;
  onSelectPerson: (person: Person) => void;
  onEditPerson: (person: Person) => void;
  onDeletePerson: (person: Person) => void;
  onQuickAdd: (person: Person) => void;
  onSelectRelationship: (rel: Relationship) => void;
  onDeleteRelationship: (relId: string) => void;
  onUpdateNodePosition: (id: string, x: number, y: number) => void;
  onUpdateMultipleNodePositions?: (positions: Array<{ id: string; x: number; y: number }>) => void;
  onSwapSpouseOrder?: (person: Person) => void;
  onAddNewPerson: () => void;
  isDarkMode: boolean;
}

export const FamilyTreeCanvas: React.FC<FamilyTreeCanvasProps> = ({
  persons,
  relationships,
  customTypes,
  settings,
  selectedPersonId,
  selectedRelationshipId,
  onSelectPerson,
  onEditPerson,
  onDeletePerson,
  onQuickAdd,
  onSelectRelationship,
  onDeleteRelationship,
  onUpdateNodePosition,
  onUpdateMultipleNodePositions,
  onSwapSpouseOrder,
  onAddNewPerson,
  isDarkMode
}) => {
  const { setCenter, fitView } = useReactFlow();

  const nodeWidth = settings.nodeWidth || 240;
  const nodeHeight = settings.nodeHeight || 120;
  const genDist = settings.generationDistance || 190;
  const spouseGap = settings.spouseDistance || 60;
  const siblingGap = settings.siblingDistance || 60;

  // Kişi sayısı değiştiğinde veya sayfa açıldığında otomatik olarak tüm ağacı ekrana sığdır
  useEffect(() => {
    if (persons.length > 0 && !selectedPersonId) {
      const timer = setTimeout(() => {
        fitView({ padding: 0.18, duration: 500 });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [persons.length, fitView, selectedPersonId]);

  useEffect(() => {
    if (selectedPersonId) {
      const target = persons.find(p => p.id === selectedPersonId);
      if (target && target.positionX !== undefined && target.positionY !== undefined) {
        setCenter(target.positionX + nodeWidth / 2, target.positionY + nodeHeight / 2, {
          zoom: 1.15,
          duration: 600
        });
      }
    }
  }, [selectedPersonId, persons, setCenter, nodeWidth, nodeHeight]);

  // Kuşak (Rank) Haritası Hesaplama
  const ranks = useMemo(() => {
    const rMap = new Map<string, number>();
    persons.forEach(p => rMap.set(p.id, 0));

    const spousesOf = new Map<string, Set<string>>();
    const childrenOf = new Map<string, Set<string>>();
    const siblingsOf = new Map<string, Set<string>>();

    persons.forEach(p => {
      spousesOf.set(p.id, new Set());
      childrenOf.set(p.id, new Set());
      siblingsOf.set(p.id, new Set());
    });

    relationships.forEach(rel => {
      if (rel.type === 'spouse') {
        spousesOf.get(rel.sourcePersonId)?.add(rel.targetPersonId);
        spousesOf.get(rel.targetPersonId)?.add(rel.sourcePersonId);
      } else if (rel.type === 'child' || rel.type === 'step_child' || rel.type === 'adopted') {
        childrenOf.get(rel.sourcePersonId)?.add(rel.targetPersonId);
      } else if (rel.type === 'parent') {
        childrenOf.get(rel.targetPersonId)?.add(rel.sourcePersonId);
      } else if (rel.type === 'sibling') {
        siblingsOf.get(rel.sourcePersonId)?.add(rel.targetPersonId);
        siblingsOf.get(rel.targetPersonId)?.add(rel.sourcePersonId);
      }
    });

    let changed = true;
    let iter = 0;
    while (changed && iter < 30) {
      changed = false;
      iter++;

      for (const [parentId, children] of childrenOf.entries()) {
        const pRank = rMap.get(parentId) || 0;
        for (const childId of children) {
          const cRank = rMap.get(childId) || 0;
          if (cRank < pRank + 1) {
            rMap.set(childId, pRank + 1);
            changed = true;
          }
        }
      }

      for (const [id, spouses] of spousesOf.entries()) {
        const myRank = rMap.get(id) || 0;
        for (const spouseId of spouses) {
          const sRank = rMap.get(spouseId) || 0;
          const maxR = Math.max(myRank, sRank);
          if (myRank !== maxR) { rMap.set(id, maxR); changed = true; }
          if (sRank !== maxR) { rMap.set(spouseId, maxR); changed = true; }
        }
      }

      for (const [id, sibs] of siblingsOf.entries()) {
        const myRank = rMap.get(id) || 0;
        for (const sibId of sibs) {
          const sibRank = rMap.get(sibId) || 0;
          const maxR = Math.max(myRank, sibRank);
          if (myRank !== maxR) { rMap.set(id, maxR); changed = true; }
          if (sibRank !== maxR) { rMap.set(sibId, maxR); changed = true; }
        }
      }
    }

    return rMap;
  }, [persons, relationships]);

  // Eş haritası
  const spousesMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    relationships.forEach(rel => {
      if (rel.type === 'spouse') {
        if (!map.has(rel.sourcePersonId)) map.set(rel.sourcePersonId, new Set());
        if (!map.has(rel.targetPersonId)) map.set(rel.targetPersonId, new Set());
        map.get(rel.sourcePersonId)!.add(rel.targetPersonId);
        map.get(rel.targetPersonId)!.add(rel.sourcePersonId);
      }
    });
    return map;
  }, [relationships]);

  const nodes: Node[] = useMemo(() => {
    return persons.map(person => {
      const isSelected = person.id === selectedPersonId;
      const hasSpouse = (spousesMap.get(person.id)?.size || 0) > 0;
      const nodeData: PersonNodeData = {
        person,
        isSelected,
        hasSpouse,
        onSelectPerson,
        onEditPerson,
        onDeletePerson,
        onQuickAdd,
        onSwapSpouseOrder
      };

      const pRank = ranks.get(person.id) || 0;
      const fixedY = pRank * (nodeHeight + genDist) + 80;

      return {
        id: person.id,
        type: 'personNode',
        position: {
          x: person.positionX ?? 100,
          y: fixedY
        },
        data: nodeData as any,
        selected: isSelected,
        draggable: true
      };
    });
  }, [persons, selectedPersonId, ranks, nodeHeight, genDist, spousesMap, onSelectPerson, onEditPerson, onDeletePerson, onQuickAdd, onSwapSpouseOrder]);

  const edges: Edge[] = useMemo(() => {
    const personMap = new Map(persons.map(p => [p.id, p]));

    // 1. Eş haritası
    const spousesOf = new Map<string, string[]>();
    relationships.forEach(rel => {
      if (rel.type === 'spouse') {
        if (!spousesOf.has(rel.sourcePersonId)) spousesOf.set(rel.sourcePersonId, []);
        if (!spousesOf.has(rel.targetPersonId)) spousesOf.set(rel.targetPersonId, []);
        spousesOf.get(rel.sourcePersonId)!.push(rel.targetPersonId);
        spousesOf.get(rel.targetPersonId)!.push(rel.sourcePersonId);
      }
    });

    // 2. Ebeveyn - Çocuk haritası
    const parentEdgesPerChild = new Map<string, string[]>();
    relationships.forEach(rel => {
      if (rel.type === 'child' || rel.type === 'step_child' || rel.type === 'adopted') {
        const childId = rel.targetPersonId;
        if (!parentEdgesPerChild.has(childId)) parentEdgesPerChild.set(childId, []);
        if (!parentEdgesPerChild.get(childId)!.includes(rel.sourcePersonId)) {
          parentEdgesPerChild.get(childId)!.push(rel.sourcePersonId);
        }
      }
    });

    return relationships
      .filter(rel => personMap.has(rel.sourcePersonId) && personMap.has(rel.targetPersonId))
      .filter(rel => {
        const isSpouse = rel.type === 'spouse';
        const isChild = rel.type === 'child' || rel.type === 'step_child' || rel.type === 'adopted' || rel.type === 'parent';

        // Eş ve Çocuk ilişkileri ana soyağacı yapısıdır ve her zaman görünür.
        if (isSpouse || isChild) {
          return true;
        }

        // Kardeş ve Kuzen ilişkileri: Bir kişinin üzerine tıklanınca çizgiyle gösterilmez,
        // sadece detay panelindeki ("Kardeşleri" / "Kuzenleri") bölümlerinde gösterilir.
        if (rel.type === 'sibling' || rel.type === 'cousin') {
          return rel.id === selectedRelationshipId;
        }

        // Kardeş, Dede, Nine, Hala, Teyze, Amca, Dayı, Yeğen, Kuzen vb. tüm ikincil ilişkiler:
        // Yalnızca ilgili ilişki veya ilgili kişi tıklandığında / seçildiğinde görünür.
        const isRelSelected = rel.id === selectedRelationshipId;
        const isConnectedPersonSelected = rel.sourcePersonId === selectedPersonId || rel.targetPersonId === selectedPersonId;

        return isRelSelected || isConnectedPersonSelected;
      })
      .map(rel => {
        const sourcePerson = personMap.get(rel.sourcePersonId)!;
        const targetPerson = personMap.get(rel.targetPersonId)!;
        const typeDef = getRelationshipType(rel.type, customTypes);
        const isSelected = rel.id === selectedRelationshipId;

        const sX = sourcePerson.positionX ?? 0;
        const sY = sourcePerson.positionY ?? 0;
        const tX = targetPerson.positionX ?? 0;
        const tY = targetPerson.positionY ?? 0;

        let sourceHandle = 'bottom-source';
        let targetHandle = 'top-target';

        if (rel.type === 'spouse') {
          // Eşler yan yana: Sol -> Sağ veya Sağ -> Sol
          if (sX <= tX) {
            sourceHandle = 'right-source';
            targetHandle = 'left-target';
          } else {
            sourceHandle = 'left-source';
            targetHandle = 'right-target';
          }
        } else if (rel.type === 'sibling') {
          // Kardeşler yan yana
          if (sX <= tX) {
            sourceHandle = 'right-source';
            targetHandle = 'left-target';
          } else {
            sourceHandle = 'left-source';
            targetHandle = 'right-target';
          }
        } else if (rel.type === 'child' || rel.type === 'step_child' || rel.type === 'adopted') {
          // Ebeveynden çocuğa: Ebeveyn alt handle -> Çocuk üst handle
          sourceHandle = 'bottom-source';
          targetHandle = 'top-target';
        } else if (rel.type === 'parent') {
          // Çocuktan ebeveyne: Çocuk üst handle -> Ebeveyn alt handle
          sourceHandle = 'top-source';
          targetHandle = 'bottom-target';
        } else {
          // Genel akrabalıklar / İkincil ilişkiler
          if (Math.abs(sY - tY) < 60) {
            if (sX <= tX) {
              sourceHandle = 'right-source';
              targetHandle = 'left-target';
            } else {
              sourceHandle = 'left-source';
              targetHandle = 'right-target';
            }
          } else if (sY < tY) {
            sourceHandle = 'bottom-source';
            targetHandle = 'top-target';
          } else {
            sourceHandle = 'top-source';
            targetHandle = 'bottom-target';
          }
        }

        const isChildRel = rel.type === 'child' || rel.type === 'step_child' || rel.type === 'adopted';
        const parentsOfThisChild = isChildRel ? (parentEdgesPerChild.get(rel.targetPersonId) || []) : [];
        const parentIndex = isChildRel ? parentsOfThisChild.indexOf(rel.sourcePersonId) : 0;
        const parentCount = isChildRel ? parentsOfThisChild.length : 1;

        // Ebeveynin eşinin X koordinatını hesapla (varsa)
        let spouseSourceX: number | undefined = undefined;
        if (isChildRel) {
          const otherParentId = parentsOfThisChild.find(pId => pId !== rel.sourcePersonId);
          if (otherParentId && personMap.has(otherParentId)) {
            const otherParent = personMap.get(otherParentId)!;
            spouseSourceX = (otherParent.positionX ?? 0) + nodeWidth / 2;
          } else {
            const spouses = spousesOf.get(rel.sourcePersonId) || [];
            if (spouses.length > 0 && personMap.has(spouses[0])) {
              const spousePerson = personMap.get(spouses[0])!;
              spouseSourceX = (spousePerson.positionX ?? 0) + nodeWidth / 2;
            }
          }
        }

        // Etiket gösterimi:
        // Eş: ayara göre
        // Çocuk: sadece seçilince (ağaç dalları temiz ve pürüzsüz kalsın)
        // Diğer akrabalıklar: seçilince gösterilir
        const shouldShowLabel = isChildRel
          ? isSelected
          : (rel.type === 'spouse' ? settings.showEdgeLabels : true);

        const edgeData: RelationshipEdgeData = {
          relationship: rel,
          typeDef,
          showLabels: shouldShowLabel,
          onSelectEdge: onSelectRelationship,
          onDeleteEdge: onDeleteRelationship,
          parentIndex,
          parentCount,
          spouseSourceX
        };

        return {
          id: rel.id,
          source: rel.sourcePersonId,
          target: rel.targetPersonId,
          sourceHandle,
          targetHandle,
          type: 'relationshipEdge',
          data: edgeData as any,
          selected: isSelected
        };
      });
  }, [
    relationships,
    persons,
    customTypes,
    selectedPersonId,
    selectedRelationshipId,
    settings.showEdgeLabels,
    nodeWidth,
    onSelectRelationship,
    onDeleteRelationship
  ]);

  const handleNodeDragStop = useCallback(
    (_: any, node: Node) => {
      // Kuşak seviyesini koru: Y koordinatını kuşağın sabit yüksekliğine kilitle
      const pRank = ranks.get(node.id) || 0;
      const genY = pRank * (nodeHeight + genDist) + 80;
      const personsInRank = persons.filter(p => (ranks.get(p.id) || 0) === pRank);

      // Bırakıldığında aynı kuşaktaki tüm kartların çakışmasını çöz ve mesafeleri güvenceye al
      interface UnitItem {
        p1: string;
        p2: string | null;
        width: number;
        x: number;
      }
      const units: UnitItem[] = [];
      const processed = new Set<string>();

      for (const p of personsInRank) {
        if (processed.has(p.id)) continue;
        const spouses = Array.from(spousesMap.get(p.id) || []).filter(sId => personsInRank.some(x => x.id === sId));
        if (spouses.length > 0) {
          const spouseId = spouses[0];
          processed.add(p.id);
          processed.add(spouseId);
          const isDragged = p.id === node.id || spouseId === node.id;

          const sPerson = personsInRank.find(x => x.id === spouseId);
          const pPrevX = p.positionX ?? 80;
          const sPrevX = sPerson?.positionX ?? (pPrevX + nodeWidth + spouseGap);

          // Eşlerin sağ/sol sırası sürükleme ile ASLA değişmez (sadece tuş ile değiştirilir)
          const wasPLeft = pPrevX <= sPrevX;
          const leftId = wasPLeft ? p.id : spouseId;
          const rightId = wasPLeft ? spouseId : p.id;

          let unitX: number;

          if (isDragged) {
            if (node.id === leftId) {
              unitX = Math.round(node.position.x);
            } else {
              unitX = Math.round(node.position.x - nodeWidth - spouseGap);
            }
          } else {
            unitX = Math.min(pPrevX, sPrevX);
          }
          units.push({ p1: leftId, p2: rightId, width: nodeWidth * 2 + spouseGap, x: unitX });
        } else {
          processed.add(p.id);
          const isDragged = p.id === node.id;
          units.push({ p1: p.id, p2: null, width: nodeWidth, x: isDragged ? Math.round(node.position.x) : (p.positionX ?? 80) });
        }
      }

      units.sort((a, b) => a.x - b.x);
      let currentMinX = 80;
      for (let i = 0; i < units.length; i++) {
        const u = units[i];
        if (u.x < currentMinX) u.x = currentMinX;
        currentMinX = u.x + u.width + siblingGap;
      }

      const updates: Array<{ id: string; x: number; y: number }> = [];
      for (const u of units) {
        if (u.p2) {
          updates.push({ id: u.p1, x: Math.round(u.x), y: genY });
          updates.push({ id: u.p2, x: Math.round(u.x + nodeWidth + spouseGap), y: genY });
        } else {
          updates.push({ id: u.p1, x: Math.round(u.x), y: genY });
        }
      }

      if (onUpdateMultipleNodePositions && updates.length > 0) {
        onUpdateMultipleNodePositions(updates);
      } else {
        onUpdateNodePosition(node.id, Math.round(node.position.x), genY);
      }
    },
    [onUpdateMultipleNodePositions, onUpdateNodePosition, ranks, persons, spousesMap, nodeHeight, genDist, nodeWidth, spouseGap, siblingGap]
  );

  const handleNodeDrag = useCallback(
    (_: any, node: Node) => {
      // Sürükleme esnasında da kartın kuşak seviyesinde (sabit Y) kalmasını sağla
      const pRank = ranks.get(node.id) || 0;
      const genY = pRank * (nodeHeight + genDist) + 80;
      node.position.y = genY;

      // Sürükleme esnasında da komşu kartlarla üst üste binmeyi önle (Manyetik çarpışma sınırı)
      const personsInRank = persons.filter(p => (ranks.get(p.id) || 0) === pRank);
      const otherUnits: Array<{ x: number; width: number }> = [];
      const processed = new Set<string>([node.id]);
      const mySpouses = Array.from(spousesMap.get(node.id) || []);
      mySpouses.forEach(s => processed.add(s));

      for (const p of personsInRank) {
        if (processed.has(p.id)) continue;
        const spouses = Array.from(spousesMap.get(p.id) || []).filter(sId => personsInRank.some(x => x.id === sId));
        if (spouses.length > 0) {
          const spouseId = spouses[0];
          processed.add(p.id);
          processed.add(spouseId);
          const sPerson = personsInRank.find(x => x.id === spouseId);
          const p1X = p.positionX ?? 80;
          const p2X = sPerson?.positionX ?? (p1X + nodeWidth + spouseGap);
          otherUnits.push({ x: Math.min(p1X, p2X), width: nodeWidth * 2 + spouseGap });
        } else {
          processed.add(p.id);
          otherUnits.push({ x: p.positionX ?? 80, width: nodeWidth });
        }
      }

      const minGap = 40;
      let currentX = Math.round(node.position.x);

      // Eşlerin yeri sadece tuş ile değiştirilir: Sürükleme esnasında eşin diğer tarafına geçilemez!
      const mySpouseList = Array.from(spousesMap.get(node.id) || []).filter(sId => personsInRank.some(x => x.id === sId));
      if (mySpouseList.length > 0) {
        const spouseId = mySpouseList[0];
        const sPerson = personsInRank.find(x => x.id === spouseId);
        const myPrevPerson = persons.find(x => x.id === node.id);
        const myPrevX = myPrevPerson?.positionX ?? 80;
        const spousePrevX = sPerson?.positionX ?? (myPrevX + nodeWidth + spouseGap);

        if (myPrevX <= spousePrevX) {
          // Bu kişi SOLDAKİ eş: Sağdaki eşin solunda kalmalıdır
          const maxAllowedX = Math.round(spousePrevX - nodeWidth - spouseGap);
          if (currentX > maxAllowedX) {
            currentX = maxAllowedX;
          }
        } else {
          // Bu kişi SAĞDAKİ eş: Soldaki eşin sağında kalmalıdır
          const minAllowedX = Math.round(spousePrevX + nodeWidth + spouseGap);
          if (currentX < minAllowedX) {
            currentX = minAllowedX;
          }
        }
      }

      for (const u of otherUnits) {
        const leftLimit = u.x - nodeWidth - minGap;
        const rightLimit = u.x + u.width + minGap;
        if (currentX > leftLimit && currentX < rightLimit) {
          const myCenter = currentX + nodeWidth / 2;
          const unitCenter = u.x + u.width / 2;
          if (myCenter < unitCenter) {
            currentX = leftLimit;
          } else {
            currentX = rightLimit;
          }
        }
      }
      node.position.x = Math.max(80, currentX);
    },
    [ranks, persons, spousesMap, nodeHeight, genDist, nodeWidth, spouseGap]
  );

  const backgroundPattern = useMemo(() => {
    switch (settings.backgroundVariant) {
      case 'dots':
        return BackgroundVariant.Dots;
      case 'lines':
        return BackgroundVariant.Lines;
      case 'cross':
        return BackgroundVariant.Cross;
      default:
        return undefined;
    }
  }, [settings.backgroundVariant]);

  if (persons.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-slate-950">
        <div className="max-w-md p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 animate-scale-in">
          <div className="w-16 h-16 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 mx-auto flex items-center justify-center">
            <Heart className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Ailenizi Oluşturmaya Başlayın
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Aile ağacınız şu anda boş. İlk aile üyenizi ekleyerek başlayın, ardından eş, çocuk, kardeş ve diğer akrabalık bağlarını oluşturun.
          </p>
          <button
            onClick={onAddNewPerson}
            className="w-full py-3 px-5 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white text-sm font-bold rounded-2xl shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            İlk Kişiyi Ekle
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeDrag={handleNodeDrag}
        onNodeDragStop={handleNodeDragStop}
        connectionMode={ConnectionMode.Loose}
        minZoom={0.1}
        maxZoom={2.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.9 }}
        fitViewOptions={{ padding: 0.2, duration: 600 }}
        proOptions={{ hideAttribution: true }}
      >
        {backgroundPattern && (
          <Background
            variant={backgroundPattern}
            gap={20}
            size={1.5}
            color={isDarkMode ? '#334155' : '#cbd5e1'}
          />
        )}
        <Controls
          className="!bg-white/90 dark:!bg-slate-900/90 !border-slate-200 dark:!border-slate-800 !shadow-lg !rounded-2xl overflow-hidden [&>button]:!border-b-slate-100 dark:[&>button]:!border-b-slate-800 dark:[&>button]:!fill-slate-200"
          showInteractive={false}
        />
        <MiniMap
          className="!bg-white/90 dark:!bg-slate-900/90 !border-slate-200 dark:!border-slate-800 !rounded-2xl !shadow-xl !overflow-hidden hidden md:block"
          nodeColor={(n) => {
            const p = persons.find(person => person.id === n.id);
            if (p?.gender === 'female') return '#ec4899';
            if (p?.gender === 'male') return '#0284c7';
            return '#64748b';
          }}
          maskColor={isDarkMode ? 'rgba(15, 23, 42, 0.7)' : 'rgba(241, 245, 249, 0.7)'}
        />
      </ReactFlow>
    </div>
  );
};
