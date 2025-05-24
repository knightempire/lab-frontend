import React from 'react';

const RequestTimeline = ({ requestData, reissue = [], formatDate }) => {
  const timelineItems = [];

  // Initial Request
  timelineItems.push({
    type: 'request',
    date: requestData.requestedDate,
    label: 'Initial Request',
    isCompleted: true
  });

  // Initial flow based on status
  const initialStatus = requestData.status?.toLowerCase();
  
  if (initialStatus === 'returned') {
    // For returned status: Request → Accepted → Issued → Returned (all from requestData)
    timelineItems.push({
      type: 'acceptance',
      date: requestData.acceptedDate,
      label: 'Accepted',
      isCompleted: !!requestData.acceptedDate,
      status: 'accepted'
    });

    timelineItems.push({
      type: 'issue',
      date: requestData.issueDate,
      label: 'Issued',
      isCompleted: !!requestData.issueDate,
      status: 'issued'
    });

    timelineItems.push({
      type: 'return',
      date: requestData.returnDate,
      label: 'Returned',
      isCompleted: true, // Always true for returned status
      status: 'returned'
    });
  } else {
    // For other statuses: Request → Accepted/Rejected/Closed
    timelineItems.push({
      type: 'acceptance',
      date: requestData.acceptedDate,
      label: getStatusLabel(requestData.status),
      isCompleted: !!requestData.acceptedDate,
      status: requestData.status
    });

    // Show issue date only if accepted (and not closed/rejected)
    if (initialStatus === 'accepted') {
      timelineItems.push({
        type: 'issue',
        date: requestData.issueDate,
        label: 'Issued',
        isCompleted: !!requestData.issueDate,
        status: 'issued'
      });
    }
  }

  // Handle Reissues
  if (requestData.isreissued) {
    const requestReissues = reissue.filter(item => item.requestId === requestData.id);

    requestReissues.forEach((item, index) => {
      // Reissue Request
      timelineItems.push({
        type: 'reissue',
        date: item.requestdate,
        label: `Reissue-Request ${index + 1}`,
        isCompleted: true
      });

      // Determine reissue status
      const isRejected = item.admindescription?.toLowerCase().includes('rejected');
      const reissueStatus = item.status?.toLowerCase();

      if (reissueStatus === 'returned') {
        // For returned reissue: Request → Accepted → Issued → Returned (all from reissue item)
        timelineItems.push({
          type: 'reacceptance',
          date: item.acceptedDate,
          label: `Reissue-Accepted ${index + 1}`,
          isCompleted: !!item.acceptedDate,
          status: 'accepted'
        });

        timelineItems.push({
          type: 'reissue-issue',
          date: item.issueDate,
          label: `Reissue-Issued ${index + 1}`,
          isCompleted: !!item.issueDate,
          status: 'issued'
        });

        timelineItems.push({
          type: 'reissue-return',
          date: item.returnDate,
          label: `Reissue-Returned ${index + 1}`,
          isCompleted: true, // Always true for returned status
          status: 'returned'
        });
      } else {
        // For other statuses: Request → Accepted/Rejected
        const finalStatus = isRejected ? 'rejected' : 
                           item.acceptedDate ? 'accepted' : 'pending';

        timelineItems.push({
          type: 'reacceptance',
          date: item.acceptedDate,
          label: isRejected ? `Reissue-Rejected ${index + 1}` : `Reissue-Accepted ${index + 1}`,
          isCompleted: !!item.acceptedDate,
          status: finalStatus
        });

        // Show issue date only if accepted (and not rejected)
        if (finalStatus === 'accepted') {
          timelineItems.push({
            type: 'reissue-issue',
            date: item.issueDate,
            label: `Reissue-Issued ${index + 1}`,
            isCompleted: !!item.issueDate,
            status: 'issued'
          });
        }
      }
    });
  }

  function getStatusLabel(status) {
    switch (status?.toLowerCase()) {
      case 'accepted': return 'Accepted';
      case 'rejected': return 'Rejected';
      case 'closed': return 'Closed';
      case 'returned': return 'Returned';
      default: return 'Pending';
    }
  }

  function getItemColor(item) {
    if (!item.isCompleted) {
      return 'bg-white border-gray-300';
    }

    switch (item.type) {
      case 'request':
      case 'reissue':
        return 'bg-blue-500 border-blue-500';
      case 'issue':
      case 'reissue-issue':
        return 'bg-purple-500 border-purple-500';
      case 'return':
      case 'reissue-return':
        return 'bg-orange-500 border-orange-500';
      default:
        // For acceptance/rejection items
        switch (item.status?.toLowerCase()) {
          case 'rejected':
            return 'bg-red-500 border-red-500';
          case 'returned':
            return 'bg-orange-500 border-orange-500';
          case 'closed':
            return 'bg-amber-500 border-amber-500';
          default:
            return 'bg-green-500 border-green-500';
        }
    }
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
      <div className="relative w-full min-w-fit">
        {/* Horizontal line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-300 z-0 transform -translate-y-1/2"></div>

        {/* Timeline items */}
        <div className="flex space-x-8 items-start relative z-10">
          {timelineItems.map((item, index) => (
            <div key={index} className="relative flex flex-col items-center w-24 sm:w-28 md:w-32">
              
              {/* Dot aligned on the line */}
              <div className={`absolute top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full border-2 z-10 flex items-center justify-center ${getItemColor(item)}`}>
                {getIcon(item)}
              </div>

              {/* Label and Date below the line */}
              <div className="mt-14 text-center">
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