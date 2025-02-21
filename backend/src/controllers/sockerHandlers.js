const { 
    addLike, 
    removeLike, 
    getLikesCount, 
    addComment, 
    getPostWithDetails 
  } = require('../models/interactions');
  
  const handleSocketEvents = (io) => {
    io.on('connection', async (socket) => {
      console.log('Client connected:', socket.id);
  
      // Handle post likes
      socket.on('toggle_like', async (data) => {
        try {
          const { userId, postId, isLiking } = data;
          
          if (isLiking) {
            await addLike(userId, postId);
          } else {
            await removeLike(userId, postId);
          }
  
          const likesCount = await getLikesCount(postId);
          const updatedPost = await getPostWithDetails(postId);
  
          io.emit('like_updated', {
            postId,
            likesCount,
            userId,
            isLiking,
            updatedPost
          });
        } catch (error) {
          console.error('Error handling like:', error);
          socket.emit('error', {
            message: 'Error processing like action',
            error: error.message
          });
        }
      });
  
      // Handle new comments
      socket.on('new_comment', async (data) => {
        try {
          const { userId, postId, comment } = data;
          
          const newComment = await addComment(userId, postId, comment);
          const updatedPost = await getPostWithDetails(postId);
  
          io.emit('comment_added', {
            postId,
            comment: newComment,
            updatedPost
          });
        } catch (error) {
          console.error('Error handling comment:', error);
          socket.emit('error', {
            message: 'Error adding comment',
            error: error.message
          });
        }
      });
  
      // Handle real-time post creation
      socket.on('new_post_created', async (postId) => {
        try {
          const newPost = await getPostWithDetails(postId);
          io.emit('post_created', newPost);
        } catch (error) {
          console.error('Error handling new post:', error);
          socket.emit('error', {
            message: 'Error broadcasting new post',
            error: error.message
          });
        }
      });
  
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  };
  
  module.exports = handleSocketEvents;
  