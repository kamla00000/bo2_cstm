import React, { useState } from "react";

function App() {
  const [msName, setMsName] = useState("");
  const [msCost, setMsCost] = useState("");
  const [msType, setMsType] = useState("");

  return (
    <div className="App">
      <h1>Mobile Suit Customizer</h1>
      <div>
        <label htmlFor="msName">MS Name</label>
        <input
          type="text"
          id="msName"
          value={msName}
          onChange={(e) => setMsName(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="msCost">MS Cost</label>
        <input
          type="number"
          id="msCost"
          value={msCost}
          onChange={(e) => setMsCost(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="msType">MS Type</label>
        <select
          id="msType"
          value={msType}
          onChange={(e) => setMsType(e.target.value)}
        >
          <option value="assault">Assault</option>
          <option value="general">General</option>
          <option value="support">Support</option>
        </select>
      </div>

      <p>Your selected Mobile Suit: {msName}</p>
      <p>Cost: {msCost}</p>
      <p>Type: {msType}</p>
    </div>
  );
}

export default App;
