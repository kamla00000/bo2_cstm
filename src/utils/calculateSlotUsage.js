// src/utils/calculateSlotUsage.js

export const calculateSlotUsage = (selectedMs, selectedParts, isFullStrengthened, fullStrengtheningEffectsData) => {
  console.log('--- calculateSlotUsage START ---');
  console.log('DEBUG: calculateSlotUsage received MS object:', selectedMs);
  console.log('DEBUG: MS近スロット (original):', selectedMs?.["近スロット"]);
  console.log('DEBUG: MS中スロット (original):', selectedMs?.["中スロット"]);
  console.log('DEBUG: MS遠スロット (original):', selectedMs?.["遠スロット"]);

  let currentClose = 0;
  let currentMid = 0;
  let currentLong = 0;

  // パーツによるスロット消費を計算
  selectedParts.forEach(part => {
    currentClose += Number(part.close || 0);
    currentMid += Number(part.mid || 0);
    currentLong += Number(part.long || 0);
  });

  // MSの基本スロット数を取得
  let maxClose = Number(selectedMs?.["近スロット"] || 0);
  let maxMid = Number(selectedMs?.["中スロット"] || 0);
  let maxLong = Number(selectedMs?.["遠スロット"] || 0);

  let additionalSlots = { close: 0, mid: 0, long: 0 };

  // フル強化によるスロット増加を計算
  console.log('DEBUG: isFullStrengthened (param):', isFullStrengthened);
  console.log('DEBUG: MS fullst property:', selectedMs?.fullst);
  console.log('DEBUG: fullStrengtheningEffectsData exists:', !!fullStrengtheningEffectsData);

  if (isFullStrengthened && selectedMs?.fullst && fullStrengtheningEffectsData) {
    console.log('DEBUG: Entering full strengthening calculation loop.');
    selectedMs.fullst.forEach(fsPart => {
      console.log('DEBUG: Processing fsPart:', fsPart);
      const effectEntry = fullStrengtheningEffectsData.find(effect => effect.name === fsPart.name);
      if (effectEntry) {
        console.log('DEBUG: Found full strengthening effect:', effectEntry);
        const levelEffect = effectEntry.levels.find(level => level.level === fsPart.level);
        if (levelEffect) {
          console.log('DEBUG: Found level effect:', levelEffect);
          // ここを修正しました: levelEffect.effects からスロット値を取得
          const slotIncreaseClose = Number(levelEffect.effects?.['近スロット'] || 0);
          const slotIncreaseMid = Number(levelEffect.effects?.['中スロット'] || 0);
          const slotIncreaseLong = Number(levelEffect.effects?.['遠スロット'] || 0);

          console.log(`DEBUG: levelEffect.effects['近スロット']: ${levelEffect.effects?.['近スロット']} Type: ${typeof levelEffect.effects?.['近スロット']}`);
          console.log(`DEBUG: levelEffect.effects['中スロット']: ${levelEffect.effects?.['中スロット']} Type: ${typeof levelEffect.effects?.['中スロット']}`);
          console.log(`DEBUG: levelEffect.effects['遠スロット']: ${levelEffect.effects?.['遠スロット']} Type: ${typeof levelEffect.effects?.['遠スロット']}`);

          additionalSlots.close += slotIncreaseClose;
          additionalSlots.mid += slotIncreaseMid;
          additionalSlots.long += slotIncreaseLong;
        }
      }
    });
    console.log('DEBUG: Calculated additionalSlots from full strengthening:', additionalSlots);

    maxClose += additionalSlots.close;
    maxMid += additionalSlots.mid;
    maxLong += additionalSlots.long;
  }

  console.log(`DEBUG: Final calculated max slots (C:${maxClose}, M:${maxMid}, L:${maxLong}) from base (C:${Number(selectedMs?.["近スロット"] || 0)}, M:${Number(selectedMs?.["中スロット"] || 0)}, L:${Number(selectedMs?.["遠スロット"] || 0)}) and additional (C:${additionalSlots.close}, M:${additionalSlots.mid}, L:${additionalSlots.long})`);

  return {
    close: currentClose,
    mid: currentMid,
    long: currentLong,
    maxClose: maxClose,
    maxMid: maxMid,
    maxLong: maxLong,
    additionalSlots: additionalSlots, // デバッグ用に含める
  };
};