import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.post('/login', async (req, res) => {
  try {
    console.log('📥 Login request body:', req.body);
    const { email, login, password } = req.body;
    
    console.log('📥 Login data:', { email, login, password: password ? '***' : 'missing' });
    
    if ((!email && !login) || !password) {
      console.log('❌ Validation failed:', { hasEmail: !!email, hasLogin: !!login, hasPassword: !!password });
      return res.status(400).json({ error: 'Email/Login va parol kiritilishi shart' });
    }
    
    // Email yoki login orqali foydalanuvchini topish
    let user;
    if (email) {
      console.log('🔍 Searching by email:', email);
      user = await prisma.user.findUnique({ where: { email } });
    } else if (login) {
      console.log('🔍 Searching by login:', login);
      user = await prisma.user.findUnique({ where: { login } });
    }

    if (!user) {
      console.log('❌ User not found in database:', { email, login });
      return res.status(401).json({ error: 'Email/Login yoki parol xato' });
    }
    
    console.log('✅ User found:', user.login || user.email, 'Role:', user.role);

    if (!user.active) {
      console.log('❌ User is not active');
      return res.status(401).json({ error: 'Foydalanuvchi faol emas' });
    }

    const valid = await bcrypt.compare(password, user.password);
    console.log('🔐 Password validation:', valid ? 'SUCCESS' : 'FAILED');
    
    if (!valid) {
      return res.status(401).json({ error: 'Email/Login yoki parol xato' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('❌ CRITICAL: JWT_SECRET is not defined in environment');
      return res.status(500).json({ error: 'Server sozlamalarida xatolik' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log('🎫 Token generated successfully');

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error('❌ Login error:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({ 
      error: 'Server xatosi. Iltimos qaytadan urinib ko\'ring.',
      details: error instanceof Error ? error.message : 'Unknown error'
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
    
    // Kassir login orqali foydalanuvchini topish
    console.log('🔍 Cashier login attempt:', login);
    const user = await prisma.user.findUnique({ where: { login } });

    if (!user) {
      console.log('❌ Cashier user not found in database:', { login });
      return res.status(401).json({ error: 'Login yoki parol xato' });
    }
    
    console.log('✅ Cashier user found:', user.login, 'Role:', user.role);
    
    if (!user.active) {
      console.log('❌ Cashier is not active');
      return res.status(401).json({ error: 'Foydalanuvchi faol emas' });
    }

    // Kassir rollari uchun ruxsat
    const allowedRoles = ['cashier', 'seller'];
    if (!allowedRoles.includes(user.role?.toLowerCase())) {
      console.log('❌ User role is not cashier/seller:', user.role);
      return res.status(403).json({ error: 'Faqat kassirlar uchun' });
    }

    const valid = await bcrypt.compare(password, user.password);
    console.log('🔐 Cashier password validation:', valid ? 'SUCCESS' : 'FAILED');
    
    if (!valid) {
      return res.status(401).json({ error: 'Login yoki parol xato' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('❌ CRITICAL: JWT_SECRET is not defined in environment');
      return res.status(500).json({ error: 'Server sozlamalarida xatolik' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log('🎫 Cashier token generated successfully');

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error('❌ Cashier login error:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({ 
      error: 'Server xatosi. Iltimos qaytadan urinib ko\'ring.',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role, login } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, role, login },
    });

    res.json({ id: user.id, name: user.name, email: user.email, role: user.role, login: user.login });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
    }

    if (!user.active) {
      return res.status(401).json({ error: 'Foydalanuvchi faol emas' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get me error:', error);
    res.status(401).json({ error: 'Token noto\'g\'ri yoki muddati tugagan' });
  }
});

export default router;
