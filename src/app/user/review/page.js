'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FileText, CheckCircle, XCircle, RefreshCw, Repeat, Minus, Plus, Clock, CalendarDays, ArrowLeft, AlertTriangle, Undo , HelpCircle} from 'lucide-react';
import Table from '../../../components/table';
import LoadingScreen from '../../../components/loading/loadingscreen';
import Pagination from '../../../components/pagination';
import { Suspense } from 'react';
import RequestTimeline from '../../../components/RequestTimeline';

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

  const [expandedRows, setExpandedRows] = useState(new Set());
  const [requestStatus, setRequestStatus] = useState('Open');


useEffect(() => {
  const requestId = searchParams.get('requestId');
  const fetchRequestData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/request/get/${requestId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        localStorage.removeItem('token');
        router.push('/auth/login');
        return;
      }

      const apiResponse = await response.json();
      const data = apiResponse.request;

      // Prepare mappedData as before
      const mappedData = {
        requestId: data.requestId,
        name: data.userId.name,
        rollNo: data.userId.rollNo,
        phoneNo: data.userId.phoneNo,
        email: data.userId.email,
        isFaculty: false,
        requestedDate: data.requestDate,
        acceptedDate: data.issuedDate || null,
        issueDate: data.collectedDate || null,
        allReturnedDate: data.AllReturnedDate || null,
        scheduledCollectionDate: data.scheduledCollectionDate,
        requestedDays: data.requestedDays || 0,
        adminApprovedDays: data.adminApprovedDays || 0,
        status: data.requestStatus.toLowerCase(),
        referenceStaff: {
          name: data.referenceId.name,
          email: data.referenceId.email,
        },
        userMessage: data.description,
        adminMessage: data.adminReturnMessage || "",
        components: data.requestedProducts.map(product => ({
          name: product.productId.product_name,
          quantity: product.quantity,
        })),
        adminIssueComponents: data.issued.map(issued => ({
          name: issued.issuedProductId.product_name,
          quantity: issued.issuedQuantity,
          replacedQuantity: issued.return
            ? issued.return.reduce((sum, ret) => sum + (ret.replacedQuantity || 0), 0)
            : 0,
        })),
        returnedComponents: data.issued
          ? data.issued.flatMap(issued =>
              (issued.return || []).map(ret => ({
                name: issued.issuedProductId.product_name,
                quantity: ret.returnedQuantity,
                returnDate: ret.returnDate,
                damagedQuantity: ret.damagedQuantity,
                userDamagedQuantity: ret.userDamagedQuantity,
                replacedQuantity: ret.replacedQuantity,
                action: ret.replacedQuantity > 0 ? 'Replaced' : 'Returned'
              }))
            )
          : [],
        reIssueRequest: null,
      };

      // If reIssued exists and has at least one value, fetch its details
      if (Array.isArray(data.reIssued) && data.reIssued.length > 0 && data.reIssued[0]) {
        const reIssuedId = data.reIssued[0];
        const reissueRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/reIssued/get/${reIssuedId}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        if (reissueRes.ok) {
          const reissueData = await reissueRes.json();
          const reIssued = reissueData.reIssued;
        mappedData.reIssueRequest = {
          status: reIssued.status,
          userExtensionMessage: reIssued.requestDescription,
          adminExtensionMessage: reIssued.adminReturnMessage || "",
          adminApprovedDays: reIssued.adminApprovedDays || 0,
          extensionDays: reIssued.requestedDays,
          adminIssueComponents: [],
          reIssuedDate: reIssued.reIssuedDate,      // <-- add this
          reviewedDate: reIssued.reviewedDate,      // <-- add this
        };
        }
      }

      setRequestData(mappedData);
      setRequestStatus(mappedData.status);
    } catch (error) {
      router.push('/user/request');
    }
  };

  if (requestId) {
    fetchRequestData();
  } else {
    router.push('/user/request');
  }
}, [searchParams, router]);

