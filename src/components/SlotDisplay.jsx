const SlotDisplay = ({ parts, onRemove }) => {
  const grouped = {
    close: [],
    mid: [],
    long: [],
  }

  parts.forEach(p => {
    if (p.close) grouped.close.push({ ...p, amount: p.close, slot: 'close' })
    if (p.mid) grouped.mid.push({ ...p, amount: p.mid, slot: 'mid' })
    if (p.long) grouped.long.push({ ...p, amount: p.mid, slot: 'mid' })
  })

  const renderGroup = (title, list, color) => (
    <div className="mb-2">
      <div className={`font-bold ${color}`}>{title}</div>
      <ul className="ml-4 list-disc text-sm space-y-1">
        {list.length === 0 && <li className="text-gray-500 list-none">なし</li>}
        {list.map(p => (
          <li key={p.name} className="flex items-center justify-between">
            <span>{p.name}（{p.amount}）</span>
            <button
              onClick={() => onRemove(p)}
              className="ml-2 text-red-400 hover:text-red-200 text-xs"
            >
              ✖
            </button>
          </li>
        ))}
      </ul>
    </div>
  )

  return (
    <div className="mt-4 p-3 rounded bg-gray-800 border border-gray-600">
      {renderGroup('🟥 近距離スロット', grouped.close, 'text-red-400')}
      {renderGroup('🟨 中距離スロット', grouped.mid, 'text-yellow-300')}
      {renderGroup('🟦 遠距離スロット', grouped.long, 'text-blue-400')}
    </div>
  )
}

export default SlotDisplay
