import React, { useState, useEffect } from 'react';
import styles from './PickedMs.module.css';

// 画像パスを生成する関数
const getBaseImagePath = (partName) => `/images/parts/${encodeURIComponent(partName || '')}`;
const IMAGE_EXTENSIONS = ['webp'];

const ImageWithFallback = ({ partName, className }) => {
  const [currentExtIndex, setCurrentExtIndex] = useState(0);

  useEffect(() => {
    setCurrentExtIndex(0); // partNameが変わったら拡張子のインデックスをリセット
  }, [partName]);

  let src;
  if (currentExtIndex < IMAGE_EXTENSIONS.length) {
    src = `${getBaseImagePath(partName)}.webp`;
  } else {
    src = '/images/parts/default.webp';
  }

  const handleError = () => {
    setCurrentExtIndex((prev) => prev + 1); // 次の拡張子を試す
  };

  return (
    <img
      key={partName + '-' + currentExtIndex} // key を変更して再レンダリングをトリガー
      src={src}
      alt={partName}
      className={`w-full h-full object-cover ${className || ''}`}
      onError={handleError}
    />
  );
};

const PartPreview = ({ part }) => {
  if (!part) {
    return (
      <div className={styles.partPreviewCardShape + " relative text-gray-200"} style={{ minHeight: '200px', height: '200px' }}>
        <span className={"absolute top-8 left-8 " + styles.equipSelectText + " text-gray-200 [text-shadow:1px_1px_2px_black]"}>装</span>
        <span className={"absolute top-8 right-8 " + styles.equipSelectText + " text-gray-200 [text-shadow:1px_1px_2px_black]"}>備</span>
        <span className={"absolute bottom-8 left-8 " + styles.equipSelectText + " text-gray-200 [text-shadow:1px_1px_2px_black]"}>選</span>
        <span className={"absolute bottom-8 right-8 " + styles.equipSelectText + " text-gray-200 [text-shadow:1px_1px_2px_black]"}>択</span>
      </div>
    );
  }

  return (
  <div className={styles.partPreviewCardShape + " p-2 w-full flex flex-col"}> {/* 横幅を拡張スキル表示と揃える */}
      {/* 画像とパーツ名、スロット情報を横並びにする新しいコンテナ */}
  <div className={styles.partPreviewRow}> {/* プレビュー行用クラス */}
        {/* 画像エリア */}
  <div className={styles.partPreviewImageBox}> {/* 画像ボックス用クラス */}
          <ImageWithFallback partName={part.name || part.名前} className="w-full h-full object-cover" />
        </div>

        {/* パーツ名とスロット情報エリア */}
        <div className="flex flex-col flex-grow"> {/* 残りのスペースを埋める */}
          <h3 className={styles.previewTitle + " text-gray-200"}>{part.name || part.名前}</h3>
          <div className="flex flex-row gap-1 w-full justify-start text-xs"> {/* justify-start で左揃えに */}
            <div className="text-gray-200 text-sm bg-gray-700 px-2 py-1">
              <span className="font-bold">近：</span>
              <span className={styles.previewSlotValue}>{part.close ?? part.近 ?? 0}</span>
            </div>
            <div className="text-gray-200 text-sm bg-gray-700 px-2 py-1">
              <span className="font-bold">中：</span>
              <span className={styles.previewSlotValue}>{part.mid ?? part.中 ?? 0}</span>
            </div>
            <div className="text-gray-200 text-sm bg-gray-700 px-2 py-1">
              <span className="font-bold">遠：</span>
              <span className={styles.previewSlotValue}>{part.long ?? part.遠 ?? 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 特性表示エリア (画像と情報のブロックの下に配置) */}
  <div className={styles.previewDescription + " text-gray-200 mb-2 break-words w-full flex-grow overflow-hidden"}>
        <span className="font-bold">特性：</span>
        {part.description || part.説明 || '-'}
      </div>
    </div>
  );
};

export default PartPreview;