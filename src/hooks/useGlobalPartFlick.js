import { useEffect } from 'react';

/**
 * 全パーツに対して「タップせずにフリックで装着」をグローバルに検知するフック
 * @param {function} onFlickRight - 右フリック時のコールバック（partNameを渡す）
 * @param {Array} partNames - 装着候補のパーツ名リスト
 */
export function useGlobalPartFlick(onFlickRight, partNames) {
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
        // どのパーツを触ったかを判定
        const target = e.target.closest('[data-part-name]');
        if (target) {
          touchedPart = target.getAttribute('data-part-name');
        } else {
          touchedPart = null;
        }
      }
    }
    function handleTouchEnd(e) {
      if (!isTouch || startX === null || !touchedPart) return;
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const dx = endX - startX;
      const dy = endY - startY;
      if (Math.abs(dx) > 15 && Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) {
          if (partNames.includes(touchedPart)) {
            onFlickRight && onFlickRight(touchedPart);
          }
        }
      }
      startX = null;
      startY = null;
      isTouch = false;
      touchedPart = null;
    }
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onFlickRight, partNames]);
}
