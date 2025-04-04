import { useState, useEffect } from 'react';
import PostHeader from './PostHeader';
import PostContent from './PostContent';
import PostActions from './PostActions';
import ImageCarousel from './ImageCarousel';
import CommentSection from './CommentSection';

const Post = ({ post, onLike, onComment, socket, userId }) => {
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [localComments, setLocalComments] = useState(post.comments || []);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  
  // Update local comments when post comments change
  useEffect(() => {
    if (post.comments) {
      setLocalComments(post.comments);
    }
  }, [post.comments]);

  // Listen for new comments on this specific post
  useEffect(() => {
    if (socket && isCommentsOpen) {
      // If we open the comments and there are none loaded yet, fetch them
      if (!post.comments || post.comments.length === 0) {
        socket.emit("fetch_comments", { postId: post.post_id });
      }
      
      // Set up the listener for fetched comments
      const handleCommentsFetched = ({ postId, comments }) => {
        if (postId === post.post_id) {
          setLocalComments(comments);
        }
      };
      
      socket.on("comments_fetched", handleCommentsFetched);
      
      return () => {
        socket.off("comments_fetched", handleCommentsFetched);
      };
    }
  }, [socket, isCommentsOpen, post.post_id, post.comments]);

  const handleCommentClick = () => {
    setIsCommentsOpen(!isCommentsOpen);
  };

  const handleSubmitComment = (comment) => {
    onComment(post.post_id, comment);
  };

  const handleLikeClick = () => {
    setIsLikeAnimating(true);
    onLike(post.post_id);
    setTimeout(() => setIsLikeAnimating(false), 1000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl mb-6 border border-gray-100">
      <PostHeader
        user_name={post.user_name}
        userId={post.user_id}
        profile_picture={post.profile_picture}
        category_name={post.category_name}
        created_at={post.created_at}
      />
      
      <PostContent content={post.content} />
      
      {post.images && post.images.length > 0 && (
        <div className="mt-2">
          <ImageCarousel images={post.images} className="h-96" />
        </div>
      )}
      
      <PostActions
        post_id={post.post_id}
        likes_count={post.likes_count}
        comments_count={post.comments_count}
        onLike={handleLikeClick}
        onCommentClick={handleCommentClick}
        isLiked={post.is_liked}
        isLikeAnimating={isLikeAnimating}
        isCommentsOpen={isCommentsOpen}
      />
      
      <CommentSection
        isOpen={isCommentsOpen}
        comments={localComments}
        onSubmitComment={handleSubmitComment}
      />
    </div>
  );
};

export default Post;