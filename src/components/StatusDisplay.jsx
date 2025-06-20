import React from 'react';

// isModifiedStats の代わりに isModified を受け取るように変更
const StatusDisplay = ({ stats, selectedMs, hoveredPart, isFullStrengthened, isModified }) => {
  // ログ追加: statsの中身を確認
  console.log("[StatusDisplay] props.stats:", stats);

  const { base, partBonus, fullStrengthenBonus, expansionBonus, partLimitBonus, currentLimits, total, rawTotal } = stats;

  // ログ追加: 各ボーナスの中身を確認
  console.log("[StatusDisplay] base:", base);
  console.log("[StatusDisplay] partBonus:", partBonus);
  console.log("[StatusDisplay] fullStrengthenBonus:", fullStrengthenBonus);
  console.log("[StatusDisplay] expansionBonus:", expansionBonus);
  console.log("[StatusDisplay] partLimitBonus:", partLimitBonus);
  console.log("[StatusDisplay] currentLimits:", currentLimits);
  console.log("[StatusDisplay] total:", total);
  console.log("[StatusDisplay] rawTotal:", rawTotal);

  if (!selectedMs || !stats) {
    console.log("[StatusDisplay] No selected MS or stats data available.");
    return <div className="bg-gray-800 p-4 rounded-xl shadow-md">ステータス情報なし</div>;
  }

  const renderStatRow = (label, statKey) => {
    // 値を数値として確実に取得
    const baseValue = Number(base[statKey] || 0);
    const partBonusValue = Number(partBonus[statKey] || 0);
    const fullStrengthenBonusValue = Number(fullStrengthenBonus[statKey] || 0);
    const expansionBonusValue = Number(expansionBonus[statKey] || 0);
    const partLimitBonusValue = Number(partLimitBonus?.[statKey] || 0); // 追加
    const rawTotalValue = Number(rawTotal[statKey] || 0);
    const totalValue = Number(total[statKey] || 0);

    // ログ追加: 各値の確認
    console.groupCollapsed(`[StatusDisplay] renderStatRow for ${label} (${statKey})`);
    console.log(`  baseValue: ${baseValue} (typeof: ${typeof baseValue})`);
    console.log(`  partBonusValue: ${partBonusValue} (typeof: ${typeof partBonusValue})`);
    console.log(`  fullStrengthenBonusValue: ${fullStrengthenBonusValue} (typeof: ${typeof fullStrengthenBonusValue})`);
    console.log(`  expansionBonusValue: ${expansionBonusValue} (typeof: ${typeof expansionBonusValue})`);
    console.log(`  partLimitBonusValue: ${partLimitBonusValue} (typeof: ${typeof partLimitBonusValue})`);
    console.log(`  rawTotalValue: ${rawTotalValue} (typeof: ${typeof rawTotalValue})`);
    console.log(`  totalValue: ${totalValue} (typeof: ${typeof totalValue})`);
    console.groupEnd();

    // ボーナス値の表示形式 (0の場合は'-', 正の場合は'+')
    const formatBonus = (value) => {
      if (value === 0) return '-';
      return value > 0 ? `+${value}` : `${value}`;
    };

    // 数値を強制的に文字列として返すように変更
    const displayNumericValue = (value) => {
      if (value === null || value === undefined || isNaN(value)) {
        return '0';
      }
      return String(value);
    };

    // partBonusValueとexpansionBonusValueを合算した新しいボーナス値を定義
    const combinedBonusValue = partBonusValue + expansionBonusValue;

    // 「上限増」列の値を合算（拡張選択＋カスタムパーツ上限幅）
    const totalLimitBonusValue = expansionBonusValue + partLimitBonusValue;

    let limitDisplay = '-';
    let limitColorClass = 'text-gray-400';

    if (statKey === 'hp' || currentLimits[statKey] === Infinity) {
      limitDisplay = '-';
    } else if (currentLimits[statKey] !== undefined && currentLimits[statKey] !== null) {
      limitDisplay = displayNumericValue(currentLimits[statKey]);
      if (currentLimits.flags && currentLimits.flags[statKey]) {
        limitColorClass = 'text-green-400';
      }
    }

    // isModifiedStats の代わりに isModified を使用
    const isStatModified = isModified && isModified[statKey];
    const totalValueColorClass = isStatModified ? 'text-green-500' : 'text-white';

    // 合計値はrawTotalValueを表示し、オーバー分もrawTotalValueから計算
    return (
      <div key={statKey} className="grid grid-cols-7 gap-2 py-1 border-b border-gray-700 last:border-b-0 items-center">
        <div className="text-gray-300 text-sm font-semibold whitespace-nowrap">{label}</div>
        <div className="text-gray-300 text-sm text-right whitespace-nowrap">{displayNumericValue(baseValue)}</div>
        <div className={`text-sm text-right whitespace-nowrap ${combinedBonusValue > 0 ? 'text-green-400' : (combinedBonusValue < 0 ? 'text-red-400' : 'text-gray-400')}`}>
          {formatBonus(combinedBonusValue)}
        </div>
        <div className={`text-sm text-right whitespace-nowrap ${fullStrengthenBonusValue > 0 ? 'text-green-400' : (fullStrengthenBonusValue < 0 ? 'text-red-400' : 'text-gray-400')}`}>
          {formatBonus(fullStrengthenBonusValue)}
        </div>
        <div className={`text-sm text-right whitespace-nowrap ${totalLimitBonusValue > 0 ? 'text-green-400' : (totalLimitBonusValue < 0 ? 'text-red-400' : 'text-gray-400')}`}>
          {formatBonus(totalLimitBonusValue)}
        </div>

        <div className="text-sm text-right font-bold flex flex-col items-end justify-center">
          <span className={
            (currentLimits[statKey] !== undefined && currentLimits[statKey] !== null && rawTotalValue > currentLimits[statKey] && currentLimits[statKey] !== Infinity)
              ? 'text-red-500' : totalValueColorClass
          }>
            {displayNumericValue(rawTotalValue)}
          </span>
          {currentLimits[statKey] !== undefined && currentLimits[statKey] !== null && currentLimits[statKey] !== Infinity && rawTotalValue > currentLimits[statKey] && (
            <span className="text-red-500 text-xs mt-0.5 whitespace-nowrap leading-none">
              +{rawTotalValue - currentLimits[statKey]} OVER
            </span>
          )}
        </div>

        <div className="text-sm text-right whitespace-nowrap font-bold">
          <span className={limitColorClass}>{limitDisplay}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-800 p-4 rounded-xl shadow-inner border border-gray-700 flex-grow">
      <h2 className="text-xl font-semibold mb-3 text-white">ステータス一覧</h2>
      {selectedMs ? (
        <div className="space-y-1">
          <div className="grid grid-cols-7 gap-2 pb-2 border-b border-gray-600 text-gray-400 font-bold">
            <div className="whitespace-nowrap">項目</div>
            <div className="text-right whitespace-nowrap">初期値</div>
            <div className="text-right whitespace-nowrap">補正値</div>
            <div className="text-right whitespace-nowrap">フル強化</div>
            <div className="text-right whitespace-nowrap">上限増</div>
            <div className="text-right whitespace-nowrap">合計値</div>
            <div className="text-right whitespace-nowrap">上限合計</div>
          </div>

          {renderStatRow('HP', 'hp')}
          {renderStatRow('射撃補正', 'shoot')}
          {renderStatRow('格闘補正', 'meleeCorrection')}
          {renderStatRow('耐実弾補正', 'armorRange')}
          {renderStatRow('耐ビーム補正', 'armorBeam')}
          {renderStatRow('耐格闘補正', 'armorMelee')}
          {renderStatRow('スピード', 'speed')}
          {renderStatRow('高速移動', 'highSpeedMovement')}
          {renderStatRow('スラスター', 'thruster')}
          {renderStatRow('旋回(地上)', 'turnPerformanceGround')}
          {renderStatRow('旋回(宇宙)', 'turnPerformanceSpace')}

          <div className="grid grid-cols-7 gap-2 py-1 items-center border-b border-gray-700 last:border-b-0">
            <div className="col-span-full text-sm text-right text-white pr-2">
              <span className="font-semibold mr-4">格闘判定力:</span>
              <span className="font-bold mr-8">{selectedMs["格闘判定力"] || '-'}</span>
              <span className="font-semibold mr-4">カウンター:</span>
              <span className="font-bold">{selectedMs["カウンター"] || '-'}</span>
            </div>
          </div>

        </div>
      ) : (
        <p className="text-gray-400 py-4 text-center">モビルスーツを選択してください。</p>
      )}
    </div>
  );
};

export default StatusDisplay;