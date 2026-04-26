import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface KeyboardShortcuts {
  [key: string]: () => void;
}

export function useKeyboardShortcuts(shortcuts?: KeyboardShortcuts) {
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

      // Check for custom shortcuts first
      if (shortcuts) {
        const key = [];
        if (e.ctrlKey) key.push('Ctrl');
        if (e.altKey) key.push('Alt');
        if (e.shiftKey) key.push('Shift');
        key.push(e.key);
        
        const shortcut = key.join('+');
        if (shortcuts[shortcut]) {
          e.preventDefault();
          shortcuts[shortcut]();
          return;
        }
      }

      // Default Alt + key shortcuts
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
  }, [navigate, shortcuts]);
}
