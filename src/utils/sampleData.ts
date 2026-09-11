import { FamilyTreeData, Person, Relationship, TreeSettings } from '../types/familyTree';

export const DEFAULT_SETTINGS: TreeSettings = {
  theme: 'light',
  language: 'tr',
  defaultZoom: 1,
  layoutDirection: 'TB',
  spouseDistance: 70,
  siblingDistance: 70,
  generationDistance: 190,
  showEdgeLabels: true,
  nodeWidth: 240,
  nodeHeight: 120,
  snapToGrid: true,
  backgroundVariant: 'dots',
  customStyles: {}
};

export function createTestFamilyData(): FamilyTreeData {
  const persons: Person[] = [
    {
      id: 'p-zekiye',
      firstName: 'Zekiye',
      lastName: 'Yılmaz',
      gender: 'female',
      role: '3 çocuk annesi',
      nickname: 'Zekiye Anne',
      birthDate: '1965-04-12',
      birthPlace: 'İstanbul',
      isLiving: true,
      description: 'Ailenin sevgi dolu annesi ve emekli öğretmen.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'p-ahmet',
      firstName: 'Ahmet',
      lastName: 'Yılmaz',
      gender: 'male',
      role: 'Baba / Mühendis',
      nickname: 'Ahmet Bey',
      birthDate: '1962-08-20',
      birthPlace: 'Ankara',
      isLiving: true,
      description: 'Emekli inşaat mühendisi, ailenin reisi.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'p-fatma',
      firstName: 'Fatma',
      lastName: 'Yılmaz',
      gender: 'female',
      role: 'Hala / Mimar',
      nickname: 'Fatma Hala',
      birthDate: '1968-11-15',
      birthPlace: 'Ankara',
      isLiving: true,
      description: 'Ahmet\'in kız kardeşi, çocukların sevgili halası.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'p-ayse',
      firstName: 'Ayşe',
      lastName: 'Yılmaz',
      gender: 'female',
      role: 'Büyük Kız / Doktor',
      nickname: 'Doktor Hanım',
      birthDate: '1990-06-10',
      birthPlace: 'İstanbul',
      isLiving: true,
      description: 'Kardiyoloji uzmanı doktor.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'p-mehmet',
      firstName: 'Mehmet',
      lastName: 'Yılmaz',
      gender: 'male',
      role: 'Ortanca Çocuk / Yazılımcı',
      nickname: 'Memo',
      birthDate: '1993-09-22',
      birthPlace: 'İstanbul',
      isLiving: true,
      description: 'Yazılım mühendisi.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'p-hasan',
      firstName: 'Hasan',
      lastName: 'Yılmaz',
      gender: 'male',
      role: 'Küçük Çocuk / Avukat',
      nickname: 'Haso',
      birthDate: '1998-02-14',
      birthPlace: 'İstanbul',
      isLiving: true,
      description: 'Hukuk bürosunda avukat.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const relationships: Relationship[] = [
    {
      id: 'rel-zekiye-ahmet',
      sourcePersonId: 'p-zekiye',
      targetPersonId: 'p-ahmet',
      type: 'spouse',
      createdAt: new Date().toISOString()
    },
    {
      id: 'rel-ahmet-fatma',
      sourcePersonId: 'p-ahmet',
      targetPersonId: 'p-fatma',
      type: 'sibling',
      createdAt: new Date().toISOString()
    },
    {
      id: 'rel-zekiye-ayse',
      sourcePersonId: 'p-zekiye',
      targetPersonId: 'p-ayse',
      type: 'child',
      createdAt: new Date().toISOString()
    },
    {
      id: 'rel-ahmet-ayse',
      sourcePersonId: 'p-ahmet',
      targetPersonId: 'p-ayse',
      type: 'child',
      createdAt: new Date().toISOString()
    },
    {
      id: 'rel-zekiye-mehmet',
      sourcePersonId: 'p-zekiye',
      targetPersonId: 'p-mehmet',
      type: 'child',
      createdAt: new Date().toISOString()
    },
    {
      id: 'rel-ahmet-mehmet',
      sourcePersonId: 'p-ahmet',
      targetPersonId: 'p-mehmet',
      type: 'child',
      createdAt: new Date().toISOString()
    },
    {
      id: 'rel-zekiye-hasan',
      sourcePersonId: 'p-zekiye',
      targetPersonId: 'p-hasan',
      type: 'child',
      createdAt: new Date().toISOString()
    },
    {
      id: 'rel-ahmet-hasan',
      sourcePersonId: 'p-ahmet',
      targetPersonId: 'p-hasan',
      type: 'child',
      createdAt: new Date().toISOString()
    }
  ];

  return {
    id: 'tree-test-family',
    name: 'Yılmaz Ailesi (Zekiye & Ahmet)',
    description: 'Zekiye ve Ahmet çifti, 3 çocukları ve Fatma Hala.',
    persons,
    relationships,
    customRelationshipTypes: [],
    settings: { ...DEFAULT_SETTINGS },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export function createThreeGenFamilyData(): FamilyTreeData {
  const persons: Person[] = [
    {
      id: 'p-dede-mustafa',
      firstName: 'Mustafa',
      lastName: 'Kaya',
      gender: 'male',
      role: 'Büyük Dede / Ailenin Kurucusu',
      birthDate: '1935-03-10',
      deathDate: '2015-08-20',
      isLiving: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'p-nine-emine',
      firstName: 'Emine',
      lastName: 'Kaya',
      gender: 'female',
      role: 'Büyük Nine / Hanımağa',
      birthDate: '1938-07-25',
      isLiving: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'p-ali',
      firstName: 'Ali',
      lastName: 'Kaya',
      gender: 'male',
      role: 'Büyük Oğul / Şirket Yöneticisi',
      birthDate: '1960-05-12',
      isLiving: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'p-selma',
      firstName: 'Selma',
      lastName: 'Kaya',
      gender: 'female',
      role: 'Gelin / Ressam',
      birthDate: '1964-09-18',
      isLiving: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'p-kemal',
      firstName: 'Kemal',
      lastName: 'Kaya',
      gender: 'male',
      role: 'Küçük Oğul / Profesör',
      birthDate: '1966-12-01',
      isLiving: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'p-leyla',
      firstName: 'Leyla',
      lastName: 'Kaya',
      gender: 'female',
      role: 'Gelin / Eczacı',
      birthDate: '1970-04-14',
      isLiving: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'p-burak',
      firstName: 'Burak',
      lastName: 'Kaya',
      gender: 'male',
      role: 'Torun / Girişimci',
      birthDate: '1988-02-11',
      isLiving: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'p-gamze',
      firstName: 'Gamze',
      lastName: 'Kaya',
      gender: 'female',
      role: 'Torun / Mimar',
      birthDate: '1992-08-30',
      isLiving: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'p-can',
      firstName: 'Can',
      lastName: 'Kaya',
      gender: 'male',
      role: 'Torun / Pilot',
      birthDate: '1995-10-05',
      isLiving: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'p-deniz',
      firstName: 'Deniz',
      lastName: 'Kaya',
      gender: 'male',
      role: 'Küçük Torun / Öğrenci',
      birthDate: '2020-01-15',
      isLiving: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const relationships: Relationship[] = [
    { id: 'r1', sourcePersonId: 'p-dede-mustafa', targetPersonId: 'p-nine-emine', type: 'spouse', createdAt: new Date().toISOString() },
    { id: 'r2', sourcePersonId: 'p-dede-mustafa', targetPersonId: 'p-ali', type: 'child', createdAt: new Date().toISOString() },
    { id: 'r3', sourcePersonId: 'p-nine-emine', targetPersonId: 'p-ali', type: 'child', createdAt: new Date().toISOString() },
    { id: 'r4', sourcePersonId: 'p-dede-mustafa', targetPersonId: 'p-kemal', type: 'child', createdAt: new Date().toISOString() },
    { id: 'r5', sourcePersonId: 'p-nine-emine', targetPersonId: 'p-kemal', type: 'child', createdAt: new Date().toISOString() },
    { id: 'r6', sourcePersonId: 'p-ali', targetPersonId: 'p-kemal', type: 'sibling', createdAt: new Date().toISOString() },
    { id: 'r7', sourcePersonId: 'p-ali', targetPersonId: 'p-selma', type: 'spouse', createdAt: new Date().toISOString() },
    { id: 'r8', sourcePersonId: 'p-kemal', targetPersonId: 'p-leyla', type: 'spouse', createdAt: new Date().toISOString() },
    { id: 'r9', sourcePersonId: 'p-ali', targetPersonId: 'p-burak', type: 'child', createdAt: new Date().toISOString() },
    { id: 'r10', sourcePersonId: 'p-selma', targetPersonId: 'p-burak', type: 'child', createdAt: new Date().toISOString() },
    { id: 'r11', sourcePersonId: 'p-ali', targetPersonId: 'p-gamze', type: 'child', createdAt: new Date().toISOString() },
    { id: 'r12', sourcePersonId: 'p-selma', targetPersonId: 'p-gamze', type: 'child', createdAt: new Date().toISOString() },
    { id: 'r13', sourcePersonId: 'p-kemal', targetPersonId: 'p-can', type: 'child', createdAt: new Date().toISOString() },
    { id: 'r14', sourcePersonId: 'p-leyla', targetPersonId: 'p-can', type: 'child', createdAt: new Date().toISOString() },
    { id: 'r15', sourcePersonId: 'p-burak', targetPersonId: 'p-deniz', type: 'child', createdAt: new Date().toISOString() }
  ];

  return {
    id: 'tree-3gen-family',
    name: 'Kaya Hanedanı (3 Nesil Geniş Aile)',
    description: 'Dede Mustafa\'dan torunlara uzanan 3 kuşaklık köklü aile ağacı.',
    persons,
    relationships,
    customRelationshipTypes: [],
    settings: { ...DEFAULT_SETTINGS },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export function createLargeFamilyData(targetPersons = 100): FamilyTreeData {
  const persons: Person[] = [];
  const relationships: Relationship[] = [];

  const firstNamesM = ['Ahmet', 'Mehmet', 'Mustafa', 'Ali', 'Hüseyin', 'Hasan', 'İbrahim', 'İsmail', 'Osman', 'Halil', 'Süleyman', 'Ömer', 'Yusuf', 'Murat', 'Emre', 'Burak', 'Can', 'Kerem', 'Kaan', 'Tolga', 'Serkan', 'Okan', 'Barış', 'Doruk', 'Arda'];
  const firstNamesF = ['Fatma', 'Ayşe', 'Emine', 'Hatice', 'Zeynep', 'Meryem', 'Elif', 'Zekiye', 'Sultan', 'Zehra', 'Cemile', 'Merve', 'Büşra', 'Seda', 'Derya', 'Gamze', 'Pınar', 'Ece', 'Selin', 'Gizem', 'Damla', 'İrem', 'Defne', 'Nehir', 'Melis'];
  const roles = ['3 çocuk annesi', 'Ailenin büyüğü', 'Öğretmen', 'Mühendis', 'Doktor', 'Avukat', 'Mimar', 'Çiftçi', 'Esnaf', 'Öğrenci', 'Yazılımcı', 'Ressam', 'Müzisyen', 'Akademisyen', 'Girişimci', 'Bankacı'];

  let idCounter = 1;

  // Gen 1: 3 Couples (6 people)
  const gen1Couples = 3;
  const gen1Map: { husband: string; wife: string }[] = [];

  for (let i = 0; i < gen1Couples; i++) {
    const hId = `p-g1-${idCounter++}`;
    const wId = `p-g1-${idCounter++}`;

    persons.push({
      id: hId,
      firstName: firstNamesM[i % firstNamesM.length],
      lastName: 'Köroğlu',
      gender: 'male',
      role: '1. Kuşak Kurucu Ata',
      birthDate: `${1920 + i * 5}-01-10`,
      isLiving: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    persons.push({
      id: wId,
      firstName: firstNamesF[i % firstNamesF.length],
      lastName: 'Köroğlu',
      gender: 'female',
      role: '1. Kuşak Ana',
      birthDate: `${1923 + i * 5}-05-20`,
      isLiving: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    relationships.push({
      id: `rel-spouse-g1-${i}`,
      sourcePersonId: hId,
      targetPersonId: wId,
      type: 'spouse',
      createdAt: new Date().toISOString()
    });

    gen1Map.push({ husband: hId, wife: wId });
  }

  // Gen 2
  const gen2Couples: { husband: string; wife: string }[] = [];
  let g2Count = 0;
  for (const couple of gen1Map) {
    const numChildren = 3;
    for (let c = 0; c < numChildren; c++) {
      const childId = `p-g2-${idCounter++}`;
      const spouseId = `p-g2-${idCounter++}`;
      const isMale = c % 2 === 0;

      persons.push({
        id: childId,
        firstName: isMale ? firstNamesM[(g2Count * 2) % firstNamesM.length] : firstNamesF[(g2Count * 2) % firstNamesF.length],
        lastName: 'Köroğlu',
        gender: isMale ? 'male' : 'female',
        role: roles[g2Count % roles.length],
        birthDate: `${1945 + g2Count * 2}-03-15`,
        isLiving: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      persons.push({
        id: spouseId,
        firstName: !isMale ? firstNamesM[(g2Count * 2 + 1) % firstNamesM.length] : firstNamesF[(g2Count * 2 + 1) % firstNamesF.length],
        lastName: 'Köroğlu',
        gender: !isMale ? 'male' : 'female',
        role: roles[(g2Count + 3) % roles.length],
        birthDate: `${1947 + g2Count * 2}-07-11`,
        isLiving: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      relationships.push({
        id: `rel-p1-${childId}`,
        sourcePersonId: couple.husband,
        targetPersonId: childId,
        type: 'child',
        createdAt: new Date().toISOString()
      });
      relationships.push({
        id: `rel-p2-${childId}`,
        sourcePersonId: couple.wife,
        targetPersonId: childId,
        type: 'child',
        createdAt: new Date().toISOString()
      });

      relationships.push({
        id: `rel-sp-${childId}-${spouseId}`,
        sourcePersonId: childId,
        targetPersonId: spouseId,
        type: 'spouse',
        createdAt: new Date().toISOString()
      });

      gen2Couples.push({ husband: isMale ? childId : spouseId, wife: isMale ? spouseId : childId });
      g2Count++;
    }
  }

  // Gen 3
  const gen3Couples: { husband: string; wife: string }[] = [];
  let g3Count = 0;
  for (const couple of gen2Couples) {
    const numChildren = 3;
    for (let c = 0; c < numChildren; c++) {
      const childId = `p-g3-${idCounter++}`;
      const spouseId = `p-g3-${idCounter++}`;
      const isMale = (g3Count + c) % 2 === 0;

      persons.push({
        id: childId,
        firstName: isMale ? firstNamesM[(g3Count * 3 + c) % firstNamesM.length] : firstNamesF[(g3Count * 3 + c) % firstNamesF.length],
        lastName: 'Köroğlu',
        gender: isMale ? 'male' : 'female',
        role: roles[(g3Count + c) % roles.length],
        birthDate: `${1970 + (g3Count % 15)}-04-10`,
        isLiving: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      persons.push({
        id: spouseId,
        firstName: !isMale ? firstNamesM[(g3Count * 3 + c + 1) % firstNamesM.length] : firstNamesF[(g3Count * 3 + c + 1) % firstNamesF.length],
        lastName: 'Köroğlu',
        gender: !isMale ? 'male' : 'female',
        role: roles[(g3Count + c + 2) % roles.length],
        birthDate: `${1972 + (g3Count % 15)}-09-21`,
        isLiving: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      relationships.push({
        id: `rel-p1-${childId}`,
        sourcePersonId: couple.husband,
        targetPersonId: childId,
        type: 'child',
        createdAt: new Date().toISOString()
      });
      relationships.push({
        id: `rel-p2-${childId}`,
        sourcePersonId: couple.wife,
        targetPersonId: childId,
        type: 'child',
        createdAt: new Date().toISOString()
      });

      relationships.push({
        id: `rel-sp-${childId}-${spouseId}`,
        sourcePersonId: childId,
        targetPersonId: spouseId,
        type: 'spouse',
        createdAt: new Date().toISOString()
      });

      gen3Couples.push({ husband: isMale ? childId : spouseId, wife: isMale ? spouseId : childId });
      g3Count++;
    }
  }

  // Gen 4
  let g4Count = 0;
  for (const couple of gen3Couples) {
    if (persons.length >= targetPersons) break;
    const numChildren = 2;
    for (let c = 0; c < numChildren; c++) {
      if (persons.length >= targetPersons) break;
      const childId = `p-g4-${idCounter++}`;
      const isMale = (g4Count + c) % 2 === 0;

      persons.push({
        id: childId,
        firstName: isMale ? firstNamesM[(g4Count * 2 + c) % firstNamesM.length] : firstNamesF[(g4Count * 2 + c) % firstNamesF.length],
        lastName: 'Köroğlu',
        gender: isMale ? 'male' : 'female',
        role: roles[(g4Count + 5) % roles.length],
        birthDate: `${1998 + (g4Count % 20)}-06-18`,
        isLiving: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      relationships.push({
        id: `rel-p1-${childId}`,
        sourcePersonId: couple.husband,
        targetPersonId: childId,
        type: 'child',
        createdAt: new Date().toISOString()
      });
      relationships.push({
        id: `rel-p2-${childId}`,
        sourcePersonId: couple.wife,
        targetPersonId: childId,
        type: 'child',
        createdAt: new Date().toISOString()
      });

      g4Count++;
    }
  }

  return {
    id: 'tree-large-family',
    name: 'Köroğlu Hanedanlığı (100+ Kişilik Büyük Aile)',
    description: '4 kuşak boyunca 100+ kişilik geniş aile ve akrabalık yapısı.',
    persons,
    relationships,
    customRelationshipTypes: [],
    settings: { ...DEFAULT_SETTINGS, generationDistance: 190, siblingDistance: 45, spouseDistance: 50 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export function createEmptyFamilyData(): FamilyTreeData {
  return {
    id: `tree-${Date.now()}`,
    name: 'Yeni Aile Ağacım',
    description: 'Kendi aile ağacınızı oluşturmaya başlayın.',
    persons: [],
    relationships: [],
    customRelationshipTypes: [],
    settings: { ...DEFAULT_SETTINGS },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

