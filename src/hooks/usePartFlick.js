import { useEffect } from 'react';

/**
 * 1024px以下でのみ有効なフリック検知フック（パーツ装着用）
 * @param {function} onFlickLeft - 左フリック時のコールバック（装着）
 * @param {function} onFlickRight - 右フリック時のコールバック
 * @param {string} partName - 現在プレビュー中のパーツ名
 */
export function usePartFlick(onFlickLeft, onFlickRight, partName) {
  useEffect(() => {
    if (window.innerWidth > 1024 || !partName) return;
    let startX = null;
    let startY = null;
    let isTouch = false;
    let startElement = null; // タッチ開始時の要素を記録

    function handleTouchStart(e) {
      if (e.touches.length === 1) {
        isTouch = true;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        startElement = e.target; // タッチ開始時の要素を記録
      }
    }
    
    function handleTouchEnd(e) {
      if (!isTouch || startX === null) return;
      
      // タッチ開始時の要素が対象パーツかどうかをチェック
      let targetElement = startElement;
      let isPartElement = false;
      
      // 要素またはその親要素に data-part-name 属性があるかチェック
      while (targetElement && targetElement !== document.body) {
        const partNameAttr = targetElement.getAttribute('data-part-name');
        if (partNameAttr === partName) {
          isPartElement = true;
          break;
        }
        targetElement = targetElement.parentElement;
      }
      
      // 対象パーツ以外では処理を中止
      if (!isPartElement) {
        startX = null;
        startY = null;
        isTouch = false;
        startElement = null;
        return;
      }
      
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const dx = endX - startX;
      const dy = endY - startY;
      if (Math.abs(dx) > 15 && Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) {
          onFlickRight && onFlickRight(partName);
        } else {
          onFlickLeft && onFlickLeft(partName);
        }
      }
      startX = null;
      startY = null;
      isTouch = false;
      startElement = null;
    }
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onFlickLeft, onFlickRight, partName]);
}
