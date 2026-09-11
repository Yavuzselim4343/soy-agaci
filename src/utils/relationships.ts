import { Relationship, RelationshipTypeDefinition, Person } from '../types/familyTree';

export const DEFAULT_RELATIONSHIP_TYPES: RelationshipTypeDefinition[] = [
  {
    id: 'spouse',
    name: 'spouse',
    label: 'Eş',
    color: '#ec4899',
    lineStyle: 'solid',
    lineWidth: 3,
    description: 'Evlilik veya hayat ortaklığı bağı. Yan yana konumlandırılır.',
    inverseType: 'spouse'
  },
  {
    id: 'child',
    name: 'child',
    label: 'Çocuk',
    color: '#0284c7',
    lineStyle: 'solid',
    lineWidth: 2,
    description: 'Ebeveynden çocuğa alt nesil bağı.',
    inverseType: 'parent'
  },
  {
    id: 'parent',
    name: 'parent',
    label: 'Anne / Baba',
    color: '#0284c7',
    lineStyle: 'solid',
    lineWidth: 2,
    description: 'Çocuktan ebeveyne üst nesil bağı.',
    inverseType: 'child'
  },
  {
    id: 'sibling',
    name: 'sibling',
    label: 'Kardeş',
    color: '#10b981',
    lineStyle: 'solid',
    lineWidth: 2,
    description: 'Aynı anne ve babadan olan kardeş bağı. Aynı nesil seviyesindedir.',
    inverseType: 'sibling'
  },
  {
    id: 'grandfather',
    name: 'grandfather',
    label: 'Dede',
    color: '#8b5cf6',
    lineStyle: 'solid',
    lineWidth: 2,
    description: '2 üst nesil erkek ata.',
    inverseType: 'grandchild'
  },
  {
    id: 'grandmother',
    name: 'grandmother',
    label: 'Nine / Anneanne / Babaanne',
    color: '#a855f7',
    lineStyle: 'solid',
    lineWidth: 2,
    description: '2 üst nesil kadın ata.',
    inverseType: 'grandchild'
  },
  {
    id: 'grandchild',
    name: 'grandchild',
    label: 'Torun',
    color: '#06b6d4',
    lineStyle: 'solid',
    lineWidth: 2,
    description: '2 alt nesil torun.',
    inverseType: 'grandfather'
  },
  {
    id: 'uncle',
    name: 'uncle',
    label: 'Amca / Dayı',
    color: '#f59e0b',
    lineStyle: 'solid',
    lineWidth: 2,
    description: 'Ebeveynin erkek kardeşi.',
    inverseType: 'nephew_niece'
  },
  {
    id: 'aunt',
    name: 'aunt',
    label: 'Hala / Teyze',
    color: '#f97316',
    lineStyle: 'solid',
    lineWidth: 2,
    description: 'Ebeveynin kız kardeşi.',
    inverseType: 'nephew_niece'
  },
  {
    id: 'nephew_niece',
    name: 'nephew_niece',
    label: 'Yeğen',
    color: '#14b8a6',
    lineStyle: 'solid',
    lineWidth: 2,
    description: 'Kardeşin çocuğu.',
    inverseType: 'uncle'
  },
  {
    id: 'cousin',
    name: 'cousin',
    label: 'Kuzen',
    color: '#6366f1',
    lineStyle: 'solid',
    lineWidth: 2,
    description: 'Amca, dayı, hala, teyze çocukları.',
    inverseType: 'cousin'
  },
  {
    id: 'step_child',
    name: 'step_child',
    label: 'Üvey Çocuk',
    color: '#84cc16',
    lineStyle: 'solid',
    lineWidth: 2,
    description: 'Eşin önceki evliliğinden olan çocuk.',
    inverseType: 'step_parent'
  },
  {
    id: 'adopted',
    name: 'adopted',
    label: 'Evlatlık',
    color: '#10b981',
    lineStyle: 'solid',
    lineWidth: 2,
    description: 'Evlat edinilen çocuk.',
    inverseType: 'parent'
  },
  {
    id: 'other',
    name: 'other',
    label: 'Diğer / Özel İlişki',
    color: '#64748b',
    lineStyle: 'solid',
    lineWidth: 2,
    description: 'Özel veya tanımlanmamış ilişki türü.'
  }
];

export function getRelationshipType(typeId: string, customTypes: RelationshipTypeDefinition[] = []): RelationshipTypeDefinition {
  const allTypes = [...DEFAULT_RELATIONSHIP_TYPES, ...customTypes];
  const found = allTypes.find(t => t.id === typeId || t.name === typeId);
  return (
    found || {
      id: typeId,
      name: typeId,
      label: typeId,
      color: '#64748b',
      lineStyle: 'solid',
      lineWidth: 2
    }
  );
}

