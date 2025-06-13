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
  console.log('--- calculateSlotUsage START ---');
  console.log('DEBUG: calculateSlotUsage received ms:', ms);
  console.log('DEBUG: calculateSlotUsage received parts:', parts);
  console.log('DEBUG: calculateSlotUsage received isFullStrengthenedParam:', isFullStrengthenedParam);
  console.log('DEBUG: calculateSlotUsage received fullStrengtheningEffectsData exists:', !!fullStrengtheningEffectsData);

  if (!ms) {
    console.log('DEBUG: ms is null or undefined. Returning default slot usage.');
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
  console.log('DEBUG: Calculated used slots (from parts):', { usedClose, usedMid, usedLong });


  // MSの基本スロット数を取得
  const baseClose = Number(ms["近スロット"] || 0);
  const baseMid = Number(ms["中スロット"] || 0);
  const baseLong = Number(ms["遠スロット"] || 0);
  console.log('DEBUG: Base MS slots (from ms object):', { baseClose, baseMid, baseLong });


  let additionalSlots = { close: 0, mid: 0, long: 0 };

  if (isFullStrengthenedParam && ms.fullst && Array.isArray(ms.fullst) && fullStrengtheningEffectsData) {
    console.log('DEBUG: Full strengthening is enabled and data exists. Processing ms.fullst.');
    ms.fullst.forEach(fsPart => {
      console.log('DEBUG: Processing full strengthening part:', fsPart);
      const foundFsEffect = fullStrengtheningEffectsData.find(
        fse => fse.name === fsPart.name
      );
      if (foundFsEffect) {
        console.log('DEBUG: Found full strengthening effect entry:', foundFsEffect);
        const levelEffect = foundFsEffect.levels.find(l => l.level === fsPart.level)?.effects;
        if (levelEffect) {
          console.log('DEBUG: Found level effect for full strengthening:', levelEffect);
          if (typeof levelEffect['近スロット'] === 'number') {
            additionalSlots.close += levelEffect['近スロット'];
            console.log(`DEBUG: Added ${levelEffect['近スロット']} to additionalSlots.close. Current: ${additionalSlots.close}`);
          }
          if (typeof levelEffect['中スロット'] === 'number') {
            additionalSlots.mid += levelEffect['中スロット'];
            console.log(`DEBUG: Added ${levelEffect['中スロット']} to additionalSlots.mid. Current: ${additionalSlots.mid}`);
          }
          if (typeof levelEffect['遠スロット'] === 'number') {
            additionalSlots.long += levelEffect['遠スロット'];
            console.log(`DEBUG: Added ${levelEffect['遠スロット']} to additionalSlots.long. Current: ${additionalSlots.long}`);
          }
        } else {
          console.log('DEBUG: No level effect found for full strengthening part:', fsPart.level);
        }
      } else {
        console.log('DEBUG: Full strengthening effect not found in data for:', fsPart.name);
      }
    });
    console.log('DEBUG: Total additional slots from full strengthening:', additionalSlots);
  } else {
    console.log('DEBUG: Full strengthening conditions not met. isFullStrengthenedParam:', isFullStrengthenedParam, 'ms.fullst:', ms?.fullst, 'fullStrengtheningEffectsData exists:', !!fullStrengtheningEffectsData);
  }

  const maxClose = baseClose + additionalSlots.close;
  const maxMid = baseMid + additionalSlots.mid;
  const maxLong = baseLong + additionalSlots.long;
  console.log('DEBUG: Final calculated max slots:', { maxClose, maxMid, maxLong });

  console.log('--- calculateSlotUsage END ---');
  return {
    close: usedClose,
    mid: usedMid,
    long: usedLong,
    maxClose: maxClose,
    maxMid: maxMid,
    maxLong: maxLong,
    // SlotBar.jsx で baseUsageAmount/originalMax として使用されている部分が
    // 実際に maxClose/maxMid/maxLong に依存している可能性があるので、
    // 明示的に base スロットも返します。
    // ただし、SlotBar.jsx のコードを見る限り、baseUsageAmount は ms の初期スロット値そのものであるべきです。
    baseClose: baseClose,
    baseMid: baseMid,
    baseLong: baseLong,
    additionalSlots: additionalSlots // デバッグ用に含める
  };
};