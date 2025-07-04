'use client'
import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Table from '../../../components/table';
import Pagination from '../../../components/pagination';
import { CheckCircle, RefreshCw, FileText, Plus, Minus, CalendarDays, Clock, ArrowLeft, AlertTriangle, Check, Info, Repeat, XCircle, RefreshCcw ,Undo} from 'lucide-react';
import { Suspense } from 'react';
import LoadingScreen from '../../../components/loading/loadingscreen';
import RequestTimeline from '../../../components/RequestTimeline';
import { apiRequest } from '../../../utils/apiRequest';
import SuccessAlert from '../../../components/SuccessAlert';

const AdminRetrunViewContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestId = searchParams.get('requestId');

  const [requestData, setRequestData] = useState(null);
  const [windowWidth, setWindowWidth] = useState(1024); // Default to desktop size
  
  const [userDamagedCount, setUserDamagedCount] = useState(0);
  const [notUserDamagedCount, setNotUserDamagedCount] = useState(0);
  const [replacingCount, setReplacingCount] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);

  //State for Request
  const [requestStatus, setRequestStatus] = useState('Open');

  // State for admin issue table (editable)
  const [adminIssueComponents, setAdminIssueComponents] = useState([]);
  
  // State for component return tracking
  const [returnTrackingComponents, setReturnTrackingComponents] = useState([]);
  
  // State for return history
  const [returnHistory, setReturnHistory] = useState([]);

  // State for tracking damage
  const [hasDamage, setHasDamage] = useState({});
  const [damageCount, setDamageCount] = useState({});
  
  // Pagination states
  const [requestedPage, setRequestedPage] = useState(1);
  const [adminPage, setAdminPage] = useState(1);
  const [returnTrackingPage, setReturnTrackingPage] = useState(1);
  const [returnHistoryPage, setReturnHistoryPage] = useState(1);
  const [reissuePage, setReissuePage] = useState(1); // Add this if you want pagination for reissue table
  const [itemsPerPage, setItemsPerPage] = useState(5);
  
  // Add this to your state declarations at the top
  const [showDamageModal, setShowDamageModal] = useState(false);
  const [selectedComponentIndex, setSelectedComponentIndex] = useState(null);
  const [damageDescription, setDamageDescription] = useState('');
  const [isUserDamaged, setIsUserDamaged] = useState(false);
  const [damageAction, setDamageAction] = useState('return'); // 'return' or 'replace'
  const [expandedRows, setExpandedRows] = useState(new Set());

  const [replacements, setReplacements] = useState({});
  const [reissue, setReissue] = useState([]);

  const [showSuccess, setShowSuccess] = useState(false);

  const isSubmittingRef = useRef(false); // Prevent rapid submissions

  // Fetch request data from API
