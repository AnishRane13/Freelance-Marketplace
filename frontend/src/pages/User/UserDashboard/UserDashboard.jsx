import { useState, useEffect } from "react";
import io from "socket.io-client";
import Modal from "../../../components/Modal";
import Post from "../../../components/Post/Post";
import LoadingSpinner from "../../../components/LoadingSpinner";
import EmptyState from "../../../components/EmptyState";

const UserDashboard = () => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  const user_id = localStorage.getItem('user_id');

  useEffect(() => {
    // Socket setup
    const socketInstance = io("http://localhost:5000");
    setSocket(socketInstance);

    // Socket event listeners
    socketInstance.on("post_created", (newPost) => {
      setPosts(prevPosts => [newPost, ...prevPosts]);
    });

    socketInstance.on("like_updated", ({ postId, likesCount, updatedPost }) => {
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.post_id === postId ? updatedPost : post
        )
      );
    });

    socketInstance.on("comment_added", ({ postId, comment, updatedPost }) => {
      setPosts(prevPosts =>
        prevPosts.map(post => {
          if (post.post_id === postId) {
            // If the post doesn't have comments array yet, create it
            if (!post.comments) {
              updatedPost.comments = [comment];
            } 
            // If we haven't loaded the full updated post yet, at least add the new comment
            else if (!updatedPost.comments) {
              const updatedPostWithComments = {
                ...updatedPost,
                comments: [...post.comments, comment]
              };
              return updatedPostWithComments;
            }
            return updatedPost;
          }
          return post;
        })
      );
    });

    socketInstance.on("error", (error) => {
      console.error("Socket error:", error);
      // You might want to show an error toast here
    });

    // Check if categories are selected and fetch posts
    const areCategoriesSelected = localStorage.getItem("categoriesSelected") === "true";
    console.log("Categories selected:", areCategoriesSelected);
    
    if (!areCategoriesSelected) {
      setIsModalOpen(true);
    }
    
    fetchPosts(areCategoriesSelected);

    // Cleanup function
    return () => socketInstance.disconnect();
  }, [selectedCategories]);

  const fetchPosts = async (areCategoriesSelected) => {
    try {
      const token = localStorage.getItem("token");
  
      // Determine the correct API URL
      const url = areCategoriesSelected
        ? `http://localhost:5000/posts/filtered?user_id=${user_id}`
        : `http://localhost:5000/posts`;
  
      const response = await fetch(url, {
        method: "GET", // Always use GET now
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        }
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
      const post = posts.find(p => p.post_id === postId);
      
      socket.emit("toggle_like", {
        userId,
        postId,
        isLiking: !post.is_liked // Toggle the like status
      });
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleComment = async (postId, comment) => {
    try {
      const userId = localStorage.getItem("user_id");
      socket.emit("new_comment", {
        userId,
        postId,
        comment
      });
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-[#13505b] to-[#0a2e33] p-4 sm:p-6">
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCategories}
        initialCategories={selectedCategories}
      />

      <div className="max-w-3xl mx-auto space-y-6">
        {loading ? (
          <LoadingSpinner />
        ) : posts.length > 0 ? (
          posts.map(post => (
            <Post 
              key={post.post_id} 
              post={post} 
              onLike={handleLike}
              onComment={handleComment}
              socket={socket}
            />
          ))
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
};

export default UserDashboard;