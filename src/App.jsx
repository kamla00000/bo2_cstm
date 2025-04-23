import React, { useState } from 'react';
import CustomPartsSelector from './CustomPartsSelector';

const App = () => {
  const [selectedParts, setSelectedParts] = useState([]);
  const [selectedMS, setSelectedMS] = useState(null);
  const msList = [
    { name: 'ガンダム', cost: 500, type: '汎用' },
    { name: 'ドム', cost: 450, type: '強襲' },
    { name: 'ジム・キャノン', cost: 400, type: '支援' },
  ];

  const [typeFilter, setTypeFilter] = useState('');
  const [costFilter, setCostFilter] = useState('');

  const filteredMSList = msList.filter((ms) => {
    return (
      (typeFilter === '' || ms.type === typeFilter) &&
      (costFilter === '' || ms.cost.toString() === costFilter)
    );
  });

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold mb-4">バトオペ２ カスタムパーツシミュレーター</h1>

      <div className="flex flex-wrap gap-4">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">属性フィルターなし</option>
          <option value="汎用">汎用</option>
          <option value="強襲">強襲</option>
          <option value="支援">支援</option>
        </select>

        <select
          value={costFilter}
          onChange={(e) => setCostFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">コストフィルターなし</option>
          <option value="400">400</option>
          <option value="450">450</option>
          <option value="500">500</option>
        </select>
      </div>

      <div className="space-y-2">
        <p className="font-semibold">モビル
