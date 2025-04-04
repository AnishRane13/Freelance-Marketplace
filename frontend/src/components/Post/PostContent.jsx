import { useState } from 'react';
import { ChevronDown, ChevronUp } from "lucide-react";

const PostContent = ({ content }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Calculate if content should be truncated
  const shouldTruncate = content && content.length > 280;
  const displayContent = shouldTruncate && !isExpanded ? 
    `${content.substring(0, 280)}...` : content;

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Function to linkify URLs in content
  const renderContentWithLinks = (text) => {
    if (!text) return null;
    
    // Simple regex to find URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    
    // Split by URLs and map each part
    const parts = text.split(urlRegex);
    
    return parts.map((part, i) => {
      // If part matches URL regex, render as link
      if (part.match(urlRegex)) {
        return (
          <a 
            key={i} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-700 hover:underline"
          >
            {part}
          </a>
        );
      }
      
      // Handle hashtags
      const hashtagRegex = /#(\w+)/g;
      const withHashtags = part.split(hashtagRegex);
      
      return withHashtags.map((subPart, j) => {
        if (subPart.match(/^\w+$/) && j % 2 === 1) {
          return (
            <span key={`${i}-${j}`} className="text-blue-600 hover:underline cursor-pointer">
              #{subPart}
            </span>
          );
        }
        return subPart;
      });
    });
  };

  return (
    <div className="px-6 py-4">
      <p className="text-gray-800 leading-relaxed text-base">
        {renderContentWithLinks(displayContent)}
      </p>
      
      {shouldTruncate && (
        <button 
          onClick={toggleExpanded}
          className="text-blue-500 hover:text-blue-700 text-sm font-medium mt-2 flex items-center group"
        >
          {isExpanded ? (
            <>
              Show less 
              <ChevronUp className="w-4 h-4 ml-1 group-hover:translate-y-px transition-transform" />
            </>
          ) : (
            <>
              Show more 
              <ChevronDown className="w-4 h-4 ml-1 group-hover:translate-y-px transition-transform" />
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default PostContent;