import { useEffect } from 'react';

/**
 * 1024px以下でのみ有効なフリック検知フック（パーツ解除用）
 * @param {function} onFlickRight - 右フリック時のコールバック（解除）
 * @param {string|string[]} partNames - 現在選択中のパーツ名（単一または配列）
 */
export function useRemoveFlick(onFlickRight, partNames) {
  useEffect(() => {
    if (window.innerWidth > 1024) return;
    
    // partNamesが配列でない場合は配列に変換、nullやundefinedの場合は空配列
    const targetPartNames = Array.isArray(partNames) ? partNames : (partNames ? [partNames] : []);
    
    if (targetPartNames.length === 0) return;
    
    let startX = null;
    let startY = null;
    let isTouch = false;

    function handleTouchStart(e) {
      if (e.touches.length === 1) {
        // 選択されているパーツの要素でタッチが開始されたかチェック
        const target = e.target.closest('[data-selected-part-name]');
        const targetPartName = target?.getAttribute('data-selected-part-name');
        
        if (targetPartName && targetPartNames.includes(targetPartName)) {
          isTouch = true;
          startX = e.touches[0].clientX;
          startY = e.touches[0].clientY;
        }
      }
    }
    
    function handleTouchMove(e) {
      if (isTouch && startX !== null) {
        const dx = Math.abs(e.touches[0].clientX - startX);
        const dy = Math.abs(e.touches[0].clientY - startY);
        // 明らかにフリック動作の場合のみドラッグを防止
        if (dx > 20 && dx > dy) {
          e.preventDefault();
        }
      }
    }
    
    function handleTouchEnd(e) {
      if (!isTouch || startX === null) return;
      
      // フリック終了時の要素から実際のパーツ名を取得
      const target = e.target.closest('[data-selected-part-name]');
      const actualPartName = target?.getAttribute('data-selected-part-name');
      
      if (!actualPartName || !targetPartNames.includes(actualPartName)) {
        startX = null;
        startY = null;
        isTouch = false;
        return;
      }
      
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const dx = endX - startX;
      const dy = endY - startY;
      if (Math.abs(dx) > 15 && Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) {
          // フリック成功時はデフォルト動作を防止
          e.preventDefault();
          onFlickRight && onFlickRight(actualPartName);
        }
      }
      startX = null;
      startY = null;
      isTouch = false;
    }
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: false });
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onFlickRight, partNames]);
}
