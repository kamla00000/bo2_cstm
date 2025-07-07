import React from 'react';
import SlotBar from './SlotBar'; // SlotBar コンポーネントをインポート

const SlotSelector = ({ usage, baseUsage, currentStats, hoveredOccupiedSlots }) => {
    // usage は usageWithPreview オブジェクト全体を指す (プレビュー含む使用量と最大値)
    // baseUsage は slotUsage オブジェクト全体を指す (確定使用量とフル強化後の最大値、そして「追加した baseClose/Mid/Long」)
    // currentStats は currentStats オブジェクト全体を指す
    // hoveredOccupiedSlots は hoveredOccupiedSlots オブジェクト全体を指す

    // 安全なデフォルト値を設定
    const safeUsage = usage || {};
    const safeBaseUsage = baseUsage || {};
    const safeHoveredOccupiedSlots = hoveredOccupiedSlots || {};


    // totalMax (バー全体の最大値) は usageWithPreview の max から取得
    // usageWithPreview と slotUsage の max プロパティは、フル強化後の最大スロット数を指します。
    const closeMax = safeUsage.maxClose ?? 0;
    const midMax = safeUsage.maxMid ?? 0;
    const longMax = safeUsage.maxLong ?? 0;

    // currentConfirmedUsage (緑色の確定使用量) は baseUsage (slotUsage) から取得
    const closeCurrentConfirmedUsage = safeBaseUsage.close ?? 0;
    const midCurrentConfirmedUsage = safeBaseUsage.mid ?? 0;
    const longCurrentConfirmedUsage = safeBaseUsage.long ?? 0;

    // baseUsageAmount (SlotBar の「MSの初期スロット数」を示すグレーのバーの基準) は
    // calculateSlotUsage で新しく追加した baseClose/Mid/Long から取得
    const baseAmountClose = safeBaseUsage.baseClose ?? 0;
    const baseAmountMid = safeBaseUsage.baseMid ?? 0;
    const baseAmountLong = safeBaseUsage.baseLong ?? 0;

    // originalMax (SlotBar の「フル強化前の最大スロット数」を示す濃い背景の基準) は
    // calculateSlotUsage で新しく追加した baseClose/Mid/Long から取得
    const originalMaxClose = safeBaseUsage.baseClose ?? 0;
    const originalMaxMid = safeBaseUsage.baseMid ?? 0;
    const originalMaxLong = safeBaseUsage.baseLong ?? 0;

    return (
        // flexコンテナとしての設定と、パディングをなくすための調整
        // inline-flex に変更し、内容に応じた幅にする
        <div className="msrow-card-shape inline-flex flex-col p-3 pr-10"> 
            <div className="space-y-3"> {/* SlotBarの行全体にパディングを適用 */}
                {/* 近距離スロット */}
                <div className="flex items-center text-sm font-medium">
                    <span className="text-gray-200 whitespace-nowrap">近距離</span>
                    <span className={`text-base flex-shrink-0 ${
                            (safeUsage.close ?? 0) > closeMax ? 'text-red-500' : 'text-gray-200'
                        }`}>
                        <span style={{display:'inline-block',width:'2.2em',textAlign:'right'}}>{safeUsage.close ?? 0}</span>
                        <span style={{display:'inline-block',width:'1.0em',textAlign:'center'}}>/</span>
                        <span style={{display:'inline-block',width:'1.4em',textAlign:'right',marginLeft:'-0.2em'}}>{closeMax}</span>
                    </span>
                    {/* 分母とゲージの間に余白 */}
                    <span className="ml-2"></span>
                    <SlotBar
                        slotType="Close"
                        currentConfirmedUsage={closeCurrentConfirmedUsage} // 緑色の確定使用量
                        totalMax={closeMax} // バー全体の最大値 (フル強化後)
                        baseUsageAmount={baseAmountClose} // MSの初期スロット数 (フル強化前)
                        originalMax={originalMaxClose} // フル強化前の最大スロット数 (baseUsageAmountと同じ意味合いと仮定)
                        hoveredOccupiedAmount={safeHoveredOccupiedSlots.close || 0} // ホバー中のパーツが占めるスロット量 (黄色のバー)
                        previewedUsageAmount={safeUsage.close || 0} // ホバー中のパーツを含めた合計使用量 (緑色のバーのプレビュー値)
                        className="flex-grow-0 flex-shrink-0" // ここに flex-grow-0 と flex-shrink-0 を追加
                    />
                    <div className="flex-grow"></div> {/* SlotBar の右側に残りのスペースを埋めるための要素を追加 */}
                </div>

                {/* 中距離スロット */}
                <div className="flex items-center text-sm font-medium">
                    <span className="text-gray-200 whitespace-nowrap">中距離</span>
                    <span
                        className={`text-base flex-shrink-0 ${
                            (safeUsage.mid ?? 0) > midMax ? 'text-red-500' : 'text-gray-200'
                        }`}
                    >
                        <span style={{display:'inline-block',width:'2.2em',textAlign:'right'}}>{safeUsage.mid ?? 0}</span>
                        <span style={{display:'inline-block',width:'1.0em',textAlign:'center'}}>/</span>
                        <span style={{display:'inline-block',width:'1.4em',textAlign:'right',marginLeft:'-0.2em'}}>{midMax}</span>
                    </span>
                    {/* 分母とゲージの間に余白 */}
                    <span className="ml-2"></span>
                    <SlotBar
                        slotType="Mid"
                        currentConfirmedUsage={midCurrentConfirmedUsage}
                        totalMax={midMax}
                        baseUsageAmount={baseAmountMid}
                        originalMax={originalMaxMid}
                        hoveredOccupiedAmount={safeHoveredOccupiedSlots.mid || 0}
                        previewedUsageAmount={safeUsage.mid || 0}
                        className="flex-grow-0 flex-shrink-0" // ここに flex-grow-0 と flex-shrink-0 を追加
                    />
                    <div className="flex-grow"></div> {/* SlotBar の右側に残りのスペースを埋めるための要素を追加 */}
                </div>

                {/* 遠距離スロット */}
                <div className="flex items-center text-sm font-medium">
                    <span className="text-gray-200 whitespace-nowrap">遠距離</span>
                    <span
                        className={`text-base flex-shrink-0 ${
                            (safeUsage.long ?? 0) > longMax ? 'text-red-500' : 'text-gray-200'
                        }`}
                    >
                        <span style={{display:'inline-block',width:'2.2em',textAlign:'right'}}>{safeUsage.long ?? 0}</span>
                        <span style={{display:'inline-block',width:'1.0em',textAlign:'center'}}>/</span>
                        <span style={{display:'inline-block',width:'1.4em',textAlign:'right',marginLeft:'-0.2em'}}>{longMax}</span>
                    </span>
                    {/* 分母とゲージの間に余白 */}
                    <span className="ml-2"></span>
                    <SlotBar
                        slotType="Long"
                        currentConfirmedUsage={longCurrentConfirmedUsage}
                        totalMax={longMax}
                        baseUsageAmount={baseAmountLong}
                        originalMax={originalMaxLong}
                        hoveredOccupiedAmount={safeHoveredOccupiedSlots.long || 0}
                        previewedUsageAmount={safeUsage.long || 0}
                        className="flex-grow-0 flex-shrink-0" // ここに flex-grow-0 と flex-shrink-0 を追加
                    />
                    <div className="flex-grow"></div> {/* SlotBar の右側に残りのスペースを埋めるための要素を追加 */}
                </div>
            </div>
        </div>
    );
};

export default SlotSelector;