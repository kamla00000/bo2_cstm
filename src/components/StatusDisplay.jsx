import React from 'react';

// calculateMSStatsLogicの初期上限値と合わせる
const initialLimits = {
  hp: Infinity,
  armorRange: 50,
  armorBeam: 50,
  armorMelee: 50,
  shoot: 100,
  meleeCorrection: 100,
  speed: 200,
  highSpeedMovement: Infinity,
  thruster: 100,
  turnPerformanceGround: Infinity,
  turnPerformanceSpace: Infinity,
};

const StatusDisplay = ({
  stats,
  selectedMs,
  hoveredPart,
  isFullStrengthened,
  isModified,
  expansionType,
}) => {
  console.log("[StatusDisplay] props.stats:", stats);

  const {
    base,
    partBonus,
    fullStrengthenBonus,
    expansionBonus,
    partLimitBonus,
    currentLimits,
    total,
    rawTotal,
  } = stats;

  if (!selectedMs || !stats) {
    console.log("[StatusDisplay] No selected MS or stats data available.");
    return <div className="bg-gray-800 p-4 shadow-md">ステータス情報なし</div>;
  }

  // 3桁区切りのフォーマット関数
  const formatNumber = (value) => {
    if (value === null || value === undefined || isNaN(value)) return '0';
    return Number(value).toLocaleString();
  };

  // HPだけ大文字小文字の違いに対応
  const getBonusValue = (obj, statKey) => {
    if (!obj) return 0;
    if (statKey in obj) return Number(obj[statKey] || 0);
    if (statKey.toLowerCase() in obj) return Number(obj[statKey.toLowerCase()] || 0);
    if (statKey.toUpperCase() in obj) return Number(obj[statKey.toUpperCase()] || 0);
    return 0;
  };

  const renderStatRow = (label, statKey) => {
  const baseValue = getBonusValue(base, statKey);
  const partBonusValue = getBonusValue(partBonus, statKey);
  const fullStrengthenBonusValue = getBonusValue(fullStrengthenBonus, statKey);
  const expansionBonusValue = getBonusValue(expansionBonus, statKey);
  const partLimitBonusValue = getBonusValue(partLimitBonus, statKey);
  const rawTotalValue = getBonusValue(rawTotal, statKey);
  const totalValue = getBonusValue(total, statKey);

  // HP特殊強化フレーム判定
  const isSpecialFrameA =
    (expansionType && expansionType.includes('特殊強化フレーム')) ||
    (selectedMs?.拡張選択 && selectedMs.拡張選択.includes('特殊強化フレーム')) ||
    (selectedMs?.拡張スロット && selectedMs.拡張スロット.includes('特殊強化フレーム'));

  // 補正値 = パーツ + 拡張（スラスター拡張も常に加算する）
  let combinedBonusValue = partBonusValue + expansionBonusValue;

  // HP特殊強化フレーム時はHP5%増加分を補正値に加算して表示
  let isSpecialHpBonus = false;
  if ((statKey === 'hp' || statKey === 'HP') && isSpecialFrameA) {
    const hp5Bonus = Math.floor(baseValue * 0.05);
    combinedBonusValue = partBonusValue + expansionBonusValue + hp5Bonus;
    if (hp5Bonus !== 0) isSpecialHpBonus = true;
  } else if (
    statKey === 'thruster' &&
    expansionBonusValue !== 0
  ) {
    // --- スラスター拡張時も必ずexpansionBonusを補正値に加算する ---
    combinedBonusValue = partBonusValue + expansionBonusValue;
  }

    const formatBonus = (value) => {
      // HP特殊強化フレーム時、5%分があれば必ず表示。0なら-。
      if ((statKey === 'hp' || statKey === 'HP') && isSpecialFrameA) {
        if (isSpecialHpBonus || value !== 0) {
          return value > 0 ? `+${formatNumber(value)}` : `${formatNumber(value)}`;
        } else {
          return '-';
        }
      }
      if (value === 0) return '-';
      return value > 0 ? `+${formatNumber(value)}` : `${formatNumber(value)}`;
    };

    const displayNumericValue = (value) => {
      if (value === null || value === undefined || isNaN(value)) {
        return '0';
      }
      return formatNumber(value);
    };

    // 上限増は「現在の上限値 - 初期上限値」で計算
    const initialLimitValue = initialLimits[statKey] ?? 0;
    let totalLimitBonusValue = null;
    if (currentLimits && currentLimits[statKey] !== undefined && initialLimitValue !== Infinity) {
      totalLimitBonusValue = currentLimits[statKey] - initialLimitValue;
    } else {
      totalLimitBonusValue = expansionBonusValue + partLimitBonusValue;
    }

    let limitDisplay = '-';
    let limitColorClass = 'text-gray-200';

    if (statKey === 'hp' || statKey === 'HP' || currentLimits[statKey] === Infinity) {
      limitDisplay = '-';
    } else if (currentLimits[statKey] !== undefined && currentLimits[statKey] !== null) {
      limitDisplay = displayNumericValue(currentLimits[statKey]);
      if (currentLimits.flags && currentLimits.flags[statKey]) {
        limitColorClass = 'text-orange-500';
      }
    }

    const isStatModified = isModified && isModified[statKey];
    const totalValueColorClass = isStatModified ? 'text-orange-500' : 'text-gray-200';

    return (
      <div key={statKey} className="grid grid-cols-7 gap-2 py-1 border-b border-gray-700 last:border-b-0 items-center">
        <div className="text-gray-200 text-sm whitespace-nowrap">{label}</div>
        <div className="text-gray-200 text-sm text-right whitespace-nowrap">{displayNumericValue(baseValue)}</div>
        <div className={`text-sm text-right whitespace-nowrap ${combinedBonusValue > 0 ? 'text-orange-300' : (combinedBonusValue < 0 ? 'text-red-500' : 'text-gray-200')}`}>
          {formatBonus(combinedBonusValue)}
        </div>
        <div className={`text-sm text-right whitespace-nowrap ${fullStrengthenBonusValue > 0 ? 'text-orange-300' : (fullStrengthenBonusValue < 0 ? 'text-red-500' : 'text-gray-200')}`}>
          {formatBonus(fullStrengthenBonusValue)}
        </div>
        <div className={`text-sm text-right whitespace-nowrap ${totalLimitBonusValue > 0 ? 'text-orange-300' : (totalLimitBonusValue < 0 ? 'text-red-500' : 'text-gray-200')}`}>
          {formatBonus(totalLimitBonusValue)}
        </div>
        <div className="text-sm text-right flex flex-col items-end justify-center">
          <span className={
            (currentLimits[statKey] !== undefined && currentLimits[statKey] !== null && rawTotalValue > currentLimits[statKey] && currentLimits[statKey] !== Infinity)
              ? 'text-red-500' : totalValueColorClass
          }>
            {displayNumericValue(rawTotalValue)}
          </span>
          {currentLimits[statKey] !== undefined && currentLimits[statKey] !== null && currentLimits[statKey] !== Infinity && rawTotalValue > currentLimits[statKey] && (
            <span className="text-red-500 text-xs mt-0.5 whitespace-nowrap leading-none">
              +{formatNumber(rawTotalValue - currentLimits[statKey])} OVER
            </span>
          )}
        </div>
        <div className="text-sm text-right whitespace-nowrap">
          <span className={limitColorClass}>{limitDisplay}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="pickedms-card p-4 flex-grow flex flex-col justify-end pb-0.5">
      <h2 className="text-xl mb-3 text-gray-200">ステータス一覧</h2>
      {selectedMs ? (
        <div className="space-y-1">
          <div className="grid grid-cols-7 gap-2 pb-2 border-b border-gray-600 text-gray-200">
            <div className="whitespace-nowrap">項目</div>
            <div className="text-right whitespace-nowrap">初期値</div>
            <div className="text-right whitespace-nowrap">補正値</div>
            <div className="text-right whitespace-nowrap">フル強化</div>
            <div className="text-right whitespace-nowrap">上限増</div>
            <div className="text-right whitespace-nowrap">合計値</div>
            <div className="text-right whitespace-nowrap">上限合計</div>
          </div>

          {renderStatRow('HP', 'hp')}
          
          {renderStatRow('耐実弾補正', 'armorRange')}
          {renderStatRow('耐ビーム補正', 'armorBeam')}
          {renderStatRow('耐格闘補正', 'armorMelee')}
          {renderStatRow('射撃補正', 'shoot')}
          {renderStatRow('格闘補正', 'meleeCorrection')}
          {renderStatRow('スピード', 'speed')}
          {renderStatRow('高速移動', 'highSpeedMovement')}
          {renderStatRow('スラスター', 'thruster')}
          {renderStatRow('旋回(地上)', 'turnPerformanceGround')}
          {renderStatRow('旋回(宇宙)', 'turnPerformanceSpace')}

          <div className="grid grid-cols-7 gap-2 py-1 items-center border-b border-gray-700 last:border-b-0">
            <div className="col-span-full text-md text-right text-gray-200 pr-2">
              <span className="font-semibold">判定：</span>
              <span className="font-bold mr-8">{selectedMs["格闘判定力"] || '-'}</span>
              <span className="font-semibold">カウンター：</span>
              <span className="font-bold">{selectedMs["カウンター"] || '-'}</span>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-200 py-4 text-center">モビルスーツを選択してください。</p>
      )}
    </div>
  );
};

export default StatusDisplay;