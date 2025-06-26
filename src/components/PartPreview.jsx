import React, { useState, useEffect } from 'react';

// 画像パスを生成する関数
const getBaseImagePath = (partName) => `/images/parts/${encodeURIComponent(partName || '')}`;
const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'bmp'];

const ImageWithFallback = ({ partName, className }) => {
  const [currentExtIndex, setCurrentExtIndex] = useState(0);

  useEffect(() => {
    setCurrentExtIndex(0); // partNameが変わったら拡張子のインデックスをリセット
  }, [partName]);

  let src;
  if (currentExtIndex < IMAGE_EXTENSIONS.length) {
    const currentExt = IMAGE_EXTENSIONS[currentExtIndex];
    src = `${getBaseImagePath(partName)}.${currentExt}`;
  } else {
    src = '/images/parts/default.jpg'; // 全ての拡張子で画像が見つからない場合のフォールバック
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
      <div className="text-4xl flex items-center justify-center h-80 w-80 text-gray-200 bg-gray-900 shadow-md rounded-md">
        装備選択
      </div>
    );
  }

  return (
    <div className="p-2 bg-gray-900 shadow-md h-80 w-80 flex flex-col"> {/* items-center を削除し、flex-col のままで配置調整 */}

      {/* 画像とパーツ名、スロット情報を横並びにする新しいコンテナ */}
      <div className="flex flex-row items-end mb-2"> {/* items-start で上揃えに */}
        {/* 画像エリア */}
        <div className="w-20 h-20 mr-3 flex-shrink-0 flex items-center justify-center bg-gray-900"> {/* mr-3 で右にマージン */}
          <ImageWithFallback partName={part.name || part.名前} className="w-full h-full object-cover" />
        </div>

        {/* パーツ名とスロット情報エリア */}
        <div className="flex flex-col flex-grow"> {/* 残りのスペースを埋める */}
          <h3 className="text-base font-bold text-gray-200 mb-1">{part.name || part.名前}</h3> {/* text-sm から text-base に戻すか、任意で調整 */}
          <div className="flex flex-row gap-1 w-full justify-start text-xs"> {/* justify-start で左揃えに */}
            <div className="text-gray-200 text-sm bg-gray-700 px-2 py-1">
              <span className="font-semibold">近：</span>
              {part.close ?? part.近 ?? 0}
            </div>
            <div className="text-gray-200 text-sm bg-gray-700 px-2 py-1">
              <span className="font-semibold">中：</span>
              {part.mid ?? part.中 ?? 0}
            </div>
            <div className="text-gray-200 text-sm bg-gray-700 px-2 py-1">
              <span className="font-semibold">遠：</span>
              {part.long ?? part.遠 ?? 0}
            </div>
          </div>
        </div>
      </div>

      {/* 特性表示エリア (画像と情報のブロックの下に配置) */}
      <div className="text-gray-200 mb-2 break-words w-full flex-grow overflow-hidden">
        <span className="font-semibold">特性：</span>
        {part.description || part.説明 || '-'}
      </div>
    </div>
  );
};

export default PartPreview;