'use client';
export default function Table({ columns, rows, currentpage, renderCell }) {
  return (
    <div className="mt-4 overflow-x-auto bg-white shadow rounded-lg">
      <table className="w-full text-sm text-left text-gray-700">
        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
          <tr>
            <th className="px-6 py-3 text-center w-12">S.No</th>
            {columns.map((col) => (
              <th key={col.key} className="px-6 py-3 text-center">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
  {rows.map((row, idx) => (
    <tr key={idx} className="border-b hover:bg-gray-50">
      <td className="px-6 py-4 text-center font-medium w-12">{idx + 1}
        </td>{columns.map((col) => (
      <td key={col.key} className="px-6 py-4 text-center font-medium">
            {renderCell ? renderCell(col.key, row, idx) : row[col.key]}
      </td>
      )
    )}
    </tr>
  ))}
</tbody>

      </table>
    </div>
  );
}