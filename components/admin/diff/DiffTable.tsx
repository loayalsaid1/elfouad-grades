export default function DiffTable({ diffRows }: { diffRows: any[] }) {
  if (diffRows.length === 0) return null
  const headers = diffRows[0] ? Object.keys(diffRows[0]).filter(h => h !== "_diffType") : []
  return (
    <table className="min-w-full border text-xs bg-white rounded shadow">
      <thead>
        <tr>
          <th className="border px-2 py-1 bg-gray-50">Type</th>
          {headers.map(h => (
            <th key={h} className="border px-2 py-1 bg-gray-50">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {diffRows.map((row, i) => (
          <tr key={i} className={
            row._diffType === "added"
              ? "bg-green-50"
              : row._diffType === "removed"
                ? "bg-red-50"
                : row._diffType === "changed"
                  ? "bg-yellow-50"
                  : ""
          }>
            <td className="border px-2 py-1 font-bold">{row._diffType}</td>
            {headers.map(h => (
              <td key={h} className="border px-2 py-1">
                {typeof row[h] === "object" && row[h] !== null && "old" in row[h] && "new" in row[h]
                  ? (
                    <span>
                      <span className="line-through text-red-600">{row[h].old}</span>
                      <span className="text-green-700 ml-1">{row[h].new}</span>
                    </span>
                  )
                  : row[h]
                }
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
