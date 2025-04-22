// src/components/MSFilter.jsx
import React, { useState } from 'react';

const MSFilter = ({ msList, onSelectMS }) => {
  const [costFilter, setCostFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const filteredMS = msList.filter(ms => {
    const costMatch = costFilter ? ms.cost === parseInt(costFilter) : true;
    const typeMatch = typeFilter ? ms.type === typeFilter : true;
    return costMatch && typeMatch;
  });

  return (
    <div className="p-4 space-y-4">
      <div>
        <label className="block">コスト:</label>
        <select
          value={costFilter}
          onChange={(e) => setCostFilter(e.target.value)}
          className="border rounded p-2"
        >
          <option value="">全て</option>
          <option value="300">300</option>
          <option value="350">350</option>
          <option value="500">500</option>
          {/* 必要に応じて追加 */}
        </select>
      </div>

      <div>
        <label className="block">属性:</label>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border rounded p-2"
        >
          <option value="">全て</option>
          <option value="強襲">強襲</option>
          <option value="汎用">汎用</option>
          <option value="支援">支援</option>
        </select>
      </div>

      <div>
        <h3 className="font-bold">機体一覧：</h3>
        <ul className="list-disc ml-6">
          {filteredMS.map((ms, index) => (
            <li
              key={index}
              onClick={() => onSelectMS(ms)}
              className="cursor-pointer hover:text-blue-600"
            >
              {ms.name}（{ms.cost}, {ms.type}）
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MSFilter;
