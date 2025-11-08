import { useState, useCallback, useRef } from 'react';

/**
 * Hook personnalisé pour gérer le drag & drop des cartes dans les binders
 */
export const useDragAndDrop = (onCardMove, binder) => {
  const [dragState, setDragState] = useState({
    isDragging: false,
    draggedCard: null,
    draggedSlot: null,
    dropTarget: null,
    dragPreview: null
  });

  // dragPreviewRef removed because it was declared but unused (eslint)
  const offsetRef = useRef({ x: 0, y: 0 });

  // Reset du state de drag
  const resetDragState = useCallback(() => {
    setDragState({
      isDragging: false,
      draggedCard: null,
      draggedSlot: null,
      dropTarget: null,
      dragPreview: null
    });
  }, []);

  // Début du drag
  const handleDragStart = useCallback((e, card, slot) => {
    if (!card || !slot) return;

    console.log('🚀 [useDragAndDrop] Début du drag:', { card, slot });

    // Empêcher la propagation pour éviter les conflits
    e.stopPropagation();

    // Calculer l'offset de la souris par rapport au centre de l'élément
    const rect = e.currentTarget.getBoundingClientRect();
    offsetRef.current = {
      x: e.clientX - rect.left - rect.width / 2,
      y: e.clientY - rect.top - rect.height / 2
    };

    // Créer l'image de preview personnalisée
    const dragImage = e.currentTarget.cloneNode(true);
    dragImage.style.transform = 'rotate(5deg)';
    dragImage.style.opacity = '0.8';
    dragImage.style.border = '2px solid #3498db';
    dragImage.style.borderRadius = '8px';
    dragImage.style.pointerEvents = 'none';
    
    // Ajouter temporairement au DOM pour le drag
    document.body.appendChild(dragImage);
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    
    // Définir l'image de drag
    e.dataTransfer.setDragImage(dragImage, rect.width / 2, rect.height / 2);
    
    // Nettoyer après un court délai
    setTimeout(() => {
      if (document.body.contains(dragImage)) {
        document.body.removeChild(dragImage);
      }
    }, 100);

    // Définir les données de drag
    e.dataTransfer.setData('application/json', JSON.stringify({
      card,
      slot,
      type: 'binder-card'
    }));

    e.dataTransfer.effectAllowed = 'move';

    setDragState({
      isDragging: true,
      draggedCard: card,
      draggedSlot: slot,
      dropTarget: null,
      dragPreview: dragImage
    });
  }, []);

  // Gestion du drag over (survol d'une zone de drop)
  const handleDragOver = useCallback((e, targetSlot) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Permettre le drop seulement sur les slots vides
    if (!targetSlot.card_id && dragState.isDragging) {
      e.dataTransfer.dropEffect = 'move';
      
      setDragState(prev => ({
        ...prev,
        dropTarget: targetSlot
      }));
    } else {
      e.dataTransfer.dropEffect = 'none';
    }
  }, [dragState.isDragging]);

  // Gestion du drag enter
  const handleDragEnter = useCallback((e, targetSlot) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!targetSlot.card_id && dragState.isDragging) {
      setDragState(prev => ({
        ...prev,
        dropTarget: targetSlot
      }));
    }
  }, [dragState.isDragging]);

  // Gestion du drag leave
  const handleDragLeave = useCallback((e, targetSlot) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Vérifier si on quitte vraiment l'élément (pas juste un enfant)
    const rect = e.currentTarget.getBoundingClientRect();
    const isStillInside = (
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom
    );
    
    if (!isStillInside) {
      setDragState(prev => ({
        ...prev,
        dropTarget: prev.dropTarget === targetSlot ? null : prev.dropTarget
      }));
    }
  }, []);

  // Gestion du drop
  const handleDrop = useCallback(async (e, targetSlot) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      // Récupérer les données du drag
      const dragData = JSON.parse(e.dataTransfer.getData('application/json'));
      
      if (dragData.type !== 'binder-card') {
        console.warn('🚫 [useDragAndDrop] Type de drag non supporté:', dragData.type);
        resetDragState();
        return;
      }

      const { card, slot: sourceSlot } = dragData;

      // Vérifications
      if (!card || !sourceSlot || !targetSlot) {
        console.error('🚫 [useDragAndDrop] Données manquantes:', { card, sourceSlot, targetSlot });
        resetDragState();
        return;
      }

      // Vérifier que la cible est vide
      if (targetSlot.card_id) {
        console.warn('🚫 [useDragAndDrop] Slot de destination occupé');
        resetDragState();
        return;
      }

      // Vérifier qu'on ne déplace pas au même endroit
      if (sourceSlot.page === targetSlot.page && sourceSlot.position === targetSlot.position) {
        console.log('ℹ️ [useDragAndDrop] Déplacement au même endroit, ignoré');
        resetDragState();
        return;
      }

      console.log('✅ [useDragAndDrop] Exécution du déplacement:', {
        from: sourceSlot,
        to: targetSlot,
        card
      });

      // Exécuter le déplacement via le callback parent
      await onCardMove(sourceSlot, targetSlot, card);

    } catch (error) {
      console.error('❌ [useDragAndDrop] Erreur lors du drop:', error);
    } finally {
      resetDragState();
    }
  }, [onCardMove, resetDragState]);

  // Gestion de la fin du drag (même si pas de drop)
  const handleDragEnd = useCallback((e) => {
    console.log('🏁 [useDragAndDrop] Fin du drag');
    resetDragState();
  }, [resetDragState]);

  // Gestion de l'annulation par Escape
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape' && dragState.isDragging) {
      console.log('🚫 [useDragAndDrop] Annulation par Escape');
      resetDragState();
    }
  }, [dragState.isDragging, resetDragState]);

  // Retourner les handlers et le state
  return {
    dragState,
    handlers: {
      onDragStart: handleDragStart,
      onDragOver: handleDragOver,
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
      onDragEnd: handleDragEnd,
      onKeyDown: handleKeyDown
    },
    resetDragState
  };
};

export default useDragAndDrop;
