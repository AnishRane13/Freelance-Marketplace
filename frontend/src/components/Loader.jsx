const Loader = () => {
  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center">
      <div className="flex flex-col items-center bg-white p-10 rounded-xl shadow-xl">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-blue-100 rounded-full"></div>
          <div className="absolute top-0 left-0 w-20 h-20 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="mt-6 text-blue-700 font-medium">Loading profile...</p>
        <p className="text-blue-400 text-sm mt-1">Please wait</p>
      </div>
    </div>
  );
};

export default Loader;