useEffect(() => {
  if (extensionSent) {
    const timer = setTimeout(() => setExtensionSent(false), 3000);
    return () => clearTimeout(timer);
  }
}, [extensionSent]);

  if (!requestData) {
    return <LoadingScreen />;
  }


  function StatusBadge({ status }) {
    const statusConfig = {
        pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <Clock size={16} className="text-yellow-700" /> },
        accepted: { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle size={16} className="text-green-700" /> },
        approved: { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle size={16} className="text-green-700" />},
        rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: <XCircle size={16} className="text-red-700" /> },
        returned: { bg: 'bg-blue-100', text: 'text-blue-800', icon: <Undo size={16} className="text-blue-700" /> },
        closed: { bg: 'bg-amber-100', text: 'text-amber-800', icon: <AlertTriangle size={16} className="text-amber-700" /> },
        reissued: { bg: 'bg-indigo-100', text: 'text-indigo-800', icon: <Repeat size={16} className="text-indigo-700" /> },
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

    function getReturnDate(collectedDate, adminApprovedDays) {
      if (!collectedDate || !adminApprovedDays) return null;
      const date = new Date(collectedDate);
      date.setDate(date.getDate() + Number(adminApprovedDays));
      return formatDate(date);
    }

  const columns = [
    { key: 'name', label: 'Component Name' },
    { key: 'quantity', label: 'Quantity' }
  ];

  const returnedColumns = [
    { key: 'name', label: 'Component Name', className: 'text-center' },
    { key: 'qtyReturned', label: 'Qty Returned', className: 'text-center' },
    { key: 'damagedCount', label: 'Damaged Count', className: 'text-center' },
    { key: 'actionType', label: 'Action', className: 'text-center' },
    { key: 'isUserDamaged', label: 'User Damaged', className: 'text-center' },
    { key: 'dateReturned', label: 'Date Returned', className: 'text-center' }
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

function ReIssueDetails({ reIssue, columns, getPageRows, userPage, setUserPage, itemsPerPage, adminIssueComponents, returnedComponents }) {
  // Calculate not returned for each component
  const notReturned = adminIssueComponents
    .map(adminItem => {
      const totalIssued = (adminItem.quantity || 0) + (adminItem.replacedQuantity || 0);
      const totalReturned = returnedComponents
        .filter(retItem => retItem.name === adminItem.name)
        .reduce((sum, retItem) => sum + (retItem.quantity || 0), 0);
      const notReturnedQty = totalIssued - totalReturned;
      return notReturnedQty > 0
        ? { ...adminItem, notReturnedQty }
        : null;
    })
    .filter(Boolean);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden m-4 mb-8 mt-4">

                
<div className="p-6 border-b border-yellow-200 bg-yellow-50 flex items-center gap-2">
  <Repeat className="w-5 h-5 text-yellow-500" />
  <h2 className="text-lg font-semibold text-yellow-700">Re-Issue Details</h2>
  <span className={`ml-4 px-3 py-1 rounded-full text-sm font-medium ${
    reIssue.status === 'pending'
      ? 'bg-yellow-100 text-yellow-800'
      : reIssue.status === 'accepted' || reIssue.status === 'approved'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800'
  }`}>
    {reIssue.status.charAt(0).toUpperCase() + reIssue.status.slice(1)}
  </span>
<div className="flex items-center gap-2 ml-auto">
  {reIssue.status === 'approved' && (
    <>
      <CheckCircle className="w-4 h-4 text-green-600" />
      <span className="font-medium text-green-700">No. of Days Approved:</span>
      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-sm font-semibold">
        {reIssue.adminApprovedDays || "N/A"} Days
      </span>
    </>
  )}
</div>
</div>
      
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* Left Column */}
  <div className="flex flex-col gap-6">
    {/* Admin Message */}
    <div>
      <div className="mb-2 flex items-center gap-2">
        <CheckCircle className="w-5 h-5 text-green-600" />
        <span className="font-semibold text-green-700">Admin Message</span>
      </div>
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-900">
        {reIssue.adminExtensionMessage || <span className="text-gray-400">No message from admin.</span>}
      </div>
    </div>
    {/* User Note / Reason */}
      {reIssue.status === 'pending' && (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <FileText className="w-4 h-4 text-blue-600" />
        <span className="font-semibold text-blue-700">User Note / Reason</span>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-900">
        {reIssue.userExtensionMessage || <span className="text-gray-400">No message provided.</span>}
      </div>
    </div>
)}
    {/* Requested Days */}
    <div className="flex items-center gap-2">
      <CalendarDays className="w-4 h-4 text-blue-600" />
      <span className="font-medium text-gray-700">Requested Days:</span>
      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm font-semibold">
        {reIssue.extensionDays || reIssue.requestedDays || "N/A"} Days
      </span>
    </div>
  </div>

  {/* Right Column */}
  <div className="flex flex-col gap-6">
    {reIssue.status === 'pending' ? (
      <>
        <div>
          <div className="mb-2 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-green-700">Re-Issued Components</span>
          </div>
          {notReturned.length > 0 ? (
            <Table
              columns={[
                { key: 'name', label: 'Component Name' },
                { key: 'notReturnedQty', label: 'Not Returned', className: 'text-center' }
              ]}
              rows={getPageRows(notReturned, userPage)}
              currentPage={userPage}
              itemsPerPage={itemsPerPage}
            />
          ) : (
            <div className="text-gray-400 text-center py-6">No re-issued components found.</div>
          )}
        </div>
      </>
    ) : (
      <>
        <div>
          <div className="mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-blue-700">User Note / Reason</span>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-900">
            {reIssue.userExtensionMessage || <span className="text-gray-400">No message provided.</span>}
          </div>
        </div>
      </>
    )}
  </div>
</div>

                
       
    </div>
  );
}

  const toggleRowExpansion = (itemId) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  // Add this helper function inside UserReviewContent
  function canShowExtension(issueDate, adminApprovedDays) {
    if (!issueDate || !adminApprovedDays) return false;
    const start = new Date(issueDate);
    const halfDays = Math.floor(Number(adminApprovedDays) / 2);
    const halfway = new Date(start);
    halfway.setDate(start.getDate() + halfDays);
    const now = new Date();
    // Remove time part for comparison
    halfway.setHours(0,0,0,0);
    now.setHours(0,0,0,0);
    return now >= halfway;
  }

  // Add this function inside UserReviewContent
