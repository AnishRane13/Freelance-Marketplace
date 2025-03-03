import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Heart, MessageCircle, Calendar, Image, Layers } from "lucide-react";
import PostModal from "./PostModal";

const UserPosts = ({ userId }) => {
  const [activeTab, setActiveTab] = useState("posts");
  const [selectedPost, setSelectedPost] = useState(null);
  const [posts, setPosts] = useState([]);
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scrollPositions, setScrollPositions] = useState({ posts: 0, portfolio: 0 });

  const postsContainerRef = useRef(null);
  const portfolioContainerRef = useRef(null);

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`http://localhost:5000/posts/${userId}/all`);
        
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          setPosts(data.posts);
          // Filter posts with category for portfolio tab
          setPortfolioItems(data.posts.filter(post => post.category_name !== null));
        } else {
          setError("Failed to fetch posts");
        }
      } catch (err) {
        setError("Error connecting to the server");
        console.error("Error fetching posts:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchUserPosts();
    }
  }, [userId]);

  // Track scroll position for containers
  useEffect(() => {
    const handleScroll = (containerType) => {
      const container = containerType === "posts" ? postsContainerRef.current : portfolioContainerRef.current;
      if (container) {
        setScrollPositions(prev => ({
          ...prev,
          [containerType]: container.scrollLeft
        }));
      }
    };

    const postsContainer = postsContainerRef.current;
    const portfolioContainer = portfolioContainerRef.current;
    
    if (postsContainer) {
      postsContainer.addEventListener("scroll", () => handleScroll("posts"));
    }
    
    if (portfolioContainer) {
      portfolioContainer.addEventListener("scroll", () => handleScroll("portfolio"));
    }
    
    return () => {
      if (postsContainer) {
        postsContainer.removeEventListener("scroll", () => handleScroll("posts"));
      }
      if (portfolioContainer) {
        portfolioContainer.removeEventListener("scroll", () => handleScroll("portfolio"));
      }
    };
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(date);
  };

  const scroll = (direction, containerType) => {
    const container = containerType === "posts" ? postsContainerRef.current : portfolioContainerRef.current;
    if (!container) return;
    
    // Smooth scroll by the width of one card with a more natural animation
    const cardWidth = Math.floor(container.offsetWidth / 3);
    const scrollAmount = direction === "next" ? cardWidth : -cardWidth;
    
    // Use smooth scrolling for better animation
    container.scrollBy({
      left: scrollAmount,
      behavior: "smooth"
    });
  };

  const hasMoreToScroll = (direction, containerType) => {
    const container = containerType === "posts" ? postsContainerRef.current : portfolioContainerRef.current;
    if (!container) return false;
    
    if (direction === "prev") {
      return container.scrollLeft > 10; // Small buffer for precision
    } else {
      return container.scrollLeft < container.scrollWidth - container.clientWidth - 10;
    }
  };

  // Function to get thumbnail image (just the first image)
  const getThumbnailImage = (imageArray) => {
    if (!imageArray || imageArray.length === 0) {
      return null;
    }
    return imageArray[0]; // Only return the first image
  };

  // Function to check if post has multiple images
  const hasMultipleImages = (imageArray) => {
    return imageArray && imageArray.length > 1;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      {/* Tabs */}
      <div className="mb-8 border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab("posts")}
            className={`pb-4 relative ${
              activeTab === "posts"
                ? "text-blue-600 font-medium"
                : "text-gray-500 hover:text-gray-700"
            } transition-colors duration-300`}
          >
            Posts
            {activeTab === "posts" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 transition-all duration-300"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("portfolio")}
            className={`pb-4 relative ${
              activeTab === "portfolio"
                ? "text-blue-600 font-medium"
                : "text-gray-500 hover:text-gray-700"
            } transition-colors duration-300`}
          >
            Portfolio
            {activeTab === "portfolio" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 transition-all duration-300"></span>
            )}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">{error}</p>
        </div>
      ) : (
        <>
          {/* Posts Content */}
          <div className={`transition-opacity duration-500 ${activeTab === "posts" ? "opacity-100" : "opacity-0 hidden"}`}>
            <div className="relative">
              {posts.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <p className="text-gray-500">No posts available</p>
                </div>
              ) : (
                <div 
                  ref={postsContainerRef}
                  className="flex overflow-x-auto gap-6 pb-6 snap-x snap-mandatory scrollbar-hide"
                  style={{ 
                    scrollbarWidth: 'none', 
                    msOverflowStyle: 'none',
                    WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
                    transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' // Custom spring animation
                  }}
                >
                  {posts.map((post) => (
                    <div 
                      key={post.post_id}
                      className="flex-none w-full sm:w-1/2 md:w-1/3 snap-start transition-transform duration-300 hover:-translate-y-2"
                      style={{transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'}} // Custom spring animation
                    >
                      <div 
                        className="relative group cursor-pointer overflow-hidden rounded-lg shadow-md bg-white transition-all duration-300 hover:shadow-xl"
                        onClick={() => setSelectedPost(post)}
                      >
                        <div className="aspect-square overflow-hidden bg-gray-100 relative">
                          {getThumbnailImage(post.images) ? (
                            <>
                              <img 
                                src={getThumbnailImage(post.images)}
                                alt={`Post ${post.post_id}`} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                style={{transition: 'transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)'}} // Custom spring animation
                              />
                              
                              {/* Multiple Images Indicator */}
                              {hasMultipleImages(post.images) && (
                                <div className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full transform transition-transform group-hover:scale-110">
                                  <Layers className="w-4 h-4" />
                                </div>
                              )}
                              
                              {/* Image Count Indicator */}
                              {hasMultipleImages(post.images) && (
                                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                  <div className="flex items-center space-x-1">
                                    <Image className="w-3 h-3" />
                                    <span>{post.images.length}</span>
                                  </div>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              <span className="text-gray-400">No image</span>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{post.content}</p>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center text-gray-500 group-hover:text-red-500 transition-colors duration-300">
                                <Heart className="w-4 h-4 mr-1 transition-transform group-hover:scale-110 duration-300" />
                                <span className="text-xs">{post.likes_count}</span>
                              </div>
                              <div className="flex items-center text-gray-500 group-hover:text-blue-500 transition-colors duration-300">
                                <MessageCircle className="w-4 h-4 mr-1 transition-transform group-hover:scale-110 duration-300" />
                                <span className="text-xs">{post.comments_count}</span>
                              </div>
                            </div>
                            <div className="flex items-center text-xs text-gray-500">
                              <Calendar className="w-3 h-3 mr-1" />
                              <span>{formatDate(post.created_at)}</span>
                            </div>
                          </div>
                        </div>
                        {post.category_name && (
                          <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-0.5 rounded-full text-xs transform transition-transform duration-300 group-hover:scale-110 shadow-md group-hover:shadow-lg">
                            {post.category_name}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
            </div>
          </div>
          {/* Portfolio Content */}
          <div className={`transition-opacity duration-300 ${activeTab === "portfolio" ? "opacity-100" : "opacity-0 hidden"}`}>
            <div className="relative">
              {portfolioItems.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <p className="text-gray-500">No portfolio items available</p>
                </div>
              ) : (
                <div 
                  ref={portfolioContainerRef}
                  className="flex overflow-x-auto gap-6 pb-6 snap-x snap-mandatory scrollbar-hide"
                  style={{ 
                    scrollbarWidth: 'none', 
                    msOverflowStyle: 'none',
                    WebkitOverflowScrolling: 'touch' // Smooth scrolling on iOS
                  }}
                >
                  {portfolioItems.map((item) => (
                    <div 
                      key={item.post_id}
                      className="flex-none w-full sm:w-1/2 md:w-1/3 snap-start transition-transform duration-300 hover:translate-y-1"
                    >
                      <div 
                        className="relative group cursor-pointer overflow-hidden rounded-lg shadow-md transition-all duration-300 hover:shadow-lg"
                        onClick={() => setSelectedPost(item)}
                      >
                        <div className="aspect-square overflow-hidden bg-gray-100">
                          {getThumbnailImage(item.images) ? (
                            <img 
                              src={getThumbnailImage(item.images)}
                              alt={`Portfolio ${item.post_id}`} 
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              <span className="text-gray-400">No image</span>
                            </div>
                          )}
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute bottom-0 left-0 right-0 p-4 text-white translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                            <div className="flex justify-between items-center mb-1">
                              <h3 className="text-lg font-medium line-clamp-1">{item.content}</h3>
                              <span className="text-xs bg-blue-500 px-2 py-0.5 rounded-full">{item.category_name}</span>
                            </div>
                            <div className="flex justify-between mt-2">
                              <div className="flex items-center space-x-3">
                                <div className="flex items-center">
                                  <Heart className="w-4 h-4 mr-1" />
                                  <span className="text-xs">{item.likes_count}</span>
                                </div>
                                <div className="flex items-center">
                                  <MessageCircle className="w-4 h-4 mr-1" />
                                  <span className="text-xs">{item.comments_count}</span>
                                </div>
                              </div>
                              <span className="text-xs">{formatDate(item.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Navigation Arrows for Portfolio */}
              {portfolioItems.length > 3 && (
                <>
                  <button 
                    onClick={() => scroll("prev", "portfolio")}
                    className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white p-3 rounded-full shadow-lg hover:bg-blue-50 transition-all duration-300 z-10 ${
                      !hasMoreToScroll("prev", "portfolio") ? "opacity-50 cursor-not-allowed" : "hover:shadow-xl"
                    }`}
                    disabled={!hasMoreToScroll("prev", "portfolio")}
                    aria-label="Previous portfolio items"
                  >
                    <ChevronLeft className="w-5 h-5 text-blue-600" />
                  </button>
                  <button 
                    onClick={() => scroll("next", "portfolio")}
                    className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white p-3 rounded-full shadow-lg hover:bg-blue-50 transition-all duration-300 z-10 ${
                      !hasMoreToScroll("next", "portfolio") ? "opacity-50 cursor-not-allowed" : "hover:shadow-xl"
                    }`}
                    disabled={!hasMoreToScroll("next", "portfolio")}
                    aria-label="Next portfolio items"
                  >
                    <ChevronRight className="w-5 h-5 text-blue-600" />
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
      
      {/* Post Modal */}
      {selectedPost && (
        <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} isPortfolio={activeTab === "portfolio"} />
      )}
    </div>
  );
};

export default UserPosts;