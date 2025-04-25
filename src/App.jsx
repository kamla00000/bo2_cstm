import React from 'react'
import CustomPartsSelector from './CustomPartsSelector'
import ResultDisplay from './ResultDisplay'

const App = () => {
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">BO2 Custom Parts Simulator</h1>
      <CustomPartsSelector />
      <ResultDisplay />
    </div>
  )
}

export default App