async function handleExtensionRequestSubmit(e) {
  e.preventDefault();

  const token = localStorage.getItem('token');
  const requestId = searchParams.get('requestId');

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/reIssued/add/${requestId}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requestedDays: extensionDays,
          requestDescription: extensionMessage
        })
      }
    );

    const data = await res.json(); 
    console.log('Response data:', data); 

    if (res.ok) { 
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
    } else {
      console.error('Failed response:', data);
    }

  } catch (err) {
    console.error('Error submitting extension request:', err);
  }
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
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full">
              <StatusBadge status={requestData.status} />
            </span>
            </div>
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
                <RequestTimeline 
              requestData={requestData} 
       reissue={
    requestData.reIssueRequest
      ? [{
          requestdate: requestData.reIssueRequest.reIssuedDate || requestData.reIssueRequest.reissuedDate, // fallback if typo
          acceptedDate: requestData.reIssueRequest.reviewedDate,
          status: requestData.reIssueRequest.status
        }]
      : []
  }
  formatDate={formatDate} 
            />
            </div>
            <div className="flex flex-col sm:flex-row lg:flex-col gap-4 w-full sm:w-auto lg:w-auto shrink-0">
            <div className="mt-4 md:mt-0">
                <div className="inline-flex items-center bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                <div className={`w-3 h-3 rounded-full ${requestData.isFaculty ? 'bg-green-500' : 'bg-blue-500'} mr-2`}></div>
                <span className="font-medium">{requestData.isFaculty ? 'Faculty' : 'Student'} Request</span>
                </div>
            </div>
            {/* Request Status Box */}
            <div className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-sm border min-w-fit
              ${requestStatus === 'returned' 
                ? 'bg-green-100 border-green-200' 
                : 'bg-yellow-100 border-yellow-200'
              }`}>
              {requestStatus === 'returned' 
                ? <CheckCircle size={16} className="text-green-700 shrink-0" />
                : <Clock size={16} className="text-yellow-700 shrink-0" />
              }
              <span className={`text-sm font-medium whitespace-nowrap ${
                requestStatus === 'returned' ? 'text-green-700' : 'text-yellow-700'
              }`}>
                Request {requestStatus}
              </span>
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
            {(requestData.status === 'accepted' || requestData.status === 'approved' || requestData.status === 'returned' || requestData.status === 'reissued' ) && (
            <>
            <div className="mb-8 bg-blue-50 p-4 rounded-lg border border-blue-100 flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="text-gray-700 font-medium">Allocated:</span>
                <span className="font-semibold">{requestData.adminApprovedDays || requestData.requestedDays || "N/A"} Days</span>
              </div>
              {requestData.issueDate ? (
                <>
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-indigo-600" />
                <span className="text-gray-700 font-medium">Return Date:</span>
                <span className="font-semibold">
                  {(() => {
                    const baseDate = requestData.collectedDate || requestData.issueDate;
                    if (!baseDate) return "N/A";
                    const mainDays = Number(requestData.adminApprovedDays || requestData.requestedDays) || 0;
                    const reIssueDays =
                      requestData.reIssueRequest && requestData.reIssueRequest.status === "approved"
                        ? Number(requestData.reIssueRequest.adminApprovedDays) || 0
                        : 0;
                    console.log("DEBUG Return Date Days:", {
                      mainDays,
                      reIssueDays,
                      totalDays: mainDays + reIssueDays,
                      baseDate,
                    });
                    const date = new Date(baseDate);
                    date.setDate(date.getDate() + mainDays + reIssueDays);
                    const pad = n => n.toString().padStart(2, '0');
                    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
                  })()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-600" />
                <span className="text-gray-700 font-medium">Time Left:</span>
                <span className="font-semibold">
                  {(() => {
                    const baseDate = requestData.collectedDate || requestData.issueDate;
                    if (!baseDate) return "N/A";
                    const mainDays = Number(requestData.adminApprovedDays || requestData.requestedDays) || 0;
                    const reIssueDays =
                      requestData.reIssueRequest && requestData.reIssueRequest.status === "approved"
                        ? Number(requestData.reIssueRequest.adminApprovedDays) || 0
                        : 0;
                    const endDate = new Date(baseDate);
                    endDate.setDate(endDate.getDate() + mainDays + reIssueDays);
                    const now = new Date();
                    const diffTime = endDate - now;
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    return diffDays > 0 ? `${diffDays} Days` : "Expired";
                  })()}
                </span>
              </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-indigo-600" />
                  <span className="text-gray-700 font-medium">Scheduled Collection Date:</span>
<span className="font-semibold flex items-center relative group">
  {requestData.scheduledCollectionDate || "-"}
  <span className="absolute left-6 top-1/2 -translate-y-1/2 z-10 w-64 rounded bg-gray-900 text-white text-xs px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
      Scheduled by admin. You can collect on this date and time. This will be valid for 48 hrs. If not collected, your request will close automatically.
    </span>
  </span>
                </div>
              )}
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
                        rows={getPageRows(
                          requestData.adminIssueComponents.map(component => {
                            // Calculate replaced quantity if available
                            const replaced = component.replacedQuantity || 0;
                            return {
                              ...component,
                              quantity: (
                                <span>
                                  {component.quantity}
                                  {replaced > 0 && (
                                    <span className="font-semibold text-orange-600">{" + " + replaced}</span>
                                  )}
                                </span>
                              ),
                            };
                          }),
                          adminPage
                        )}
                        currentPage={adminPage}
                        itemsPerPage={itemsPerPage}
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
                          columns={returnedColumns}
                          rows={(() => {
                            const returnHistoryRows = requestData.returnedComponents.reduce((acc, item) => {
                              // Map the existing data structure to match the template
                              const mappedItem = {
                                id: `${item.name}-${item.returnDate}`, // Create unique ID
                                name: item.name,
                                qtyReturned: item.quantity,
                                damagedCount: item.damagedQuantity || 0,
                                actionType: item.replacedQuantity > 0 ? 'replace' : 'return',
                                isUserDamaged: item.userDamagedQuantity > 0,
                                dateReturned: item.returnDate,
                                damageDescription: item.damageDescription || null // Add if available in your data
                              };

                              acc.push({
                                ...mappedItem,
                                name: (
                                  <div className="text-center flex items-center justify-center">
                                    {mappedItem.name}
                                  </div>
                                ),
                                qtyReturned: <div className="text-center">{mappedItem.qtyReturned}</div>,
                                damagedCount: (
                                  <div className="flex items-center justify-center">
                                    {mappedItem.damagedCount > 0 ? (
                                      <div className="flex items-center text-amber-600">
                                        <AlertTriangle className="w-4 h-4 mr-1" />
                                        <span>{mappedItem.damagedCount}</span>
                                      </div>
                                    ) : (
                                      <span className="text-green-600">0</span>
                                    )}
                                    {mappedItem.damagedCount > 0 && mappedItem.damageDescription && (
                                      <button
                                        onClick={() => toggleRowExpansion(mappedItem.id)}
                                        className="ml-2 p-1 rounded-full hover:bg-blue-100 text-blue-600 transition-colors"
                                        title="View damage description"
                                      >
                                        {expandedRows.has(mappedItem.id) ? (
                                          <Minus size={16} />
                                        ) : (
                                          <Plus size={16} />
                                        )}
                                      </button>
                                    )}
                                  </div>
                                ),
                                actionType: (
                                  <div className="text-center">
                                    {mappedItem.damagedCount > 0 ? (
                                      <span className={mappedItem.actionType === 'replace' ? 'text-blue-600' : 'text-amber-600'}>
                                        {mappedItem.actionType === 'replace' ? 'Replaced' : 'Returned'}
                                      </span>
                                    ) : (
                                      <span className="text-green-600">Returned</span>
                                    )}
                                  </div>
                                ),
                                isUserDamaged: (
                                  <div className="text-center">
                                    {mappedItem.damagedCount > 0 ? (
                                      <span className={mappedItem.isUserDamaged ? 'text-red-600 rounded-full bg-red-100 px-3 py-1' : 'text-green-600 rounded-full bg-green-100 px-3 py-1'}>
                                        {mappedItem.isUserDamaged ? 'Yes' : 'No'}
                                      </span>
                                    ) : (
                                      <span>-</span>
                                    )}
                                  </div>
                                ),
                                dateReturned: <div className="text-center">{formatDate(mappedItem.dateReturned)}</div>
                              });

                              // Add expanded row if needed
                              if (expandedRows.has(mappedItem.id) && mappedItem.damagedCount > 0 && mappedItem.damageDescription) {
                                acc.push({
                                  id: `${mappedItem.id}-expanded`,
                                  isExpanded: true,
                                  expandedContent: (
                                    <div className="p-4 bg-blue-50 border-l-4 border-blue-500">
                                      <div className="flex items-start">
                                        <AlertTriangle className="w-5 h-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                                        <div>
                                          <h4 className="font-medium text-gray-800 mb-2">Damage Description</h4>
                                          <p className="text-gray-600 text-sm leading-relaxed">
                                            {mappedItem.damageDescription}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                });
                              }
                              return acc;
                            }, []);

                            return getPageRows(returnHistoryRows, returnPage);
                          })()}
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
{(requestData.reIssueRequest && (
    requestData.reIssueRequest.userExtensionMessage?.trim() ||
    requestData.reIssueRequest.extensionDays ||
    extensionSent // show immediately after submit
  )) && (
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
)}
                </div>

                {/* Extension Request Button and Message */}
                {requestData.status !== 'returned' &&
                  requestData.adminIssueComponents &&
                  (
                    !requestData.reIssueRequest ||
                    (
                      requestData.reIssueRequest.status === 'pending' &&
                      !requestData.reIssueRequest.userExtensionMessage &&
                      !requestData.reIssueRequest.extensionDays
                    )
                  ) &&
                  canShowExtension(requestData.issueDate, requestData.adminApprovedDays) && (
                    <div className="md:col-span-2 mt-8">
                      <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
                  <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
                    <Repeat className="w-5 h-5 mr-2 text-indigo-600" />
                    Request Extension
                    <span className="ml-2 relative group flex items-center">
                      <HelpCircle className="w-5 h-5 text-blue-500 cursor-pointer" />
                      <span className="absolute left-7 top-1/2 -translate-y-1/2 z-20 w-64 rounded bg-gray-900 text-white text-xs px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
                        You can request an extension for your components. The admin may accept or decline your request. You will be notified of the decision.
                      </span>
                    </span>
                  </h3>
                {/* Always display the extension request form/table */}
                <form
                  onSubmit={handleExtensionRequestSubmit}
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

            {/* Closed - Failed to collect components */}
            {requestData.status === 'closed' && (
  <div className="space-y-8">
    <div className="bg-white shadow rounded-lg">
      <div className="p-6 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Requested Components Table */}
          <div>
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
          </div>
          {/* Admin Issued Components Table */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              Admin Issued Components
            </h3>
            {requestData.adminIssueComponents && requestData.adminIssueComponents.length > 0 ? (
              <>
                <Table
                  columns={columns}
                  rows={getPageRows(requestData.adminIssueComponents, adminPage)}
                  currentPage={adminPage}
                  itemsPerPage={itemsPerPage}
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
        {/* Scheduled Collection Date and Failure Message */}
        <div className="text-center py-8">
<div className="mb-4">
  <span className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 font-medium text-sm">
    <CalendarDays className="w-5 h-5 mr-2" />
    Scheduled Collection Date:&nbsp;
    {requestData.scheduledCollectionDate
      ? requestData.scheduledCollectionDate
      : '-'}
    <span
      className="ml-2 cursor-pointer"
      title="Scheduled by admin. You can collect on this date and time. This will be valid for 48 hrs. If not collected, your request will close automatically."
    >
      {/* Import HelpCircle from lucide-react at the top */}
      <HelpCircle className="w-4 h-4 text-blue-500 inline" />
    </span>
  </span>
</div>
          <XCircle className="w-10 h-10 mx-auto text-red-400 mb-3" />
          <p className="text-lg text-red-700 font-semibold">
            Failed to collect components from scheduled date. 48 hrs crossed!
          </p>
        </div>
      </div>
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