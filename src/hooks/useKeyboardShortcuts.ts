import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function useKeyboardShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // Alt + key shortcuts
      if (e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'h':
            e.preventDefault();
            navigate('/');
            break;
          case 's':
            e.preventDefault();
            navigate('/sales');
            break;
          case 'p':
            e.preventDefault();
            navigate('/products');
            break;
          case 'c':
            e.preventDefault();
            navigate('/customers');
            break;
          case 'm':
            e.preventDefault();
            navigate('/expenses');
            break;
          case 'r':
            e.preventDefault();
            navigate('/reports');
            break;
          case 'o':
            e.preventDefault();
            navigate('/settings');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [navigate]);
}
