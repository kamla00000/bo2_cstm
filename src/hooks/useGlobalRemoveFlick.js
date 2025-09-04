import { useEffect } from 'react';

/**
 * 全装着済みパーツに対して「タップせずにフリックで解除」をグローバルに検知するフック
 * @param {function} onFlickRight - 右フリック時のコールバック（partNameを渡す）
 * @param {Array} partNames - 解除候補のパーツ名リスト
 */
export function useGlobalRemoveFlick(onFlickRight, partNames) {
  useEffect(() => {
    if (window.innerWidth > 1024 || !Array.isArray(partNames)) return;
    let startX = null;
    let startY = null;
    let isTouch = false;
    let touchedPart = null;

    function handleTouchStart(e) {
      if (e.touches.length === 1) {
        isTouch = true;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        // どのパーツを触ったかを判定（判定を甘くする）
        const target = e.target.closest('[data-selected-part-name]');
        if (target) {
          touchedPart = target.getAttribute('data-selected-part-name');
        } else {
          // パーツ要素を直接触っていなくても、フリック終了時に再判定する
          touchedPart = null;
        }
      }
    }
    
    function handleTouchMove(e) {
      if (isTouch && startX !== null) {
        const dx = Math.abs(e.touches[0].clientX - startX);
        const dy = Math.abs(e.touches[0].clientY - startY);
        // 明らかにフリック動作の場合のみドラッグを防止（パーツ判定に関係なく）
        if (dx > 15 && dx > dy) {
          e.preventDefault();
        }
      }
    }
    
    function handleTouchEnd(e) {
      if (!isTouch || startX === null) return;
      
      // フリック終了時にも対象パーツを再判定（判定を甘くする）
      let finalTouchedPart = touchedPart;
      if (!finalTouchedPart) {
        const target = e.target.closest('[data-selected-part-name]');
        if (target) {
          finalTouchedPart = target.getAttribute('data-selected-part-name');
        }
      }
      
      // パーツが特定できない場合は処理を中止
      if (!finalTouchedPart) {
        startX = null;
        startY = null;
        isTouch = false;
        touchedPart = null;
        return;
      }
      
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const dx = endX - startX;
      const dy = endY - startY;
      
      // フリック判定の閾値を少し甘くする（15px → 12px）
      if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) {
          if (partNames.includes(finalTouchedPart)) {
            // フリック成功時はデフォルト動作を防止
            e.preventDefault();
            onFlickRight && onFlickRight(finalTouchedPart);
          }
        }
      }
      startX = null;
      startY = null;
      isTouch = false;
      touchedPart = null;
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
