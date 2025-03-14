import { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, FileText, Send, AlertCircle } from 'lucide-react';

const QuoteModal = ({ jobId, jobTitle, onClose, onSuccess, addNotification }) => {
  const [quotePrice, setQuotePrice] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    quotePrice: '',
    coverLetter: ''
  });
  const userId = localStorage.getItem("user_id");

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!quotePrice || isNaN(Number(quotePrice)) || Number(quotePrice) <= 0) {
      errors.quotePrice = 'Please enter a valid quote price';
      isValid = false;
    }

    if (!coverLetter.trim()) {
      errors.coverLetter = 'Cover letter is required';
      isValid = false;
    } else if (coverLetter.trim().length < 30) {
      errors.coverLetter = 'Cover letter is too short (minimum 30 characters)';
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      const response = await fetch(`http://localhost:5000/quotes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          jobId: jobId,
          quote_price: Number(quotePrice),
          cover_letter: coverLetter
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit quote');
      }

      // Show success notification
      addNotification({
        type: 'success',
        message: 'Your quote was submitted successfully!'
      });
      
      onSuccess();
    } catch (err) {
      console.error('Error submitting quote:', err);
      
      // Show error notification
      addNotification({
        type: 'error',
        message: err.message || 'An error occurred while submitting your quote'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="flex items-center justify-center min-h-screen p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 bg-blue-600 text-white">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Submit Your Quote</h3>
              <button 
                onClick={onClose}
                className="text-white hover:text-gray-200 focus:outline-none transition-colors"
                aria-label="Close modal"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Job Title Banner */}
          <div className="px-6 py-3 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <h4 className="font-medium text-gray-700 dark:text-gray-200">
              {jobTitle}
            </h4>
          </div>
          
          {/* Form Content */}
          <div className="px-6 py-4">
            <form onSubmit={handleSubmit}>
              {/* Quote Price Input */}
              <div className="mb-5">
                <label htmlFor="quotePrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span>Your Quote Price</span>
                  </div>
                </label>
                <div className="relative rounded-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    id="quotePrice"
                    className={`block w-full pl-8 pr-12 py-3 border ${fieldErrors.quotePrice ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'} rounded-lg shadow-sm dark:bg-gray-700 dark:text-white`}
                    placeholder="0.00"
                    min="1"
                    step="0.01"
                    value={quotePrice}
                    onChange={(e) => setQuotePrice(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">USD</span>
                  </div>
                </div>
                {fieldErrors.quotePrice && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>{fieldErrors.quotePrice}</span>
                  </div>
                )}
              </div>
              
              {/* Cover Letter Input */}
              <div className="mb-5">
                <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>Cover Letter</span>
                  </div>
                </label>
                <textarea
                  id="coverLetter"
                  rows="6"
                  className={`block w-full p-3 border ${fieldErrors.coverLetter ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'} rounded-lg shadow-sm text-sm dark:bg-gray-700 dark:text-white`}
                  placeholder="Explain why you're the right person for this job..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                ></textarea>
                <div className="flex justify-between mt-1">
                  {fieldErrors.coverLetter ? (
                    <div className="flex items-center gap-1.5 text-red-600 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      <span>{fieldErrors.coverLetter}</span>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Provide details about your experience, skills, and approach to this job.
                    </p>
                  )}
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {coverLetter.length} characters
                  </span>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="mt-6 sm:flex sm:flex-row-reverse sm:gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:ring-4 focus:ring-blue-300 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Submit Quote</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="mt-3 sm:mt-0 w-full sm:w-auto px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors focus:ring-4 focus:ring-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default QuoteModal;