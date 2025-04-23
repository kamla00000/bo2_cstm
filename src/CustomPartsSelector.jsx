import React from "react";

function CustomPartsSelector({ filter }) {
  return (
    <div>
      <p>属性: {filter.attribute || "全て"}</p>
      <p>コスト: {filter.cost || "全て"}</p>
    </div>
  );
}

export default CustomPartsSelector;
