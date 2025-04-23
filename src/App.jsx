import React, { useState } from "react";
import CustomPartsSelector from "./CustomPartsSelector";

function App() {
  const [filter, setFilter] = useState({ cost: "", attribute: "" });

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">カスタムパーツシミュレーター</h1>
      <div className="mb-4">
        <label className="mr-2">属性:</label>
        <select
          value={filter.attribute}
          onChange={(e) => setFilter({ ...filter, attribute: e.target.value })}
        >
          <option value="">全て</option>
          <option value="地上">地上</option>
          <option value="宇宙">宇宙</option>
        </select>
        <label className="ml-4 mr-2">コスト:</label>
        <select
          value={filter.cost}
          onChange={(e) => setFilter({ ...filter, cost: e.target.value })}
        >
          <option value="">全て</option>
          <option value="200">200</option>
          <option value="300">300</option>
          <option value="400">400</option>
        </select>
      </div>
      <CustomPartsSelector filter={filter} />
    </div>
  );
}

export default App;