useEffect(() => {

    const verifyadmin = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
          router.push('/auth/login'); 
      }

      const res = await apiRequest(`/verify-token`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    if (!res.ok) {
      console.error('Token verification failed:', data.message);
      router.push('/auth/login'); 
    } else {
      const user = data.user;
      if (!user.isAdmin ) {
        router.push('/auth/login'); 
      }
      if (!user.isActive) {
          router.push('/auth/login'); 
      }

       fetchAllData();
  
    }
  }


  verifyadmin()

}, [requestId, router]);


  const fetchAllData = async () => {
    const token = localStorage.getItem('token');
    if (!requestId || !token) return;

    try {
      // Fetch request details
      const response = await apiRequest(`/request/get/${requestId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const apiData = await response.json();
      if (!response.ok || !apiData.request) {
        router.back();
        return;
      }
      const req = apiData.request;
  
      // Fetch return details
      const returnRes = await apiRequest(`/request/return/${requestId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const returnData = await returnRes.json();

      // Map issued components for return tracking
      const issued = req.issued || [];
      const returnMap = {};
      (returnData.return || []).forEach(ret => {
        returnMap[ret.issuedProductId] = ret;
      });

      // Build return tracking components
      const tracking = issued.map(issuedItem => {
        // Sum all replacedQuantity for this issued item
        const replacedCount = (issuedItem.return || []).reduce(
          (sum, ret) => sum + (ret.replacedQuantity || 0),
          0
        );
        // Sum all returnedQuantity for this issued item
        const returnedCount = (issuedItem.return || []).reduce(
          (sum, ret) => sum + (ret.returnedQuantity || 0),
          0
        );
        const totalIssued = issuedItem.issuedQuantity + replacedCount;
        const remaining = totalIssued - returnedCount;
return {
  id: issuedItem.issuedProductId._id,
  name: issuedItem.issuedProductId.product_name,
  totalIssued,
  returned: 0 // for input
,
  remaining: remaining > 0 ? remaining : 0,
};
      });

      setReturnTrackingComponents(tracking);

      // Build return history
      let history = [];
      (returnData.return || []).forEach(ret => {
        (ret.returns || []).forEach(r => {
          history.push({
            id: r._id,
            name: issued.find(i => i.issuedProductId._id === ret.issuedProductId)?.issuedProductId.product_name || '',
            qtyReturned: r.returnedQuantity,
            damagedCount: r.damagedQuantity,
            dateReturned: r.returnDate,
            damageDescription: '', // If you want to store description, add it to API and here
            isUserDamaged: r.userDamagedQuantity > 0,
            actionType: r.replacedQuantity > 0 ? 'replace' : 'return'
          });
        });
      });
      // Sort history by date (optional)
      history = history.sort((a, b) => new Date(b.dateReturned) - new Date(a.dateReturned));
      setReturnHistory(history);

      // Set requestData as before
      const mappedRequest = {
        id: req.requestId,
        name: req.userId?.name || '',
        rollNo: req.userId?.rollNo || '',
        phoneNo: req.userId?.phoneNo || '',
        email: req.userId?.email || '',
        isFaculty: req.userId?.isFaculty ,
        requestedDate: req.requestDate,
        acceptedDate: req.issuedDate,
        issueDate: req.collectedDate,
        returnedDate: req.returnedDate,
        requestedDays: req.requestedDays,
        adminApprovedDays: req.adminApprovedDays || null,
         allReturnedDate: req.AllReturnedDate || null,
        status: req.requestStatus,
        referenceStaff: {
          name: req.referenceId?.name || '',
          email: req.referenceId?.email || ''
        },
        description: req.description,
        admindescription: req.adminReturnMessage,
components: (req.issued && req.issued.length > 0
    ? req.issued.map(item => ({
        id: item.issuedProductId?._id || item._id,
        name: item.issuedProductId?.product_name || item.product_name || item.name,
        quantity: item.issuedQuantity || item.quantity
      }))
    : (req.requestedProducts || []).map(item => ({
        id: item.productId?._id || item._id,
        name: item.productId?.product_name || item.product_name || item.name,
        quantity: item.quantity
      }))
  ),
        issued: req.issued, // <-- ADD THIS LINE
        requestedProducts: req.requestedProducts, // <-- Add this line
        isreissued: req.reIssued && req.reIssued.length > 0
      };

      if (req.reIssued && req.reIssued.length > 0) {
  try {
    const reIssueId = req.reIssued[0]; // Assuming only one re-issue at a time
    const reIssueRes = await apiRequest(`/reIssued/get/${reIssueId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const reIssueData = await reIssueRes.json();
    if (reIssueRes.ok && reIssueData.reIssued) {
  mappedRequest.reIssueRequest = { ...reIssueData.reIssued };
    }
  } catch (err) {
    // Optionally handle error
    mappedRequest.reIssueRequest = null;
  }
}




      setRequestData(mappedRequest);
      setAdminIssueComponents(mappedRequest.components);

      // Setup damage state
      const initialDamageState = {};
      const initialDamageCount = {};
      mappedRequest.components.forEach((component, index) => {
        initialDamageState[index] = false;
        initialDamageCount[index] = 0;
      });
      setHasDamage(initialDamageState);
      setDamageCount(initialDamageCount);

      setReissue(req.reIssued || []);
    } catch (err) {
      router.back();
    }
  };

useEffect(() => {
  if (requestData?.status === 'closed') {
    setRequestStatus('Done');
  } else {
    // Check if all components have been returned
    const allReturned = returnTrackingComponents.length === 0 || 
      returnTrackingComponents.every(component => component.remaining === 0);
    setRequestStatus(allReturned ? 'Done' : 'Open');
  }
}, [returnTrackingComponents, requestData?.status]);

  useEffect(() => {
    // Handle window resize for responsive layout
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [router]);

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle return quantity change
const handleReturnQtyChange = (index, value) => {
  const newValue = parseInt(value) || 0;
  const updatedComponents = [...returnTrackingComponents];
  const component = updatedComponents[index];
  const validValue = Math.max(0, Math.min(newValue, component.remaining));
  updatedComponents[index] = {
    ...component,
    returned: validValue,
  };
  setReturnTrackingComponents(updatedComponents);
  if (hasDamage[index] && damageCount[index] > validValue) {
    setDamageCount({ ...damageCount, [index]: validValue });
  }
};

  // Handle damage modal submit
  const handleDamageModalSubmit = () => {
    const totalDamaged = userDamagedCount + notUserDamagedCount;
    setDamageCount({ ...damageCount, [selectedComponentIndex]: totalDamaged });
    setShowDamageModal(false);
  };

  // Handle damage count change
  const handleDamageCountChange = (index, value) => {
    let newValue = parseInt(value) || 0;
    const returnQty = returnTrackingComponents[index].returned;
    const validValue = Math.max(0, Math.min(newValue, returnQty));
    setDamageCount({ ...damageCount, [index]: validValue });
  };

  // Increment/decrement handlers
const incrementReturnQty = (index) => {
  const component = returnTrackingComponents[index];
  if (component.returned < component.remaining) {
    handleReturnQtyChange(index, component.returned + 1);
  }
};

const decrementReturnQty = (index) => {
  const component = returnTrackingComponents[index];
  if (component.returned > 0) {
    handleReturnQtyChange(index, component.returned - 1);
  }
};
  const decrementDamageCount = (index) => {
    const currentCount = damageCount[index] || 0;
    if (currentCount > 0) {
      handleDamageCountChange(index, currentCount - 1);
    }
  };

  const incrementUserDamagedCount = () => {
    const returnQty = returnTrackingComponents[selectedComponentIndex].returned;
    const currentTotal = userDamagedCount + notUserDamagedCount;
    if (currentTotal < returnQty) {
      setUserDamagedCount(userDamagedCount + 1);
    }
  };
  const decrementUserDamagedCount = () => {
    if (userDamagedCount > 0) {
      setUserDamagedCount(userDamagedCount - 1);
      if (replacingCount > userDamagedCount + notUserDamagedCount - 1) {
        setReplacingCount(userDamagedCount + notUserDamagedCount - 1);
      }
    }
  };
  const incrementNotUserDamagedCount = () => {
    const returnQty = returnTrackingComponents[selectedComponentIndex].returned;
    const currentTotal = userDamagedCount + notUserDamagedCount;
    if (currentTotal < returnQty) {
      setNotUserDamagedCount(notUserDamagedCount + 1);
    }
  };
  const decrementNotUserDamagedCount = () => {
    if (notUserDamagedCount > 0) {
      setNotUserDamagedCount(notUserDamagedCount - 1);
      if (replacingCount > userDamagedCount + notUserDamagedCount - 1) {
        setReplacingCount(userDamagedCount + notUserDamagedCount - 1);
      }
    }
  };
  const incrementReplacingCount = () => {
    const totalDamaged = userDamagedCount + notUserDamagedCount;
    if (replacingCount < totalDamaged) {
      setReplacingCount(replacingCount + 1);
    }
  };
  const decrementReplacingCount = () => {
    if (replacingCount > 0) {
      setReplacingCount(replacingCount - 1);
    }
  };

  // Toggle row expansion for damage details
  const toggleRowExpansion = (itemId) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(itemId)) {
      newExpandedRows.delete(itemId);
    } else {
      newExpandedRows.add(itemId);
    }
    setExpandedRows(newExpandedRows);
  };


const handleReturnSubmit = async (componentIndex) => {
  if (isSubmittingRef.current) return; // Prevent rapid clicks
  isSubmittingRef.current = true;

  const component = returnTrackingComponents[componentIndex];
  if (component.returned > 0) {
    // Prepare API payload
    const payload = {
      productName: component.name,
      returnQuantity: component.returned,
      damagedQuantity: (damageCount[componentIndex] || 0),
      userDamagedQuantity: userDamagedCount,
      replacedQuantity: replacingCount
    };

    const token = localStorage.getItem('token');
    try {
      const response = await apiRequest(
        `/request/return/${requestData.id}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }
      );
      const data = await response.json();
      if (!response.ok) {
        console.error('Error returning component:', data.message);
        isSubmittingRef.current = false;
        return;
      }

      // Show success and refresh data
      setShowSuccess(true);
      fetchAllData();

      // Clear modal values after successful return
      setUserDamagedCount(0);
      setNotUserDamagedCount(0);
      setReplacingCount(0);
      setDamageDescription('');
      setSelectedComponentIndex(null);
      setShowDamageModal(false);

    } catch (err) {
      console.error('Error returning component:', err);
    }
  }
  isSubmittingRef.current = false;
};

  if (!requestData) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Check if we should use large screen layout
  const isLargeScreen = windowWidth >= 1024;

  // Table configurations
  const requestedComponentsColumns = [
    { key: 'name', label: 'Component Name' },
    { key: 'quantity', label: 'Quantity' }
  ];

  // Use requestedProducts for original requested quantity
  const requestedComponentsRows = (requestData.requestedProducts || []).map(item => ({
    name: item.productId?.product_name || item.product_name || item.name,
    quantity: item.quantity,
    description: item.description || '-'
  }));

  const adminComponentsColumns = [
    { key: 'name', label: 'Component Name' },
    { key: 'quantity', label: 'Quantity', className: 'text-center' },
  ];

const adminComponentsRows = (requestData.issued || []).map(component => {
  const issuedQuantity = component.issuedQuantity;
  const returns = component.return || [];
  const totalReplacedQuantity = returns.reduce((total, ret) => total + (ret.replacedQuantity || 0), 0);

  return {
    id: component.issuedProductId._id,
    name: component.issuedProductId.product_name,
    quantity: (
      <div className="flex items-center justify-center">
        <span>
          {issuedQuantity}
          {totalReplacedQuantity > 0 && (
            <> + {totalReplacedQuantity}</>
          )}
        </span>
      </div>
    ),
    description: component.description || '-'
  };
});


  const reissueColumns = [
    { key: 'name', label: 'Component Name' },
    { key: 'quantity', label: 'Quantity' }
  ];

  // Map reissue data if available
  const reissueRows = (reissue.length > 0 && reissue[0].components)
    ? reissue[0].components.map(component => ({
        name: component.product_name || component.name,
        quantity: component.quantity
      }))
    : [];

  // Return tracking table configuration
  const returnTrackingColumns = [
    { key: 'name', label: 'Component Name', className: 'text-center' },
    { key: 'totalIssued', label: 'Total Issued', className: 'text-center' },
    { key: 'returned', label: 'Returning', className: 'text-center' },
    { key: 'remaining', label: 'Remaining', className: 'text-center' },
    { key: 'damage', label: 'Damage', className: 'text-center' },
    { key: 'actions', label: 'Actions', className: 'text-center' }
  ];




const returnTrackingRows = returnTrackingComponents
  .map((component, originalIndex) => ({ ...component, originalIndex }))
  .filter(component => component.remaining > 0)
  .map((component) => {
    const index = component.originalIndex;
    const returnedValue = returnTrackingComponents[index]?.returned ?? 0;

    return {
      ...component,
      name: <div className="text-center">{component.name}</div>,
      totalIssued: <div className="text-center">{component.totalIssued}</div>,
      remaining: <div className="text-center">{component.remaining}</div>,
      returned: (
        <div className="flex items-center justify-center">
          <button 
            onClick={() => decrementReturnQty(index)}
            disabled={returnedValue <= 0}
            className={`p-1 rounded ${returnedValue <= 0 ? 'text-gray-300' : 'text-blue-600 hover:bg-blue-100'}`}
          >
            <Minus size={16} />
          </button>
          <input
            type="number"
            min="0"
            max={component.remaining}
            value={returnedValue}
            onChange={(e) => handleReturnQtyChange(index, e.target.value)}
            className="w-16 p-1 mx-1 border border-gray-300 rounded text-center"
          />
          <button 
            onClick={() => incrementReturnQty(index)}
            disabled={returnedValue >= component.remaining}
            className={`p-1 rounded ${returnedValue >= component.remaining ? 'text-gray-300' : 'text-blue-600 hover:bg-blue-100'}`}
          >
            <Plus size={16} />
          </button>
        </div>
      ),
      damage: (
        <div className="flex items-center justify-center">
          <button
            onClick={() => {
              setSelectedComponentIndex(index);
              setDamageCount({ ...damageCount, [index]: 0 });
              setDamageDescription('');
              setIsUserDamaged(false);
              setDamageAction('return');
              setShowDamageModal(true);
            }}
            disabled={returnedValue <= 0}
            className={`px-3 py-1 rounded-md ${
              returnedValue > 0 
                ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            Report Damage
          </button>
        </div>
      ),
      actions: (
        <div className="text-center">
          <button
            onClick={() => handleReturnSubmit(index)}
            disabled={returnedValue <= 0}
            className={`px-3 py-1 rounded-md ${
              returnedValue > 0 
                ? 'bg-green-500 hover:bg-green-600 text-white' 
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            Return
          </button>
        </div>
      )
    };
  });

  
  // Return history table configuration
  const returnHistoryColumns = [
    { key: 'name', label: 'Component Name', className: 'text-center' },
    { key: 'qtyReturned', label: 'Qty Returned', className: 'text-center' },
    { key: 'damagedCount', label: 'Damaged Count', className: 'text-center' },
    { key: 'actionType', label: 'Action', className: 'text-center' },
    { key: 'isUserDamaged', label: 'User Damaged', className: 'text-center' },
    { key: 'dateReturned', label: 'Date Returned', className: 'text-center' }
  ];

  const returnHistoryRows = returnHistory.reduce((acc, item) => {
    acc.push({
      ...item,
      name: (
        <div className="text-center flex items-center justify-center">
          {item.name}
        </div>
      ),
      qtyReturned: <div className="text-center">{item.qtyReturned}</div>,
      damagedCount: (
        <div className="flex items-center justify-center">
          {item.damagedCount > 0 ? (
            <div className="flex items-center text-amber-600">
              <AlertTriangle className="w-4 h-4 mr-1" />
              <span>{item.damagedCount}</span>
            </div>
          ) : (
            <span className="text-green-600">0</span>
          )}
          {item.damagedCount > 0 && item.damageDescription && (
            <button
              onClick={() => toggleRowExpansion(item.id)}
              className="ml-2 p-1 rounded-full hover:bg-blue-100 text-blue-600 transition-colors"
              title="View damage description"
            >
              {expandedRows.has(item.id) ? (
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
          {item.damagedCount > 0 ? (
            <span className={item.actionType === 'replace' ? 'text-blue-600' : 'text-amber-600'}>
              {item.actionType === 'replace' ? 'Replaced' : 'Returned'}
            </span>
          ) : (
            <span className="text-green-600">Returned</span>
          )}
        </div>
      ),
      isUserDamaged: (
        <div className="text-center">
          {item.damagedCount > 0 ? (
            <span className={item.isUserDamaged ? 'text-red-600 rounded-full bg-red-100 px-3 py-1' : 'text-green-600 rounded-full bg-green-100 px-3 py-1'}>
              {item.isUserDamaged ? 'Yes' : 'No'}
            </span>
          ) : (
            <span>-</span>
          )}
        </div>
      ),
      dateReturned: <div className="text-center">{formatDate(item.dateReturned)}</div>
    });
    if (expandedRows.has(item.id) && item.damagedCount > 0 && item.damageDescription) {
      acc.push({
        id: `${item.id}-expanded`,
        isExpanded: true,
        expandedContent: (
          <div className="p-4 bg-blue-50 border-l-4 border-blue-500">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Damage Description</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {item.damageDescription}
                </p>
              </div>
            </div>
          </div>
        )
      });
    }
    return acc;
  }, []);

  const issueStatus = requestData.status;
  let statusIcon, statusText, bgColor, textColor;
  switch (issueStatus) {
    case 'accepted':
    case 'approved':
    statusIcon = <CheckCircle size={16} className="text-green-700" />;
    bgColor = 'bg-green-100';
    textColor = 'text-green-700';
    statusText = 'Accepted';
    break;
    case 'returned':
      statusIcon = <Undo size={16} className="text-blue-700" />;
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-700';
      statusText = 'Returned';
      break;
    case 'rejected':
      statusIcon = <XCircle size={16} className="text-red-700" />;
      bgColor = 'bg-red-100';
      textColor = 'text-red-700';
      statusText = 'Rejected';
      break;
    case 'closed':
      statusIcon = <AlertTriangle size={16} className="text-amber-700" />;
      bgColor = 'bg-amber-100';
      textColor = 'text-amber-700';
      statusText = 'Closed';
      break;
    case 'pending':
        statusIcon = <Clock size={16} className="text-yellow-700" />;
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-700';
        statusText = 'Pending';
        break;
        case 'reIssued':
        statusIcon = <Repeat size={16} className="text-indigo-700" />;
        bgColor = 'bg-indigo-100';
        textColor = 'text-indigo-700';
        statusText = 'Extension';
        break;    
    default:
      statusIcon = <AlertTriangle size={16} className="text-gray-700" />;
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-700';
      statusText = 'Unknown';
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
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              Issued Details
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${bgColor} ${textColor}`}>
                {statusIcon}
                <span className="text-sm font-medium">{statusText}</span>
              </span>
            </h1>
          </div>
        </div>
        {/* Main content card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Request header */}
          <div className="bg-blue-50 p-6 border-b border-blue-100">
            <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
              {/* Left Section */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-4">  
                  <h2 className="text-xl font-semibold text-blue-800">
                    Request #{requestData.id}
                  </h2>
                  {/* {requestData.isreissued && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                      <Repeat size={16} className="mr-1" />
                      Extension / Re-Issue Request
                    </span>
                  )} */}
                </div>
                <div className="w-full mt-5">
                  <RequestTimeline 
                    requestData={requestData}
                    reissue={reissue}
                    formatDate={formatDate}
                  />
                </div>
              </div>
              {/* Right Section */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-4 w-full sm:w-auto lg:w-auto shrink-0">
                {/* Request Type Box */}
          <div
  className={`flex items-center gap-3 bg-white px-5 py-3 rounded-xl shadow-sm border min-w-fit ${
    requestData.isFaculty
      ? 'border-green-200'
      : 'border-blue-200'
  }`}
>
  <div
    className={`w-3 h-3 rounded-full shrink-0 ${
      requestData.isFaculty ? 'bg-green-500' : 'bg-blue-500'
    }`}
  ></div>
  <span
    className={`text-sm font-medium whitespace-nowrap ${
      requestData.isFaculty ? 'text-green-800' : 'text-blue-800'
    }`}
  >
    {requestData.isFaculty ? 'Faculty' : 'Student'} Request
  </span>
</div>
                {/* Request Status Box */}
                <div className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-sm border min-w-fit
                  ${requestStatus === 'Done' 
                    ? 'bg-green-100 border-green-200' 
                    : 'bg-yellow-100 border-yellow-200'
                  }`}>
                  {requestStatus === 'Done' 
                    ? <CheckCircle size={16} className="text-green-700 shrink-0" />
                    : <Clock size={16} className="text-yellow-700 shrink-0" />
                  }
                  <span className={`text-sm font-medium whitespace-nowrap ${
                    requestStatus === 'Done' ? 'text-green-700' : 'text-yellow-700'
                  }`}>
                    Request {requestStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* User and Reference Information */}
<div className="p-0 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
  {/* Requester Information */}
  <div className="flex flex-col bg-white border border-blue-100 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
    <div className="flex items-center gap-3 px-6 pt-6 pb-3 border-b border-blue-100 bg-blue-50">
      <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-100 shadow-inner">
        <FileText className="w-6 h-6 text-blue-700" />
      </div>
      <div>
        <div className="text-base font-bold text-blue-900">Requester</div>
        <div className="text-xs text-blue-500 font-semibold uppercase tracking-wider">User Info</div>
      </div>
    </div>
    <div className="flex-1 px-6 py-6 space-y-4 text-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-gray-500 w-24">Name:</span>
          <span className="font-semibold text-blue-900">{requestData.name}</span>
        </div>
        <button
          className="ml-4 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-xs font-semibold"
          onClick={() => router.push(`/admin/profile?rollNo=${requestData.rollNo}`)}
        >
          View Profile
        </button>
      </div>
      <div className="flex">
        <span className="text-gray-500 w-24">Email:</span>
        <span className="font-semibold text-blue-900">{requestData.email}</span>
      </div>
      <div className="flex">
        <span className="text-gray-500 w-24">Roll Number:</span>
        <span className="font-semibold text-blue-900">{requestData.rollNo}</span>
      </div>
      <div className="flex">
        <span className="text-gray-500 w-24">Phone Number:</span>
        <span className="font-semibold text-blue-900">{requestData.phoneNo || 'N/A'}</span>
      </div>
    </div>
  </div>

  {/* Request Description */}
  <div className="flex flex-col bg-white border border-indigo-100 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
    <div className="flex items-center gap-3 px-6 pt-6 pb-3 border-b border-indigo-100 bg-indigo-50">
      <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-indigo-100 shadow-inner">
        <Info className="w-6 h-6 text-indigo-700" />
      </div>
      <div>
        <div className="text-base font-bold text-indigo-900">Request Details</div>
        <div className="text-xs text-indigo-500 font-semibold uppercase tracking-wider">Description</div>
      </div>
    </div>
    <div className="flex-1 px-6 py-6 space-y-4 text-sm">
      <div>
        <h4 className="font-semibold text-indigo-700 mb-1">User Note</h4>
        <p className="text-gray-700">{requestData.description || "No description provided."}</p>
      </div>
      <div>
        <h4 className="font-semibold text-indigo-700 mb-1">Admin Note</h4>
        <p className="text-gray-700">{requestData.admindescription || "No description available"}</p>
      </div>
    </div>
  </div>

  {/* Reference Staff */}
  <div className="flex flex-col bg-white border border-yellow-100 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
    <div className="flex items-center gap-3 px-6 pt-6 pb-3 border-b border-yellow-100 bg-yellow-50">
      <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-yellow-100 shadow-inner">
        <Repeat className="w-6 h-6 text-yellow-700" />
      </div>
      <div>
        <div className="text-base font-bold text-yellow-700">Reference Staff</div>
        <div className="text-xs text-yellow-600 font-semibold uppercase tracking-wider">Staff Info</div>
      </div>
    </div>
    <div className="flex-1 px-6 py-6 space-y-4 text-sm">
      {requestData.isFaculty ? (
        <div className="text-gray-400 italic">No reference staff (user is a faculty member)</div>
      ) : (
        <>
          <div className="flex">
            <span className="text-gray-500 w-20">Name:</span>
            <span className="font-semibold text-yellow-900">{requestData.referenceStaff.name}</span>
          </div>
          <div className="flex">
            <span className="text-gray-500 w-20">Email:</span>
            <span className="font-semibold text-yellow-900">{requestData.referenceStaff.email}</span>
          </div>
        </>
      )}
    </div>
  </div>
</div>
{(requestData.status === 'accepted' || requestData.status === 'approved' || requestData.status === 'returned' || requestData.status === 'reIssued') && (
  <div className="mx-6 bg-blue-50 p-4 rounded-lg border border-blue-100 flex flex-col md:flex-row md:items-center gap-4">
    {/* Allocated Days */}
    <div className="flex items-center gap-2">
      <Clock className="w-5 h-5 text-blue-600" />
      <span className="text-gray-700 font-medium">Allocated:</span>
      <span className="font-semibold">
        {(() => {
          const main = Number(requestData.adminApprovedDays || requestData.requestedDays) || 0;
          const reissue =
            requestData.reIssueRequest &&
            (requestData.reIssueRequest.status === "approved" || requestData.reIssueRequest.status === "accepted")
              ? Number(requestData.reIssueRequest.adminApprovedDays) || 0
              : 0;
          return reissue > 0
            ? `${main} + ${reissue} Days`
            : `${main} Days`;
        })()}
      </span>
    </div>


{/* If issued, show Return Date and Delay/Time Left */}
{requestData.issueDate && (
  <>
    {/* Return Date */}
    <div className="flex items-center gap-2">
      <CalendarDays className="w-5 h-5 text-indigo-600" />
      <span className="text-gray-700 font-medium">Return Date:</span>
      <span className="font-semibold">
        {(() => {
          // Always show the expected return date (from calculation)
          const baseDate = requestData.collectedDate || requestData.issueDate;
          if (!baseDate) return "N/A";
          const mainDays = Number(requestData.adminApprovedDays || requestData.requestedDays) || 0;
          const reIssueDays =
            requestData.reIssueRequest &&
            (requestData.reIssueRequest.status === "approved" || requestData.reIssueRequest.status === "accepted")
              ? Number(requestData.reIssueRequest.adminApprovedDays) || 0
              : 0;
          const date = new Date(baseDate);
          date.setDate(date.getDate() + mainDays + reIssueDays);
          const pad = n => n.toString().padStart(2, '0');
          return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${pad(date.getFullYear())}`;
        })()}
      </span>
    </div>

    {/* Delay or Time Left */}
    {(() => {
      const baseDate = requestData.collectedDate || requestData.issueDate;
      if (!baseDate) return null;
      const mainDays = Number(requestData.adminApprovedDays || requestData.requestedDays) || 0;
      const reIssueDays =
        requestData.reIssueRequest &&
        (requestData.reIssueRequest.status === "approved" || requestData.reIssueRequest.status === "accepted")
          ? Number(requestData.reIssueRequest.adminApprovedDays) || 0
          : 0;
      const expectedReturnDate = new Date(baseDate);
      expectedReturnDate.setDate(expectedReturnDate.getDate() + mainDays + reIssueDays);

      // If returned, show only Delay (compare AllReturnedDate with expectedReturnDate)
      if (requestData.status === 'returned' && requestData.allReturnedDate) {
        const allReturnedDate = new Date(requestData.allReturnedDate);
        // Zero out the time for both dates to compare only the date part
        expectedReturnDate.setHours(0,0,0,0);
        allReturnedDate.setHours(0,0,0,0);
        const msPerDay = 1000 * 60 * 60 * 24;
        const delayDays = Math.floor((allReturnedDate - expectedReturnDate) / msPerDay);
        return (
          <div className="flex items-center gap-2">
            <Clock className={`w-5 h-5 ${delayDays > 0 ? 'text-red-600' : 'text-green-600'}`} />
            <span className="text-gray-700 font-medium">Delay:</span>
            <span className="font-semibold">
              {delayDays > 0
                ? `${delayDays} Day${delayDays > 1 ? 's' : ''}`
                : 'No Delay'}
            </span>
          </div>
        );
      }

      // If not returned, show Time Left or Delay as before
      if (requestData.status !== 'returned') {
        const now = new Date();
        const diffDays = Math.ceil((expectedReturnDate - now) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0) {
          return (
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-green-600" />
              <span className="text-gray-700 font-medium">Time Left:</span>
              <span className="font-semibold">{`${diffDays} Day${diffDays > 1 ? 's' : ''}`}</span>
            </div>
          );
        } else {
          const delayDays = Math.abs(diffDays);
          return (
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-red-600" />
              <span className="text-gray-700 font-medium">Delay:</span>
              <span className="font-semibold">
                {delayDays > 0
                  ? `${delayDays} Day${delayDays > 1 ? 's' : ''}`
                  : 'No Delay'}
              </span>
            </div>
          );
        }
      }

      return null;
    })()}
  </>
)}
  </div>
)}


          {/* Components Tables Section */}
          <div className="p-6">
            <div className={`grid ${isLargeScreen ? 'grid-cols-2 gap-6' : 'grid-cols-1 gap-8'} mb-8`}>
              {/* Requested Components Table - Always shown */}
              <div className="bg-white shadow rounded-lg">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-700 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      Requested Components
                    </h2>
                    <div className="mb-2">
                      <div className="flex gap-4">
                        <div className="flex items-center">
                          <CalendarDays className="w-5 h-5 mr-2 text-blue-600" />
                          <h4 className="font-medium text-gray-700">Requested Days</h4>
                        </div>
                        <div className="flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{requestData.requestedDays || "N/A"} Days</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Table 
                    columns={requestedComponentsColumns} 
                    rows={requestedComponentsRows.slice(
                      (requestedPage - 1) * itemsPerPage,
                      requestedPage * itemsPerPage
                    )}                     
                    currentPage={requestedPage} 
                    itemsPerPage={itemsPerPage}
                  />
                  {requestedComponentsRows.length > 0 && (
                    <Pagination 
                      currentPage={requestedPage}
                      totalPages={Math.ceil(requestedComponentsRows.length / itemsPerPage)}
                      setCurrentPage={setRequestedPage}
                    />
                  )}                  
                </div>
              </div>
              {/* Admin Issue Components Table - Show for accepted, returned, and closed status */}
              {(requestData.status === 'accepted' || requestData.status === 'approved' || requestData.status === 'returned' || requestData.status === 'closed' ||  requestData.status === 'reIssued') && (
                <div className="bg-white shadow rounded-lg">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold text-gray-700 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Admin Issued Components
                      </h2>
                      <div className="mb-2">
                        <div className="flex gap-4">
                          <div className="flex items-center">
                            <CalendarDays className="w-5 h-5 mr-2 text-blue-600" />
                            <h4 className="font-medium text-gray-700">Issued Days</h4>
                          </div>
                          <div className="flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>{requestData.adminApprovedDays || "N/A"} Days</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Table 
                      columns={adminComponentsColumns} 
                      rows={adminComponentsRows.slice(
                        (adminPage - 1) * itemsPerPage,
                        adminPage * itemsPerPage
                      )}  
                      currentPage={adminPage} 
                      itemsPerPage={itemsPerPage}
                    />
                    {adminComponentsRows.length > 0 && (
                      <Pagination 
                        currentPage={adminPage}
                        totalPages={Math.ceil(adminComponentsRows.length / itemsPerPage)}
                        setCurrentPage={setAdminPage}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
            {/* Status Messages for Rejected and Closed */}
            {(requestData.status === 'rejected' || requestData.status === 'closed') && (
              <div className={`mb-8 p-6 rounded-lg border ${
                requestData.status === 'rejected' 
                  ? 'bg-red-50 border-red-200' 
                  : 'bg-amber-50 border-amber-500'
              }`}>
                <div className="flex items-center">
                  {requestData.status === 'rejected' ? (
                    <>
                      <svg className="w-6 h-6 mr-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                      <div>
                        <h3 className="text-lg font-semibold text-red-800">Request Rejected</h3>
                        <p className="text-red-700 mt-1">This component request has been rejected by the Lab Incharge.</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6 mr-3 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                      </svg>
                      <div>
                        <h3 className="text-lg font-semibold text-amber-800">Request Closed</h3>
                        <p className="text-amber-700 mt-1">This component request has been closed and is no longer active.</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}


            
            {/* Re-requested Components Tables Section - Only show for accepted and returned */}
{(requestData.status === 'accepted' || requestData.status === 'approved' || requestData.status === 'returned' || requestData.status === 'reIssued') && requestData.isreissued && (
  <div className="w-full my-10 px-0 md:px-4">
    <div className="relative w-full rounded-lg shadow-lg border-0 bg-gradient-to-r from-yellow-50 via-white to-yellow-100 flex flex-col md:flex-row items-stretch overflow-hidden">
      {/* Ribbon */}
      <div className="absolute left-0 top-0 bg-yellow-400 text-white px-6 py-1 rounded-br-lg font-bold text-xs tracking-widest z-10 shadow">
        RE-ISSUE
      </div>
      {/* Left: Admin Message */}
      <div className="flex-1 flex flex-col justify-center p-8 border-r-0 md:border-r-2 border-yellow-200 bg-gradient-to-br from-green-50 to-white min-h-[180px]">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="font-semibold text-green-700 text-base">Admin Message</span>
        </div>
        <div className="text-green-900 text-base bg-green-50 border border-green-100 rounded-lg p-4 min-h-[48px]">
          {requestData.reIssueRequest.adminReturnMessage || <span className="text-gray-400">No message from admin.</span>}
        </div>

               <div className="flex items-center gap-2 mt-4">
          <Repeat className="w-5 h-5 text-yellow-600" />
          <span className="text-yellow-700 text-sm font-semibold">Status:</span>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm ${
            requestData.reIssueRequest.status === 'approved' || requestData.reIssueRequest.status === 'accepted'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {requestData.reIssueRequest.status.charAt(0).toUpperCase() + requestData.reIssueRequest.status.slice(1)}
          </span>
          {requestData.reIssueRequest.status === 'approved' && (
            <span className="flex items-center gap-1 ml-2 text-green-700 text-xs font-semibold">
              <CheckCircle className="w-4 h-4" />
              {requestData.reIssueRequest.adminApprovedDays || "N/A"} Days Approved
            </span>
          )}
        </div>

     
      </div>
      {/* Right: Details */}
      <div className="flex-1 flex flex-col justify-center p-8 bg-gradient-to-br from-blue-50 to-white min-h-[180px]">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-5 h-5 text-blue-600" />
          <span className="font-semibold text-blue-700 text-base">User Note / Reason</span>
        </div>
        <div className="text-blue-900 text-base bg-blue-50 border border-blue-100 rounded-lg p-4 min-h-[48px]">
          {requestData.reIssueRequest.requestDescription || <span className="text-gray-400">No message provided.</span>}
        </div>
 
   <div className="flex items-center gap-2 mt-4">
          <CalendarDays className="w-4 h-4 text-blue-600" />
          <span className="text-gray-700 text-sm">Requested Days:</span>
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
            {requestData.reIssueRequest.extensionDays || requestData.reIssueRequest.requestedDays || "N/A"} Days
          </span>
        </div>


      </div>
    </div>
  </div>
)}


            {/* Return Tracking Table - Only show for accepted and returned */}
            {(requestData.status === 'accepted'  || requestData.status === 'approved'  || requestData.status === 'returned' ||  requestData.status === 'reIssued') &&
  returnTrackingComponents.some(component => component.remaining > 0) && (
    <div className="bg-white shadow rounded-lg mb-8">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
          <RefreshCw className="w-5 h-5 mr-2 text-amber-600" />
          Component Return Tracking
        </h2>
        <Table 
          columns={returnTrackingColumns} 
          rows={returnTrackingRows} 
          currentPage={returnTrackingPage} 
          itemsPerPage={itemsPerPage}
          setCurrentPage={setReturnTrackingPage}
        />
      </div>
    </div>
)}
            {/* Return History Table - Only show for accepted and returned */}
            {(requestData.status === 'accepted'  || requestData.status === 'approved' || requestData.status === 'returned' || requestData.status === 'reIssued') && (
              <div className="bg-white shadow rounded-lg">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                    Return History
                  </h2>
                  {returnHistory.length > 0 ? (
                    <>
                      <Table 
                        columns={returnHistoryColumns} 
                        rows={returnHistoryRows.slice(
                          (returnHistoryPage - 1) * itemsPerPage,
                          returnHistoryPage * itemsPerPage
                        )}
                        currentPage={returnHistoryPage} 
                        itemsPerPage={itemsPerPage}
                      />
                      {returnHistoryRows.length > 0 && (
                        <Pagination 
                          currentPage={returnHistoryPage}
                          totalPages={Math.ceil(returnHistoryRows.length / itemsPerPage)}
                          setCurrentPage={setReturnHistoryPage}
                        />
                      )}
                    </>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      No return history available yet
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Damage Report Modal */}
      {showDamageModal && selectedComponentIndex !== null && (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300">
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md transform scale-100 animate-fadeIn">
          <h3 className="text-2xl font-bold mb-5 text-gray-800 flex items-center">
            <AlertTriangle className="w-6 h-6 mr-2 text-amber-600" />
            Report Damaged Component
          </h3>
          <div className="space-y-5">
            {/* Component Name */}
            <div>
              <label className="block text-s font-medium text-gray-700 mb-1">Component Name</label>
              <div className="px-3 py-2 bg-gray-100 rounded-md text-gray-800 text-sm">
                {returnTrackingComponents[selectedComponentIndex].name}
              </div>
            </div>
            {/* User Damaged Quantity */}
            <div>
              <label className="block text-s font-medium text-gray-700 mb-1">User Damaged Quantity</label>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={decrementUserDamagedCount}
                  disabled={userDamagedCount <= 0}
                  className={`p-2 rounded-md border ${userDamagedCount <= 0 
                    ? 'text-gray-300 border-gray-200' 
                    : 'text-blue-600 hover:bg-blue-100 border-blue-300'}`}
                >
                  <Minus size={16} />
                </button>
                <input
                  type="number"
                  min="0"
                  max={returnTrackingComponents[selectedComponentIndex].returned - notUserDamagedCount}
                  value={userDamagedCount}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    const max = returnTrackingComponents[selectedComponentIndex].returned - notUserDamagedCount;
                    setUserDamagedCount(Math.min(val, max));
                    if (replacingCount > val + notUserDamagedCount) {
                      setReplacingCount(val + notUserDamagedCount);
                    }
                  }}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-md text-center"
                />
                <button 
                  onClick={incrementUserDamagedCount}
                  disabled={userDamagedCount + notUserDamagedCount >= returnTrackingComponents[selectedComponentIndex].returned}
                  className={`p-2 rounded-md border ${userDamagedCount + notUserDamagedCount >= returnTrackingComponents[selectedComponentIndex].returned 
                    ? 'text-gray-300 border-gray-200' 
                    : 'text-blue-600 hover:bg-blue-100 border-blue-300'}`}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
            {/* Not User Damaged Quantity */}
            <div>
              <label className="block text-s font-medium text-gray-700 mb-1">Not User Damaged Quantity</label>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={decrementNotUserDamagedCount}
                  disabled={notUserDamagedCount <= 0}
                  className={`p-2 rounded-md border ${notUserDamagedCount <= 0 
                    ? 'text-gray-300 border-gray-200' 
                    : 'text-blue-600 hover:bg-blue-100 border-blue-300'}`}
                >
                  <Minus size={16} />
                </button>
                <input
                  type="number"
                  min="0"
                  max={returnTrackingComponents[selectedComponentIndex].returned - userDamagedCount}
                  value={notUserDamagedCount}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    const max = returnTrackingComponents[selectedComponentIndex].returned - userDamagedCount;
                    setNotUserDamagedCount(Math.min(val, max));
                    if (replacingCount > val + userDamagedCount) {
                      setReplacingCount(val + userDamagedCount);
                    }
                  }}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-md text-center"
                />
                <button 
                  onClick={incrementNotUserDamagedCount}
                  disabled={userDamagedCount + notUserDamagedCount >= returnTrackingComponents[selectedComponentIndex].returned}
                  className={`p-2 rounded-md border ${userDamagedCount + notUserDamagedCount >= returnTrackingComponents[selectedComponentIndex].returned 
                    ? 'text-gray-300 border-gray-200' 
                    : 'text-blue-600 hover:bg-blue-100 border-blue-300'}`}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
            {/* Replacing Quantity */}
            <div>
              <label className="block text-s font-medium text-gray-700 mb-1">Replacing Quantity</label>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={decrementReplacingCount}
                  disabled={replacingCount <= 0}
                  className={`p-2 rounded-md border ${replacingCount <= 0 
                    ? 'text-gray-300 border-gray-200' 
                    : 'text-blue-600 hover:bg-blue-100 border-blue-300'}`}
                >
                  <Minus size={16} />
                </button>
                <input
                  type="number"
                  min="0"
                  max={userDamagedCount + notUserDamagedCount}
                  value={replacingCount}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    const max = userDamagedCount + notUserDamagedCount;
                    setReplacingCount(Math.min(val, max));
                  }}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-md text-center"
                />
                <button 
                  onClick={incrementReplacingCount}
                  disabled={replacingCount >= userDamagedCount + notUserDamagedCount}
                  className={`p-2 rounded-md border ${replacingCount >= userDamagedCount + notUserDamagedCount 
                    ? 'text-gray-300 border-gray-200' 
                    : 'text-blue-600 hover:bg-blue-100 border-blue-300'}`}
                >
                  <Plus size={16} />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Cannot exceed total damaged quantity ({userDamagedCount + notUserDamagedCount})
              </p>
            </div>
            {/* Damage Description */}
            <div>
              <label className="block text-s font-medium text-gray-700 mb-1">Damage Description</label>
              <textarea
                value={damageDescription}
                onChange={(e) => setDamageDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
                rows="3"
                placeholder="Describe the damage..."
                required
              ></textarea>
            </div>    
          </div>
          {/* Modal Buttons */}
          <div className="flex justify-end mt-8 space-x-3">
            <button
              onClick={() => setShowDamageModal(false)}
              className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleDamageModalSubmit}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition flex items-center gap:2 shadow-sm"
            >
              <Check size={20} />
              Confirm
            </button>
          </div>
        </div>
      </div>
      )}
      {showSuccess && (
        <SuccessAlert
          message="Component returned successfully!"
          description="The return has been recorded."
          onClose={() => setShowSuccess(false)}
        />
      )}
    </div>
  );
};

export default function AdminRetrunView() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <AdminRetrunViewContent />
    </Suspense>
  );
}