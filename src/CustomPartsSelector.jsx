import React from 'react';
import partsData from './data/partsData';

function CustomPartsSelector({ selectedParts, setSelectedParts }) {
  const handleSelect = (part) => {
    if (selectedParts.length >= 8) {
      alert('最大8つまで選択できます');
      return;
    }
    if (!selectedParts.includes(part)) {
      setSelectedParts([...selectedParts, part]);
    }
  };

  const handleRemove = (index) => {
    const newParts = [...selectedParts];
    newParts.splice(index, 1);
    setSelectedParts(newParts);
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {partsData.map((part, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(part)}
            className="bg-blue-100 hover:bg-blue-200 text-blue-800 rounded px-2 py-1 text-sm"
          >
            {part.name}（{part.slots}）
          </button>
        ))}
      </div>
      <div className="mt-4">
        <h3 className="font-semibold">選択済みパーツ：</h3>
        <ul className="list-disc pl-6">
          {selectedParts.map((part, index) => (
            <li key={index} className="flex justify-between items-center">
              {part.name}（{part.slots}）
              <button
                onClick={() => handleRemove(index)}
                className="ml-2 text-red-600 text-sm hover:underline"
              >
                削除
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default CustomPartsSelector;
