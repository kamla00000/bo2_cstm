// src/hooks/useDataLoading.js
import { useState, useEffect, useRef } from 'react';
import { CATEGORIES, ALL_CATEGORY_NAME } from '../constants/appConstants'; // 定数をインポート

export const useDataLoading = () => {
  const [msData, setMsData] = useState([]);
  const [fullStrengtheningEffects, setFullStrengtheningEffects] = useState([]);
  const allPartsCache = useRef({}); // 全てのパーツデータをキャッシュするためのref
  const [isDataLoaded, setIsDataLoaded] = useState(false); // 全データロード完了フラグ

  useEffect(() => {
    const loadAllInitialData = async () => {
      try {
        // MSデータとフル強化データを並行してロード
        const [msResponse, fullStrengtheningResponse] = await Promise.all([
          fetch('/data/msData.json'),
          fetch('/data/fullst.json')
        ]);

        if (!msResponse.ok) throw new Error(`HTTP error! status: ${msResponse.status} for msData.json`);
        if (!fullStrengtheningResponse.ok) throw new Error(`HTTP error! status: ${fullStrengtheningResponse.status} for fullst.json`);

        const msJson = await msResponse.json();
        const fullStrengtheningJson = await fullStrengtheningResponse.json();

        // ここにデバッグログを追加
        console.log('DEBUG: useDataLoading - msData.json loaded. First MS entry:', msJson[0]);
        const cannonGun = msJson.find(ms => ms.MS名 === "キャノンガン_LV1");
        if (cannonGun) {
            console.log('DEBUG: useDataLoading - "キャノンガン_LV1" entry:', cannonGun);
            console.log('DEBUG: "キャノンガン_LV1" 近スロット:', cannonGun["近スロット"]);
            console.log('DEBUG: "キャノンガン_LV1" 中スロット:', cannonGun["中スロット"]);
            console.log('DEBUG: "キャノンガン_LV1" 遠スロット:', cannonGun["遠スロット"]);
        } else {
            console.log('DEBUG: "キャノンガン_LV1" not found in loaded msData.json.');
        }


        setMsData(msJson);
        setFullStrengtheningEffects(fullStrengtheningJson);

        // 全てのパーツデータをキャッシュにロード
        const partsPromises = CATEGORIES.map(async (cat) => {
          if (!allPartsCache.current[cat.name]) {
            try {
              const response = await fetch(`/data/${cat.fileName}`);
              if (!response.ok) throw new Error(`HTTP error! status: ${response.status} for ${cat.fileName}`);
              const data = await response.json();
              allPartsCache.current[cat.name] = data;
            } catch (error) {
              console.error(`パーツデータ読み込みエラー (${cat.fileName}):`, error);
            }
          }
        });
        await Promise.all(partsPromises);
        setIsDataLoaded(true); // 全てのデータロードが完了
      } catch (error) {
        console.error("初期データ読み込みエラー:", error);
        setIsDataLoaded(false); // エラー時はfalseのまま
      }
    };

    loadAllInitialData();
  }, []); // 初回のみ実行

  return {
    msData,
    fullStrengtheningEffects,
    allPartsCache: allPartsCache.current, // refの.currentを直接返す
    isDataLoaded, // ロード完了フラグ
  };
};