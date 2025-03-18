import { useState } from 'react';
import { 
  CreditCard, 
  Loader2, 
  CheckCircle, 
  AlertCircle ,
  X,
  User,
  Calendar,
  Lock
} from 'lucide-react';

const PaymentModal = ({ paymentData, onClose }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvc, setCvc] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState(null);
  const [cardType, setCardType] = useState(null);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  const company_id = localStorage.getItem("user_id"); // Fetch company_id

  const detectCardType = (cardNumber) => {
    const patterns = {
      visa: /^4/,
      mastercard: /^5[1-5]/,
      amex: /^3[47]/,
      discover: /^6(?:011|5)/,
    };
    
    const cleanNumber = cardNumber.replace(/\s+/g, '');
    
    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(cleanNumber)) {
        return type;
      }
    }
    
    return null;
  };

  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, '');
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ').slice(0, 19);
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
    setCardType(detectCardType(formatted));
  };

  const handleCVCFocus = () => setIsCardFlipped(true);
  const handleCVCBlur = () => setIsCardFlipped(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsProcessing(true);

    if (!cardNumber || !cardholderName || !expiryMonth || !expiryYear || !cvc) {
      setError('Please fill in all card details');
      setIsProcessing(false);
      return;
    }
    
    const cardNumberClean = cardNumber.replace(/\s/g, '');

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const response = await fetch('http://localhost:5000/jobs/completion-payment/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          paymentIntentId: paymentData.paymentIntentId,
          jobId: paymentData.jobId,
          cardNumber: cardNumberClean,
          expiryMonth,
          expiryYear,
          cvc,
          cardholderName,
          company_id // Include company_id in the request
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Payment processing failed');
      }
      
      setIsComplete(true);

      setTimeout(() => {
        if (data.redirectUrl) {
          window.location.href = data.redirectUrl;
        } else {
          onClose();
          window.location.reload();
        }
      }, 2000);
      
    } catch (err) {
      setError(err.message || 'Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };


  // Card brand logo component
  const CardLogo = ({ type }) => {
    if (!type) return <CreditCard className="w-6 h-6 text-gray-400" />;
    
    switch(type) {
      case 'visa':
        return <div className="text-blue-600 font-bold italic text-xl">VISA</div>;
      case 'mastercard':
        return <div className="text-orange-600 font-bold text-xl">Mastercard</div>;
      case 'amex':
        return <div className="text-blue-700 font-bold text-xl">AmEx</div>;
      case 'discover':
        return <div className="text-orange-500 font-bold text-xl">Discover</div>;
      default:
        return <CreditCard className="w-6 h-6 text-gray-400" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-auto overflow-hidden transform transition-all h-[600px] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white relative overflow-hidden flex-shrink-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2 blur-lg"></div>
          
          <div className="flex items-center justify-between mb-4 relative">
            <div className="flex items-center">
              <button 
                onClick={onClose} 
                className="mr-3 bg-white/20 rounded-full p-1.5 hover:bg-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-semibold">Complete Payment</h2>
            </div>
          </div>
          
          <div className="mt-2 relative">
            <div className="text-sm text-blue-100">Payment for:</div>
            <div className="font-medium">{paymentData.description}</div>
            <div className="mt-2 text-3xl font-bold">${paymentData.amount.toFixed(2)}</div>
          </div>
        </div>

        {/* Scrollable content area */}
        <div className="flex-grow overflow-y-auto">
          {/* Virtual Credit Card (only show when card number is entered) */}
          {cardNumber && (
            <div className="px-6 pt-6">
              <div className={`h-44 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-lg p-5 relative overflow-hidden transition-all duration-500 transform ${isCardFlipped ? 'rotate-y-180' : ''}`}>
                {/* Front of card */}
                <div className={`absolute inset-0 p-5 flex flex-col justify-between transition-opacity duration-500 ${isCardFlipped ? 'opacity-0' : 'opacity-100'}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-6 bg-yellow-400 rounded opacity-70"></div>
                      <div className="w-6 h-6 rounded-full bg-red-500 opacity-80"></div>
                    </div>
                    <CardLogo type={cardType} />
                  </div>
                  
                  <div className="mt-2">
                    <div className="text-gray-300 text-sm mb-1">Card Number</div>
                    <div className="text-white tracking-wider text-lg font-mono">
                      {cardNumber || '•••• •••• •••• ••••'}
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <div>
                      <div className="text-gray-300 text-xs">Card Holder</div>
                      <div className="text-white font-medium truncate max-w-[150px]">
                        {cardholderName || 'YOUR NAME'}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-gray-300 text-xs">Expires</div>
                      <div className="text-white font-medium">
                        {expiryMonth || 'MM'}/{expiryYear || 'YY'}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Back of card */}
                <div className={`absolute inset-0 flex flex-col justify-center transition-opacity duration-500 ${isCardFlipped ? 'opacity-100' : 'opacity-0'}`}>
                  <div className="w-full h-8 bg-gray-600 mb-4"></div>
                  <div className="flex items-center px-4">
                    <div className="w-3/4 h-8 bg-gray-300"></div>
                    <div className="ml-2 bg-white rounded px-2 py-1 text-gray-800 font-mono">
                      {cvc || 'CVC'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            {isComplete ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="bg-green-100 rounded-full p-3 mb-4 animate-bounce">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-green-700 mb-2">Payment Successful!</h3>
                <p className="text-gray-600 text-center">
                  The job has been marked as completed and payment has been processed. You will be redirected shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r text-red-800 flex items-start animate-shake">
                    <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}
                
                <div className="space-y-6">
                  <div className="flex items-center border-b border-gray-200 pb-4 mb-2">
                    <CreditCard className="w-5 h-5 text-indigo-500 mr-2" />
                    <span className="font-medium text-gray-700">Card Information</span>
                  </div>
                  
                  {/* Card number */}
                  <div className="group">
                    <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-blue-600 transition-colors">
                      Card Number
                    </label>
                    <div className="relative">
                      <input
                        id="cardNumber"
                        type="text"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="1234 5678 9012 3456"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        maxLength="19"
                      />
                      <CreditCard className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      {cardType && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <CardLogo type={cardType} />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Cardholder name */}
                  <div className="group">
                    <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-blue-600 transition-colors">
                      Cardholder Name
                    </label>
                    <div className="relative">
                      <input
                        id="cardholderName"
                        type="text"
                        value={cardholderName}
                        onChange={(e) => setCardholderName(e.target.value)}
                        placeholder="John Smith"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      />
                      <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    </div>
                  </div>
                  
                  {/* Expiry and CVC */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="group">
                      <label htmlFor="expiry" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-blue-600 transition-colors">
                        Expiry Date
                      </label>
                      <div className="relative">
                        <div className="grid grid-cols-2 gap-2">
                          <select
                            value={expiryMonth}
                            onChange={(e) => setExpiryMonth(e.target.value)}
                            className="pl-8 pr-2 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none"
                          >
                            <option value="">MM</option>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                              <option key={month} value={month.toString().padStart(2, '0')}>
                                {month.toString().padStart(2, '0')}
                              </option>
                            ))}
                          </select>
                          
                          <select
                            value={expiryYear}
                            onChange={(e) => setExpiryYear(e.target.value)}
                            className="pl-2 pr-2 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none"
                          >
                            <option value="">YY</option>
                            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                              <option key={year} value={year.toString().slice(-2)}>
                                {year.toString().slice(-2)}
                              </option>
                            ))}
                          </select>
                        </div>
                        <Calendar className="w-5 h-5 text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                    
                    <div className="group">
                      <label htmlFor="cvc" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-blue-600 transition-colors">
                        CVC
                      </label>
                      <input
                        id="cvc"
                        type="text"
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        onFocus={handleCVCFocus}
                        onBlur={handleCVCBlur}
                        placeholder="123"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        maxLength="4"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className={`w-full py-3.5 px-4 rounded-lg text-white font-medium transition-all transform hover:scale-[1.01] active:scale-[0.99] ${
                      isProcessing 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg hover:from-blue-700 hover:to-indigo-700'
                    } flex justify-center items-center`}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Processing payment...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Pay ${paymentData.amount.toFixed(2)}
                      </>
                    )}
                  </button>
                </div>
                
                <div className="mt-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className="flex-grow h-px bg-gray-200"></div>
                    <span className="px-3 text-xs text-gray-500 font-medium">SECURE PAYMENT</span>
                    <div className="flex-grow h-px bg-gray-200"></div>
                  </div>
                  
                  <div className="flex items-center justify-center gap-4">
                    <div className="flex items-center justify-center text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                      <Lock className="w-3 h-3 mr-1 text-gray-400" />
                      <span>256-bit encryption</span>
                    </div>
                    
                    <div className="flex items-center justify-center text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                      <CheckCircle className="w-3 h-3 mr-1 text-gray-400" />
                      <span>Secure checkout</span>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;