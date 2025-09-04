import { useEffect } from 'react';

/**
 * 767px以下でのみ有効なフリック検知フック
 * @param {function} onFlickLeft - 左フリック時のコールバック
 * @param {function} onFlickRight - 右フリック時のコールバック
 */
export function useFlick(onFlickLeft, onFlickRight) {
  useEffect(() => {
    let startX = null;
    let startY = null;
    let isTouch = false;
    let isDrag = false;

    function handleTouchStart(e) {
      // 767px以下でのみ有効
      if (window.innerWidth > 767) return;
      
      if (e.touches.length === 1) {
        isTouch = true;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      }
    }
    
    function handleTouchEnd(e) {
      if (!isTouch || startX === null) return;
      if (window.innerWidth > 767) return;
      
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const dx = endX - startX;
      const dy = endY - startY;
      
      if (Math.abs(dx) > 15 && Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) {
          onFlickRight && onFlickRight();
        } else {
          onFlickLeft && onFlickLeft();
        }
      }
      startX = null;
      startY = null;
      isTouch = false;
    }

    // マウスイベント（デスクトップテスト用）
    function handleMouseDown(e) {
      // 767px以下でのみ有効
      if (window.innerWidth > 767) return;
      
      isDrag = true;
      startX = e.clientX;
      startY = e.clientY;
    }

    function handleMouseUp(e) {
      if (!isDrag || startX === null) return;
      if (window.innerWidth > 767) {
        isDrag = false;
        startX = null;
        startY = null;
        return;
      }
      
      const endX = e.clientX;
      const endY = e.clientY;
      const dx = endX - startX;
      const dy = endY - startY;
      
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) {
          onFlickRight && onFlickRight();
        } else {
          onFlickLeft && onFlickLeft();
        }
      }
      startX = null;
      startY = null;
      isDrag = false;
    }
    
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [onFlickLeft, onFlickRight]);
}
