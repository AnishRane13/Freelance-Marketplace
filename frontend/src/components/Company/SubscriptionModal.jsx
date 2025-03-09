import { useState, useEffect } from 'react';
import { X, Loader2, Check, AlertCircle, CreditCard, Calendar, Gift } from 'lucide-react';
import PaymentCheckout from './PaymentCheckout';

const SubscriptionModal = ({ isOpen, onClose, onSubscriptionPurchased, companyId }) => {
  const [plans, setPlans] = useState({});
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);

  // Load subscription plans when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchSubscriptionPlans();
    }
  }, [isOpen]);

  const fetchSubscriptionPlans = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/subscription/plans');
      const data = await response.json();
      if (response.ok) {
        setPlans(data);
      } else {
        setError('Failed to fetch subscription plans');
      }
    } catch (error) {
      setError('Error loading subscription plans');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlanSelect = (planKey) => {
    setSelectedPlan(planKey);
  };

  const handleProceedToCheckout = async () => {
    if (!selectedPlan) {
      setError('Please select a subscription plan');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create payment intent through your backend
      const response = await fetch('http://localhost:5000/subscription/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          user_id: companyId,
          planType: selectedPlan
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment');
      }

      const data = await response.json();
      setPaymentIntent(data);
      setShowCheckout(true);
      
    } catch (error) {
      setError(error.message || 'Error initializing payment');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentResult) => {
    // Call the parent component's callback
    if (onSubscriptionPurchased) {
      onSubscriptionPurchased(paymentResult);
    }
    // Close the modal
    handleClose();
  };

  const handleBackToPlans = () => {
    setShowCheckout(false);
    setPaymentIntent(null);
  };

  // Handle close with explicit function
  const handleClose = () => {
    // Reset state for next time
    setShowCheckout(false);
    setPaymentIntent(null);
    setSelectedPlan(null);
    
    // Ensure we call the onClose prop
    if (onClose && typeof onClose === 'function') {
      onClose();
    }
  };

  const getBestValuePlan = () => {
    if (!plans || Object.keys(plans).length === 0) return null;
    
    // Simple logic - the plan with the best jobs per dollar ratio
    let bestValuePlan = null;
    let bestRatio = 0;
    
    Object.entries(plans).forEach(([key, plan]) => {
      const ratio = plan.jobLimit / plan.amount;
      if (ratio > bestRatio) {
        bestRatio = ratio;
        bestValuePlan = key;
      }
    });
    
    return bestValuePlan;
  };

  const bestValuePlan = getBestValuePlan();

  // Don't render anything if modal is closed
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {!showCheckout ? (
          <>
            {/* Glass effect header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white relative">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Premium Subscription</h2>
                  <p className="text-blue-100 mt-1">Unlock your full potential with our premium plans</p>
                </div>
                <button
                  onClick={handleClose}
                  className="bg-white bg-opacity-20 rounded-full p-2 hover:bg-opacity-30 transition-all z-10"
                  type="button"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Abstract shapes for design flair */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/4"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-5 rounded-full translate-y-1/2 -translate-x-1/4"></div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {isLoading ? (
                <div className="flex flex-col justify-center items-center py-16">
                  <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
                  <p className="text-gray-500">Loading subscription options...</p>
                </div>
              ) : error ? (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg text-red-700">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                    <p>{error}</p>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-gray-600 mb-8 text-center max-w-2xl mx-auto">
                    Choose the perfect plan to showcase your opportunities and connect with top talent. Our flexible options are designed to fit your recruiting needs.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {Object.entries(plans).map(([key, plan]) => (
                      <div
                        key={key}
                        className={`relative rounded-xl overflow-hidden transition-all duration-300 transform ${
                          selectedPlan === key ? 'scale-102 shadow-xl' : 'shadow-md hover:shadow-lg'
                        }`}
                      >
                        {/* Conditional "Best Value" badge */}
                        {key === bestValuePlan && (
                          <div className="absolute top-0 right-0 bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10 shadow-md">
                            BEST VALUE
                          </div>
                        )}
                        
                        <div 
                          className={`cursor-pointer h-full flex flex-col ${
                            selectedPlan === key
                              ? 'border-2 border-blue-500'
                              : 'border border-gray-200 hover:border-blue-300'
                          }`}
                          onClick={() => handlePlanSelect(key)}
                        >
                          {/* Plan header */}
                          <div className={`p-5 ${
                            selectedPlan === key 
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                              : 'bg-gray-50'
                          }`}>
                            <div className="flex justify-between items-start mb-2">
                              <h3 className={`font-bold text-xl ${selectedPlan === key ? 'text-white' : 'text-blue-800'}`}>
                                {key.charAt(0).toUpperCase() + key.slice(1).toLowerCase()}
                              </h3>
                              {selectedPlan === key && (
                                <div className="bg-white text-blue-600 p-1 rounded-full">
                                  <Check className="w-4 h-4" />
                                </div>
                              )}
                            </div>
                            <div className="mb-2">
                              <span className={`text-3xl font-bold ${selectedPlan === key ? 'text-white' : 'text-blue-600'}`}>
                                ₹{plan.amount}
                              </span>
                              <span className={`text-sm ml-1 ${selectedPlan === key ? 'text-blue-100' : 'text-gray-500'}`}>
                                / {plan.duration} days
                              </span>
                            </div>
                          </div>
                          
                          {/* Plan features */}
                          <div className="p-5 bg-white flex-grow">
                            <ul className="space-y-3">
                              <li className="flex items-center text-gray-700">
                                <div className="bg-blue-100 p-1.5 rounded-full mr-3">
                                  <CreditCard className="w-4 h-4 text-blue-600" />
                                </div>
                                <span><span className="font-semibold">{plan.jobLimit}</span> Job Postings</span>
                              </li>
                              <li className="flex items-center text-gray-700">
                                <div className="bg-blue-100 p-1.5 rounded-full mr-3">
                                  <Calendar className="w-4 h-4 text-blue-600" />
                                </div>
                                <span><span className="font-semibold">{plan.duration}</span> Days Access</span>
                              </li>
                              <li className="flex items-center text-gray-700">
                                <div className="bg-blue-100 p-1.5 rounded-full mr-3">
                                  <Gift className="w-4 h-4 text-blue-600" />
                                </div>
                                <span>Premium Support</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-4">
                    <button
                      onClick={handleClose}
                      className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      disabled={isLoading}
                      type="button"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleProceedToCheckout}
                      disabled={!selectedPlan || isLoading}
                      className={`px-8 py-3 rounded-lg text-white shadow-lg transition-all ${
                        !selectedPlan || isLoading
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                      } disabled:opacity-70 flex items-center justify-center`}
                      type="button"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin mr-2" />
                          Processing...
                        </>
                      ) : (
                        'Proceed to Checkout'
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          <PaymentCheckout
            paymentIntentId={paymentIntent.paymentIntentId}
            amount={paymentIntent.amount}
            description={paymentIntent.description}
            onSuccess={handlePaymentSuccess}
            onCancel={handleBackToPlans}
          />
        )}
      </div>
    </div>
  );
};

export default SubscriptionModal;