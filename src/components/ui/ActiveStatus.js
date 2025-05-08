'use client';

import { CheckCircle, XCircle } from 'lucide-react';

export default function ActiveStatus({ value }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium
        ${value ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
    >
      {value ? <CheckCircle size={16} /> : <XCircle size={16} />}
      {value ? 'Active' : 'Inactive'}
    </span>
  );
}
