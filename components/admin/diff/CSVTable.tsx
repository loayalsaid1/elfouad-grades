import React from "react"

export function CSVTable({ data }: { data: string[][] }) {
  if (!data || data.length === 0) return <div className="text-gray-400 italic p-2">No data</div>
  return (
    <table className="min-w-max w-full text-xs border bg-white">
      <thead>
        <tr>
          {data[0].map((cell, idx) => (
            <th key={idx} className="border px-2 py-1 bg-gray-100 font-semibold sticky top-0 z-10">{cell}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.slice(1).map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td key={j} className="border px-2 py-1 whitespace-nowrap max-w-[180px] overflow-x-auto">{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
