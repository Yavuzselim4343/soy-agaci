import { useCallback, useEffect } from 'react';
import { FamilyTreeData, Person, Relationship, RelationshipTypeDefinition, TreeSettings } from '../types/familyTree';
import { useLocalStorage } from './useLocalStorage';
import { useHistory } from './useHistory';
import { createTestFamilyData } from '../utils/sampleData';
import { calculateFamilyTreeLayout } from '../utils/layout';
import { validateRelationship, autoSyncFamilyRelationships } from '../utils/relationships';

const STORAGE_KEY = 'aile_agaci_current_tree_v2';

export function useFamilyTree() {
  const initialTree = createTestFamilyData();
  const [persistedTree, setPersistedTree] = useLocalStorage<FamilyTreeData>(STORAGE_KEY, initialTree);
  
  const {
    state: treeData,
    setState: setTreeData,
    undo,
    redo,
    canUndo,
    canRedo,
    resetHistory
  } = useHistory(persistedTree);

  useEffect(() => {
    setPersistedTree(treeData);
  }, [treeData, setPersistedTree]);

  // Yalnızca kullanıcı üst bardaki "Otomatik Düzenle" butonuna bastığında tüm ağaç baştan dizilir
  const runAutoLayout = useCallback(() => {
    setTreeData(prev => {
      const syncedRelationships = autoSyncFamilyRelationships(prev.relationships, prev.persons);
      const positions = calculateFamilyTreeLayout(prev.persons, syncedRelationships, prev.settings);
      const updatedPersons = prev.persons.map(p => {
        const pos = positions.get(p.id);
        if (pos) {
          return { ...p, positionX: pos.x, positionY: pos.y, updatedAt: new Date().toISOString() };
        }
        return p;
      });

      return {
        ...prev,
        relationships: syncedRelationships,
        persons: updatedPersons,
        updatedAt: new Date().toISOString()
      };
    }, true);
  }, [setTreeData]);

  // Yeni bağımsız kişi ekleme: Mevcut kişilerin yerleri ASLA bozulmaz!
  const addPerson = useCallback((personInput: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = `person-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    setTreeData(prev => {
      const nodeWidth = prev.settings.nodeWidth || 240;
      const siblingGap = prev.settings.siblingDistance || 60;

      let newX = 80;
      let newY = 80;

      if (prev.persons.length > 0) {
        // En üst kuşaktaki (Y ~ 80) kişilerin en sağına temizce ekle
        const topRow = prev.persons.filter(p => (p.positionY ?? 80) < 150);
        if (topRow.length > 0) {
          const maxX = Math.max(...topRow.map(p => p.positionX ?? 80));
          newX = maxX + nodeWidth + siblingGap;
          newY = 80;
        } else {
          const maxX = Math.max(...prev.persons.map(p => p.positionX ?? 80));
          newX = maxX + nodeWidth + siblingGap;
          newY = 80;
        }
      }

      const newPerson: Person = {
        ...personInput,
        id,
        positionX: newX,
        positionY: newY,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const newPersons = [...prev.persons, newPerson];
      const syncedRels = autoSyncFamilyRelationships(prev.relationships, newPersons);

      return {
        ...prev,
        persons: newPersons,
        relationships: syncedRels,
        updatedAt: new Date().toISOString()
      };
    });

    return id;
  }, [setTreeData]);

  const updatePerson = useCallback((id: string, updates: Partial<Person>) => {
    setTreeData(prev => ({
      ...prev,
      persons: prev.persons.map(p => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p)),
      updatedAt: new Date().toISOString()
    }));
  }, [setTreeData]);

  // Kişi silme: Kalan kişilerin yerleri ASLA bozulmaz
  const deletePerson = useCallback((id: string) => {
    setTreeData(prev => {
      const remainingPersons = prev.persons.filter(p => p.id !== id);
      const remainingRelationships = prev.relationships.filter(
        r => r.sourcePersonId !== id && r.targetPersonId !== id
      );

      return {
        ...prev,
        persons: remainingPersons,
        relationships: remainingRelationships,
        updatedAt: new Date().toISOString()
      };
    });
  }, [setTreeData]);

  // Mevcut iki kişi arasında ilişki kurma: Kişilerin yerleri ASLA bozulmaz
  const addRelationship = useCallback((
    sourcePersonId: string,
    targetPersonId: string,
    type: string,
    options?: {
      color?: string;
      lineStyle?: 'solid' | 'dashed' | 'dotted';
      lineWidth?: number;
      customLabel?: string;
    }
  ) => {
    const validation = validateRelationship(sourcePersonId, targetPersonId, type, treeData.relationships);
    if (!validation.valid) {
      throw new Error(validation.message);
    }

    const newRel: Relationship = {
      id: `rel-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sourcePersonId,
      targetPersonId,
      type,
      customLabel: options?.customLabel,
      color: options?.color,
      lineStyle: options?.lineStyle,
      lineWidth: options?.lineWidth,
      createdAt: new Date().toISOString()
    };

    setTreeData(prev => {
      const initialNewRelationships = [...prev.relationships, newRel];
      const syncedRelationships = autoSyncFamilyRelationships(initialNewRelationships, prev.persons);

      return {
        ...prev,
        relationships: syncedRelationships,
        updatedAt: new Date().toISOString()
      };
    });

    return newRel.id;
  }, [treeData.relationships, setTreeData]);

  const addMultipleRelationships = useCallback((
    items: Array<{ sourceId: string; targetId: string; type: string }>
  ) => {
    setTreeData(prev => {
      const newRels: Relationship[] = items.map((item, idx) => ({
        id: `rel-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
        sourcePersonId: item.sourceId,
        targetPersonId: item.targetId,
        type: item.type,
        createdAt: new Date().toISOString()
      }));

      const combined = [...prev.relationships, ...newRels];
      const synced = autoSyncFamilyRelationships(combined, prev.persons);

      return {
        ...prev,
        relationships: synced,
        updatedAt: new Date().toISOString()
      };
    });
  }, [setTreeData]);

  const updateRelationship = useCallback((id: string, updates: Partial<Relationship>) => {
    setTreeData(prev => ({
      ...prev,
      relationships: prev.relationships.map(r => (r.id === id ? { ...r, ...updates } : r)),
      updatedAt: new Date().toISOString()
    }));
  }, [setTreeData]);

  // İlişki silme: Kişilerin yerleri ASLA bozulmaz
  const deleteRelationship = useCallback((id: string) => {
    setTreeData(prev => {
      const remainingRelationships = prev.relationships.filter(r => r.id !== id);

      return {
        ...prev,
        relationships: remainingRelationships,
        updatedAt: new Date().toISOString()
      };
    });
  }, [setTreeData]);

  // Var olan birine ilişkili yeni kişi ekleme (Eş, Çocuk vb.):
  // Var olan kişilerin yerleri korunur! Eş hemen yanına, çocuk altına eklenir!
  const createPersonWithRelationship = useCallback((
    personInput: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>,
    existingPersonId: string,
    relationshipType: string,
    relationshipDirection: 'existing_is_source' | 'new_is_source' = 'existing_is_source'
  ) => {
    const newPersonId = `person-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const sourceId = relationshipDirection === 'existing_is_source' ? existingPersonId : newPersonId;
    const targetId = relationshipDirection === 'existing_is_source' ? newPersonId : existingPersonId;

    const newRel: Relationship = {
      id: `rel-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sourcePersonId: sourceId,
      targetPersonId: targetId,
      type: relationshipType,
      createdAt: new Date().toISOString()
    };

    setTreeData(prev => {
      const nodeWidth = prev.settings.nodeWidth || 240;
      const nodeHeight = prev.settings.nodeHeight || 120;
      const genDist = prev.settings.generationDistance || 190;
      const spouseGap = prev.settings.spouseDistance || 60;
      const siblingGap = prev.settings.siblingDistance || 60;

      const existing = prev.persons.find(p => p.id === existingPersonId);
      const eX = existing?.positionX ?? 100;
      const eY = existing?.positionY ?? 80;

      let newX = eX;
      let newY = eY;
      let shiftedPersons = [...prev.persons];

      if (relationshipType === 'spouse') {
        // EŞ EKLEME: Var olan kişinin hemen yanına ekle!
        newY = eY;
        newX = eX + nodeWidth + spouseGap;

        // Eğer mevcut kişinin sağında aynı hizada başka kişiler varsa, yeni eş için yer açacak kadar sağa kaydır
        const shiftAmount = nodeWidth + spouseGap;
        shiftedPersons = shiftedPersons.map(p => {
          if (p.id !== existingPersonId && Math.abs((p.positionY ?? 80) - eY) < 50 && (p.positionX ?? 0) > eX) {
            return { ...p, positionX: (p.positionX ?? 0) + shiftAmount };
          }
          return p;
        });
      } else if (relationshipType === 'child' || relationshipType === 'step_child' || relationshipType === 'adopted') {
        // ÇOCUK EKLEME: Ebeveynin / çiftin tam altına ekle!
        newY = eY + nodeHeight + genDist;

        // Ebeveynin eşi var mı kontrol et
        const spouseRel = prev.relationships.find(
          r => r.type === 'spouse' && (r.sourcePersonId === existingPersonId || r.targetPersonId === existingPersonId)
        );
        const spouseId = spouseRel ? (spouseRel.sourcePersonId === existingPersonId ? spouseRel.targetPersonId : spouseRel.sourcePersonId) : null;
        const spousePerson = spouseId ? prev.persons.find(p => p.id === spouseId) : null;

        const coupleCenterX = spousePerson && spousePerson.positionX !== undefined
          ? (Math.min(eX, spousePerson.positionX) + Math.max(eX, spousePerson.positionX) + nodeWidth) / 2
          : (eX + nodeWidth / 2);

        // Bu kişinin/çiftin mevcut çocukları var mı?
        const existingChildRels = prev.relationships.filter(
          r => (r.type === 'child' || r.type === 'step_child' || r.type === 'adopted') && r.sourcePersonId === existingPersonId
        );
        const existingChildren = prev.persons.filter(
          p => existingChildRels.some(r => r.targetPersonId === p.id) && p.positionX !== undefined
        );

        if (existingChildren.length > 0) {
          const maxChildX = Math.max(...existingChildren.map(c => c.positionX!));
          newX = maxChildX + nodeWidth + siblingGap;
        } else {
          newX = Math.round(coupleCenterX - nodeWidth / 2);
        }

        // Eğer o hizada sağda başka birileri varsa çakışmayı önlemek için sağa kaydır
        const shiftAmount = nodeWidth + siblingGap;
        shiftedPersons = shiftedPersons.map(p => {
          if (Math.abs((p.positionY ?? 0) - newY) < 50 && (p.positionX ?? 0) >= newX) {
            return { ...p, positionX: (p.positionX ?? 0) + shiftAmount };
          }
          return p;
        });
      } else if (relationshipType === 'parent') {
        // EBEVEYN EKLEME: Üst seviyeye ekle
        newY = Math.max(80, eY - (nodeHeight + genDist));
        newX = eX;
      } else if (relationshipType === 'sibling') {
        // KARDEŞ EKLEME: Aynı seviyede sağa ekle
        newY = eY;
        newX = eX + nodeWidth + siblingGap;
        const shiftAmount = nodeWidth + siblingGap;
        shiftedPersons = shiftedPersons.map(p => {
          if (p.id !== existingPersonId && Math.abs((p.positionY ?? 80) - eY) < 50 && (p.positionX ?? 0) >= newX) {
            return { ...p, positionX: (p.positionX ?? 0) + shiftAmount };
          }
          return p;
        });
      } else {
        // DİĞER İLİŞKİLER:
        newY = eY;
        newX = eX + nodeWidth + siblingGap;
      }

      const newPerson: Person = {
        ...personInput,
        id: newPersonId,
        positionX: newX,
        positionY: newY,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const finalPersons = [...shiftedPersons, newPerson];
      const initialNewRelationships = [...prev.relationships, newRel];
      const syncedRelationships = autoSyncFamilyRelationships(initialNewRelationships, finalPersons);

      return {
        ...prev,
        persons: finalPersons,
        relationships: syncedRelationships,
        updatedAt: new Date().toISOString()
      };
    });

    return { personId: newPersonId, relationshipId: newRel.id };
  }, [setTreeData]);

  // Çoklu kişi (örneğin birden fazla çocuk) oluşturup tek seferde bağlama:
  // Mevcut kişilerin yerleri korunur, çocuklar ebeveynin altına yan yana dizilir!
  const createMultiplePersonsWithRelationship = useCallback((
    personsInput: Array<Omit<Person, 'id' | 'createdAt' | 'updatedAt'>>,
    existingPersonId: string,
    relationshipType: string,
    relationshipDirection: 'existing_is_source' | 'new_is_source' = 'existing_is_source'
  ) => {
    const newPersons: Person[] = personsInput.map((input, idx) => ({
      ...input,
      id: `person-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    const newRelationships: Relationship[] = newPersons.map((p, idx) => {
      const sourceId = relationshipDirection === 'existing_is_source' ? existingPersonId : p.id;
      const targetId = relationshipDirection === 'existing_is_source' ? p.id : existingPersonId;
      return {
        id: `rel-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
        sourcePersonId: sourceId,
        targetPersonId: targetId,
        type: relationshipType,
        createdAt: new Date().toISOString()
      };
    });

    setTreeData(prev => {
      const nodeWidth = prev.settings.nodeWidth || 240;
      const nodeHeight = prev.settings.nodeHeight || 120;
      const genDist = prev.settings.generationDistance || 190;
      const siblingGap = prev.settings.siblingDistance || 60;

      const existing = prev.persons.find(p => p.id === existingPersonId);
      const eX = existing?.positionX ?? 100;
      const eY = existing?.positionY ?? 80;

      const childY = eY + nodeHeight + genDist;

      // Çiftin merkezini bul
      const spouseRel = prev.relationships.find(
        r => r.type === 'spouse' && (r.sourcePersonId === existingPersonId || r.targetPersonId === existingPersonId)
      );
      const spouseId = spouseRel ? (spouseRel.sourcePersonId === existingPersonId ? spouseRel.targetPersonId : spouseRel.sourcePersonId) : null;
      const spousePerson = spouseId ? prev.persons.find(p => p.id === spouseId) : null;

      const coupleCenterX = spousePerson && spousePerson.positionX !== undefined
        ? (Math.min(eX, spousePerson.positionX) + Math.max(eX, spousePerson.positionX) + nodeWidth) / 2
        : (eX + nodeWidth / 2);

      // Mevcut kardeşler var mı?
      const existingChildRels = prev.relationships.filter(
        r => (r.type === 'child' || r.type === 'step_child' || r.type === 'adopted') && r.sourcePersonId === existingPersonId
      );
      const existingChildren = prev.persons.filter(
        p => existingChildRels.some(r => r.targetPersonId === p.id) && p.positionX !== undefined
      );

      let startX: number;
      const count = newPersons.length;
      const totalBatchWidth = count * nodeWidth + (count - 1) * siblingGap;

      if (existingChildren.length > 0) {
        const maxChildX = Math.max(...existingChildren.map(c => c.positionX!));
        startX = maxChildX + nodeWidth + siblingGap;
      } else {
        startX = Math.round(coupleCenterX - totalBatchWidth / 2);
      }

      let shiftedPersons = [...prev.persons];
      // Çakışan diğer kartları sağa kaydır
      shiftedPersons = shiftedPersons.map(p => {
        if (Math.abs((p.positionY ?? 0) - childY) < 50 && (p.positionX ?? 0) >= startX) {
          return { ...p, positionX: (p.positionX ?? 0) + totalBatchWidth + siblingGap };
        }
        return p;
      });

      const positionedNewPersons = newPersons.map((p, idx) => ({
        ...p,
        positionX: startX + idx * (nodeWidth + siblingGap),
        positionY: childY
      }));

      const finalPersons = [...shiftedPersons, ...positionedNewPersons];
      const combinedRelationships = [...prev.relationships, ...newRelationships];
      const syncedRelationships = autoSyncFamilyRelationships(combinedRelationships, finalPersons);

      return {
        ...prev,
        persons: finalPersons,
        relationships: syncedRelationships,
        updatedAt: new Date().toISOString()
      };
    });

    return newPersons.map(p => p.id);
  }, [setTreeData]);

  const updateNodePosition = useCallback((id: string, x: number, y: number) => {
    setTreeData(prev => ({
      ...prev,
      persons: prev.persons.map(p => (p.id === id ? { ...p, positionX: x, positionY: y } : p))
    }), false);
  }, [setTreeData]);

  const updateMultipleNodePositions = useCallback((positions: Array<{ id: string; x: number; y: number }>) => {
    const posMap = new Map(positions.map(p => [p.id, p]));
    setTreeData(prev => ({
      ...prev,
      persons: prev.persons.map(p => {
        const update = posMap.get(p.id);
        return update ? { ...p, positionX: update.x, positionY: update.y } : p;
      })
    }), false);
  }, [setTreeData]);

  const addCustomRelationshipType = useCallback((typeDef: RelationshipTypeDefinition) => {
    setTreeData(prev => ({
      ...prev,
      customRelationshipTypes: [...prev.customRelationshipTypes.filter(t => t.id !== typeDef.id), typeDef],
      updatedAt: new Date().toISOString()
    }));
  }, [setTreeData]);

  const updateSettings = useCallback((newSettings: Partial<TreeSettings>) => {
    setTreeData(prev => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings },
      updatedAt: new Date().toISOString()
    }));
  }, [setTreeData]);

  const loadTree = useCallback((newTree: FamilyTreeData) => {
    const syncedRels = autoSyncFamilyRelationships(newTree.relationships, newTree.persons);
    const positions = calculateFamilyTreeLayout(newTree.persons, syncedRels, newTree.settings);
    const laidOutPersons = newTree.persons.map(p => {
      const pos = positions.get(p.id);
      return pos ? { ...p, positionX: p.positionX ?? pos.x, positionY: pos.y } : p;
    });

    const fullTree = {
      ...newTree,
      relationships: syncedRels,
      persons: laidOutPersons,
      updatedAt: new Date().toISOString()
    };

    resetHistory(fullTree);
  }, [resetHistory]);

  return {
    treeData,
    addPerson,
    updatePerson,
    deletePerson,
    addRelationship,
    addMultipleRelationships,
    updateRelationship,
    deleteRelationship,
    createPersonWithRelationship,
    createMultiplePersonsWithRelationship,
    updateNodePosition,
    updateMultipleNodePositions,
    runAutoLayout,
    addCustomRelationshipType,
    updateSettings,
    loadTree,
    undo,
    redo,
    canUndo,
    canRedo
  };
}
