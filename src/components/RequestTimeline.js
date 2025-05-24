import React from 'react';

const RequestTimeline = ({ requestData, reissue = [], formatDate }) => {
  const timelineItems = [];

  timelineItems.push({
    type: 'request',
    date: requestData.requestedDate,
    label: 'Initial Request',
    isCompleted: true
  });

  timelineItems.push({
    type: 'acceptance',
    date: requestData.acceptedDate,
    label: getStatusLabel(requestData.status),
    isCompleted: !!requestData.acceptedDate,
    status: requestData.status
  });

  if (requestData.isreissued) {
    const requestReissues = reissue.filter(item => item.requestId === requestData.id);

    requestReissues.forEach((item, index) => {
      timelineItems.push({
        type: 'reissue',
        date: item.requestdate,
        label: `Reissue-Request ${index + 1}`,
        isCompleted: true
      });

      const isAccepted = item.acceptedDate && !item.admindescription?.toLowerCase().includes('rejected');

      timelineItems.push({
        type: 'reacceptance',
        date: item.acceptedDate,
        label: isAccepted ? `Reissue-Accepted ${index + 1}` : `Reissue-Rejected ${index + 1}`,
        isCompleted: !!item.acceptedDate,
        status: isAccepted ? 'accepted' : 'rejected'
      });
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
              <div className={`absolute top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full border-2 z-10 flex items-center justify-center ${
                item.isCompleted
                  ? item.type.includes('request') || item.type === 'reissue'
                    ? 'bg-blue-500 border-blue-500'
                    : item.status === 'rejected'
                      ? 'bg-red-500 border-red-500'
                      : item.status === 'returned'
                        ? 'bg-orange-500 border-orange-500'
                        : item.status === 'closed'
                          ? 'bg-amber-500 border-amber-500'
                          : 'bg-green-500 border-green-500'
                  : 'bg-white border-gray-300'
              }`}>
                {item.isCompleted && (
                  item.status === 'rejected' ? (
                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )
                )}
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
