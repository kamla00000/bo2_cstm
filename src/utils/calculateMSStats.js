// src/utils/calculateMSStats.js
export const calculateMSStats = (msSelected, parts = []) => {
  if (!msSelected) {
    console.warn('⚠️ msSelected が null または undefined');
    return {};
  }

  const stats = {
    name: msSelected["MS名"] || '不明',
    属性: msSelected["属性"] || 'なし', // ✅ 属性を追加
    コスト: msSelected.コスト || 0,
    HP: msSelected.HP || 0,
    耐実弾補正: msSelected.耐実弾補正 ?? 0,
    耐ビーム補正: msSelected.耐ビーム補正 ?? 0,
    耐格闘補正: msSelected.耐格闘補正 ?? 0,
    射撃補正: msSelected.射撃補正 ?? 0,
    格闘補正: msSelected.格闘補正 ?? 0,
    スピード: msSelected.スピード ?? 0,
    高速移動: msSelected.高速移動 ?? 0,
    スラスター: msSelected.スラスター ?? 0,
    旋回_地上_通常時: msSelected.旋回_地上_通常時 ?? 0,
    旋回_宇宙_通常時: msSelected.旋回_宇宙_通常時 ?? 0,
    格闘判定力: msSelected.格闘判定力 ?? '',
    カウンター: msSelected.カウンター ?? '',
    close: msSelected.近スロット ?? 0,
    mid: msSelected.中スロット ?? 0,
    long: msSelected.遠スロット ?? 0,
  };

  const noBonusKeys = ['カウンター', 'close', 'mid', 'long'];

  const bonus = {};
  const total = {};

  Object.keys(stats).forEach((key) => {
    if (!noBonusKeys.includes(key)) {
      bonus[key] = 0;
      total[key] = stats[key];
    } else {
      bonus[key] = null;
      total[key] = stats[key];
    }
  });

  parts.forEach((part) => {
    Object.entries(part).forEach(([key, value]) => {
      if (typeof value === 'number' && !isNaN(value)) {
        if (bonus.hasOwnProperty(key) && bonus[key] !== null) {
          bonus[key] += value;
          total[key] = stats[key] + bonus[key];
        }
      }
    });
  });

  return {
    base: stats,
    bonus,
    total
  };
};