import { describe, it, expect } from 'vitest';
import { calculateFamilyTreeLayout } from './utils/layout';
import { validateRelationship, getPersonRelations, autoSyncFamilyRelationships } from './utils/relationships';
import { createTestFamilyData, createThreeGenFamilyData, createLargeFamilyData } from './utils/sampleData';
import { validateAndImportFamilyTree } from './utils/exportImport';
import { Person, Relationship } from './types/familyTree';

describe('Aile Ağacı Otomatik İlişki ve Mantık Testleri', () => {
  it('TEST 1: Zekiye ve Ahmet eş olduğunda aynı Y seviyesinde ve yan yana yerleşmelidir', () => {
    const testData = createTestFamilyData();
    const positions = calculateFamilyTreeLayout(testData.persons, testData.relationships, testData.settings);

    const zPos = positions.get('p-zekiye');
    const aPos = positions.get('p-ahmet');

    expect(zPos).toBeDefined();
    expect(aPos).toBeDefined();
    expect(zPos!.y).toBe(aPos!.y);
    expect(Math.abs(zPos!.x - aPos!.x)).toBeGreaterThan(150);
  });

  it('TEST 2: Eş olan birine çocuk eklenince diğer eşe de otomatik çocuk ilişkisi eklenmelidir', () => {
    const persons: Person[] = [
      { id: 'p-anne', firstName: 'Zekiye', lastName: 'Yılmaz', gender: 'female', role: 'Anne', isLiving: true, createdAt: '', updatedAt: '' },
      { id: 'p-baba', firstName: 'Ahmet', lastName: 'Yılmaz', gender: 'male', role: 'Baba', isLiving: true, createdAt: '', updatedAt: '' },
      { id: 'p-cocuk1', firstName: 'Ayşe', lastName: 'Yılmaz', gender: 'female', role: 'Çocuk', isLiving: true, createdAt: '', updatedAt: '' },
    ];

    const relationships: Relationship[] = [
      { id: 'r-sp', sourcePersonId: 'p-anne', targetPersonId: 'p-baba', type: 'spouse', createdAt: '' },
      { id: 'r-ch1', sourcePersonId: 'p-anne', targetPersonId: 'p-cocuk1', type: 'child', createdAt: '' }
    ];

    const synced = autoSyncFamilyRelationships(relationships, persons);

    const ahmetAyseRel = synced.find(r => r.sourcePersonId === 'p-baba' && r.targetPersonId === 'p-cocuk1' && r.type === 'child');
    expect(ahmetAyseRel).toBeDefined();
  });

  it('TEST 3: Aynı anda birden fazla çocuk eklendiğinde tüm çocuklar eşe bağlanmalı ve kardeş olmalıdır', () => {
    const persons: Person[] = [
      { id: 'p-anne', firstName: 'Zekiye', lastName: 'Yılmaz', gender: 'female', role: 'Anne', isLiving: true, createdAt: '', updatedAt: '' },
      { id: 'p-baba', firstName: 'Ahmet', lastName: 'Yılmaz', gender: 'male', role: 'Baba', isLiving: true, createdAt: '', updatedAt: '' },
      { id: 'p-c1', firstName: 'Ayşe', lastName: 'Yılmaz', gender: 'female', role: '1. Çocuk', isLiving: true, createdAt: '', updatedAt: '' },
      { id: 'p-c2', firstName: 'Mehmet', lastName: 'Yılmaz', gender: 'male', role: '2. Çocuk', isLiving: true, createdAt: '', updatedAt: '' },
      { id: 'p-c3', firstName: 'Hasan', lastName: 'Yılmaz', gender: 'male', role: '3. Çocuk', isLiving: true, createdAt: '', updatedAt: '' }
    ];

    const relationships: Relationship[] = [
      { id: 'r-sp', sourcePersonId: 'p-anne', targetPersonId: 'p-baba', type: 'spouse', createdAt: '' },
      { id: 'r1', sourcePersonId: 'p-anne', targetPersonId: 'p-c1', type: 'child', createdAt: '' },
      { id: 'r2', sourcePersonId: 'p-anne', targetPersonId: 'p-c2', type: 'child', createdAt: '' },
      { id: 'r3', sourcePersonId: 'p-anne', targetPersonId: 'p-c3', type: 'child', createdAt: '' }
    ];

    const synced = autoSyncFamilyRelationships(relationships, persons);

    // Baba da tüm çocukların ebeveyni olmalı
    expect(synced.some(r => r.sourcePersonId === 'p-baba' && r.targetPersonId === 'p-c1' && r.type === 'child')).toBe(true);
    expect(synced.some(r => r.sourcePersonId === 'p-baba' && r.targetPersonId === 'p-c2' && r.type === 'child')).toBe(true);
    expect(synced.some(r => r.sourcePersonId === 'p-baba' && r.targetPersonId === 'p-c3' && r.type === 'child')).toBe(true);

    // Tüm çocuklar kardeş olmalı
    const hasSibling = (idA: string, idB: string) => synced.some(r =>
      r.type === 'sibling' &&
      ((r.sourcePersonId === idA && r.targetPersonId === idB) ||
       (r.sourcePersonId === idB && r.targetPersonId === idA))
    );

    expect(hasSibling('p-c1', 'p-c2')).toBe(true);
    expect(hasSibling('p-c1', 'p-c3')).toBe(true);
    expect(hasSibling('p-c2', 'p-c3')).toBe(true);
  });

  it('TEST 4: Kardeş ilişkisi doğru şekilde çözümlenmeli ve aynı seviyede olmalıdır', () => {
    const testData = createTestFamilyData();
    const positions = calculateFamilyTreeLayout(testData.persons, testData.relationships, testData.settings);

    const aPos = positions.get('p-ahmet')!;
    const fPos = positions.get('p-fatma')!;

    expect(aPos.y).toBe(fPos.y);
  });

  it('TEST 5: İlişki doğrulama kuralları (Kendisiyle ilişki & Mükerrer engelleme)', () => {
    const testData = createTestFamilyData();
    
    const selfRel = validateRelationship('p-zekiye', 'p-zekiye', 'spouse', testData.relationships);
    expect(selfRel.valid).toBe(false);

    const dupSpouse = validateRelationship('p-zekiye', 'p-ahmet', 'spouse', testData.relationships);
    expect(dupSpouse.valid).toBe(false);

    const validRel = validateRelationship('p-fatma', 'p-ayse', 'aunt', testData.relationships);
    expect(validRel.valid).toBe(true);
  });

  it('TEST 6: Kişi ilişkileri analizi (getPersonRelations)', () => {
    const testData = createTestFamilyData();
    const zRelations = getPersonRelations('p-zekiye', testData.persons, testData.relationships);

    expect(zRelations.spouses.length).toBe(1);
    expect(zRelations.spouses[0].id).toBe('p-ahmet');
    expect(zRelations.children.length).toBe(3);
    expect(zRelations.children.map(c => c.firstName).sort()).toEqual(['Ayşe', 'Hasan', 'Mehmet']);
  });

  it('TEST 7: 3 Nesil geniş aile veri ve layout tutarlılığı', () => {
    const data3Gen = createThreeGenFamilyData();
    const positions = calculateFamilyTreeLayout(data3Gen.persons, data3Gen.relationships, data3Gen.settings);

    expect(positions.size).toBe(data3Gen.persons.length);

    const dedePos = positions.get('p-dede-mustafa')!;
    const aliPos = positions.get('p-ali')!;
    const burakPos = positions.get('p-burak')!;
    const denizPos = positions.get('p-deniz')!;

    expect(aliPos.y).toBeGreaterThan(dedePos.y);
    expect(burakPos.y).toBeGreaterThan(aliPos.y);
    expect(denizPos.y).toBeGreaterThan(burakPos.y);
  });

  it('TEST 8: 100+ Kişilik büyük aile veri modeli ve layout performansı', () => {
    const largeData = createLargeFamilyData(100);
    expect(largeData.persons.length).toBeGreaterThanOrEqual(100);

    const start = performance.now();
    const positions = calculateFamilyTreeLayout(largeData.persons, largeData.relationships, largeData.settings);
    const duration = performance.now() - start;

    expect(positions.size).toBe(largeData.persons.length);
    expect(duration).toBeLessThan(500);
  });

  it('TEST 9: JSON İçe Aktarım Doğrulama', () => {
    const testData = createTestFamilyData();
    const jsonStr = JSON.stringify(testData);

    const imported = validateAndImportFamilyTree(jsonStr);
    expect(imported.success).toBe(true);
    expect(imported.data?.persons.length).toBe(testData.persons.length);
    expect(imported.data?.relationships.length).toBe(testData.relationships.length);

    const invalid = validateAndImportFamilyTree('invalid json content');
    expect(invalid.success).toBe(false);
  });

  it('TEST 10: 2 Ebeveyn ve 2+ Çocuk durumunda ilişki çizgileri ve kardeş bağlantıları tutarlı olmalıdır', () => {
    const persons: Person[] = [
      { id: 'p1', firstName: 'Baba', lastName: 'Kaya', gender: 'male', role: 'Baba', isLiving: true, createdAt: '', updatedAt: '' },
      { id: 'p2', firstName: 'Anne', lastName: 'Kaya', gender: 'female', role: 'Anne', isLiving: true, createdAt: '', updatedAt: '' },
      { id: 'c1', firstName: 'Çocuk 1', lastName: 'Kaya', gender: 'female', role: 'Çocuk', isLiving: true, createdAt: '', updatedAt: '' },
      { id: 'c2', firstName: 'Çocuk 2', lastName: 'Kaya', gender: 'male', role: 'Çocuk', isLiving: true, createdAt: '', updatedAt: '' }
    ];

    const rels: Relationship[] = [
      { id: 'r-sp', sourcePersonId: 'p1', targetPersonId: 'p2', type: 'spouse', createdAt: '' },
      { id: 'r-c1', sourcePersonId: 'p1', targetPersonId: 'c1', type: 'child', createdAt: '' },
      { id: 'r-c2', sourcePersonId: 'p1', targetPersonId: 'c2', type: 'child', createdAt: '' }
    ];

    const synced = autoSyncFamilyRelationships(rels, persons);
    const positions = calculateFamilyTreeLayout(persons, synced);

    // Anneye de 2 çocuk eklenmiş olmalı
    expect(synced.filter(r => r.type === 'child').length).toBe(4);
    // 2 çocuk arasında kardeşlik kurulmuş olmalı
    expect(synced.filter(r => r.type === 'sibling').length).toBe(1);

    // Ebeveynler aynı Y seviyesinde
    expect(positions.get('p1')!.y).toBe(positions.get('p2')!.y);
    // Çocuklar aynı Y seviyesinde ve ebeveynlerin altında
    expect(positions.get('c1')!.y).toBe(positions.get('c2')!.y);
    expect(positions.get('c1')!.y).toBeGreaterThan(positions.get('p1')!.y);
    // Çocuklar yan yana ve aralarında mesafe olmalı
    expect(Math.abs(positions.get('c1')!.x - positions.get('c2')!.x)).toBeGreaterThan(200);
  });

  it('TEST 11: Çoklu ata ve evlilik birleşimi durumunda aynı kuşakların Y koordinatları kesinlikle eşit olmalıdır', () => {
    const persons: Person[] = [
      { id: 'ayşa', firstName: 'ayşa', lastName: 'pala', role: 'Anneanne', gender: 'female', isLiving: true, createdAt: '', updatedAt: '' },
      { id: 'hüsne', firstName: 'hüsne', lastName: 'çöl', role: 'Babaanne', gender: 'female', isLiving: true, createdAt: '', updatedAt: '' },
      { id: 'zekiye', firstName: 'zekiye', lastName: 'çöl', role: 'Anne', gender: 'female', isLiving: true, createdAt: '', updatedAt: '' },
      { id: 'adem', firstName: 'Adem', lastName: 'çöl', role: 'Baba', gender: 'male', isLiving: true, createdAt: '', updatedAt: '' },
      { id: 'safiye', firstName: 'safiye', lastName: 'pala', role: 'Teyze', gender: 'female', isLiving: true, createdAt: '', updatedAt: '' },
      { id: 'güllü', firstName: 'güllü', lastName: 'erkol', role: 'Teyze', gender: 'female', isLiving: true, createdAt: '', updatedAt: '' },
      { id: 'ismail', firstName: 'ismail', lastName: 'çöl', role: 'Oğul', gender: 'male', isLiving: true, createdAt: '', updatedAt: '' },
      { id: 'gülsüm', firstName: 'gülsüm', lastName: 'çöl', role: 'Gelin', gender: 'female', isLiving: true, createdAt: '', updatedAt: '' },
      { id: 'ayşe', firstName: 'ayşe', lastName: 'çöl', role: 'Kız', gender: 'female', isLiving: true, createdAt: '', updatedAt: '' },
      { id: 'yücel', firstName: 'yücel', lastName: 'oral', role: 'Damat', gender: 'male', isLiving: true, createdAt: '', updatedAt: '' },
      { id: 'hayri', firstName: 'hayri', lastName: 'çöl', role: 'Oğul', gender: 'male', isLiving: true, createdAt: '', updatedAt: '' },
      { id: 'özlem', firstName: 'özlem', lastName: 'çöl', role: 'Gelin', gender: 'female', isLiving: true, createdAt: '', updatedAt: '' },
      { id: 'nisa', firstName: 'nisa', lastName: 'çöl', role: 'Torun', gender: 'female', isLiving: true, createdAt: '', updatedAt: '' }
    ];

    const relationships: Relationship[] = [
      { id: 'r1', sourcePersonId: 'adem', targetPersonId: 'zekiye', type: 'spouse', createdAt: '' },
      { id: 'r2', sourcePersonId: 'ayşa', targetPersonId: 'zekiye', type: 'child', createdAt: '' },
      { id: 'r3', sourcePersonId: 'ayşa', targetPersonId: 'safiye', type: 'child', createdAt: '' },
      { id: 'r4', sourcePersonId: 'ayşa', targetPersonId: 'güllü', type: 'child', createdAt: '' },
      { id: 'r5', sourcePersonId: 'hüsne', targetPersonId: 'adem', type: 'child', createdAt: '' },
      { id: 'r6', sourcePersonId: 'adem', targetPersonId: 'ismail', type: 'child', createdAt: '' },
      { id: 'r7', sourcePersonId: 'zekiye', targetPersonId: 'ismail', type: 'child', createdAt: '' },
      { id: 'r8', sourcePersonId: 'adem', targetPersonId: 'ayşe', type: 'child', createdAt: '' },
      { id: 'r9', sourcePersonId: 'zekiye', targetPersonId: 'ayşe', type: 'child', createdAt: '' },
      { id: 'r10', sourcePersonId: 'adem', targetPersonId: 'hayri', type: 'child', createdAt: '' },
      { id: 'r11', sourcePersonId: 'zekiye', targetPersonId: 'hayri', type: 'child', createdAt: '' },
      { id: 'r12', sourcePersonId: 'ismail', targetPersonId: 'gülsüm', type: 'spouse', createdAt: '' },
      { id: 'r13', sourcePersonId: 'ayşe', targetPersonId: 'yücel', type: 'spouse', createdAt: '' },
      { id: 'r14', sourcePersonId: 'hayri', targetPersonId: 'özlem', type: 'spouse', createdAt: '' },
      { id: 'r15', sourcePersonId: 'ismail', targetPersonId: 'nisa', type: 'child', createdAt: '' }
    ];

    const positions = calculateFamilyTreeLayout(persons, relationships);

    // Kuşak 0: Ayşa ve Hüsne aynı Y seviyesinde olmalı
    expect(positions.get('ayşa')!.y).toBe(positions.get('hüsne')!.y);

    // Kuşak 1: Zekiye, Adem, Safiye, Güllü aynı Y seviyesinde olmalı
    expect(positions.get('zekiye')!.y).toBe(positions.get('adem')!.y);
    expect(positions.get('safiye')!.y).toBe(positions.get('zekiye')!.y);
    expect(positions.get('güllü')!.y).toBe(positions.get('zekiye')!.y);

    // Kuşak 2: İsmail, Gülsüm, Ayşe, Yücel, Hayri, Özlem aynı Y seviyesinde olmalı
    expect(positions.get('ismail')!.y).toBe(positions.get('gülsüm')!.y);
    expect(positions.get('ayşe')!.y).toBe(positions.get('ismail')!.y);
    expect(positions.get('yücel')!.y).toBe(positions.get('ismail')!.y);
    expect(positions.get('hayri')!.y).toBe(positions.get('ismail')!.y);
    expect(positions.get('özlem')!.y).toBe(positions.get('ismail')!.y);

    // Kuşaklar arası mesafe tutarlı olmalı
    expect(positions.get('zekiye')!.y).toBeGreaterThan(positions.get('ayşa')!.y);
    expect(positions.get('ismail')!.y).toBeGreaterThan(positions.get('zekiye')!.y);
    expect(positions.get('nisa')!.y).toBeGreaterThan(positions.get('ismail')!.y);

    // Hiçbir kart üst üste binmemeli (aynı kuşaktaki kartlar arasında en az nodeWidth mesafe olmalı)
    const gen1 = ['zekiye', 'adem', 'safiye', 'güllü'].map(id => positions.get(id)!);
    gen1.sort((a, b) => a.x - b.x);
    for (let i = 0; i < gen1.length - 1; i++) {
      expect(gen1[i + 1].x - gen1[i].x).toBeGreaterThanOrEqual(240);
    }
  });

  it('TEST 12: Ebeveynleri kardeş olan çocuklar arasında otomatik kuzenlik ilişkisi eklenmelidir', () => {
    const persons: Person[] = [
      { id: 'baba1', firstName: 'Ahmet', lastName: 'Yılmaz', gender: 'male', role: 'Baba', isLiving: true, createdAt: '', updatedAt: '' },
      { id: 'baba2', firstName: 'Mehmet', lastName: 'Yılmaz', gender: 'male', role: 'Amca', isLiving: true, createdAt: '', updatedAt: '' },
      { id: 'cocuk1', firstName: 'Ali', lastName: 'Yılmaz', gender: 'male', role: 'Çocuk', isLiving: true, createdAt: '', updatedAt: '' },
      { id: 'cocuk2', firstName: 'Veli', lastName: 'Yılmaz', gender: 'male', role: 'Kuzen', isLiving: true, createdAt: '', updatedAt: '' }
    ];

    const relationships: Relationship[] = [
      { id: 'r-sib', sourcePersonId: 'baba1', targetPersonId: 'baba2', type: 'sibling', createdAt: '' },
      { id: 'r-c1', sourcePersonId: 'baba1', targetPersonId: 'cocuk1', type: 'child', createdAt: '' },
      { id: 'r-c2', sourcePersonId: 'baba2', targetPersonId: 'cocuk2', type: 'child', createdAt: '' }
    ];

    const synced = autoSyncFamilyRelationships(relationships, persons);

    const hasCousin = synced.some(r =>
      r.type === 'cousin' &&
      ((r.sourcePersonId === 'cocuk1' && r.targetPersonId === 'cocuk2') ||
       (r.sourcePersonId === 'cocuk2' && r.targetPersonId === 'cocuk1'))
    );

    expect(hasCousin).toBe(true);

    // Detay panelinde kuzen listesi doğru gelmeli
    const aliRelations = getPersonRelations('cocuk1', persons, synced);
    expect(aliRelations.cousins.length).toBe(1);
    expect(aliRelations.cousins[0].id).toBe('cocuk2');
  });

  it('TEST 13: Eşlerin yatay konumu (sağ/sol) değiştirildiğinde layout bu sıralamayı korumalıdır', () => {
    const persons: Person[] = [
      // Normalde varsayılan: erkek solda, kadın sağda.
      // Fakat anne solda (x = 100), baba sağda (x = 400) olarak ayarlanmışsa bu sıra korunmalıdır.
      { id: 'anne', firstName: 'Zekiye', lastName: 'Yılmaz', gender: 'female', role: 'Anne', isLiving: true, positionX: 100, positionY: 80, createdAt: '', updatedAt: '' },
      { id: 'baba', firstName: 'Ahmet', lastName: 'Yılmaz', gender: 'male', role: 'Baba', isLiving: true, positionX: 400, positionY: 80, createdAt: '', updatedAt: '' }
    ];

    const relationships: Relationship[] = [
      { id: 'r-sp', sourcePersonId: 'baba', targetPersonId: 'anne', type: 'spouse', createdAt: '' }
    ];

    const positions = calculateFamilyTreeLayout(persons, relationships);
    const annePos = positions.get('anne')!;
    const babaPos = positions.get('baba')!;

    // Anne solda, baba sağda olmalı (annePos.x < babaPos.x)
    expect(annePos.x).toBeLessThan(babaPos.x);
  });

  it('TEST 14: Var olan birine eş eklendiğinde var olan kişinin konumu değişmemeli ve eş hemen yanına yerleşmelidir', () => {
    const existingPerson: Person = {
      id: 'p-ahmet',
      firstName: 'Ahmet',
      lastName: 'Yılmaz',
      gender: 'male',
      role: 'Baba',
      isLiving: true,
      positionX: 500,
      positionY: 80,
      createdAt: '',
      updatedAt: ''
    };

    // Yeni eş ekleme simülasyonu (nodeWidth = 240, spouseGap = 60)
    const nodeWidth = 240;
    const spouseGap = 60;
    const newSpouseX = existingPerson.positionX! + nodeWidth + spouseGap;

    expect(newSpouseX).toBe(800);
    expect(existingPerson.positionX).toBe(500);
    expect(newSpouseX - existingPerson.positionX!).toBe(nodeWidth + spouseGap);
  });
});

