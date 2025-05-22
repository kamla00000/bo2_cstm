// src/components/StatusDisplay.jsx
import React from 'react';

// statsオブジェクトに base, partBonus, fullStrengthenBonus, total が含まれていることを前提とします
const StatusDisplay = ({ stats, selectedMs, hoveredPart, isFullStrengthened }) => {
  // statsから必要な値を分解して取得
  const { base, partBonus, fullStrengthenBonus, total } = stats;

  // ステータス表示用の共通関数
  // formatFn はここでは使用しない
  const renderStatRow = (label, statKey) => {
    const baseValue = Number(base[statKey] || 0);
    const partBonusValue = Number(partBonus[statKey] || 0);
    const fullStrengthenBonusValue = Number(fullStrengthenBonus[statKey] || 0);
    const totalValue = Number(total[statKey] || 0);

    // ボーナス値の表示形式 (0の場合は'-', 正の場合は'+')
    const formatBonus = (value) => {
        if (value === 0) return '-';
        return value > 0 ? `+${value}` : `${value}`;
    };

    // 既存の値をそのまま表示
    const displayValue = (value) => {
      return value;
    };
    
    return (
      <div key={statKey} className="grid grid-cols-6 gap-2 py-1 border-b border-gray-700 last:border-b-0 items-center">
        <div className="text-gray-300 text-sm font-semibold whitespace-nowrap">{label}</div> {/* 項目 */}
        <div className="text-gray-300 text-sm text-right whitespace-nowrap">{displayValue(baseValue)}</div> {/* 初期値 */}
        <div className="text-sm text-right text-gray-400 whitespace-nowrap">-</div> {/* 上限 (常に'-'で固定表示) */}
        <div className={`text-sm text-right whitespace-nowrap ${partBonusValue > 0 ? 'text-green-400' : (partBonusValue < 0 ? 'text-red-400' : 'text-gray-400')}`}>
          {formatBonus(partBonusValue)}
        </div> {/* 補正値 (パーツ) */}
        <div className={`text-sm text-right whitespace-nowrap ${fullStrengthenBonusValue > 0 ? 'text-green-400' : (fullStrengthenBonusValue < 0 ? 'text-red-400' : 'text-gray-400')}`}>
          {formatBonus(fullStrengthenBonusValue)}
        </div> {/* フル強化 */}
        <div className="text-sm text-right font-bold text-white whitespace-nowrap">
          {displayValue(totalValue)}
        </div> {/* 合計値 */}
      </div>
    );
  };


  return (
    <div className="bg-gray-800 p-4 rounded-xl shadow-inner border border-gray-700 flex-grow">
      <h2 className="text-xl font-semibold mb-3 text-white">ステータス一覧</h2>
      {selectedMs ? (
        <div className="space-y-1">
          {/* ヘッダー行 - 6列に調整 */}
          <div className="grid grid-cols-6 gap-2 pb-2 border-b border-gray-600 text-gray-400 font-bold">
            <div className="whitespace-nowrap">項目</div>
            <div className="text-right whitespace-nowrap">初期値</div>
            <div className="text-right whitespace-nowrap">上限</div> {/* 新しい上限列 */}
            <div className="text-right whitespace-nowrap">補正値</div> {/* パーツによる補正 */}
            <div className="text-right whitespace-nowrap">フル強化</div> {/* フル強化による補正 */}
            <div className="text-right whitespace-nowrap">合計値</div>
          </div>

          {renderStatRow('HP', 'hp')}
          {renderStatRow('耐実弾補正', 'armor')}
          {renderStatRow('耐ビーム補正', 'beam')}
          {renderStatRow('耐格闘補正', 'melee')}
          {renderStatRow('射撃補正', 'shoot')}
          {renderStatRow('格闘補正', 'meleeCorrection')}
          {renderStatRow('スピード', 'speed')}
          {renderStatRow('スラスター', 'thruster')}
          {renderStatRow('旋回(地上)', 'turnPerformanceGround')}
          {renderStatRow('旋回(宇宙)', 'turnPerformanceSpace')}

          {/* ... その他のステータス */}
        </div>
      ) : (
        <p className="text-gray-400">モビルスーツを選択してください。</p>
      )}
    </div>
  );
};

export default StatusDisplay;