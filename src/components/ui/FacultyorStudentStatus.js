'use client'

export default function FacultyorStudentStatus({ value, trueText = "Faculty", falseText = "Student" }) {
  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
        value ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
      }`}
    >
      {value ? trueText : falseText}
    </span>
  );
}
