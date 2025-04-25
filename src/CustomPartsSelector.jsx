import React from 'react'

const CustomPartsSelector = () => {
  return (
    <div className="mb-4">
      <label className="block mb-2">カスタムパーツを選択してください:</label>
      <select className="w-full border p-2 rounded">
        <option>フレーム強化Lv1</option>
        <option>強化フレームLv2</option>
        <option>新型フレーム</option>
      </select>
    </div>
  )
}

export default CustomPartsSelector