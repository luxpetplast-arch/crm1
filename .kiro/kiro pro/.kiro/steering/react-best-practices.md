---
inclusion: fileMatch
fileMatchPattern: '**/*.jsx,**/*.tsx,**/components/**,**/pages/**'
---

# React Best Practices

## Component Structure

### Functional Components
```typescript
// ✅ Good: Clear, typed, documented
interface UserCardProps {
  user: User;
  onEdit: (id: string) => void;
}

/**
 * Displays user information in a card format
 */
export const UserCard: React.FC<UserCardProps> = ({ user, onEdit }) => {
  return (
    <div className="user-card">
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      <button onClick={() => onEdit(user.id)}>Edit</button>
    </div>
  );
};

// ❌ Bad: No types, unclear
export const UserCard = ({ user, onEdit }) => {
  return <div>...</div>;
};
```

## Hooks Best Practices

### useState
```typescript
// ✅ Good: Descriptive names, proper typing
const [isLoading, setIsLoading] = useState<boolean>(false);
const [users, setUsers] = useState<User[]>([]);

// ❌ Bad: Generic names
const [data, setData] = useState();
const [flag, setFlag] = useState(false);
```

### useEffect
```typescript
// ✅ Good: Clear dependencies, cleanup
useEffect(() => {
  const controller = new AbortController();
  
  const fetchData = async () => {
    try {
      const response = await fetch('/api/users', {
        signal: controller.signal
      });
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error(error);
      }
    }
  };
  
  fetchData();
  
  return () => controller.abort();
}, []);

// ❌ Bad: Missing dependencies, no cleanup
useEffect(() => {
  fetchData();
});
```

### Custom Hooks
```typescript
// ✅ Good: Reusable logic
function useUser(userId: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/users/${userId}`);
        const data = await response.json();
        setUser(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, [userId]);
  
  return { user, loading, error };
}

// Usage
const { user, loading, error } = useUser('123');
```

## Performance Optimization

### useMemo
```typescript
// ✅ Good: Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return users.filter(u => u.active)
              .sort((a, b) => a.name.localeCompare(b.name));
}, [users]);

// ❌ Bad: Recalculates on every render
const expensiveValue = users.filter(u => u.active)
                            .sort((a, b) => a.name.localeCompare(b.name));
```

### useCallback
```typescript
// ✅ Good: Stable function reference
const handleClick = useCallback((id: string) => {
  console.log('Clicked:', id);
}, []);

// Pass to child component
<ChildComponent onClick={handleClick} />
```

### React.memo
```typescript
// ✅ Good: Prevent unnecessary re-renders
export const UserCard = React.memo<UserCardProps>(({ user, onEdit }) => {
  return (
    <div className="user-card">
      <h3>{user.name}</h3>
      <button onClick={() => onEdit(user.id)}>Edit</button>
    </div>
  );
});
```

### Code Splitting
```typescript
// ✅ Good: Lazy load components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}
```

## State Management

### Context API
```typescript
// ✅ Good: Typed context
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  
  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    setUser(data.user);
  };
  
  const logout = () => setUser(null);
  
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### Zustand (Recommended)
```typescript
// ✅ Good: Simple, performant state management
import create from 'zustand';

interface UserStore {
  users: User[];
  addUser: (user: User) => void;
  removeUser: (id: string) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  users: [],
  addUser: (user) => set((state) => ({ 
    users: [...state.users, user] 
  })),
  removeUser: (id) => set((state) => ({ 
    users: state.users.filter(u => u.id !== id) 
  }))
}));

// Usage
const users = useUserStore(state => state.users);
const addUser = useUserStore(state => state.addUser);
```

## Error Handling

### Error Boundaries
```typescript
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}

// Usage
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

## Forms

### Controlled Components
```typescript
// ✅ Good: Controlled form with validation
const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    try {
      await login(email, password);
    } catch (error) {
      setErrors({ form: 'Login failed' });
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        aria-invalid={!!errors.email}
      />
      {errors.email && <span className="error">{errors.email}</span>}
      
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        aria-invalid={!!errors.password}
      />
      {errors.password && <span className="error">{errors.password}</span>}
      
      <button type="submit">Login</button>
      {errors.form && <span className="error">{errors.form}</span>}
    </form>
  );
};
```

## Testing

### Component Tests
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { UserCard } from './UserCard';

describe('UserCard', () => {
  const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com'
  };
  
  it('renders user information', () => {
    render(<UserCard user={mockUser} onEdit={() => {}} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });
  
  it('calls onEdit when button clicked', () => {
    const onEdit = jest.fn();
    render(<UserCard user={mockUser} onEdit={onEdit} />);
    
    fireEvent.click(screen.getByText('Edit'));
    expect(onEdit).toHaveBeenCalledWith('1');
  });
});
```

## Accessibility

### ARIA Attributes
```typescript
// ✅ Good: Accessible component
<button
  onClick={handleClick}
  aria-label="Close dialog"
  aria-pressed={isPressed}
>
  <CloseIcon aria-hidden="true" />
</button>

// ✅ Good: Semantic HTML
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/about">About</a></li>
  </ul>
</nav>
```

## File Structure
```
src/
├── components/
│   ├── common/
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   └── Button.module.css
│   │   └── Input/
│   └── features/
│       └── UserCard/
├── hooks/
│   ├── useAuth.ts
│   └── useUser.ts
├── pages/
│   ├── Home.tsx
│   └── Dashboard.tsx
├── store/
│   └── userStore.ts
├── types/
│   └── user.ts
└── utils/
    └── api.ts
```

## Eslatma

Bu qoidalar React kod yozganingizda avtomatik qo'llaniladi. Kiro agentlari bu standartlarga rioya qilishni tekshiradi.
