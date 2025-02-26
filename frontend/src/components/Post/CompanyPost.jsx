import { useState, useEffect } from 'react';
import CompanyPostHeader from './CompanyPostHeader';
import PostContent from './PostContent';
import PostActions from './PostActions';
import ImageCarousel from './ImageCarousel';
import CommentSection from './CommentSection';

const CompanyPost = ({ post, onLike, onComment, socket, userId }) => {
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [localComments, setLocalComments] = useState(post.comments || []);
  
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

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-[1.02] transition-transform duration-200">
      <CompanyPostHeader
        user_name={post.user_name}
        userId={userId}
        profile_picture={post.profile_picture}
        category_name={post.category_name}
        created_at={post.created_at}
      />
      <PostContent content={post.content} />
      {post.images && post.images.length > 0 && <ImageCarousel images={post.images} />}
      <PostActions
        post_id={post.post_id}
        likes_count={post.likes_count}
        comments_count={post.comments_count}
        onLike={onLike}
        onCommentClick={handleCommentClick}
        isLiked={post.is_liked}
      />
      <CommentSection
        isOpen={isCommentsOpen}
        comments={localComments}
        onSubmitComment={handleSubmitComment}
      />
    </div>
  );
};

export default CompanyPost;