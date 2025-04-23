import React, { useState } from 'react';
import CustomPartsSelector from './CustomPartsSelector';

function App() {
  const [selectedParts, setSelectedParts] = useState([]);

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">カスタムパーツシミュレーター</h1>
      <CustomPartsSelector selectedParts={selectedParts} setSelectedParts={setSelectedParts} />
    </div>
  );
}

export default App;
