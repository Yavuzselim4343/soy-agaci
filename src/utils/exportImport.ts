import { FamilyTreeData } from '../types/familyTree';
import { toPng, toSvg } from 'html-to-image';

export function exportFamilyTreeToJson(data: FamilyTreeData): void {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const fileName = `${(data.name || 'aile-agaci').toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function validateAndImportFamilyTree(jsonString: string): { success: boolean; data?: FamilyTreeData; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, error: 'Geçersiz JSON formatı.' };
    }

    if (!Array.isArray(parsed.persons)) {
      return { success: false, error: 'JSON dosyasında "persons" listesi bulunamadı.' };
    }

    if (!Array.isArray(parsed.relationships)) {
      return { success: false, error: 'JSON dosyasında "relationships" listesi bulunamadı.' };
    }

    // Sanitize and ensure IDs
    const validPersons = parsed.persons.map((p: any, idx: number) => ({
      id: p.id || `person-${Date.now()}-${idx}`,
      firstName: p.firstName || 'İsimsiz',
      lastName: p.lastName || '',
      gender: p.gender || 'unspecified',
      role: p.role || '',
      nickname: p.nickname || '',
      birthDate: p.birthDate || '',
      birthPlace: p.birthPlace || '',
      deathDate: p.deathDate || '',
      isLiving: p.isLiving !== undefined ? Boolean(p.isLiving) : true,
      description: p.description || '',
      photo: p.photo || '',
      cardColor: p.cardColor || undefined,
      positionX: p.positionX,
      positionY: p.positionY,
      createdAt: p.createdAt || new Date().toISOString(),
      updatedAt: p.updatedAt || new Date().toISOString()
    }));

    const personIdSet = new Set(validPersons.map((p: any) => p.id));

    const validRelationships = parsed.relationships
      .filter((r: any) => r && personIdSet.has(r.sourcePersonId) && personIdSet.has(r.targetPersonId))
      .map((r: any, idx: number) => ({
        id: r.id || `rel-${Date.now()}-${idx}`,
        sourcePersonId: r.sourcePersonId,
        targetPersonId: r.targetPersonId,
        type: r.type || 'other',
        customLabel: r.customLabel,
        color: r.color,
        lineStyle: r.lineStyle || 'solid',
        lineWidth: r.lineWidth || 2,
        opacity: r.opacity || 1,
        notes: r.notes,
        createdAt: r.createdAt || new Date().toISOString()
      }));

    const result: FamilyTreeData = {
      id: parsed.id || `tree-${Date.now()}`,
      name: parsed.name || 'İçe Aktarılan Aile Ağacı',
      description: parsed.description || '',
      persons: validPersons,
      relationships: validRelationships,
      customRelationshipTypes: Array.isArray(parsed.customRelationshipTypes) ? parsed.customRelationshipTypes : [],
      settings: parsed.settings || {
        theme: 'light',
        language: 'tr',
        defaultZoom: 1,
        layoutDirection: 'TB',
        spouseDistance: 60,
        siblingDistance: 50,
        generationDistance: 170,
        showEdgeLabels: true,
        nodeWidth: 240,
        nodeHeight: 120,
        snapToGrid: true,
        backgroundVariant: 'dots',
        customStyles: {}
      },
      createdAt: parsed.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return { success: true, data: result };
  } catch (err: any) {
    return { success: false, error: `Dosya okunurken hata oluştu: ${err.message || 'Bilinmeyen hata'}` };
  }
}

export async function exportTreeAsImage(element: HTMLElement, format: 'png' | 'svg' = 'png', filename = 'aile-agaci'): Promise<void> {
  try {
    let dataUrl = '';
    if (format === 'png') {
      dataUrl = await toPng(element, {
        quality: 0.95,
        backgroundColor: '#ffffff',
        pixelRatio: 2
      });
    } else {
      dataUrl = await toSvg(element, {
        backgroundColor: '#ffffff'
      });
    }

    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${filename}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (error) {
    console.error('Image export failed:', error);
    throw error;
  }
}

