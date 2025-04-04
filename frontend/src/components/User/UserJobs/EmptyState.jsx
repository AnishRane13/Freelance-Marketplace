

const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="bg-blue-50 p-6 rounded-full mb-4">
        <svg
          className="w-12 h-12 text-blue-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          ></path>
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-blue-800 mb-2">No Jobs Found</h3>
      <p className="text-blue-600 text-center max-w-md">
        There are currently no available jobs in this category. Please check back later or try a different category.
      </p>
    </div>
  );
};

export default EmptyState;