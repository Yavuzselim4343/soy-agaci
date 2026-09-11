import { Person, Relationship, TreeSettings } from '../types/familyTree';

export interface LayoutOptions {
  direction?: 'TB' | 'LR';
  nodeWidth?: number;
  nodeHeight?: number;
  generationDistance?: number;
  spouseDistance?: number;
  siblingDistance?: number;
}

export function calculateFamilyTreeLayout(
  persons: Person[],
  relationships: Relationship[],
  settings: Partial<TreeSettings> = {}
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  if (persons.length === 0) return positions;

  const nodeWidth = settings.nodeWidth || 240;
  const nodeHeight = settings.nodeHeight || 120;
  const genDist = settings.generationDistance || 190;
  const spouseGap = settings.spouseDistance || 60;
  const siblingGap = settings.siblingDistance || 60;

  const personMap = new Map<string, Person>(persons.map(p => [p.id, p]));

  // 1. İlişki Grafı Kümeleri
  const spousesOf = new Map<string, Set<string>>();
  const childrenOf = new Map<string, Set<string>>();
  const parentsOf = new Map<string, Set<string>>();
  const siblingsOf = new Map<string, Set<string>>();
  const grandchildrenOf = new Map<string, Set<string>>();
  const nephewsOf = new Map<string, Set<string>>();
  const cousinsOf = new Map<string, Set<string>>();

  persons.forEach(p => {
    spousesOf.set(p.id, new Set());
    childrenOf.set(p.id, new Set());
    parentsOf.set(p.id, new Set());
    siblingsOf.set(p.id, new Set());
    grandchildrenOf.set(p.id, new Set());
    nephewsOf.set(p.id, new Set());
    cousinsOf.set(p.id, new Set());
  });

  relationships.forEach(rel => {
    const s = rel.sourcePersonId;
    const t = rel.targetPersonId;
    if (!personMap.has(s) || !personMap.has(t)) return;

    if (rel.type === 'spouse') {
      spousesOf.get(s)?.add(t);
      spousesOf.get(t)?.add(s);
    } else if (rel.type === 'child' || rel.type === 'step_child' || rel.type === 'adopted') {
      childrenOf.get(s)?.add(t);
      parentsOf.get(t)?.add(s);
    } else if (rel.type === 'parent') {
      parentsOf.get(s)?.add(t);
      childrenOf.get(t)?.add(s);
    } else if (rel.type === 'sibling') {
      siblingsOf.get(s)?.add(t);
      siblingsOf.get(t)?.add(s);
    } else if (rel.type === 'grandfather' || rel.type === 'grandmother') {
      grandchildrenOf.get(s)?.add(t);
    } else if (rel.type === 'grandchild') {
      grandchildrenOf.get(t)?.add(s);
    } else if (rel.type === 'uncle' || rel.type === 'aunt') {
      nephewsOf.get(s)?.add(t);
    } else if (rel.type === 'nephew_niece') {
      nephewsOf.get(t)?.add(s);
    } else if (rel.type === 'cousin') {
      cousinsOf.get(s)?.add(t);
      cousinsOf.get(t)?.add(s);
    }
  });

  // 2. Kuşak (Rank) Hesaplama - Tüm Akrabalık Tiplerine Göre
  const ranks = new Map<string, number>();
  persons.forEach(p => ranks.set(p.id, 0));

  let changed = true;
  let iterations = 0;
  while (changed && iterations < 50) {
    changed = false;
    iterations++;

    // Çocuklar = Ebeveyn + 1
    for (const [parentId, children] of childrenOf.entries()) {
      const pRank = ranks.get(parentId) || 0;
      for (const childId of children) {
        const cRank = ranks.get(childId) || 0;
        if (cRank < pRank + 1) {
          ranks.set(childId, pRank + 1);
          changed = true;
        }
      }
    }

    // Eşler aynı kuşaktadır
    for (const [id, spouses] of spousesOf.entries()) {
      const myRank = ranks.get(id) || 0;
      for (const spouseId of spouses) {
        const sRank = ranks.get(spouseId) || 0;
        const maxR = Math.max(myRank, sRank);
        if (myRank !== maxR) { ranks.set(id, maxR); changed = true; }
        if (sRank !== maxR) { ranks.set(spouseId, maxR); changed = true; }
      }
    }

    // Kardeşler aynı kuşaktadır
    for (const [id, sibs] of siblingsOf.entries()) {
      const myRank = ranks.get(id) || 0;
      for (const sibId of sibs) {
        const sibRank = ranks.get(sibId) || 0;
        const maxR = Math.max(myRank, sibRank);
        if (myRank !== maxR) { ranks.set(id, maxR); changed = true; }
        if (sibRank !== maxR) { ranks.set(sibId, maxR); changed = true; }
      }
    }

    // Torunlar >= Dede/Nine + 2
    for (const [gpId, gChildren] of grandchildrenOf.entries()) {
      const gpRank = ranks.get(gpId) || 0;
      for (const gcId of gChildren) {
        const gcRank = ranks.get(gcId) || 0;
        if (gcRank < gpRank + 2) {
          ranks.set(gcId, gpRank + 2);
          changed = true;
        }
      }
    }

    // Yeğenler >= Amca/Hala/Dayı/Teyze + 1
    for (const [uId, nephews] of nephewsOf.entries()) {
      const uRank = ranks.get(uId) || 0;
      for (const nId of nephews) {
        const nRank = ranks.get(nId) || 0;
        if (nRank < uRank + 1) {
          ranks.set(nId, uRank + 1);
          changed = true;
        }
      }
    }

    // Kuzenler aynı kuşaktadır
    for (const [cId, cousins] of cousinsOf.entries()) {
      const myRank = ranks.get(cId) || 0;
      for (const otherId of cousins) {
        const oRank = ranks.get(otherId) || 0;
        const maxR = Math.max(myRank, oRank);
        if (myRank !== maxR) { ranks.set(cId, maxR); changed = true; }
        if (oRank !== maxR) { ranks.set(otherId, maxR); changed = true; }
      }
    }
  }

  // Kuşak normalizasyonu (En üst kuşak her zaman 0'dan başlar)
  const minRank = Math.min(...Array.from(ranks.values()));
  if (minRank !== 0) {
    for (const [id, r] of ranks.entries()) {
      ranks.set(id, r - minRank);
    }
  }

  const maxRank = Math.max(0, ...Array.from(ranks.values()));

  // 3. Aile Birimleri (Units): Çiftler (Couples) ve Bekarlar (Singles)
  class Unit {
    p1: string;
    p2: string | null;
    rank: number;
    isCouple: boolean;
    width: number;
    x: number;
    children: string[];
    subtreeWidth: number;

    constructor(p1: string, p2: string | null = null, rank = 0) {
      this.p1 = p1;
      this.p2 = p2;
      this.rank = rank;
      this.isCouple = !!p2;
      this.width = this.isCouple ? (nodeWidth * 2 + spouseGap) : nodeWidth;
      this.x = 0;
      this.children = [];
      this.subtreeWidth = this.width;
    }
  }

  const unitsByRank = new Map<number, Unit[]>();
  for (let r = 0; r <= maxRank; r++) unitsByRank.set(r, []);

  const processedPersons = new Set<string>();

  for (let r = 0; r <= maxRank; r++) {
    const personsInRank = persons.filter(p => ranks.get(p.id) === r);
    const units: Unit[] = [];

    // Deterministik sıralama (önce doğum tarihi / id)
    personsInRank.sort((a, b) => {
      if (a.birthDate && b.birthDate) return a.birthDate.localeCompare(b.birthDate);
      return (a.createdAt || a.id).localeCompare(b.createdAt || b.id);
    });

    for (const p of personsInRank) {
      if (processedPersons.has(p.id)) continue;

      const spouses = Array.from(spousesOf.get(p.id) || []).filter(sId => ranks.get(sId) === r);
      if (spouses.length > 0) {
        const spouseId = spouses[0];
        processedPersons.add(p.id);
        processedPersons.add(spouseId);

        const unit = new Unit(p.id, spouseId, r);
        const c1 = Array.from(childrenOf.get(p.id) || []);
        const c2 = Array.from(childrenOf.get(spouseId) || []);
        const allChildren = Array.from(new Set([...c1, ...c2])).filter(cId => ranks.get(cId) === r + 1);
        unit.children = allChildren;

        units.push(unit);
      } else {
        processedPersons.add(p.id);
        const unit = new Unit(p.id, null, r);
        const allChildren = Array.from(childrenOf.get(p.id) || []).filter(cId => ranks.get(cId) === r + 1);
        unit.children = allChildren;

        units.push(unit);
      }
    }

    unitsByRank.set(r, units);
  }

  // 4. Alt Ağaç Genişlikleri (Subtree Width) - Bottom-Up
  for (let r = maxRank; r >= 0; r--) {
    const units = unitsByRank.get(r) || [];
    const nextRankUnits = unitsByRank.get(r + 1) || [];

    for (const unit of units) {
      if (unit.children.length === 0 || r === maxRank) {
        unit.subtreeWidth = unit.width;
      } else {
        const childUnits: Unit[] = [];
        const seenChildUnits = new Set<Unit>();
        for (const cId of unit.children) {
          const cu = nextRankUnits.find(u => u.p1 === cId || u.p2 === cId);
          if (cu && !seenChildUnits.has(cu)) {
            seenChildUnits.add(cu);
            childUnits.push(cu);
          }
        }

        if (childUnits.length === 0) {
          unit.subtreeWidth = unit.width;
        } else {
          let totalW = 0;
          childUnits.forEach((cu, idx) => {
            totalW += cu.subtreeWidth;
            if (idx > 0) totalW += siblingGap;
          });
          unit.subtreeWidth = Math.max(unit.width, totalW);
        }
      }
    }
  }

  // 5. Üstten Aşağıya Hiyerarşik Merkezleme (Top-Down Centering)
  function layoutChildren(unit: Unit, unitCenterX: number, rank: number) {
    if (unit.children.length === 0 || rank >= maxRank) return;
    const nextRankUnits = unitsByRank.get(rank + 1) || [];
    const childUnits: Unit[] = [];
    const seen = new Set<Unit>();
    for (const cId of unit.children) {
      const cu = nextRankUnits.find(u => u.p1 === cId || u.p2 === cId);
      if (cu && !seen.has(cu)) {
        seen.add(cu);
        childUnits.push(cu);
      }
    }
    if (childUnits.length === 0) return;

    let totalChildW = 0;
    childUnits.forEach((cu, idx) => {
      totalChildW += cu.subtreeWidth;
      if (idx > 0) totalChildW += siblingGap;
    });

    let curX = unitCenterX - totalChildW / 2;
    for (const cu of childUnits) {
      const cuCenterX = curX + cu.subtreeWidth / 2;
      cu.x = cuCenterX - cu.width / 2;
      layoutChildren(cu, cuCenterX, rank + 1);
      curX += cu.subtreeWidth + siblingGap;
    }
  }

  // Rank 0 yerleşimi
  let rootX = 80;
  const rank0Units = unitsByRank.get(0) || [];
  for (const u of rank0Units) {
    const uCenterX = rootX + u.subtreeWidth / 2;
    u.x = uCenterX - u.width / 2;
    layoutChildren(u, uCenterX, 0);
    rootX += u.subtreeWidth + siblingGap * 2;
  }

  // Üstten bağlanmamış diğer bağımsız birimler için yerleşim
  for (let r = 1; r <= maxRank; r++) {
    const units = unitsByRank.get(r) || [];
    let curX = 80;
    for (const u of units) {
      if (u.x === 0 && !rank0Units.includes(u)) {
        const uCenterX = curX + u.subtreeWidth / 2;
        u.x = uCenterX - u.width / 2;
        layoutChildren(u, uCenterX, r);
        curX += u.subtreeWidth + siblingGap * 2;
      }
    }
  }

  // 6. Her Kuşakta Çakışmaları Kesin Olarak Çöz (Collision Resolution)
  function shiftSubtree(unit: Unit, delta: number, r: number) {
    if (r >= maxRank) return;
    const nextRankUnits = unitsByRank.get(r + 1) || [];
    for (const cId of unit.children) {
      const cu = nextRankUnits.find(u => u.p1 === cId || u.p2 === cId);
      if (cu) {
        cu.x += delta;
        shiftSubtree(cu, delta, r + 1);
      }
    }
  }

  for (let r = 0; r <= maxRank; r++) {
    const units = unitsByRank.get(r) || [];
    if (units.length <= 1) continue;
    units.sort((a, b) => a.x - b.x);

    let minX = 80;
    for (const u of units) {
      if (u.x < minX) {
        const delta = minX - u.x;
        u.x = minX;
        shiftSubtree(u, delta, r);
      }
      minX = u.x + u.width + siblingGap;
    }
  }

  // 7. Ebeveynleri Çocuklarının Tam Üstüne Hizala (Bottom-Up Parent Re-centering)
  for (let r = maxRank - 1; r >= 0; r--) {
    const units = unitsByRank.get(r) || [];
    const nextRankUnits = unitsByRank.get(r + 1) || [];

    for (const u of units) {
      if (u.children.length > 0) {
        const childXs: number[] = [];
        for (const cId of u.children) {
          const cu = nextRankUnits.find(cu => cu.p1 === cId || cu.p2 === cId);
          if (cu) {
            if (cu.isCouple) {
              const pX = cu.p1 === cId ? cu.x + nodeWidth / 2 : cu.x + nodeWidth + spouseGap + nodeWidth / 2;
              childXs.push(pX);
            } else {
              childXs.push(cu.x + cu.width / 2);
            }
          }
        }

        if (childXs.length > 0) {
          const minChildX = Math.min(...childXs);
          const maxChildX = Math.max(...childXs);
          const targetCenterX = (minChildX + maxChildX) / 2;
          u.x = targetCenterX - u.width / 2;
        }
      }
    }

    units.sort((a, b) => a.x - b.x);
    let minX = 80;
    for (const u of units) {
      if (u.x < minX) {
        u.x = minX;
      }
      minX = u.x + u.width + siblingGap;
    }
  }

  // 8. Pozisyonları Kesin ve Sabit Y Koordinatlarıyla Haritaya Yaz (Aynı Kuşaklar Kesinlikle Aynı Y Seviyesindedir)
  for (let r = 0; r <= maxRank; r++) {
    const units = unitsByRank.get(r) || [];
    const fixedY = r * (nodeHeight + genDist) + 80;

    for (const u of units) {
      if (u.isCouple) {
        const p1 = personMap.get(u.p1);
        const p2 = personMap.get(u.p2!);

        let leftId = u.p1;
        let rightId = u.p2!;
        if (p1?.positionX !== undefined && p2?.positionX !== undefined) {
          if (p1.positionX > p2.positionX) {
            leftId = u.p2!;
            rightId = u.p1;
          } else {
            leftId = u.p1;
            rightId = u.p2!;
          }
        } else if (p1?.gender === 'female' && p2?.gender === 'male') {
          leftId = u.p2!;
          rightId = u.p1;
        }

        positions.set(leftId, { x: Math.round(u.x), y: fixedY });
        positions.set(rightId, { x: Math.round(u.x + nodeWidth + spouseGap), y: fixedY });
      } else {
        positions.set(u.p1, { x: Math.round(u.x), y: fixedY });
      }
    }
  }

  // Güvenlik Ağı
  persons.forEach(p => {
    if (!positions.has(p.id)) {
      const r = ranks.get(p.id) || 0;
      positions.set(p.id, { x: 80, y: r * (nodeHeight + genDist) + 80 });
    }
  });

  // Normalizasyon: Sol kenar 80px
  const allX = Array.from(positions.values()).map(p => p.x);
  const minX = Math.min(...allX);
  if (minX !== 80) {
    const offset = 80 - minX;
    positions.forEach(p => { p.x += offset; });
  }

  return positions;
}