export interface RelatedPersonInfo {
  person: Person;
  relationship: Relationship;
  typeDef: RelationshipTypeDefinition;
  roleInRel: 'source' | 'target';
  relationshipLabel: string;
}

export function getPersonRelations(personId: string, persons: Person[], relationships: Relationship[], customTypes: RelationshipTypeDefinition[] = []) {
  const personMap = new Map(persons.map(p => [p.id, p]));
  const spouses: Person[] = [];
  const children: Person[] = [];
  const parents: Person[] = [];
  const siblings: Person[] = [];
  const cousins: Person[] = [];
  const others: RelatedPersonInfo[] = [];

  for (const rel of relationships) {
    if (rel.sourcePersonId !== personId && rel.targetPersonId !== personId) continue;

    const isSource = rel.sourcePersonId === personId;
    const otherId = isSource ? rel.targetPersonId : rel.sourcePersonId;
    const otherPerson = personMap.get(otherId);
    if (!otherPerson) continue;

    const typeDef = getRelationshipType(rel.type, customTypes);
    const relInfo: RelatedPersonInfo = {
      person: otherPerson,
      relationship: rel,
      typeDef,
      roleInRel: isSource ? 'source' : 'target',
      relationshipLabel: typeDef.label
    };

    if (rel.type === 'spouse') {
      if (!spouses.some(s => s.id === otherPerson.id)) {
        spouses.push(otherPerson);
      }
    } else if (rel.type === 'child') {
      if (isSource) {
        if (!children.some(c => c.id === otherPerson.id)) children.push(otherPerson);
      } else {
        if (!parents.some(p => p.id === otherPerson.id)) parents.push(otherPerson);
      }
    } else if (rel.type === 'parent') {
      if (isSource) {
        if (!parents.some(p => p.id === otherPerson.id)) parents.push(otherPerson);
      } else {
        if (!children.some(c => c.id === otherPerson.id)) children.push(otherPerson);
      }
    } else if (rel.type === 'sibling') {
      if (!siblings.some(s => s.id === otherPerson.id)) siblings.push(otherPerson);
    } else if (rel.type === 'cousin') {
      if (!cousins.some(c => c.id === otherPerson.id)) cousins.push(otherPerson);
    } else {
      others.push(relInfo);
    }
  }

  return {
    spouses,
    children,
    parents,
    siblings,
    cousins,
    others
  };
}

export function validateRelationship(sourceId: string, targetId: string, type: string, existingRelationships: Relationship[]): { valid: boolean; message?: string } {
  if (!sourceId || !targetId) {
    return { valid: false, message: 'Lütfen her iki kişiyi de seçiniz.' };
  }
  if (sourceId === targetId) {
    return { valid: false, message: 'Bir kişi kendisiyle ilişkilendirilemez.' };
  }

  const duplicate = existingRelationships.find(r => {
    if (type === 'spouse' || type === 'sibling' || type === 'cousin') {
      return (
        r.type === type &&
        ((r.sourcePersonId === sourceId && r.targetPersonId === targetId) ||
         (r.sourcePersonId === targetId && r.targetPersonId === sourceId))
      );
    }
    return r.type === type && r.sourcePersonId === sourceId && r.targetPersonId === targetId;
  });

  if (duplicate) {
    return { valid: false, message: 'Bu iki kişi arasında bu ilişki zaten mevcut.' };
  }

  return { valid: true };
}

/**
 * Otomatik İlişki Çıkarımı ve Senkronizasyonu:
 * 1. Eş olan birine çocuk eklendiğinde, aynı çocuk otomatik olarak diğer eşe de bağlanır.
 * 2. Aynı anne ve babadan olan (veya aynı ebeveyn çiftinin ortak çocukları olan) çocuklar arasında otomatik "kardeş" (sibling) ilişkisi oluşturulur.
 */
