import { useEffect, useState } from "react";
import Modal from "../../../components/Modal";
import io from "socket.io-client";
import { Heart, MessageCircle, Share2, Image } from "lucide-react";

const UserDashboard = () => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Connect to WebSocket
    const socketInstance = io("http://localhost:5000");
    setSocket(socketInstance);

    // WebSocket event listeners
    socketInstance.on("post_created", (newPost) => {
      setPosts(prevPosts => [newPost, ...prevPosts]);
    });

    socketInstance.on("like_updated", ({ postId, likesCount }) => {
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.post_id === postId
            ? { ...post, likes_count: likesCount }
            : post
        )
      );
    });

    socketInstance.on("comment_added", ({ postId, comment }) => {
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.post_id === postId
            ? { 
                ...post, 
                comments_count: post.comments_count + 1,
                latest_comment: comment 
              }
            : post
        )
      );
    });

    return () => socketInstance.disconnect();
  }, []);

  useEffect(() => {
    const areCategoriesSelected = localStorage.getItem("categoriesSelected");
    if (areCategoriesSelected !== "true") {
      setIsModalOpen(true);
    }
    fetchPosts();
  }, [selectedCategories]);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem("token");
      const url = selectedCategories.length > 0
        ? `http://localhost:5000/posts/filtered`
        : `http://localhost:5000/posts`;
      
      const response = await fetch(url, {
        method: selectedCategories.length > 0 ? 'POST' : 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        ...(selectedCategories.length > 0 && {
          body: JSON.stringify({ categories: selectedCategories })
        })
      });

      const data = await response.json();
      if (data.success) {
        setPosts(data.posts);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCategories = async (categories) => {
    try {
      const user_id = localStorage.getItem("user_id");
      const token = localStorage.getItem("token");
      const userType = localStorage.getItem("userType");

      if (!user_id || !token || !userType) {
        console.error("Missing required data");
        return;
      }

      const response = await fetch("http://localhost:5000/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: user_id,
          type: userType,
          categories,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSelectedCategories(categories);
        localStorage.setItem("categoriesSelected", "true");
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Failed to save categories:", error);
    }
  };

  const handleLike = async (postId) => {
    try {
      const userId = localStorage.getItem("user_id");
      socket.emit("toggle_like", {
        userId,
        postId,
        isLiking: true
      });
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const Post = ({ post }) => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Post Header */}
      <div className="p-4 flex items-center space-x-3">
        <img
          src={post.profile_picture || '/default-avatar.png'}
          alt={post.user_name}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <h3 className="font-semibold text-[#13505b]">{post.user_name}</h3>
          <span className="text-sm text-gray-500">{post.category_name}</span>
        </div>
      </div>

      {/* Post Content */}
      <div className="px-4 py-2">
        <p className="text-gray-800">{post.content}</p>
      </div>

      {/* Post Images */}
      {post.images && post.images.length > 0 && (
        <div className="flex overflow-x-auto scrollbar-hide">
          {post.images.map((image, index) => (
            <img
              key={index}
              src={image.image_url}
              alt={`Post image ${index + 1}`}
              className="w-full h-64 object-cover"
            />
          ))}
        </div>
      )}

      {/* Post Actions */}
      <div className="p-4 flex items-center justify-between border-t">
        <button
          onClick={() => handleLike(post.post_id)}
          className="flex items-center space-x-2 text-gray-600 hover:text-red-500"
        >
          <Heart className="w-5 h-5" />
          <span>{post.likes_count}</span>
        </button>
        <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-500">
          <MessageCircle className="w-5 h-5" />
          <span>{post.comments_count}</span>
        </button>
        <button className="flex items-center space-x-2 text-gray-600 hover:text-green-500">
          <Share2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#13505b] p-4 sm:p-6">
      {/* Categories Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCategories}
        initialCategories={selectedCategories}
      />

      {/* Main Content */}
      <div className="max-w-3xl mx-auto space-y-6">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : posts.length > 0 ? (
          posts.map(post => <Post key={post.post_id} post={post} />)
        ) : (
          <div className="text-center text-white py-8">
            <p>No posts found. Follow some categories to see posts!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;