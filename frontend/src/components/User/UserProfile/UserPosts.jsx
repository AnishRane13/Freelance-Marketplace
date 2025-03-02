import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PostModal from "./PostModal";

const UserPosts = ({ userId }) => {
  const [activeTab, setActiveTab] = useState("posts");
  const [selectedPost, setSelectedPost] = useState(null);
  const [posts, setPosts] = useState([]);
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const postsContainerRef = useRef(null);
  const portfolioContainerRef = useRef(null);

  useEffect(() => {
    // Simulate fetching posts and portfolio items
    setTimeout(() => {
      setPosts([
        {
          id: 1,
          image: "/api/placeholder/600/600",
          caption: "Our latest project completed for a client in downtown. #design #architecture",
          likes: 124,
          comments: 18,
          date: "2 days ago"
        },
        {
          id: 2,
          image: "/api/placeholder/600/600",
          caption: "Behind the scenes look at our design process. We take pride in our attention to detail.",
          likes: 89,
          comments: 7,
          date: "4 days ago"
        },
        {
          id: 3,
          image: "/api/placeholder/600/600",
          caption: "Customer satisfaction is our top priority. Another happy client!",
          likes: 231,
          comments: 24,
          date: "1 week ago"
        },
        {
          id: 4,
          image: "/api/placeholder/600/600",
          caption: "New equipment arrived today. Expanding our capabilities!",
          likes: 76,
          comments: 5,
          date: "1 week ago"
        },
        {
          id: 5,
          image: "/api/placeholder/600/600",
          caption: "Team outing to celebrate our 5th year in business.",
          likes: 182,
          comments: 31,
          date: "2 weeks ago"
        }
      ]);

      setPortfolioItems([
        {
          id: 101,
          image: "/api/placeholder/600/600",
          title: "Modern Office Renovation",
          description: "Complete renovation of a 5,000 sq ft office space with modern furnishings and efficient layout.",
          category: "Commercial",
          date: "January 2025"
        },
        {
          id: 102,
          image: "/api/placeholder/600/600",
          title: "Luxury Residence Design",
          description: "Custom home design with high-end finishes and smart home integration.",
          category: "Residential",
          date: "December 2024"
        },
        {
          id: 103,
          image: "/api/placeholder/600/600",
          title: "Restaurant Interior",
          description: "Full interior design for an upscale restaurant featuring custom furniture and lighting.",
          category: "Hospitality",
          date: "November 2024"
        },
        {
          id: 104,
          image: "/api/placeholder/600/600",
          title: "Retail Space Redesign",
          description: "Modernization of retail floor space to improve customer flow and maximize display areas.",
          category: "Retail",
          date: "October 2024"
        }
      ]);

      setIsLoading(false);
    }, 1000);
  }, [userId]);

  const scroll = (direction, containerType) => {
    const container = containerType === "posts" ? postsContainerRef.current : portfolioContainerRef.current;
    if (!container) return;
    
    // Each card is 1/3 of the visible area, so scroll by that amount
    const scrollAmount = Math.floor(container.offsetWidth / 3);
    
    if (direction === "next") {
      container.scrollLeft += scrollAmount;
    } else {
      container.scrollLeft -= scrollAmount;
    }
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
            }`}
          >
            Posts
            {activeTab === "posts" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("portfolio")}
            className={`pb-4 relative ${
              activeTab === "portfolio"
                ? "text-blue-600 font-medium"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Portfolio
            {activeTab === "portfolio" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></span>
            )}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Posts Content */}
          <div className={activeTab === "posts" ? "block" : "hidden"}>
            <div className="relative">
              {/* Fixed width container that forces horizontal scrolling */}
              <div 
                ref={postsContainerRef}
                className="flex overflow-x-auto gap-6 pb-6 snap-x snap-mandatory scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {posts.map((post) => (
                  <div 
                    key={post.id}
                    className="flex-none w-full sm:w-1/2 md:w-1/3 snap-start"
                  >
                    <div 
                      className="relative group cursor-pointer overflow-hidden rounded-lg shadow-md"
                      onClick={() => setSelectedPost(post)}
                    >
                      <div className="aspect-square overflow-hidden bg-gray-100">
                        <img 
                          src={post.image} 
                          alt={`Post ${post.id}`} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                          <p className="line-clamp-2 text-sm font-medium">{post.caption}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Navigation Arrows for Posts */}
              {posts.length > 3 && (
                <>
                  <button 
                    onClick={() => scroll("prev", "posts")}
                    className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white p-3 rounded-full shadow-lg hover:bg-blue-50 transition-colors z-10 ${
                      !hasMoreToScroll("prev", "posts") ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={!hasMoreToScroll("prev", "posts")}
                    aria-label="Previous posts"
                  >
                    <ChevronLeft className="w-5 h-5 text-blue-600" />
                  </button>
                  <button 
                    onClick={() => scroll("next", "posts")}
                    className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white p-3 rounded-full shadow-lg hover:bg-blue-50 transition-colors z-10 ${
                      !hasMoreToScroll("next", "posts") ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={!hasMoreToScroll("next", "posts")}
                    aria-label="Next posts"
                  >
                    <ChevronRight className="w-5 h-5 text-blue-600" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Portfolio Content */}
          <div className={activeTab === "portfolio" ? "block" : "hidden"}>
            <div className="relative">
              {/* Fixed width container that forces horizontal scrolling */}
              <div 
                ref={portfolioContainerRef}
                className="flex overflow-x-auto gap-6 pb-6 snap-x snap-mandatory scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {portfolioItems.map((item) => (
                  <div 
                    key={item.id}
                    className="flex-none w-full sm:w-1/2 md:w-1/3 snap-start"
                  >
                    <div 
                      className="relative group cursor-pointer overflow-hidden rounded-lg shadow-md"
                      onClick={() => setSelectedPost(item)}
                    >
                      <div className="aspect-square overflow-hidden bg-gray-100">
                        <img 
                          src={item.image} 
                          alt={item.title} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                          <div className="flex justify-between items-center mb-1">
                            <h3 className="text-lg font-medium">{item.title}</h3>
                            <span className="text-xs bg-blue-500 px-2 py-0.5 rounded-full">{item.category}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Navigation Arrows for Portfolio */}
              {portfolioItems.length > 3 && (
                <>
                  <button 
                    onClick={() => scroll("prev", "portfolio")}
                    className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white p-3 rounded-full shadow-lg hover:bg-blue-50 transition-colors z-10 ${
                      !hasMoreToScroll("prev", "portfolio") ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={!hasMoreToScroll("prev", "portfolio")}
                    aria-label="Previous portfolio items"
                  >
                    <ChevronLeft className="w-5 h-5 text-blue-600" />
                  </button>
                  <button 
                    onClick={() => scroll("next", "portfolio")}
                    className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white p-3 rounded-full shadow-lg hover:bg-blue-50 transition-colors z-10 ${
                      !hasMoreToScroll("next", "portfolio") ? "opacity-50 cursor-not-allowed" : ""
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