'use client';

export default function TextField({ label, type, value, onChange, placeholder }) {
    return (
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required
          className="px-4 py-2 rounded-md border border-gray-300 bg-blue-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
    );
  }
  