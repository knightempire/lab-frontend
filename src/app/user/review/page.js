'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FileText, CheckCircle, XCircle, RefreshCw, Repeat, Minus, Plus, Clock, CalendarDays, ArrowLeft } from 'lucide-react';
import Table from '../../../components/table';
import LoadingScreen from '../../../components/loading/loadingscreen';
import Pagination from '../../../components/pagination';
import { Suspense } from 'react';

const requests = [
  {
    requestId: "REQ-S-250001",
    name: "John Doe",
    rollNo: "CS21B054",
    phoneNo: "9876543210",
    email: "john.doe@university.edu",
    isFaculty: false,
    requestedDate: "2025-05-10T09:30:00",
    requestedDays: 5,
    adminApprovedDays: 3,
    status: "pending",
    referenceStaff: {
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@university.edu'
    },
    userMessage: "I need these for my IoT project, to display indicators.",
    adminMessage: "",
    components: [
      { name: "Arduino Kit", quantity: 1 },
      { name: "Breadboard", quantity: 2 },
      { name: "LED Pack", quantity: 10 }
    ],
    adminIssueComponents: [],
    returnedComponents: [],
    // No reIssueRequest yet
  },
  {
    requestId: "REQ-S-250002",
    name: "Jane Smith",
    rollNo: "CS21B055",
    phoneNo: "9876543211",
    email: "jane.smith@university.edu",
    isFaculty: false,
    requestedDate: "2025-05-09T14:15:00",
    requestedDays: 3,
    adminApprovedDays: 3,
    status: "accepted",
    referenceStaff: {
      name: 'Dr. Alan Turing',
      email: 'alan.turing@university.edu'
    },
    userMessage: "Required for ML project demo.",
    adminMessage: "Approved. Please return the Raspberry Pi by the due date.",
    components: [
      { name: "Raspberry Pi", quantity: 1 },
      { name: "HDMI Cable", quantity: 1 }
    ],
    adminIssueComponents: [   
      { name: "Raspberry Pi", quantity: 1 , replacedQuantity: 1 },
    ],
    returnedComponents: [
      { name: "Raspberry Pi", quantity: 1 }
    ],
    reIssueRequest: {
      status: "pending", 
      userExtensionMessage: "Need more time for final testing.",
      adminExtensionMessage: "",
      extensionDays: 4,
    }
  },
  {
    requestId: "REQ-S-250003",
    name: "Alice Kumar",
    rollNo: "2023123",
    phoneNo: "9876543210",
    email: "alice@example.com",
    isFaculty: false,
    requestedDate: "2025-05-05T11:00:00",
    requestedDays: 3,
    adminApprovedDays: 3,
    status: "rejected",
    referenceStaff: {
      name: 'Prof. Michael Johnson',
      email: 'michael.johnson@university.edu'
    },
    userMessage: "For embedded project, for circuit prototyping.",
    adminMessage: "Rejected due to insufficient stock of jumper wires.",
    components: [
      { name: "Jumper Wires", quantity: 5 },
      { name: "Breadboard", quantity: 1 }
    ],
    adminIssueComponents: [],
    returnedComponents: [],
  },
  {
    requestId: "REQ-2025-0510",
    name: "Priya Singh",
    rollNo: "EE20B123",
    phoneNo: "9876543222",
    email: "priya.singh@university.edu",
    isFaculty: true,
    requestedDate: "2025-05-19T16:45:00",
    requestedDays: 7,
    adminApprovedDays: 3,
    status: "accepted",
    referenceStaff: {
      name: 'Dr. Ramesh Gupta',
      email: 'ramesh.gupta@university.edu'
    },
    userMessage: "For faculty workshop on IoT.",
    adminMessage: "Issued as per faculty request.",
    components: [
      { name: "ESP32 Module", quantity: 2 },
      { name: "Sensor Kit", quantity: 1 }
    ],
    adminIssueComponents: [
      { name: "ESP32 Module", quantity: 2 , replacedQuantity: 1},
      { name: "Sensor Kit", quantity: 1 }
    ],
    returnedComponents: [],
    // Example: re-issue was accepted
    reIssueRequest: {
      status: "accepted",
      userExtensionMessage: "Workshop extended, need 2 more days.",
      adminExtensionMessage: "Extension granted.",
      extensionDays: 2,
      adminApprovedDays : 1
    }
  },
  {
    requestId: "REQ-2025-0509",
    name: "Rahul Verma",
    rollNo: "ME19B007",
    phoneNo: "9876543233",
    email: "rahul.verma@university.edu",
    isFaculty: false,
    requestedDate: "2025-04-20T10:00:00",
    requestedDays: 2,
    adminApprovedDays: 1,
    status: "pending",
    referenceStaff: {
      name: 'Dr. Anita Desai',
      email: 'anita.desai@university.edu'
    },
    userMessage: "Need for robotics club event.",
    adminMessage: "",
    components: [],
    adminIssueComponents: [],
    returnedComponents: []
    // No reIssueRequest
  },
  {
    requestId: "REQ-2025-0514",
    name: "Suresh Raina",
    rollNo: "ME20B101",
    phoneNo: "9876543244",
    email: "suresh.raina@university.edu",
    isFaculty: false,
    requestedDate: "2025-05-01T10:00:00",
    requestedDays: 2,
    adminApprovedDays: 2,
    status: "accepted",
    referenceStaff: {
      name: 'Dr. Kavita Rao',
      email: 'kavita.rao@university.edu'
    },
    userMessage: "Need for mechanical project testing.",
    adminMessage: "Approved for 2 days.",
    components: [
      { name: "Stepper Motor", quantity: 2 }
    ],
    adminIssueComponents: [
      { name: "Stepper Motor", quantity: 2 }
    ],
    returnedComponents: [],
    reIssueRequest: {
      status: "rejected",
      userExtensionMessage: "Project delayed, need 2 more days.",
      adminExtensionMessage: "Cannot extend due to upcoming lab maintenance.",
      extensionDays: 2
    }
  },
    // Pending request, no extension
  {
    requestId: "REQ-2025-0515",
    name: "Vikram Patel",
    rollNo: "CS22B001",
    phoneNo: "9876543255",
    email: "vikram.patel@university.edu",
    isFaculty: false,
    requestedDate: "2025-05-20T09:00:00",
    requestedDays: 4,
    adminApprovedDays: null,
    status: "pending",
    referenceStaff: {
      name: 'Dr. Leena Shah',
      email: 'leena.shah@university.edu'
    },
    userMessage: "Need for AI project.",
    adminMessage: "",
    components: [
      { name: "Jetson Nano", quantity: 1 }
    ],
    adminIssueComponents: [],
    returnedComponents: []
  },

  // Accepted, not extended yet (extension button should show)
  {
    requestId: "REQ-2025-0516",
    name: "Meera Nair",
    rollNo: "EE21B045",
    phoneNo: "9876543266",
    email: "meera.nair@university.edu",
    isFaculty: false,
    requestedDate: "2025-05-18T10:30:00",
    requestedDays: 3,
    adminApprovedDays: 3,
    status: "accepted",
    referenceStaff: {
      name: 'Dr. S. Krishnan',
      email: 'krishnan@university.edu'
    },
    userMessage: "For circuit design lab.",
    adminMessage: "Approved.",
    components: [
      { name: "Oscilloscope", quantity: 1 }
    ],
    adminIssueComponents: [
      { name: "Oscilloscope", quantity: 1 }
    ],
    returnedComponents: [],
    // No reIssueRequest yet
  },

  // Accepted, extension pending
  {
    requestId: "REQ-2025-0517",
    name: "Arjun Rao",
    rollNo: "ME21B099",
    phoneNo: "9876543277",
    email: "arjun.rao@university.edu",
    isFaculty: false,
    requestedDate: "2025-05-15T11:00:00",
    requestedDays: 2,
    adminApprovedDays: 2,
    status: "accepted",
    referenceStaff: {
      name: 'Dr. P. Suresh',
      email: 'psuresh@university.edu'
    },
    userMessage: "For mechanical prototype.",
    adminMessage: "Approved.",
    components: [
      { name: "3D Printer", quantity: 1 }
    ],
    adminIssueComponents: [
      { name: "3D Printer", quantity: 1 }
    ],
    returnedComponents: [],
    reIssueRequest: {
      status: "pending",
      userExtensionMessage: "Need 1 more day for print completion.",
      adminExtensionMessage: "",
      extensionDays: 1
    }
  },

  // Accepted, extension accepted
  {
    requestId: "REQ-2025-0518",
    name: "Fatima Khan",
    rollNo: "CE20B021",
    phoneNo: "9876543288",
    email: "fatima.khan@university.edu",
    isFaculty: false,
    requestedDate: "2025-05-10T14:00:00",
    requestedDays: 5,
    adminApprovedDays: 5,
    status: "accepted",
    referenceStaff: {
      name: 'Dr. R. Menon',
      email: 'rmenon@university.edu'
    },
    userMessage: "For concrete testing.",
    adminMessage: "Approved.",
    components: [
      { name: "Compression Machine", quantity: 1 }
    ],
    adminIssueComponents: [
      { name: "Compression Machine", quantity: 1 }
    ],
    returnedComponents: [],
    reIssueRequest: {
      status: "accepted",
      userExtensionMessage: "Need 2 more days for final test.",
      adminExtensionMessage: "Extension granted.",
      extensionDays: 2,
      adminApprovedDays : 1
    }
  },

  // Accepted, extension rejected
  {
    requestId: "REQ-2025-0519",
    name: "Rohit Sharma",
    rollNo: "CS20B077",
    phoneNo: "9876543299",
    email: "rohit.sharma@university.edu",
    isFaculty: false,
    requestedDate: "2025-05-05T13:00:00",
    requestedDays: 2,
    adminApprovedDays: 2,
    status: "accepted",
    referenceStaff: {
      name: 'Dr. A. Iyer',
      email: 'aiyer@university.edu'
    },
    userMessage: "For coding contest.",
    adminMessage: "Approved.",
    components: [
      { name: "Laptop", quantity: 1 }
    ],
    adminIssueComponents: [
      { name: "Laptop", quantity: 1 }
    ],
    returnedComponents: [],
    reIssueRequest: {
      status: "rejected",
      userExtensionMessage: "Contest extended, need 1 more day.",
      adminExtensionMessage: "Extension denied due to high demand.",
      extensionDays: 1
    }
  },

  // Rejected request
  {
    requestId: "REQ-2025-0520",
    name: "Sneha Das",
    rollNo: "EE22B011",
    phoneNo: "9876543300",
    email: "sneha.das@university.edu",
    isFaculty: false,
    requestedDate: "2025-05-02T15:00:00",
    requestedDays: 3,
    adminApprovedDays: null,
    status: "rejected",
    referenceStaff: {
      name: 'Dr. V. Rao',
      email: 'vrao@university.edu'
    },
    userMessage: "For electronics mini project.",
    adminMessage: "Rejected due to insufficient stock.",
    components: [
      { name: "Multimeter", quantity: 2 }
    ],
    adminIssueComponents: [],
    returnedComponents: []
  },

  // Accepted, all components returned (no extension possible)
  {
    requestId: "REQ-2025-0521",
    name: "Kiran Joshi",
    rollNo: "ME22B055",
    phoneNo: "9876543311",
    email: "kiran.joshi@university.edu",
    isFaculty: false,
    requestedDate: "2025-04-28T10:00:00",
    requestedDays: 2,
    adminApprovedDays: 2,
    status: "accepted",
    referenceStaff: {
      name: 'Dr. S. Nair',
      email: 'snair@university.edu'
    },
    userMessage: "For lab experiment.",
    adminMessage: "Approved.",
    components: [
      { name: "Vernier Caliper", quantity: 1 }
    ],
    adminIssueComponents: [
      { name: "Vernier Caliper", quantity: 1 }
    ],
    returnedComponents: [
      { name: "Vernier Caliper", quantity: 1 }
    ]
  }
];

function UserReviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [requestData, setRequestData] = useState(null);
  const [userPage, setUserPage] = useState(1);
  const [adminPage, setAdminPage] = useState(1);
  const [returnPage, setReturnPage] = useState(1);
  const itemsPerPage = 5;

  const [extensionDays, setExtensionDays] = useState(1);
  const [extensionMessage, setExtensionMessage] = useState('');
  const [extensionSent, setExtensionSent] = useState(false);

  useEffect(() => {
    const requestId = searchParams.get('requestId');
    const req = requests.find(r => r.requestId === requestId);
    if (!req) {
      router.push('/user/request');
    } else {
      setRequestData(req);
    }
  }, [searchParams, router]);

  if (!requestData) {
    return <LoadingScreen />;
  }

  function StatusBadge({ status }) {
    const statusConfig = {
        pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '⏳' },
        accepted: { bg: 'bg-green-100', text: 'text-green-800', icon: '✓' },
        rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: '✕' }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        <span className="mr-1">{config.icon}</span>
        {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Pending'}
        </span>
    );
    }

    function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    }

  const columns = [
    { key: 'name', label: 'Component Name' },
    { key: 'quantity', label: 'Quantity' }
  ];

  const getPageRows = (rows, page) =>
      rows.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleDecrementDays = () => setExtensionDays(d => Math.max(1, d - 1));
  const handleIncrementDays = () => setExtensionDays(d => Math.min(30, d + 1));
  const handleExtensionDaysChange = (val) => {
    const num = parseInt(val, 10);
    if (!isNaN(num) && num >= 1 && num <= 30) setExtensionDays(num);
  };

  function getDaysLeft(approvedDays, requestedDate) {
    if (!approvedDays || !requestedDate) return "N/A";
    const approved = Number(approvedDays);
    const start = new Date(requestedDate);
    const now = new Date();
    const end = new Date(start);
    end.setDate(start.getDate() + approved);
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? `${diff} Days` : "Expired";
  }

  function ReIssueDetails({ reIssue, columns, getPageRows, userPage, setUserPage, itemsPerPage ,   adminIssueComponents, returnedComponents }) {
    const notReturned = adminIssueComponents.filter(adminItem =>
      !returnedComponents.some(retItem => retItem.name === adminItem.name)
    );
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden m-4 mb-8 mt-4">
        <div className="p-6 border-b border-yellow-200 bg-yellow-50 flex items-center gap-2">
          <Repeat className="w-5 h-5 text-yellow-500" />
          <h2 className="text-lg font-semibold text-yellow-700">Re-Issue Details</h2>
          <span className={`ml-4 px-3 py-1 rounded-full text-sm font-medium ${
            reIssue.status === 'pending'
              ? 'bg-yellow-100 text-yellow-800'
              : reIssue.status === 'accepted'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {reIssue.status.charAt(0).toUpperCase() + reIssue.status.slice(1)}
          </span>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-700">Admin Message</span>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-900 mb-4">
              {reIssue.adminExtensionMessage || <span className="text-gray-400">No message from admin.</span>}
            </div>
            <div className="mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-blue-700">User Note / Reason</span>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-900 mb-4">
              {reIssue.userExtensionMessage || <span className="text-gray-400">No message provided.</span>}
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-gray-700">Requested Days:</span>
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm font-semibold">
                {reIssue.extensionDays || "N/A"} Days
              </span>
            </div>
          </div>
          <div>
            <div className="mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-700">Re-Issued Components</span>
                {reIssue.status === 'accepted' && (
                <span className="ml-auto flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-sm">
                  <CalendarDays className="w-4 h-4" />
                  {reIssue.adminApprovedDays || reIssue.extensionDays} Days
                </span>
              )}
            </div>
            {notReturned.length > 0 ? (
              <>
                <Table
                  columns={columns}
                  rows={getPageRows(notReturned, userPage)}
                  currentPage={userPage}
                  itemsPerPage={itemsPerPage}
                />
                {notReturned.length > itemsPerPage && (
                  <Pagination
                    currentPage={userPage}
                    totalPages={Math.ceil(notReturned.length / itemsPerPage)}
                    setCurrentPage={setUserPage}
                  />
                )}
              </>
            ) : (
              <div className="text-gray-400 text-center py-6">No re-issued components found.</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
     <div className="bg-gray-50">
       <div className="mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
            <button
                onClick={() => router.back()}
                className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                aria-label="Go back"
            >
                <ArrowLeft size={20} className="text-gray-700" />
            </button>
            <FileText className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">Request Details</h1>
            </div>
            <StatusBadge status={requestData.status} />
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* --- Common Header --- */}
        <div className="bg-blue-50 p-6 border-b border-blue-100">
            <div className="flex flex-col md:flex-row justify-between">
            <div>
                <h2 className="text-xl font-semibold text-blue-800 mb-2">
                Request #{requestData.requestId}
                </h2>
                {requestData.isExtended && (
                <div className="flex items-center pb-2">
                    <span className="inline-flex items-center px-3 py-1 mb-2 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                        <Repeat className="w-4 h-4 mr-1" />
                        Extension / Re-Issue Request
                      </span>
                </div>
                )}
                <p className="text-gray-600">
                Requested on {formatDate(requestData.requestedDate)}
                </p>
            </div>
            <div className="mt-4 md:mt-0">
                <div className="inline-flex items-center bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                <div className={`w-3 h-3 rounded-full ${requestData.isFaculty ? 'bg-green-500' : 'bg-blue-500'} mr-2`}></div>
                <span className="font-medium">{requestData.isFaculty ? 'Faculty' : 'Student'} Request</span>
                </div>
            </div>
            </div>
        </div>

            {/* --- User and Reference Info --- */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* User Message */}
            <div className="bg-gray-50 p-5 rounded-lg flex flex-col h-full">
                <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                User Message
                </h3>
                <div className="text-gray-700 text-sm flex-1">
                {requestData.userMessage || <span className="text-gray-400">No message provided.</span>}
                </div>
            </div>

            {/* Admin Message */}
            <div className="bg-gray-50 p-5 rounded-lg flex flex-col h-full">
                <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M12 20.5a8.38 8.38 0 01-7.45-4.4 8.5 8.5 0 1114.9 0A8.38 8.38 0 0112 20.5z" />
                </svg>
                Admin Message
                </h3>
                <div className="text-gray-700 text-sm flex-1">
                {requestData.adminMessage
                    ? requestData.adminMessage
                    : <span className="text-gray-400">No message from admin.</span>}
                </div>
            </div>

            {/* Reference Staff */}
            <div className="bg-gray-50 p-5 rounded-lg flex flex-col h-full">
                <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
                Reference Staff
                </h3>
                <div className="space-y-3 text-sm">
                <div className="flex"><span className="text-gray-500 w-28">Name:</span><span className="font-medium">{requestData.referenceStaff?.name}</span></div>
                <div className="flex"><span className="text-gray-500 w-28">Email:</span><span className="font-medium">{requestData.referenceStaff?.email}</span></div>
                </div>
            </div>
            </div>

          {/* --- Conditional Tables --- */}
          <div className="p-6 border-t border-gray-200">
            {/* Pending */}
            {requestData.status === 'pending' && (
                <>
                <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
                    <Repeat className="w-5 h-5 mr-2 text-blue-600" />
                    Requested Components
                </h3>
                {requestData.components && requestData.components.length > 0 ? (
                    <>
                      <Table
                        columns={columns}
                        rows={getPageRows(requestData.components, userPage)}
                        currentPage={userPage}
                        itemsPerPage={itemsPerPage}
                      />
                      {requestData.components.length > itemsPerPage && (
                        <Pagination
                          currentPage={userPage}
                          totalPages={Math.ceil(requestData.components.length / itemsPerPage)}
                          setCurrentPage={setUserPage}
                        />
                      )}
                    </>
                    ) : (
                    <div className="text-gray-400 text-center py-6">No components found.</div>
                    )}
                </>
            )}

            {/* Accepted */}
            {requestData.status === 'accepted' && (
            <>
            <div className="mb-8 bg-blue-50 p-4 rounded-lg border border-blue-100 flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="text-gray-700 font-medium">Allocated:</span>
                <span className="font-semibold">{requestData.adminApprovedDays || requestData.requestedDays || "N/A"} Days</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-indigo-600" />
                <span className="text-gray-700 font-medium">Return Date:</span>
                <span className="font-semibold">
                  {(() => {
                    const days = Number(requestData.adminApprovedDays || requestData.requestedDays);
                    if (!days || !requestData.requestedDate) return "N/A";
                    const start = new Date(requestData.requestedDate);
                    start.setDate(start.getDate() + days);
                    return start.toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });
                  })()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-600" />
                <span className="text-gray-700 font-medium">Time Left:</span>
                <span className="font-semibold">
                  {getDaysLeft(requestData.adminApprovedDays, requestData.requestedDate)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* User Requested Components Table */}
                <div className="bg-white shadow rounded-lg">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-700 flex items-center">
                        <Repeat className="w-5 h-5 mr-2 text-blue-600" />
                        Requested Components
                    </h2>
                    <div className="flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{requestData.requestedDays || "N/A"} Days</span>
                    </div>
                    </div>
                    {requestData.components && requestData.components.length > 0 ? (
                    <>
                      <Table
                        columns={columns}
                        rows={getPageRows(requestData.components, userPage)}
                        currentPage={userPage}
                        itemsPerPage={itemsPerPage}
                      />
                      {requestData.components.length > itemsPerPage && (
                        <Pagination
                          currentPage={userPage}
                          totalPages={Math.ceil(requestData.components.length / itemsPerPage)}
                          setCurrentPage={setUserPage}
                        />
                      )}
                    </>
                    ) : (
                    <div className="text-gray-400 text-center py-6">No components found.</div>
                    )}
                </div>
                </div>

                {/* Admin Issued Components Table */}
                <div className="bg-white shadow rounded-lg">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-700 flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                        Admin Issued Components
                    </h2>
                    <div className="flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{requestData.adminApprovedDays || "N/A"} Days</span>
                    </div>
                    </div>
                    {requestData.adminIssueComponents && requestData.adminIssueComponents.length > 0 ? (
                    <>
                      <Table
                        columns={columns}
                        rows={getPageRows(requestData.adminIssueComponents, adminPage)}
                        currentPage={adminPage}
                        itemsPerPage={itemsPerPage}
                        renderCell={(key, row) => {
                        if (key === 'quantity' && row.replacedQuantity && row.replacedQuantity > 0) {
                          return (
                            <span>
                              {row.quantity}
                              <span className="font-semibold text-orange-600">
                                {" + " + row.replacedQuantity}
                              </span>
                            </span>
                          );
                        }
                        return row[key];
                      }}
                      />
                      {requestData.adminIssueComponents.length > itemsPerPage && (
                        <Pagination
                          currentPage={adminPage}
                          totalPages={Math.ceil(requestData.adminIssueComponents.length / itemsPerPage)}
                          setCurrentPage={setAdminPage}
                        />
                      )}
                    </>
                    ) : (
                    <div className="text-gray-400 text-center py-6">No admin issued components found.</div>
                    )}
                </div>
                </div>

                {/* Returned Components Table - spans both columns */}
                <div className="bg-white shadow rounded-lg md:col-span-2">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center mb-4">
                    <RefreshCw className="w-5 h-5 mr-2 text-indigo-600" />
                    <h2 className="text-lg font-semibold text-indigo-700">Returned Components</h2>
                    </div>
                    {requestData.returnedComponents && requestData.returnedComponents.length > 0 ? (
                    <>
                      <Table
                        columns={columns}
                        rows={getPageRows(requestData.returnedComponents, returnPage)}
                        currentPage={returnPage}
                        itemsPerPage={itemsPerPage}
                      />
                      {requestData.returnedComponents.length > itemsPerPage && (
                        <Pagination
                          currentPage={returnPage}
                          totalPages={Math.ceil(requestData.returnedComponents.length / itemsPerPage)}
                          setCurrentPage={setReturnPage}
                        />
                      )}
                    </>
                    ) : (
                    <div className="text-gray-400 text-center py-6">No return history available yet.</div>
                    )}
                </div>

                {/* Re-Issue Details: show in addition if extended */}
                  {requestData.status === 'accepted' && requestData.reIssueRequest && requestData.adminIssueComponents &&
                    requestData.adminIssueComponents.length > requestData.returnedComponents.length && requestData.reIssueRequest &&
                  (
                    requestData.reIssueRequest.userExtensionMessage?.trim() ||
                    requestData.reIssueRequest.extensionDays
                  ) ? (
                    <ReIssueDetails
                      reIssue={requestData.reIssueRequest}
                      columns={columns}
                      getPageRows={getPageRows}
                      userPage={userPage}
                      setUserPage={setUserPage}
                      itemsPerPage={itemsPerPage}
                      adminIssueComponents={requestData.adminIssueComponents}
                      returnedComponents={requestData.returnedComponents}
                    />
                  ) : null 
                }
                </div>

                {/* Extension Request Button */}
                {requestData.adminIssueComponents &&
                  requestData.adminIssueComponents.length > requestData.returnedComponents.length &&
                  (
                    !requestData.reIssueRequest ||
                    (
                      requestData.reIssueRequest.status === 'pending' &&
                      !requestData.reIssueRequest.userExtensionMessage &&
                      !requestData.reIssueRequest.extensionDays
                    )
                  ) && (
                  <div className="md:col-span-2 mt-8">
                    <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
                      <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
                        <Repeat className="w-5 h-5 mr-2 text-indigo-600" />
                        Request Extension
                      </h3>
                      {extensionSent ? (
                        <div className="flex items-center gap-2 bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-lg">
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Extension request sent!
                        </div>
                      ) : (
                        <form
                          onSubmit={e => {
                            e.preventDefault();
                            setRequestData(prev => ({
                              ...prev,
                              reIssueRequest: {
                                status: "pending",
                                userExtensionMessage: extensionMessage,
                                adminExtensionMessage: "",
                                extensionDays: extensionDays,
                                adminIssueComponents: []
                              }
                            }));
                            setExtensionSent(true);
                          }}
                          className="space-y-4"
                        >
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Number of additional days
                            </label>
                            <div className="flex items-center space-x-2 mt-2">
                              <button
                                type="button"
                                className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onClick={handleDecrementDays}
                                disabled={extensionDays <= 1}
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <input
                                type="text"
                                className="w-16 px-2 py-1 text-center rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                min="1"
                                max="30"
                                value={extensionDays}
                                onChange={e => handleExtensionDaysChange(e.target.value)}
                                disabled={extensionSent}
                              />
                              <button
                                type="button"
                                className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onClick={handleIncrementDays}
                                disabled={extensionDays >= 30 || extensionSent}
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                              <span className="text-sm font-medium">Days</span>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Reason for extension
                            </label>
                            <textarea
                              rows={3}
                              value={extensionMessage}
                              onChange={e => setExtensionMessage(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              placeholder="Explain why you need more time..."
                              required
                              disabled={extensionSent}
                            />
                          </div>
                          <div className="flex space-x-4">
                            <button
                              type="submit"
                              className="inline-flex items-center px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
                              disabled={extensionSent}
                            >
                              <Repeat className="w-5 h-5 mr-2" />
                              Submit Extension Request
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  </div>
                )}
            </div>
            </>
            )}

            {/* Rejected */}
            {requestData.status === 'rejected' && (
            <div className="space-y-8">
                <div className="bg-white shadow rounded-lg">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center mb-4">
                    <Repeat className="w-5 h-5 mr-2 text-blue-600" />
                    <h2 className="text-lg font-semibold text-gray-700">
                        Requested Components
                    </h2>
                    </div>
                    {requestData.components && requestData.components.length > 0 ? (
                    <>
                      <Table
                        columns={columns}
                        rows={getPageRows(requestData.components, userPage)}
                        currentPage={userPage}
                        itemsPerPage={itemsPerPage}
                      />
                      {requestData.components.length > itemsPerPage && (
                        <Pagination
                          currentPage={userPage}
                          totalPages={Math.ceil(requestData.components.length / itemsPerPage)}
                          setCurrentPage={setUserPage}
                        />
                      )}
                    </>
                    ) : (
                    <div className="text-gray-400 text-center py-6">No components found.</div>
                  )}
                </div>
                </div>
                <div className="text-center py-8">
                <XCircle className="w-10 h-10 mx-auto text-red-400 mb-3" />
                <p className="text-lg text-red-700 font-semibold">Your request was rejected.</p>
                </div>
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UserReviewPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <UserReviewContent />
    </Suspense>
  );
}