export function autoSyncFamilyRelationships(
  currentRelationships: Relationship[],
  persons: Person[]
): Relationship[] {
  const rels: Relationship[] = [...currentRelationships];
  const personIds = new Set(persons.map(p => p.id));

  const hasRel = (sId: string, tId: string, type: string) => {
    return rels.some(r => {
      if (type === 'spouse' || type === 'sibling' || type === 'cousin') {
        return (
          r.type === type &&
          ((r.sourcePersonId === sId && r.targetPersonId === tId) ||
           (r.sourcePersonId === tId && r.targetPersonId === sId))
        );
      }
      return r.type === type && r.sourcePersonId === sId && r.targetPersonId === tId;
    });
  };

  const spousesOf = new Map<string, Set<string>>();
  const childrenOf = new Map<string, Set<string>>();
  const parentsOf = new Map<string, Set<string>>();

  persons.forEach(p => {
    spousesOf.set(p.id, new Set());
    childrenOf.set(p.id, new Set());
    parentsOf.set(p.id, new Set());
  });

  rels.forEach(r => {
    if (!personIds.has(r.sourcePersonId) || !personIds.has(r.targetPersonId)) return;

    if (r.type === 'spouse') {
      spousesOf.get(r.sourcePersonId)?.add(r.targetPersonId);
      spousesOf.get(r.targetPersonId)?.add(r.sourcePersonId);
    } else if (r.type === 'child' || r.type === 'step_child' || r.type === 'adopted') {
      childrenOf.get(r.sourcePersonId)?.add(r.targetPersonId);
      parentsOf.get(r.targetPersonId)?.add(r.sourcePersonId);
    } else if (r.type === 'parent') {
      childrenOf.get(r.targetPersonId)?.add(r.sourcePersonId);
      parentsOf.get(r.sourcePersonId)?.add(r.targetPersonId);
    }
  });

  // 1. Eşler arası çocuk senkronizasyonu:
  // Eğer Anne/Baba A'nın çocuğu C varsa ve A'nın eşi B varsa => B'ye de C çocuğu eklenir.
  for (const [parentId, children] of childrenOf.entries()) {
    const spouses = spousesOf.get(parentId) || new Set();
    for (const spouseId of spouses) {
      for (const childId of children) {
        if (!hasRel(spouseId, childId, 'child')) {
          rels.push({
            id: `rel-auto-sp-child-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            sourcePersonId: spouseId,
            targetPersonId: childId,
            type: 'child',
            createdAt: new Date().toISOString()
          });
          childrenOf.get(spouseId)?.add(childId);
          parentsOf.get(childId)?.add(spouseId);
        }
      }
    }
  }

  // 2. Aynı anne ve babadan olan çocuklar için otomatik kardeşlik ilişkisi:
  // İki çocuk C1 ve C2 aynı anne ve babaya (veya aynı ebeveyne) sahipse kardeş olurlar.
  const allChildren = Array.from(persons.map(p => p.id)).filter(id => (parentsOf.get(id)?.size || 0) > 0);

  for (let i = 0; i < allChildren.length; i++) {
    for (let j = i + 1; j < allChildren.length; j++) {
      const c1 = allChildren[i];
      const c2 = allChildren[j];
      const parents1 = parentsOf.get(c1) || new Set();
      const parents2 = parentsOf.get(c2) || new Set();

      // Aynı ebeveynleri paylaşıyorlarsa
      let sharesParent = false;
      for (const p of parents1) {
        if (parents2.has(p)) {
          sharesParent = true;
          break;
        }
      }

      if (sharesParent && !hasRel(c1, c2, 'sibling')) {
        rels.push({
          id: `rel-auto-sib-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          sourcePersonId: c1,
          targetPersonId: c2,
          type: 'sibling',
          createdAt: new Date().toISOString()
        });
      }
    }
  }

  // 3. Ebeveynlerin kardeşlerinin çocukları ile otomatik Kuzen (cousin) ilişkisi:
  const siblingsOf = new Map<string, Set<string>>();
  persons.forEach(p => siblingsOf.set(p.id, new Set()));

  rels.forEach(r => {
    if (r.type === 'sibling') {
      siblingsOf.get(r.sourcePersonId)?.add(r.targetPersonId);
      siblingsOf.get(r.targetPersonId)?.add(r.sourcePersonId);
    }
  });

  for (let i = 0; i < allChildren.length; i++) {
    for (let j = i + 1; j < allChildren.length; j++) {
      const c1 = allChildren[i];
      const c2 = allChildren[j];
      const p1List = parentsOf.get(c1) || new Set();
      const p2List = parentsOf.get(c2) || new Set();

      // Zaten kardeş iseler kuzen sayılmazlar
      if (hasRel(c1, c2, 'sibling')) continue;

      let parentsAreSiblings = false;
      for (const p1 of p1List) {
        const p1Sibs = siblingsOf.get(p1) || new Set();
        for (const p2 of p2List) {
          if (p1Sibs.has(p2)) {
            parentsAreSiblings = true;
            break;
          }
        }
        if (parentsAreSiblings) break;
      }

      if (parentsAreSiblings && !hasRel(c1, c2, 'cousin')) {
        rels.push({
          id: `rel-auto-cousin-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          sourcePersonId: c1,
          targetPersonId: c2,
          type: 'cousin',
          createdAt: new Date().toISOString()
        });
      }
    }
  }

  return rels;
}

