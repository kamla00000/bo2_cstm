import React, { useState } from 'react';

function CustomPartsSelector() {
  const [selectedParts, setSelectedParts] = useState([]);
  
  const handlePartSelection = (part) => {
    setSelectedParts((prevParts) => {
      if (prevParts.includes(part)) {
        return prevParts.filter((p) => p !== part);
      }
      return [...prevParts, part];
    });
  };

  return (
    <div>
      <h2>Select Parts (Max 8)</h2>
      <div>
        <label>
          <input type="checkbox" onChange={() => handlePartSelection('Part1')} />
          Part 1
        </label>
        <label>
          <input type="checkbox" onChange={() => handlePartSelection('Part2')} />
          Part 2
        </label>
        {/* Add more parts as needed */}
      </div>
      <p>Selected Parts: {selectedParts.join(', ')}</p>
    </div>
  );
}

export default CustomPartsSelector;