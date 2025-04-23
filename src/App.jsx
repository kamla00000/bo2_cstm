import React, { useState } from 'react';
import MSSelector from './MSSelector';
import CustomPartsSelector from './CustomPartsSelector';
import './App.css';

const App = () => {
  const [selectedMS, setSelectedMS] = useState(null);
  const [selectedParts, setSelectedParts] = useState([]);

  const handleMSChange = (ms) => {
    setSelectedMS(ms);
  };

  const handlePartChange = (part) => {
    setSelectedParts((prevParts) => {
      if (prevParts.includes(part)) {
        return prevParts.filter((p) => p !== part);
      } else {
        return [...prevParts, part];
      }
    });
  };

  const handleSubmit = () => {
    // 設定されたMSとパーツを表示または処理する
    alert(`Selected MS: ${selectedMS}\nSelected Parts: ${selectedParts.join(', ')}`);
  };

  return (
    <div className="App">
      <h1>ガンダム バトルオペレーション2 カスタムパーツシミュレーター</h1>
      <div className="selector-container">
        <div className="ms-selector">
          <MSSelector onChange={handleMSChange} />
        </div>
        <div className="parts-selector">
          <CustomPartsSelector onChange={handlePartChange} />
        </div>
      </div>
      <div className="summary">
        <p>選択されたモビルスーツ: {selectedMS || 'なし'}</p>
        <p>選択されたカスタムパーツ: {selectedParts.length > 0 ? selectedParts.join(', ') : 'なし'}</p>
      </div>
      <button onClick={handleSubmit}>シミュレーション開始</button>
    </div>
  );
};

export default App;
