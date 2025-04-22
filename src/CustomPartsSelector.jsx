import React, { useState } from 'react';
import CustomPartsSelector from './CustomPartsSelector';

const msList = [
  { name: 'ガンダム', cost: 500, type: '強襲' },
  { name: 'ザクII', cost: 300, type: '汎用' },
  { name: 'ドム', cost: 350, type: '支援' },
  { name: 'ジム・カスタム', cost: 400, type: '汎用' },
];

export default function App() {
  const [costFilter, setCostFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const filteredMS = msList.filter((ms) => {
    const matchesCost = costFilter === '' || ms.cost === parseInt(costFilter);
    const matchesType = typeFilter === '' || ms.type === typeFilter;
    return matchesCost && matchesType;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">
          バトオペ2 カスタムパーツシミュレーター
        </h1>

        {/* フィルターエリア */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">コストで絞り込み</label>
            <select
              value={costFilter}
              onChange={(e) => setCostFilter(e.target.value)}
              className="w-full border border-gray-300 rounded p-2"
            >
              <option value="">全て</option>
              <option value="300">300</option>
              <option value="350">350</option>
              <option value="400">400</option>
              <option value="500">500</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">属性で絞り込み</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full border border-gray-300 rounded p-2"
            >
              <option value="">全て</option>
              <option value="強襲">強襲</option>
              <option value="汎用">汎用</option>
              <option value="支援">支援</option>
            </select>
          </div>
        </div>

        {/* MS表示 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2 text-blue-600">該当するモビルスーツ</h2>
          {filteredMS.length > 0 ? (
            <ul className="grid sm:grid-cols-2 gap-4">
              {filteredMS.map((ms, index) => (
                <li key={index} className="p-4 border rounded shadow-sm bg-gray-50">
                  <p className="font-semibold">{ms.name}</p>
                  <p className="text-sm text-gray-600">コスト: {ms.cost}</p>
                  <p className="text-sm text-gray-600">属性: {ms.type}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 mt-2">該当する機体がありません。</p>
          )}
        </div>

        {/* カスタムパーツセレクター */}
        <CustomPartsSelector />
      </div>
    </div>
  );
}
