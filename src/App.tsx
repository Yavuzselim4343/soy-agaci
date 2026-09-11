import { useState, useEffect, useRef } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { useFamilyTree } from './hooks/useFamilyTree';
import { Person, Relationship } from './types/familyTree';

import { Toolbar } from './components/Toolbar';
import { FamilyTreeCanvas } from './components/canvas/FamilyTreeCanvas';
import { PersonDetailPanel } from './components/panels/PersonDetailPanel';
import { PeopleListPanel } from './components/panels/PeopleListPanel';
import { SettingsPanel } from './components/panels/SettingsPanel';
import { PersonModal } from './components/modals/PersonModal';
import { QuickAddRelationModal } from './components/modals/QuickAddRelationModal';
import { RelationshipModal } from './components/modals/RelationshipModal';
import { ConfirmDeleteModal } from './components/modals/ConfirmDeleteModal';

export function App() {
  const {
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
  } = useFamilyTree();

  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [selectedRelationship, setSelectedRelationship] = useState<Relationship | null>(null);

  const [isPersonModalOpen, setIsPersonModalOpen] = useState(false);
  const [personToEdit, setPersonToEdit] = useState<Person | null>(null);

  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddSource, setQuickAddSource] = useState<Person | null>(null);

  const [isRelModalOpen, setIsRelModalOpen] = useState(false);
  const [relToEdit, setRelToEdit] = useState<Relationship | null>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPeopleListOpen, setIsPeopleListOpen] = useState(false);

  const [deleteConfirmData, setDeleteConfirmData] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const canvasContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (selectedPerson) {
      const updated = treeData.persons.find(p => p.id === selectedPerson.id);
      setSelectedPerson(updated || null);
    }
  }, [treeData.persons, selectedPerson]);

  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const isDark =
      treeData.settings.theme === 'dark' ||
      (treeData.settings.theme === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [treeData.settings.theme]);

  const handleToggleDarkMode = () => {
    updateSettings({ theme: isDarkMode ? 'light' : 'dark' });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          if (canRedo) redo();
        } else {
          if (canUndo) undo();
        }
        e.preventDefault();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        if (canRedo) redo();
        e.preventDefault();
      } else if (e.key === 'Escape') {
        setSelectedPerson(null);
        setSelectedRelationship(null);
        setIsPersonModalOpen(false);
        setIsQuickAddOpen(false);
        setIsRelModalOpen(false);
        setIsSettingsOpen(false);
        setDeleteConfirmData(prev => ({ ...prev, isOpen: false }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, canUndo, canRedo]);

  const handleOpenAddPerson = () => {
    setPersonToEdit(null);
    setIsPersonModalOpen(true);
  };

  const handleOpenEditPerson = (person: Person) => {
    setPersonToEdit(person);
    setIsPersonModalOpen(true);
  };

  const handleSavePerson = (data: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (personToEdit) {
      updatePerson(personToEdit.id, data);
    } else {
      addPerson(data);
    }
  };

  const handleDeletePerson = (person: Person) => {
    setDeleteConfirmData({
      isOpen: true,
      title: 'Kişiyi Sil',
      message: `"${person.firstName} ${person.lastName}" kişisini ve bu kişiye ait tüm aile ilişkilerini silmek istediğinize emin misiniz?`,
      onConfirm: () => {
        deletePerson(person.id);
        if (selectedPerson?.id === person.id) {
          setSelectedPerson(null);
        }
      }
    });
  };

  const handleQuickAdd = (person: Person) => {
    setQuickAddSource(person);
    setIsQuickAddOpen(true);
  };

  const handleOpenAddRelationship = () => {
    setRelToEdit(null);
    setIsRelModalOpen(true);
  };

  const handleSelectRelationship = (rel: Relationship) => {
    setRelToEdit(rel);
    setIsRelModalOpen(true);
  };

  const handleSaveRelationship = (
    sourceId: string,
    targetId: string,
    type: string,
    options?: any
  ) => {
    if (relToEdit) {
      updateRelationship(relToEdit.id, {
        sourcePersonId: sourceId,
        targetPersonId: targetId,
        type,
        ...options
      });
    } else {
      addRelationship(sourceId, targetId, type, options);
    }
  };

  const handleDeleteRelationship = (relId: string) => {
    setDeleteConfirmData({
      isOpen: true,
      title: 'İlişkiyi Sil',
      message: 'Bu iki kişi arasındaki aile ilişkisi bağını silmek istediğinize emin misiniz?',
      onConfirm: () => {
        deleteRelationship(relId);
        if (selectedRelationship?.id === relId) {
          setSelectedRelationship(null);
        }
      }
    });
  };

  const handleSwapSpouseOrder = (person: Person) => {
    const spouseRel = treeData.relationships.find(
      r => r.type === 'spouse' && (r.sourcePersonId === person.id || r.targetPersonId === person.id)
    );
    if (!spouseRel) return;
    const spouseId = spouseRel.sourcePersonId === person.id ? spouseRel.targetPersonId : spouseRel.sourcePersonId;
    const spouse = treeData.persons.find(p => p.id === spouseId);
    if (!spouse) return;

    const nodeW = treeData.settings.nodeWidth || 240;
    const gap = treeData.settings.spouseDistance || 60;
    const pX = person.positionX ?? 100;
    const pY = person.positionY ?? 100;
    const sX = spouse.positionX ?? (pX + nodeW + gap);
    const sY = spouse.positionY ?? 100;

    updateMultipleNodePositions([
      { id: person.id, x: sX, y: pY },
      { id: spouse.id, x: pX, y: sY }
    ]);
  };

  return (
    <ReactFlowProvider>
      <div className="h-screen w-screen flex flex-col overflow-hidden bg-slate-100 dark:bg-slate-950 font-sans">
        <Toolbar
          treeData={treeData}
          onAddNewPerson={handleOpenAddPerson}
          onAddNewRelationship={handleOpenAddRelationship}
          onAutoLayout={runAutoLayout}
          onCenterTree={() => {
            if (treeData.persons.length > 0) {
              const first = treeData.persons[0];
              setSelectedPerson(first);
            }
          }}
          onFitView={() => {
            runAutoLayout();
          }}
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
          onLoadTree={loadTree}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onTogglePeopleList={() => setIsPeopleListOpen(!isPeopleListOpen)}
          isPeopleListOpen={isPeopleListOpen}
          onSelectPerson={(p) => setSelectedPerson(p)}
          isDarkMode={isDarkMode}
          onToggleDarkMode={handleToggleDarkMode}
          canvasContainerRef={canvasContainerRef}
        />

        <div className="flex-1 flex relative overflow-hidden" ref={canvasContainerRef}>
          {isPeopleListOpen && (
            <PeopleListPanel
              persons={treeData.persons}
              relationships={treeData.relationships}
              selectedPersonId={selectedPerson?.id}
              onSelectPerson={(p) => setSelectedPerson(p)}
              onAddNewPerson={handleOpenAddPerson}
              onClose={() => setIsPeopleListOpen(false)}
            />
          )}

          <main className="flex-1 h-full w-full relative">
            <FamilyTreeCanvas
              persons={treeData.persons}
              relationships={treeData.relationships}
              customTypes={treeData.customRelationshipTypes}
              settings={treeData.settings}
              selectedPersonId={selectedPerson?.id}
              selectedRelationshipId={selectedRelationship?.id}
              onSelectPerson={(p) => setSelectedPerson(p)}
              onEditPerson={handleOpenEditPerson}
              onDeletePerson={handleDeletePerson}
              onQuickAdd={handleQuickAdd}
              onSelectRelationship={handleSelectRelationship}
              onDeleteRelationship={handleDeleteRelationship}
              onUpdateNodePosition={updateNodePosition}
              onUpdateMultipleNodePositions={updateMultipleNodePositions}
              onSwapSpouseOrder={handleSwapSpouseOrder}
              onAddNewPerson={handleOpenAddPerson}
              isDarkMode={isDarkMode}
            />
          </main>

          {selectedPerson && (
            <PersonDetailPanel
              person={selectedPerson}
              allPersons={treeData.persons}
              relationships={treeData.relationships}
              customTypes={treeData.customRelationshipTypes}
              onClose={() => setSelectedPerson(null)}
              onEdit={handleOpenEditPerson}
              onDelete={handleDeletePerson}
              onQuickAdd={handleQuickAdd}
              onSelectPerson={(p) => setSelectedPerson(p)}
              onSwapSpouseOrder={handleSwapSpouseOrder}
            />
          )}
        </div>

        <PersonModal
          isOpen={isPersonModalOpen}
          onClose={() => setIsPersonModalOpen(false)}
          onSave={handleSavePerson}
          initialPerson={personToEdit}
        />

        <QuickAddRelationModal
          isOpen={isQuickAddOpen}
          onClose={() => setIsQuickAddOpen(false)}
          sourcePerson={quickAddSource}
          allPersons={treeData.persons}
          customTypes={treeData.customRelationshipTypes}
          onAddExistingRelation={(sId, tId, type) => addRelationship(sId, tId, type)}
          onAddMultipleExistingRelations={addMultipleRelationships}
          onCreateAndRelate={createPersonWithRelationship}
          onCreateMultipleAndRelate={createMultiplePersonsWithRelationship}
        />

        <RelationshipModal
          isOpen={isRelModalOpen}
          onClose={() => setIsRelModalOpen(false)}
          onSave={handleSaveRelationship}
          onDelete={handleDeleteRelationship}
          allPersons={treeData.persons}
          customTypes={treeData.customRelationshipTypes}
          initialRelationship={relToEdit}
          defaultSourceId={selectedPerson?.id}
        />

        {isSettingsOpen && (
          <SettingsPanel
            settings={treeData.settings}
            customTypes={treeData.customRelationshipTypes}
            onUpdateSettings={updateSettings}
            onAddCustomType={addCustomRelationshipType}
            onDeleteCustomType={(typeId) => {
              updateSettings({
                customStyles: Object.fromEntries(
                  Object.entries(treeData.settings.customStyles || {}).filter(([k]) => k !== typeId)
                )
              });
            }}
            onClose={() => setIsSettingsOpen(false)}
          />
        )}

        <ConfirmDeleteModal
          isOpen={deleteConfirmData.isOpen}
          onClose={() => setDeleteConfirmData(prev => ({ ...prev, isOpen: false }))}
          onConfirm={deleteConfirmData.onConfirm}
          title={deleteConfirmData.title}
          message={deleteConfirmData.message}
        />
      </div>
    </ReactFlowProvider>
  );
}

