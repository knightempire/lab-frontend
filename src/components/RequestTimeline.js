import React from 'react';

const RequestTimeline = ({ requestData, reissue = [], formatDate }) => {
  const timelineItems = [];

  // Always show Initial Request
  timelineItems.push({
    type: 'request',
    date: requestData.requestedDate,
    label: 'Initial Request',
    isCompleted: !!requestData.requestedDate
  });

  if (requestData.status === 'pending') {
    timelineItems.push({
      type: 'admin-action-pending',
      date: null,
      label: 'Admin Action Pending',
      isCompleted: false
    });
  } else if (requestData.status === 'rejected') {
    timelineItems.push({
      type: 'rejected',
      date: requestData.acceptedDate || null,
      label: 'Rejected',
      isCompleted: true
    });
  } else if (requestData.status === 'closed') {
    // Show Accepted
    timelineItems.push({
      type: 'acceptance',
      date: requestData.acceptedDate,
      label: 'Accepted',
      isCompleted: !!requestData.acceptedDate,
      status: 'accepted'
    });
    // Show Closed
    timelineItems.push({
      type: 'closed',
      date: requestData.allReturnedDate || requestData.returnedDate|| null,
      label: 'Closed',
      isCompleted: true
    });
  } else {
    // Accepted
    timelineItems.push({
      type: 'acceptance',
      date: requestData.acceptedDate,
      label: 'Accepted',
      isCompleted: !!requestData.acceptedDate,
      status: 'accepted'
    });

    // Issued
    timelineItems.push({
      type: 'issue',
      date: requestData.issueDate,
      label: 'Issued',
      isCompleted: !!requestData.issueDate,
      status: 'issued'
    });

    // Re-issue steps here, after Issued
if (requestData.reIssueRequest) {
  timelineItems.push({
    type: 'reissue-request',
    date: requestData.reIssueRequest.reIssuedDate,
    label: 'Reissue Requested',
    isCompleted: !!requestData.reIssueRequest.reIssuedDate
  });

  // Add admin reissue status after reissue request
if (requestData.reIssueRequest.status === 'pending') {
  timelineItems.push({
    type: 'reissue-admin-status',
    date: requestData.reIssueRequest.adminActionDate || null, 
    label: `Admin Reissue Status`,
    isCompleted: false
  });
}

      if (requestData.reIssueRequest.status !== 'pending') {
        const isRejected = requestData.reIssueRequest.status === 'rejected';
        timelineItems.push({
          type: 'reissue-accept-decline',
          date: requestData.reIssueRequest.reIssuedDate,
          label: isRejected ? 'Reissue Rejected' : 'Reissue Accepted',
          isCompleted: !!requestData.reIssueRequest.reIssuedDate,
          status: requestData.reIssueRequest.status
        });
      }
    }

    // Returned (if applicable)
    const returnedDate = requestData.allReturnedDate || requestData.returnedDate;
    if (returnedDate) {
      timelineItems.push({
        type: 'returned',
        date: returnedDate,
        label: 'Returned',
        isCompleted: true
      });
    }
  }

  function getStatusLabel(status) {
    switch (status?.toLowerCase()) {
      case 'accepted': return 'Accepted';
      case 'approved': return 'Accepted';
      case 'rejected': return 'Rejected';
      case 'closed': return 'Closed';
      case 'returned': return 'Returned';
      default: return 'Pending';
    }
  }

function getItemColor(item) {
  if (!item.isCompleted) {
    // Orange for pending
    return 'bg-orange-400 border-orange-400';
  }
  switch (item.type) {
    case 'request':
      return 'bg-blue-500 border-blue-500';         // Initial Request: Blue
    case 'acceptance':
      return 'bg-green-500 border-green-500';        // Accepted: Green
    case 'issue':
      return 'bg-purple-500 border-purple-500';      // Issued: Purple
    case 'reissue-request':
      return 'bg-cyan-500 border-cyan-500';      // Reissue Requested: Yellow
    case 'reissue-admin-status':
      return 'bg-yellow-500 border-yellow-500';          // Admin Reissue Status: Cyan
    case 'reissue-accept-decline':
      return item.status === 'rejected'
        ? 'bg-red-500 border-red-500'               // Reissue Rejected: Red
        : 'bg-green-600 border-green-600';          // Reissue Accepted: Dark Green
    case 'returned':
      return 'bg-rose-500 border-rose-500';          // Returned: Pink
    case 'closed':
      return 'bg-gray-700 border-gray-700';          // Closed: Dark Gray
         case 'rejected':
      return 'bg-red-500 border-red-500';    
    default:
      return 'bg-gray-400 border-gray-400';          // Fallback: Gray
  }
}

  function getIcon(item) {
    if (!item.isCompleted) {
      // No icon for pending
      return null;
    }
    if (item.status?.toLowerCase() === 'rejected') {
      return (
        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      );
    }
    return (
      <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    );
  }
  function getIcon(item) {
    if (!item.isCompleted) {
      return null;
    }

    // Show X icon for rejected items
    if (item.status?.toLowerCase() === 'rejected') {
      return (
        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      );
    }

    // Show checkmark for all other completed items
    return (
      <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    );
  }

  return (
    <div className="overflow-x-auto w-full px-4">
      <div className="relative inline-flex min-w-fit">
        {/* Horizontal line that spans from first to last dot */}
        {timelineItems.length > 1 && (
          <div className="absolute top-2 left-2 right-2 h-0.5 bg-gray-300 z-0"></div>
        )}

        {/* Timeline items */}
        <div className="flex space-x-8 items-start relative z-10">
          {timelineItems.map((item, index) => (
            <div key={index} className="relative flex flex-col items-center w-24 sm:w-28 md:w-32">
              {/* Dot */}
              <div className={`w-4 h-4 rounded-full border-2 z-10 flex items-center justify-center ${getItemColor(item)}`}>
                {getIcon(item)}
              </div>

              {/* Label and Date */}
              <div className="mt-2 text-center">
                <div className={`text-sm font-medium ${item.isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                  {item.label}
                </div>
                <div className={`text-xs mt-1 ${item.isCompleted ? 'text-gray-600' : 'text-gray-400'}`}>
                  {item.date ? formatDate(item.date) : 'Pending'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RequestTimeline;