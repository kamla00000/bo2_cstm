// デバイス検出ユーティリティ

/**
 * タッチサポートがあるかどうかを判定
 * @returns {boolean} タッチサポートがある場合はtrue
 */
export const isTouchSupported = () => {
    return 'ontouchstart' in window || 
           navigator.maxTouchPoints > 0 || 
           navigator.msMaxTouchPoints > 0;
};

/**
 * マウス優先デバイスかどうかを判定
 * タッチサポートがなく、ホバーが利用可能な環境
 * @returns {boolean} マウス優先デバイスの場合はtrue
 */
export const isMousePrimaryDevice = () => {
    const hasTouch = isTouchSupported();
    const hasHover = window.matchMedia('(hover: hover)').matches;
    
    // タッチサポートがなく、ホバーが利用可能な場合はマウス優先
    return !hasTouch && hasHover;
};

/**
 * デバイスタイプを取得
 * @returns {'mouse' | 'touch' | 'hybrid'} デバイスタイプ
 */
export const getDeviceType = () => {
    const hasTouch = isTouchSupported();
    const hasHover = window.matchMedia('(hover: hover)').matches;
    
    if (!hasTouch && hasHover) {
        return 'mouse'; // 純粋なマウス環境
    } else if (hasTouch && !hasHover) {
        return 'touch'; // 純粋なタッチ環境
    } else {
        return 'hybrid'; // ハイブリッド環境（タッチもマウスも使える）
    }
};

/**
 * フリックガイドを表示すべきかどうかを判定
 * @returns {boolean} フリックガイドを表示する場合はtrue
 */
export const shouldShowFlickGuide = () => {
    const deviceType = getDeviceType();
    // マウス優先デバイスではフリックガイドを表示しない
    return deviceType !== 'mouse';
};

/**
 * クリックで即座に装備・解除を行うかどうかを判定
 * @returns {boolean} 即座に装備・解除を行う場合はtrue
 */
export const shouldInstantAction = () => {
    const deviceType = getDeviceType();
    // マウス優先デバイスでは即座にアクションを実行
    return deviceType === 'mouse';
};