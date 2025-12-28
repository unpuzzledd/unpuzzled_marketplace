import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { StudentApi } from '../lib/studentApi';
import { useAuth } from '../hooks/useAuth';

interface ViewTopicProps {
  isOpen?: boolean;
  onClose?: () => void;
  topicId?: string;
  topic?: any; // Allow passing topic data directly
}

export const ViewTopic: React.FC<ViewTopicProps> = ({ isOpen = true, onClose, topicId, topic: topicProp }) => {
  const navigate = useNavigate();
  const params = useParams();
  const { user } = useAuth();
  const [topic, setTopic] = useState<any>(topicProp || null);
  const [loading, setLoading] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [completionError, setCompletionError] = useState<string | null>(null);

  // Get topicId from props, params, or use topicProp
  const effectiveTopicId = topicId || params.topicId;

  useEffect(() => {
    const fetchTopic = async () => {
      if (!effectiveTopicId || topicProp) return; // Skip if topic is passed directly or no ID
      
      setLoading(true);
      try {
        const response = await StudentApi.getTopicDetails(effectiveTopicId);
        if (response.data) {
          setTopic(response.data);
        }
      } catch (error) {
        console.error('Error fetching topic:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && effectiveTopicId) {
      fetchTopic();
    }
  }, [isOpen, effectiveTopicId, topicProp]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };

  const handleCancel = () => {
    handleClose();
  };

  const handleComplete = async () => {
    if (!topic?.id || !user?.id) {
      setCompletionError('Missing topic or user information');
      return;
    }

    setCompleting(true);
    setCompletionError(null);

    try {
      // Mark topic as complete
      const response = await StudentApi.markTopicComplete(topic.id, user.id);
      
      if (response.error) {
        setCompletionError(response.error);
        return;
      }
      
      // Show success feedback (you can replace this with a toast notification)
      // For now, we'll just close the modal after a brief delay
      setTimeout(() => {
        handleClose();
      }, 300);
      
    } catch (error) {
      console.error('Error completing topic:', error);
      setCompletionError('Failed to mark topic as complete. Please try again.');
    } finally {
      setCompleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (!isOpen) return null;

  // Show loading state
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
        <div className="w-full max-w-[603px] flex flex-col items-center justify-center gap-4 rounded-xl bg-[#F7FCFA] p-8 font-lexend">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#009963]"></div>
          <p className="text-[#5E8C7D]">Loading topic...</p>
        </div>
      </div>
    );
  }

  // Show error state if no topic data
  if (!topic && !effectiveTopicId) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
        <div className="w-full max-w-[603px] flex flex-col items-center justify-center gap-4 rounded-xl bg-[#F7FCFA] p-8 font-lexend">
          <p className="text-red-600">Topic not found</p>
          <button 
            onClick={handleClose}
            className="px-4 py-2 bg-[#009963] text-white rounded-lg hover:bg-[#007a4f] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Parse image URLs if stored as JSON string
  const imageUrls = topic?.image_urls 
    ? (typeof topic.image_urls === 'string' ? JSON.parse(topic.image_urls) : topic.image_urls)
    : [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div 
        className="w-full max-w-[603px] max-h-[95vh] sm:h-[823px] flex flex-col items-start gap-3 sm:gap-6 rounded-xl bg-[#F7FCFA] p-4 sm:p-8 md:p-16 font-lexend overflow-y-auto"
      >
        <div className="flex h-auto sm:h-[72px] p-2 sm:p-4 justify-between items-center self-stretch gap-2">
          <h1 className="w-full sm:w-[288px] text-xl sm:text-2xl md:text-[32px] font-bold leading-tight sm:leading-10 text-[#0F1717]">
            View Topic
          </h1>
          <button 
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-black hover:bg-opacity-10 rounded-lg transition-colors flex-shrink-0 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
          >
            <svg width="24" height="24" className="sm:w-8 sm:h-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 8L24 24" stroke="#00241E" strokeWidth="2" strokeLinecap="round"/>
              <path d="M24 8L8 24" stroke="#00241E" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="flex flex-col items-start self-stretch">
          <div className="flex flex-col items-start gap-3 sm:gap-[-16px] self-stretch">
            <div className="flex max-w-[480px] p-2 sm:p-3 px-2 sm:px-4 items-end content-end gap-3 sm:gap-4 self-stretch flex-wrap">
              <div className="flex min-w-0 flex-col items-start flex-1">
                <div className="flex pb-2 flex-col items-start self-stretch">
                  <h2 className="self-stretch text-lg sm:text-xl md:text-[20px] font-bold leading-tight sm:leading-normal text-[#1C1D1D]">
                    {topic?.title || 'Untitled Topic'}
                  </h2>
                </div>
              </div>
            </div>

            {topic?.description && (
              <div className="flex max-w-[480px] p-2 sm:p-3 px-2 sm:px-4 items-end content-end gap-3 sm:gap-4 self-stretch flex-wrap">
                <div className="flex min-w-0 flex-col items-start flex-1">
                  <div className="flex pb-2 flex-col items-start self-stretch">
                    <p className="self-stretch text-sm sm:text-base font-normal leading-5 sm:leading-6 text-black opacity-80 whitespace-pre-wrap">
                      {topic.description}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {topic?.due_date && (
            <div className="flex max-w-[480px] p-2 sm:p-3 px-2 sm:px-4 items-end content-end gap-3 sm:gap-4 self-stretch flex-wrap">
              <div className="flex min-w-0 flex-col items-start flex-1">
                <div className="flex pb-2 flex-col items-start self-stretch">
                  <p className="self-stretch text-sm sm:text-base font-medium leading-5 sm:leading-6 text-[#0F1717]">
                    Due Date: {formatDate(topic.due_date)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {imageUrls.length > 0 && (
            <div className="flex flex-col items-start gap-2 sm:gap-[-14px] self-stretch">
              {imageUrls.length > 0 && (
                <div className="flex p-2 sm:p-3 px-2 sm:px-4 justify-center items-center gap-2 self-stretch">
                  {imageUrls.slice(0, 2).map((url: string, idx: number) => (
                    <img 
                      key={idx}
                      src={url} 
                      alt={`Topic image ${idx + 1}`}
                      className="h-[100px] sm:h-[138px] flex-1 rounded-[7px] object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ))}
                </div>
              )}
              {imageUrls.length > 2 && (
                <div className="flex p-2 sm:p-3 px-2 sm:px-4 justify-center items-center gap-2 self-stretch">
                  {imageUrls.slice(2, 4).map((url: string, idx: number) => (
                    <img 
                      key={idx + 2}
                      src={url} 
                      alt={`Topic image ${idx + 3}`}
                      className="h-[100px] sm:h-[138px] flex-1 rounded-[7px] object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row p-0 px-2 sm:px-4 items-stretch sm:items-center gap-3 sm:gap-4 self-stretch mt-2 sm:mt-0">
          {completionError && (
            <div className="w-full px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mb-2">
              {completionError}
            </div>
          )}
          <button 
            onClick={handleCancel}
            disabled={completing}
            className="flex h-10 sm:h-10 min-w-[84px] max-w-[480px] px-4 justify-center items-center flex-1 rounded-xl bg-[#F0F5F2] hover:bg-[#E5F5F0] transition-colors min-h-[44px] sm:min-h-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-sm font-bold leading-[21px] text-[#0F1717] overflow-hidden text-ellipsis whitespace-nowrap text-center">
              Cancel
            </span>
          </button>
          <button 
            onClick={handleComplete}
            disabled={completing || !topic?.id || !user?.id}
            className="flex h-10 sm:h-10 min-w-[84px] max-w-[480px] px-4 justify-center items-center flex-1 rounded-xl bg-[#009963] hover:bg-[#007a4d] transition-colors min-h-[44px] sm:min-h-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {completing ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span className="text-sm font-bold leading-[21px] text-white overflow-hidden text-ellipsis whitespace-nowrap text-center">
                  Completing...
                </span>
              </div>
            ) : (
              <span className="text-sm font-bold leading-[21px] text-white overflow-hidden text-ellipsis whitespace-nowrap text-center">
                Complete
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewTopic;
