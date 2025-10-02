// ビルド管理ユーティリティ - localStorage操作と設定管理

const MAX_SAVED_BUILDS_PER_MS = 10; // MS別の最大保存数
const LOCAL_KEY_PREFIX = 'gbo2cstm_builds_'; // MS別にキーを分ける

// MS名からストレージキーを生成する関数
export const getMsStorageKey = (msName) => {
    if (!msName) return null;
    // MS名を正規化してキーに使用
    const normalized = msName
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '_') // 特殊文字をアンダースコアに変換
        .replace(/_+/g, '_') // 連続するアンダースコアを1つに
        .replace(/^_+|_+$/g, ''); // 先頭末尾のアンダースコアを削除
    return `${LOCAL_KEY_PREFIX}${normalized}`;
};

// ビルドを保存する関数
export const saveBuildToLocal = (build, msName) => {
    try {
        const storageKey = getMsStorageKey(msName);
        if (!storageKey) {
            console.error('[saveBuildToLocal] 無効なMS名:', msName);
            return false;
        }

        let builds = JSON.parse(localStorage.getItem(storageKey) || '[]');
        
        // 新しいビルドを先頭に追加
        builds.unshift(build);
        
        // MS別の最大数を超えた場合は古いものを削除
        if (builds.length > MAX_SAVED_BUILDS_PER_MS) {
            builds = builds.slice(0, MAX_SAVED_BUILDS_PER_MS);
        }
        
        localStorage.setItem(storageKey, JSON.stringify(builds));
        console.log('[saveBuildToLocal] 保存成功:', {
            msName: msName,
            storageKey: storageKey,
            totalBuilds: builds.length,
            maxBuilds: MAX_SAVED_BUILDS_PER_MS,
            partsCount: build.parts?.length || 0,
            parts: build.parts
        });
        
        return true;
    } catch (error) {
        console.error('[saveBuildToLocal] 保存失敗:', error);
        return false;
    }
};

// ビルドを読み込む関数
export const loadBuildsFromLocal = (msName) => {
    try {
        const storageKey = getMsStorageKey(msName);
        if (!storageKey) {
            console.error('[loadBuildsFromLocal] 無効なMS名:', msName);
            return [];
        }

        const builds = JSON.parse(localStorage.getItem(storageKey) || '[]');
        console.log('[loadBuildsFromLocal] ロード成功:', {
            msName: msName,
            storageKey: storageKey,
            totalBuilds: builds.length,
            maxBuilds: MAX_SAVED_BUILDS_PER_MS,
            builds: builds.map(b => ({ 
                partsCount: b.parts?.length || 0,
                parts: b.parts 
            }))
        });
        return builds;
    } catch (error) {
        console.error('[loadBuildsFromLocal] ロード失敗:', error);
        return [];
    }
};

// 特定のビルドを削除する関数
export const deleteBuildFromLocal = (msName, buildIndex) => {
    try {
        const storageKey = getMsStorageKey(msName);
        if (!storageKey) {
            console.error('[deleteBuildFromLocal] 無効なMS名:', msName);
            return false;
        }

        let builds = JSON.parse(localStorage.getItem(storageKey) || '[]');
        
        if (buildIndex >= 0 && buildIndex < builds.length) {
            builds.splice(buildIndex, 1);
            localStorage.setItem(storageKey, JSON.stringify(builds));
            console.log('[deleteBuildFromLocal] 削除成功:', {
                msName: msName,
                deletedIndex: buildIndex,
                remainingBuilds: builds.length
            });
            return true;
        } else {
            console.error('[deleteBuildFromLocal] 無効なインデックス:', buildIndex);
            return false;
        }
    } catch (error) {
        console.error('[deleteBuildFromLocal] 削除失敗:', error);
        return false;
    }
};

// 全MSのビルド数を取得する関数（デバッグ用）
export const getAllBuildsCount = () => {
    try {
        let totalCount = 0;
        const msBuilds = {};
        
        // localStorageの全キーをチェック
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(LOCAL_KEY_PREFIX)) {
                const msKey = key.replace(LOCAL_KEY_PREFIX, '');
                const builds = JSON.parse(localStorage.getItem(key) || '[]');
                msBuilds[msKey] = builds.length;
                totalCount += builds.length;
            }
        }
        
        console.log('[getAllBuildsCount] 全ビルド数:', { totalCount, msBuilds });
        return { totalCount, msBuilds };
    } catch (error) {
        console.error('[getAllBuildsCount] エラー:', error);
        return { totalCount: 0, msBuilds: {} };
    }
};

// 全ビルドデータをクリアする関数（デバッグ用）
export const clearAllBuilds = () => {
    try {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(LOCAL_KEY_PREFIX)) {
                keysToRemove.push(key);
            }
        }
        
        keysToRemove.forEach(key => localStorage.removeItem(key));
        console.log('[clearAllBuilds] 全ビルドデータをクリア:', keysToRemove);
        return true;
    } catch (error) {
        console.error('[clearAllBuilds] クリア失敗:', error);
        return false;
    }
};

// 設定関連の定数をエクスポート
export { MAX_SAVED_BUILDS_PER_MS, LOCAL_KEY_PREFIX };