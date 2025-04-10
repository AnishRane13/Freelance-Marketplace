import { useState } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';
import PaymentModal from './PaymentModal';

const JobCompletionButton = ({ jobId, userId }) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const company_id = userId || localStorage.getItem("user_id");
  
  const handleMarkAsCompleted = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:5000/jobs/${jobId}/completion-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          company_id
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate payment');
      }
      
      setPaymentData(data);
      setShowPaymentModal(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 text-red-700">
          <p>{error}</p>
        </div>
      )}
      
      <button 
        onClick={handleMarkAsCompleted}
        disabled={isLoading}
        className={`w-full flex items-center justify-center px-4 py-3 rounded-lg text-white transition-colors ${
          isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CheckCircle className="w-5 h-5 mr-2" />
            Mark Job as Completed & Process Payment
          </>
        )}
      </button>
      
      {showPaymentModal && paymentData && (
        <PaymentModal 
          paymentData={paymentData}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </>
  );
};

export default JobCompletionButton;