import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || (() => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable is required in production');
  }
  // Development uchun random secret generatsiya qilish
  return 'dev-secret-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
})();

router.post('/login', async (req, res) => {
  try {
    const { login, password } = req.body;
    
    if (!login || !password) {
      return res.status(400).json({ error: 'Login va parol kiritilishi shart' });
    }
    
    const user = await prisma.user.findUnique({ where: { login } });

    if (!user) {
      return res.status(401).json({ error: 'Login yoki parol xato' });
    }

    if (!user.active) {
      return res.status(401).json({ error: 'Foydalanuvchi faol emas' });
    }

    const valid = await bcrypt.compare(password, user.password);
    
    if (!valid) {
      return res.status(401).json({ error: 'Login yoki parol xato' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (error) {
    console.error('❌ Login error:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({ 
      error: 'Server xatosi',
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
    });
  }
});

// Kassir login endpointi
router.post('/cashier-login', async (req, res) => {
  try {
    const { login, password } = req.body;
    
    if (!login || !password) {
      return res.status(400).json({ error: 'Login va parol kiritilishi shart' });
    }
    
    const user = await prisma.user.findUnique({ where: { login } });

    if (!user) {
      return res.status(401).json({ error: 'Login yoki parol xato' });
    }
    
    if (!user.active) {
      return res.status(401).json({ error: 'Foydalanuvchi faol emas' });
    }

    const allowedRoles = ['cashier', 'seller'];
    if (!allowedRoles.includes(user.role?.toLowerCase())) {
      return res.status(403).json({ error: 'Faqat kassirlar uchun' });
    }

    const valid = await bcrypt.compare(password, user.password);
    
    if (!valid) {
      return res.status(401).json({ error: 'Login yoki parol xato' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (error) {
    console.error('❌ Cashier login error:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({ 
      error: 'Server xatosi',
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
    });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { password, name, role, login } = req.body;
    
    if (!login || !password || !name) {
      return res.status(400).json({ error: 'Login, parol va ism kiritilishi shart' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { password: hashedPassword, name, role, login },
    });

    res.json({ id: user.id, name: user.name, role: user.role, login: user.login });
  } catch (error) {
    console.error('❌ Register error:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({ 
      error: 'Registration failed',
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
    });
  }
});

// Current user ma'lumotlarini olish
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token topilmadi' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, role: true, active: true, createdAt: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
    }

    if (!user.active) {
      return res.status(401).json({ error: 'Foydalanuvchi faol emas' });
    }

    res.json(user);
  } catch (error) {
    console.error('❌ Get current user error:', error instanceof Error ? error.message : 'Unknown error');
    res.status(401).json({ 
      error: 'Token noto\'g\'ri yoki muddati tugagan',
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
    });
  }
});

export default router;
