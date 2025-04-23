import React, { useState } from 'react';
import CustomPartsSelector from "./components/CustomPartsSelector"; // 正しい場所に合わせて


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
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">バトオペ2 カスタムシミュレーター</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block mb-1">コスト:</label>
          <select
            value={costFilter}
            onChange={(e) => setCostFilter(e.target.value)}
            className="border rounded p-2 w-full"
          >
            <option value="">全て</option>
            <option value="300">300</option>
            <option value="350">350</option>
            <option value="400">400</option>
            <option value="500">500</option>
          </select>
        </div>

        <div>
          <label className="block mb-1">属性:</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border rounded p-2 w-full"
          >
            <option value="">全て</option>
            <option value="強襲">強襲</option>
            <option value="汎用">汎用</option>
            <option value="支援">支援</option>
          </select>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">該当するモビルスーツ:</h2>
        <ul className="space-y-2">
          {filteredMS.map((ms, index) => (
            <li key={index} className="border p-2 rounded shadow">
              <p><strong>名前:</strong> {ms.name}</p>
              <p><strong>コスト:</strong> {ms.cost}</p>
              <p><strong>属性:</strong> {ms.type}</p>
            </li>
          ))}
        </ul>
        {filteredMS.length === 0 && (
          <p className="mt-4 text-gray-500">該当する機体がありません。</p>
        )}
      </div>

      {/* カスタムパーツセレクター */}
      <CustomPartsSelector />
    </div>
  );
}
