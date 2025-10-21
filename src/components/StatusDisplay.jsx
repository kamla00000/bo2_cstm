import styles from './StatusDisplay.module.css';
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
  previewStats,
  selectedMs,
  hoveredPart,
  isFullStrengthened,
  isModified,
  expansionType,
  isMobile = false,
  onClose,
}) => {
  console.log("[StatusDisplay] props.stats:", stats);
  console.log("[StatusDisplay] props.previewStats:", previewStats);

  // タブの状態管理
  const [activeTab, setActiveTab] = React.useState('graph'); // 'graph' または 'numbers'

  // ホバー時は previewStats を使用、通常時は stats を使用
  const displayStats = previewStats || stats;

  const {
    base,
    partBonus,
    fullStrengthenBonus,
    expansionBonus,
    partLimitBonus,
    currentLimits,
    total,
    rawTotal,
  } = displayStats;

  if (!selectedMs || !displayStats) {
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
  
  // A placeholder function to avoid errors. You need to define the actual logic.
  const formatBonus = (value) => {
    if (value > 0) return `+${formatNumber(value)}`;
    if (value < 0) return `-${formatNumber(Math.abs(value))}`;
    return '0';
  };

  // 耐久指標の計算関数
  const calculateDurabilityIndex = (armorType) => {
    // 機体HPの上限制限後の値を取得
    const rawHpValue = getBonusValue(rawTotal, 'hp');
    const hpLimit = currentLimits && currentLimits.hp !== undefined && currentLimits.hp !== null && currentLimits.hp !== Infinity 
      ? currentLimits.hp 
      : rawHpValue;
    const hpValue = Math.min(rawHpValue, hpLimit);
    
    // 各耐性の上限制限後の値を取得
    let armorValue;
    let armorStatKey;
    switch (armorType) {
      case 'range':
        armorStatKey = 'armorRange';
        break;
      case 'beam':
        armorStatKey = 'armorBeam';
        break;
      case 'melee':
        armorStatKey = 'armorMelee';
        break;
      default:
        return 0;
    }
    
    const rawArmorValue = getBonusValue(rawTotal, armorStatKey);
    const armorLimit = currentLimits && currentLimits[armorStatKey] !== undefined && currentLimits[armorStatKey] !== null && currentLimits[armorStatKey] !== Infinity
      ? currentLimits[armorStatKey]
      : rawArmorValue;
    armorValue = Math.min(rawArmorValue, armorLimit);
    
    // 計算式: HP ÷ (100 - 耐性) × 100
    // 耐性が100以上の場合は計算不可能なので0を返す
    if (armorValue >= 100) {
      return '∞'; // 無限大を表示
    }
    
    const durabilityIndex = (hpValue / (100 - armorValue)) * 100;
    return Math.round(durabilityIndex); // 小数点以下を四捨五入
  };

  // 耐久指標が基本値から変動しているかどうかを判定
  const isDurabilityIndexModified = (armorType) => {
    // 基本HPと基本耐性を取得
    const baseHp = getBonusValue(base, 'hp');
    let baseArmor;
    switch (armorType) {
      case 'range':
        baseArmor = getBonusValue(base, 'armorRange');
        break;
      case 'beam':
        baseArmor = getBonusValue(base, 'armorBeam');
        break;
      case 'melee':
        baseArmor = getBonusValue(base, 'armorMelee');
        break;
      default:
        return false;
    }

    // 基本値での耐久指標を計算
    let baseDurabilityIndex;
    if (baseArmor >= 100) {
      baseDurabilityIndex = '∞';
    } else {
      baseDurabilityIndex = Math.round((baseHp / (100 - baseArmor)) * 100);
    }

    // 現在の耐久指標と比較
    const currentDurabilityIndex = calculateDurabilityIndex(armorType);
    return baseDurabilityIndex !== currentDurabilityIndex;
  };

  // 耐久指標の色クラスを取得
  const getDurabilityIndexColorClass = (armorType) => {
    return isDurabilityIndexModified(armorType) ? 'text-orange-500' : 'text-gray-200';
  };

  // グラフタブ用の上限値を取得（暫定上限を含む）
  const getGraphLimit = (statKey) => {
    // 暫定上限値の設定
    const tempLimits = {
      hp: 50000,
      highSpeedMovement: 300,
      turnPerformanceGround: 200,
      turnPerformanceSpace: 200,
    };

    // 暫定上限がある場合はそれを使用
    if (tempLimits[statKey]) {
      return tempLimits[statKey];
    }

    // 通常の上限値を使用
    if (currentLimits && currentLimits[statKey] !== undefined && currentLimits[statKey] !== null && currentLimits[statKey] !== Infinity) {
      return currentLimits[statKey];
    }

    // フォールバック（initialLimitsから取得）
    return initialLimits[statKey] !== Infinity ? initialLimits[statKey] : 100;
  };

  // 横棒グラフのレンダリング関数
  const renderBarGraph = (statKey) => {
    const baseValue = getBonusValue(base, statKey);
    const rawTotalValue = getBonusValue(rawTotal, statKey);
    const limit = getGraphLimit(statKey);
    const isOverLimit = rawTotalValue > limit;
    
    // 初期値と変動値の割合を計算
    const basePercentage = Math.min((baseValue / limit) * 100, 100);
    const totalPercentage = Math.min((rawTotalValue / limit) * 100, 100);
    const bonusValue = rawTotalValue - baseValue;
    const hasBonusChange = bonusValue !== 0;
    
    // 合計値の色分けロジック（数値タブと同様）
    const isStatModified = isModified && isModified[statKey];
    const totalValueColorClass = isStatModified ? 'text-orange-500' : 'text-gray-200';

    return (
      <div className="flex items-center gap-3">
        <div className="text-gray-200 text-sm whitespace-nowrap w-20">
          {statKey === 'hp' ? 'HP' :
           statKey === 'armorRange' ? '耐実弾補正' :
           statKey === 'armorBeam' ? '耐ビーム補正' :
           statKey === 'armorMelee' ? '耐格闘補正' :
           statKey === 'shoot' ? '射撃補正' :
           statKey === 'meleeCorrection' ? '格闘補正' :
           statKey === 'speed' ? 'スピード' :
           statKey === 'highSpeedMovement' ? '高速移動' :
           statKey === 'thruster' ? 'スラスター' :
           statKey === 'turnPerformanceGround' ? '旋回(地上)' :
           statKey === 'turnPerformanceSpace' ? '旋回(宇宙)' : statKey}
        </div>
        {/* 合計値の表示 */}
        <div className="text-sm text-right w-16 flex items-center justify-end gap-1">
          {isOverLimit && (
            <span className="inline-flex items-center justify-center gap-1 px-1 py-0.5 bg-red-500 rounded text-xs whitespace-nowrap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="warning-pulse">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/>
                <path d="M12 9v4"/>
                <path d="m12 17 .01 0"/>
              </svg>
              <span className="text-white font-bold" style={{ textShadow: 'none', filter: 'none' }}>+{formatNumber(rawTotalValue - limit)}</span>
            </span>
          )}
          <span className={`transition-all duration-500 ease-in-out ${
            isOverLimit ? 'text-red-500' : totalValueColorClass
          }`}>
            {formatNumber(rawTotalValue)}
          </span>
        </div>
        {/* 補正値の表示 */}
        <div className={`text-sm text-right w-12 transition-all duration-500 ease-in-out ${bonusValue > 0 ? 'text-orange-300' : bonusValue < 0 ? 'text-red-500' : 'text-gray-200'}`}>
          {formatBonus(bonusValue)}
        </div>
        <div className="flex-1 bg-transparent h-4 relative border border-white overflow-hidden">
          {/* 初期値部分 */}
          <div 
            className={"h-full transition-all duration-500 ease-in-out bg-gradient-to-r from-orange-500 to-orange-800"}
            style={{ width: `${Math.min(basePercentage, 100)}%` }}
          />
          {/* 変動部分（相性のいい色） */}
          <div 
            className={`h-full absolute top-0 transform ${
              bonusValue > 0 ? 'bg-yellow-500' : 'bg-blue-600'
            }`}
            style={{ 
              left: `${Math.min(basePercentage, Math.min(totalPercentage, 100))}%`,
              width: `${Math.min(Math.abs(totalPercentage - basePercentage), 100 - Math.min(basePercentage, 100))}%`,
              opacity: hasBonusChange ? 1 : 0,
              transition: 'left 0.5s ease-in-out, width 0.5s ease-in-out, opacity 0.5s ease-in-out, background-color 0.5s ease-in-out'
            }}
          />
          
          {/* オーバー分を赤で表示（白枠内の右端部分に） */}
          {isOverLimit && (
            <div 
              className="h-full absolute top-0 right-0 bg-gradient-to-l from-red-600 to-red-500 transition-all duration-500 ease-in-out border-l-2 border-red-300"
              style={{ 
                width: `${Math.min(((rawTotalValue - limit) / limit) * 100, 25)}%`,
                transition: 'width 0.5s ease-in-out',
                zIndex: 15
              }}
            />
          )}
          
          {/* 上限値をバー内に表示（左詰め） */}
          <div className="absolute inset-0 flex items-center h-full leading-none justify-start pl-2 text-xs text-white font-bold pointer-events-none" style={{ zIndex: 20 }}>
            <strong className={styles.statusShadowStrong + ' h-full flex items-center leading-none'}>
              上限：{(() => {
                if (statKey === 'hp' || statKey === 'HP' || limit === Infinity || 
                    statKey === 'highSpeedMovement' || 
                    statKey === 'turnPerformanceGround' || 
                    statKey === 'turnPerformanceSpace') {
                  return '-';
                }
                return formatNumber(limit);
              })()}
            </strong>
          </div>
          {isOverLimit && (
            <div className="absolute inset-0 flex items-center h-full leading-none justify-end pr-2 text-xs text-red-200 font-bold pointer-events-none" style={{ zIndex: 25 }}>
              <strong className={styles.statusShadowStrong + ' h-full flex items-center leading-none'}>
                OVER
              </strong>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  const renderStatRow = (label, statKey) => {
    const baseValue = getBonusValue(base, statKey);
    const partBonusValue = getBonusValue(partBonus, statKey);
    const fullStrengthenBonusValue = getBonusValue(fullStrengthenBonus, statKey);
    const expansionBonusValue = getBonusValue(expansionBonus, statKey);
    const partLimitBonusValue = getBonusValue(partLimitBonus, statKey);
    const rawTotalValue = getBonusValue(rawTotal, statKey);
    const totalValue = getBonusValue(total, statKey);
    
  // 補正値: パーツ補正 + 拡張スキル補正（フル強化補正は除外）
  const combinedBonusValue = partBonusValue + expansionBonusValue;

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
      <div key={statKey} className={`grid gap-2 py-1 border-b border-gray-700 last:border-b-0 items-center ${isMobile ? 'grid-cols-5' : 'grid-cols-7'} details-row`}>
        <div className="text-gray-200 text-sm whitespace-nowrap">{label}</div>
        <div className="text-gray-200 text-sm text-right whitespace-nowrap">{displayNumericValue(baseValue)}</div>
        <div className={`text-sm text-right whitespace-nowrap transition-all duration-500 ease-in-out ${combinedBonusValue > 0 ? 'text-orange-300' : (combinedBonusValue < 0 ? 'text-red-500' : 'text-gray-200')}`}>
          {formatBonus(combinedBonusValue)}
        </div>
        {!isMobile && (
          <div className={`text-sm text-right whitespace-nowrap transition-all duration-500 ease-in-out ${fullStrengthenBonusValue > 0 ? 'text-orange-300' : (fullStrengthenBonusValue < 0 ? 'text-red-500' : 'text-gray-200')}`}>
            {formatBonus(fullStrengthenBonusValue)}
          </div>
        )}
        {!isMobile && (
          <div className={`text-sm text-right whitespace-nowrap transition-all duration-500 ease-in-out ${totalLimitBonusValue > 0 ? 'text-orange-300' : (totalLimitBonusValue < 0 ? 'text-red-500' : 'text-gray-200')}`}>
            {formatBonus(totalLimitBonusValue)}
          </div>
        )}
        <div className="text-sm text-right w-20 flex items-center justify-end gap-[5px]">
          {currentLimits[statKey] !== undefined && currentLimits[statKey] !== null && currentLimits[statKey] !== Infinity && rawTotalValue > currentLimits[statKey] && (
            <span className="inline-flex items-center justify-center gap-1 px-1 py-0.5 bg-red-500 rounded text-xs whitespace-nowrap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="warning-pulse">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/>
                <path d="M12 9v4"/>
                <path d="m12 17 .01 0"/>
              </svg>
              <span className="text-white font-bold" style={{ textShadow: 'none', filter: 'none' }}>+{formatNumber(rawTotalValue - currentLimits[statKey])}</span>
            </span>
          )}
          <span className={`transition-all duration-500 ease-in-out ${
            (currentLimits[statKey] !== undefined && currentLimits[statKey] !== null && rawTotalValue > currentLimits[statKey] && currentLimits[statKey] !== Infinity)
              ? 'text-red-500' : totalValueColorClass
          }`}>
            {displayNumericValue(rawTotalValue)}
          </span>
        </div>
        <div className="text-sm text-right whitespace-nowrap">
          <span className={limitColorClass}>{limitDisplay}</span>
        </div>
      </div>
    );
  };
  

  return (
  <div className={`${styles.pickedmsCard} pickedms-card p-2 flex-grow flex flex-col justify-end pb-0.5`}>
      {/* <h2 className="text-xl mb-3 text-gray-200 statusTitle">ステータス一覧</h2> */}
      {selectedMs ? (
        <div className="space-y-1">
          {/* モバイル用格納ボタン */}
          {isMobile && onClose && (
            <div 
              onClick={onClose}
              className="mobile-close-button flex justify-center items-center py-2 cursor-pointer text-gray-200 hover:text-white mb-1"
            >
              <span className="flex items-center gap-1">
                <span className="triangle-blink-1">▶</span>
                <span className="triangle-blink-2">▶</span>
                <span className="triangle-blink-3">▶</span>
                <span className="mx-2">格　納</span>
                <span className="triangle-blink-4">▶</span>
                <span className="triangle-blink-5">▶</span>
                <span className="triangle-blink-6">▶</span>
              </span>
            </div>
          )}

          {/* ホバーインジケーター - 768px未満でのみ表示 */}
          <div className="relative mb-2 md:hidden" style={{ height: '24px' }}>
            {hoveredPart && (
              <div className="absolute inset-0 flex justify-center items-center bg-orange-900 bg-opacity-30 border border-orange-400 rounded text-orange-300 text-xs animate-pulse select-none pointer-events-none">
                <span>{hoveredPart.name}の装備プレビュー中</span>
              </div>
            )}
          </div>
          {/* デスクトップ用の高さ調整（インジケーター非表示時） */}
          <div className="hidden md:block mb-2"></div>

          {/* タブナビゲーション */}
          <div className="flex justify-end border-b border-gray-600 mb-2">
            <button
              onClick={() => setActiveTab('graph')}
              className={`px-3 py-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'graph'
                  ? 'border-orange-400 text-orange-400'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              グラフ
            </button>
            <button
              onClick={() => setActiveTab('numbers')}
              className={`px-3 py-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'numbers'
                  ? 'border-orange-400 text-orange-400'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              詳細
            </button>
          </div>

          {/* タブコンテンツ */}
          {activeTab === 'graph' ? (
            // グラフ表示
            <div className="space-y-1">
              {/* グラフタブのヘッダー行 */}
              <div className="flex items-center gap-3 pb-2 border-b border-gray-600 text-gray-200">
                <div className="w-20 whitespace-nowrap">項目名</div>
                <div className="w-16 text-right whitespace-nowrap">合計値</div>
                <div className="w-12 text-right whitespace-nowrap">補正</div>
                <div className="flex-1 text-center">グラフ</div>
              </div>

              <div className="py-1 border-b border-gray-700">
                {renderBarGraph('hp')}
              </div>
              <div className="py-1 border-b border-gray-700">
                {renderBarGraph('armorRange')}
              </div>
              <div className="py-1 border-b border-gray-700">
                {renderBarGraph('armorBeam')}
              </div>
              <div className="py-1 border-b border-gray-700">
                {renderBarGraph('armorMelee')}
              </div>
              <div className="py-1 border-b border-gray-700">
                {renderBarGraph('shoot')}
              </div>
              <div className="py-1 border-b border-gray-700">
                {renderBarGraph('meleeCorrection')}
              </div>
              <div className="py-1 border-b border-gray-700">
                {renderBarGraph('speed')}
              </div>
              <div className="py-1 border-b border-gray-700">
                {renderBarGraph('highSpeedMovement')}
              </div>
              <div className="py-1 border-b border-gray-700">
                {renderBarGraph('thruster')}
              </div>
              <div className="py-1 border-b border-gray-700">
                {renderBarGraph('turnPerformanceGround')}
              </div>
              <div className="py-1 border-b border-gray-700">
                {renderBarGraph('turnPerformanceSpace')}
              </div>
              {/* 耐久指標行 - 横並び表示（数値タブと同様） */}
              <div className="py-1 border-b border-gray-700 flex items-center justify-between">
                <div className="text-gray-200 text-sm whitespace-nowrap">耐久指標</div>
                <div className="text-xs md:text-xs xl:text-sm flex gap-4">
                  <span className="text-gray-200">耐実弾：<span className={getDurabilityIndexColorClass('range')}>{formatNumber(calculateDurabilityIndex('range'))}</span></span>
                  <span className="text-gray-200">耐ビーム：<span className={getDurabilityIndexColorClass('beam')}>{formatNumber(calculateDurabilityIndex('beam'))}</span></span>
                  <span className="text-gray-200">耐格闘：<span className={getDurabilityIndexColorClass('melee')}>{formatNumber(calculateDurabilityIndex('melee'))}</span></span>
                </div>
              </div>
              {/* 判定・カウンター行（数値タブと同様） */}
              <div className={`py-1 items-center border-b border-gray-700 last:border-b-0 ${styles.statusJudgeRow}`}> 
                <div className="text-md text-right text-gray-200">
                  <span className="font-semibold">判定：</span>
                  <span className="font-bold mr-2">{selectedMs["格闘判定力"] || '-'}</span>
                  <span className="font-semibold">カウンター：</span>
                  <span className="font-bold">{selectedMs["カウンター"] || '-'}</span>
                </div>
              </div>
            </div>
          ) : (
            // 数値表示（現在のステータス一覧）
            <>
              <div className={`grid gap-2 pb-2 border-b border-gray-600 text-gray-200 ${isMobile ? 'grid-cols-5' : 'grid-cols-7'} details-header`}>
                <div className="whitespace-nowrap">項目名</div>
                <div className="text-right whitespace-nowrap">初期値</div>
                <div className="text-right whitespace-nowrap">補正</div>
                {!isMobile && <div className="text-right whitespace-nowrap">強化</div>}
                {!isMobile && <div className="text-right whitespace-nowrap">上限増</div>}
                <div className="text-right whitespace-nowrap w-20">合計値</div>
                <div className="text-right whitespace-nowrap">上限</div>
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

              {/* 耐久指標行 - 横並び表示 */}
              <div className="py-1 border-b border-gray-700 flex items-center justify-between">
                <div className="text-gray-200 text-sm whitespace-nowrap">耐久指標</div>
                <div className="text-xs md:text-xs xl:text-sm flex gap-4">
                  <span className="text-gray-200">耐実弾：<span className={getDurabilityIndexColorClass('range')}>{formatNumber(calculateDurabilityIndex('range'))}</span></span>
                  <span className="text-gray-200">耐ビーム：<span className={getDurabilityIndexColorClass('beam')}>{formatNumber(calculateDurabilityIndex('beam'))}</span></span>
                  <span className="text-gray-200">耐格闘：<span className={getDurabilityIndexColorClass('melee')}>{formatNumber(calculateDurabilityIndex('melee'))}</span></span>
                </div>
              </div>

              <div className={`grid grid-cols-7 gap-2 py-1 items-center border-b border-gray-700 last:border-b-0 ${styles.statusJudgeRow}`}> 
                <div className="col-span-full text-md text-right text-gray-200">
                  <span className="font-semibold">判定：</span>
                  <span className="font-bold mr-2">{selectedMs["格闘判定力"] || '-'}</span>
                  <span className="font-semibold">カウンター：</span>
                  <span className="font-bold">{selectedMs["カウンター"] || '-'}</span>
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        <p className="text-gray-200 py-4 text-center">モビルスーツを選択してください。</p>
      )}
    </div>
  );
};

export default StatusDisplay;