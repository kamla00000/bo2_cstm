// src/utils/calculateSlots.js

/**
 * MSと選択されたパーツ、フル強化状態に基づいてスロット使用量を計算します。
 * @param {object} ms - 選択されたMSデータ。
 * @param {Array<object>} parts - 選択されたカスタムパーツの配列。
 * @param {boolean} isFullStrengthenedParam - フル強化が有効かどうか。
 * @param {Array<object>} fullStrengtheningEffectsData - フル強化効果のデータ。
 * @returns {object} 計算されたスロット使用量と最大スロット数。
 */
export const calculateSlotUsage = (ms, parts, isFullStrengthenedParam, fullStrengtheningEffectsData) => {
  if (!ms) {
    return { close: 0, mid: 0, long: 0, maxClose: 0, maxMid: 0, maxLong: 0 };
  }

  let usedClose = 0;
  let usedMid = 0;
  let usedLong = 0;
  parts.forEach(part => {
    usedClose += Number(part.close || 0);
    usedMid += Number(part.mid || 0);
    usedLong += Number(part.long || 0);
  });

  let additionalSlots = { close: 0, mid: 0, long: 0 };

  if (isFullStrengthenedParam && ms.fullst && Array.isArray(ms.fullst) && fullStrengtheningEffectsData) {
    ms.fullst.forEach(fsPart => {
      const foundFsEffect = fullStrengtheningEffectsData.find(
        fse => fse.name === fsPart.name
      );
      if (foundFsEffect) {
        const levelEffect = foundFsEffect.levels.find(l => l.level === fsPart.level)?.effects;
        if (levelEffect) {
          if (typeof levelEffect['近スロット'] === 'number') additionalSlots.close += levelEffect['近スロット'];
          if (typeof levelEffect['中スロット'] === 'number') additionalSlots.mid += levelEffect['中スロット'];
          if (typeof levelEffect['遠スロット'] === 'number') additionalSlots.long += levelEffect['遠スロット'];
        }
      }
    });
  }

  const maxClose = Number(ms["近スロット"] || 0) + additionalSlots.close;
  const maxMid = Number(ms["中スロット"] || 0) + additionalSlots.mid;
  const maxLong = Number(ms["遠スロット"] || 0) + additionalSlots.long;

  return {
    close: usedClose,
    mid: usedMid,
    long: usedLong,
    maxClose: maxClose,
    maxMid: maxMid,
    maxLong: maxLong
  };
};