const EmptyState = () => (
  <div className="text-center text-white py-12">
    <div className="bg-white/10 rounded-lg p-8 backdrop-blur-sm">
      <h3 className="text-xl font-semibold mb-2">No posts found</h3>
      <p className="text-white/80">Follow some categories to see posts in your feed!</p>
    </div>
  </div>
);

export default EmptyState;