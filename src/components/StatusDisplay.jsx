import React from 'react';

// statsオブジェクトに base, partBonus, fullStrengthenBonus, expansionBonus, currentLimits, total が含まれていることを前提とします
const StatusDisplay = ({ stats, selectedMs, hoveredPart, isFullStrengthened }) => {
  // statsから必要な値を分解して取得
  const { base, partBonus, fullStrengthenBonus, expansionBonus, currentLimits, total, rawTotal } = stats;

  // ステータス表示用の共通関数
  const renderStatRow = (label, statKey) => {
    const baseValue = Number(base[statKey] || 0);
    const partBonusValue = Number(partBonus[statKey] || 0);
    const fullStrengthenBonusValue = Number(fullStrengthenBonus[statKey] || 0);
    const expansionBonusValue = Number(expansionBonus[statKey] || 0); // expansionBonusValue を取得
    const rawTotalValue = Number(rawTotal[statKey] || 0); // クリップ前の合計値
    const totalValue = Number(total[statKey] || 0);

    // ボーナス値の表示形式 (0の場合は'-', 正の場合は'+')
    const formatBonus = (value) => {
      if (value === 0) return '-';
      return value > 0 ? `+${value}` : `${value}`;
    };

    // 数値をそのまま表示する関数
    const displayValue = (value) => {
      return value;
    };
    
    // 上限値の表示と色
    let limitDisplay = '-'; // デフォルトは '-'
    let limitColorClass = 'text-gray-400'; // デフォルトの色

    // HPの上限は表示しない（-）
    // currentLimitsがInfinityの場合も -
    if (statKey === 'hp' || currentLimits[statKey] === Infinity) {
        limitDisplay = '-';
    } else if (currentLimits[statKey] !== undefined && currentLimits[statKey] !== null) {
        limitDisplay = displayValue(currentLimits[statKey]);
        // App.jsxで設定した個別の変更フラグをチェック
        if (currentLimits.flags && currentLimits.flags[statKey]) {
            limitColorClass = 'text-green-400'; // 上限が動的に変更された場合
        }
    }


    return (
      // grid-cols-7 に変更
      <div key={statKey} className="grid grid-cols-7 gap-2 py-1 border-b border-gray-700 last:border-b-0 items-center">
        <div className="text-gray-300 text-sm font-semibold whitespace-nowrap">{label}</div>         {/* 項目 */}
        <div className="text-gray-300 text-sm text-right whitespace-nowrap">{displayValue(baseValue)}</div>   {/* 初期値 */}
        <div className={`text-sm text-right whitespace-nowrap ${partBonusValue > 0 ? 'text-green-400' : (partBonusValue < 0 ? 'text-red-400' : 'text-gray-400')}`}>
          {formatBonus(partBonusValue)}
        </div>                                                                                                {/* 補正値 (パーツ) */}
        <div className={`text-sm text-right whitespace-nowrap ${fullStrengthenBonusValue > 0 ? 'text-green-400' : (fullStrengthenBonusValue < 0 ? 'text-red-400' : 'text-gray-400')}`}>
          {formatBonus(fullStrengthenBonusValue)}
        </div>                                                                                                {/* フル強化 */}
        <div className={`text-sm text-right whitespace-nowrap ${expansionBonusValue > 0 ? 'text-green-400' : (expansionBonusValue < 0 ? 'text-red-400' : 'text-gray-400')}`}>
          {formatBonus(expansionBonusValue)} {/* 拡張ボーナスの表示 */}
        </div>                                                                                                {/* 拡張 */}
        
        {/* 合計値の表示とオーバー分 (上限値の前に移動) */}
        <div className="text-sm text-right font-bold flex flex-col items-end justify-center">
          <span className={
            // クリップ前の値が上限を超えている場合に赤くする
            (currentLimits[statKey] !== undefined && currentLimits[statKey] !== null && rawTotalValue > currentLimits[statKey])
            ? 'text-red-500' : 'text-white'
          }>{displayValue(totalValue)}</span>
          {/* オーバー分の表示 */}
          {currentLimits[statKey] !== undefined && currentLimits[statKey] !== null && rawTotalValue > currentLimits[statKey] && (
            <span className="text-red-500 text-xs mt-0.5 whitespace-nowrap leading-none">
              +{rawTotalValue - currentLimits[statKey]} OVER
            </span>
          )}
        </div>                                                                                                {/* 合計値 */}

        {/* 上限値の表示と色 (合計値の後に移動し、太文字に) */}
        <div className="text-sm text-right whitespace-nowrap font-bold">
          <span className={limitColorClass}>{limitDisplay}</span>
        </div>                                                                                                {/* 上限 */}
      </div>
    );
  };


  return (
    <div className="bg-gray-800 p-4 rounded-xl shadow-inner border border-gray-700 flex-grow">
      <h2 className="text-xl font-semibold mb-3 text-white">ステータス一覧</h2>
      {selectedMs ? (
        <div className="space-y-1">
          {/* ヘッダー行 - grid-cols-7 に調整 */}
          <div className="grid grid-cols-7 gap-2 pb-2 border-b border-gray-600 text-gray-400 font-bold">
            <div className="whitespace-nowrap">項目</div>
            <div className="text-right whitespace-nowrap">初期値</div>         
            <div className="text-right whitespace-nowrap">補正値</div> {/* パーツによる補正 */}
            <div className="text-right whitespace-nowrap">フル強化</div> {/* フル強化による補正 */}
            <div className="text-right whitespace-nowrap">拡張</div> {/* 拡張列 */}
            <div className="text-right whitespace-nowrap">合計値</div>         {/* 合計値 (上限値の前に移動) */}
            <div className="text-right whitespace-nowrap">上限</div>         {/* 上限値 (合計値の後に移動) */}
          </div>

          {renderStatRow('HP', 'hp')}
          {renderStatRow('耐実弾補正', 'armor')}
          {renderStatRow('耐ビーム補正', 'beam')}
          {renderStatRow('耐格闘補正', 'melee')}
          {renderStatRow('射撃補正', 'shoot')}
          {renderStatRow('格闘補正', 'meleeCorrection')}
          {renderStatRow('スピード', 'speed')}
          {renderStatRow('高速移動', 'highSpeedMovement')} {/* 高速移動を追加 */}
          {renderStatRow('スラスター', 'thruster')}
          {renderStatRow('旋回(地上)', 'turnPerformanceGround')} {/* 旋回(地上)を追加 */}
          {renderStatRow('旋回(宇宙)', 'turnPerformanceSpace')} {/* 旋回(宇宙)を追加 */}

          {/* 格闘判定力とカウンターを1行にまとめる - grid-cols-7 に調整 */}
          <div className="grid grid-cols-7 gap-2 py-1 items-center border-b border-gray-700 last:border-b-0">
            {/* この行は統計値ではないため、col-spanを調整して表示 */}
            <div className="col-span-full text-sm text-right text-white pr-2"> {/* pr-2 で右端の余白を調整 */}
              <span className="font-semibold mr-4">格闘判定力:</span> 
              <span className="font-bold mr-8">{selectedMs["格闘判定力"] || '-'}</span>
              <span className="font-semibold mr-4">カウンター:</span> 
              <span className="font-bold">{selectedMs["カウンター"] || '-'}</span>
            </div>
          </div>

        </div>
      ) : (
        <p className="text-gray-400">モビルスーツを選択してください。</p>
      )}
    </div>
  );
};

export default StatusDisplay;