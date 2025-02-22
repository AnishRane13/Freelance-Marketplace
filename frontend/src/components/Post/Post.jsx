import { useState } from 'react';
import PostHeader from '../Post/PostHeader';
import PostContent from '../Post/PostContent';
import PostActions from '../Post/PostActions';
import ImageCarousel from '../Post/ImageCarousel';
import CommentSection from './CommentSection';

const Post = ({ post, onLike, onComment }) => {
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

  const handleCommentClick = () => {
    setIsCommentsOpen(!isCommentsOpen);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-[1.02] transition-transform duration-200">
      <PostHeader
        user_name={post.user_name}
        profile_picture={post.profile_picture}
        category_name={post.category_name}
      />
      <PostContent content={post.content} />
      {post.images && <ImageCarousel images={post.images} />}
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
        comments={post.comments}
        onSubmitComment={(comment) => onComment(post.post_id, comment)}
      />
    </div>
  );
};

export default Post;