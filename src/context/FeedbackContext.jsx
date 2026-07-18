import { createContext, useCallback, useContext, useState } from 'react';
import FeedbackModal from '../components/ui/FeedbackModal';

const FeedbackContext = createContext(null);

export function FeedbackProvider({ children }) {
  const [feedback, setFeedback] = useState(null);

  const showFeedback = useCallback((tone, message) => {
    if (!message) return;
    setFeedback({ tone, message });
  }, []);

  const showError = useCallback((message) => showFeedback('danger', message), [showFeedback]);
  const showSuccess = useCallback((message) => showFeedback('success', message), [showFeedback]);
  const showWarning = useCallback((message) => showFeedback('warning', message), [showFeedback]);
  const close = useCallback(() => setFeedback(null), []);

  return (
    <FeedbackContext.Provider value={{ showError, showSuccess, showWarning }}>
      {children}
      <FeedbackModal feedback={feedback} onClose={close} />
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  return useContext(FeedbackContext);
}
