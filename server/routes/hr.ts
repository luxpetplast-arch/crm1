import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

// Middleware
router.use(authenticate);

// ============ BO'LIMLAR (DEPARTMENTS) ============

// Barcha bo'limlarni olish
router.get('/departments', async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      where: { active: true },
      include: {
        _count: {
          select: { employees: true, positions: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    res.json(departments);
  } catch (error) {
    console.error('❌ Get departments error:', error);
    res.status(500).json({ error: 'Bo\'limlarni yuklashda xatolik' });
  }
});

// Yangi bo'lim yaratish
router.post('/departments', authorize('ADMIN', 'HR_MANAGER'), async (req: AuthRequest, res) => {
  try {
    const { name, code, description, parentId, managerId } = req.body;
    
    const department = await prisma.department.create({
      data: {
        name,
        code,
        description,
        parentId,
        managerId
      }
    });
    
    res.status(201).json(department);
  } catch (error) {
    console.error('❌ Create department error:', error);
    res.status(500).json({ error: 'Bo\'lim yaratishda xatolik' });
  }
});

// Bo'limni yangilash
router.put('/departments/:id', authorize('ADMIN', 'HR_MANAGER'), async (req: AuthRequest, res) => {
  try {
    const { name, code, description, parentId, managerId, active } = req.body;
    
    const department = await prisma.department.update({
      where: { id: req.params.id },
      data: {
        name,
        code,
        description,
        parentId,
        managerId,
        active
      }
    });
    
    res.json(department);
  } catch (error) {
    console.error('❌ Update department error:', error);
    res.status(500).json({ error: 'Bo\'lim yangilashda xatolik' });
  }
});

// ============ LAVOZIMLAR (POSITIONS) ============

// Barcha lavozimlarni olish
router.get('/positions', async (req, res) => {
  try {
    const { departmentId } = req.query;
    
    const where: any = { active: true };
    if (departmentId) where.departmentId = departmentId;
    
    const positions = await prisma.position.findMany({
      where,
      include: {
        department: true,
        _count: {
          select: { employees: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    res.json(positions);
  } catch (error) {
    console.error('❌ Get positions error:', error);
    res.status(500).json({ error: 'Lavozimlarni yuklashda xatolik' });
  }
});

// Yangi lavozim yaratish
router.post('/positions', authorize('ADMIN', 'HR_MANAGER'), async (req: AuthRequest, res) => {
  try {
    const { name, code, departmentId, description, responsibilities, requirements, salaryRangeMin, salaryRangeMax } = req.body;
    
    const position = await prisma.position.create({
      data: {
        name,
        code,
        departmentId,
        description,
        responsibilities,
        requirements,
        salaryRangeMin,
        salaryRangeMax
      }
    });
    
    res.status(201).json(position);
  } catch (error) {
    console.error('❌ Create position error:', error);
    res.status(500).json({ error: 'Lavozim yaratishda xatolik' });
  }
});

// Lavozimni yangilash
router.put('/positions/:id', authorize('ADMIN', 'HR_MANAGER'), async (req: AuthRequest, res) => {
  try {
    const { name, code, departmentId, description, responsibilities, requirements, salaryRangeMin, salaryRangeMax, active } = req.body;
    
    const position = await prisma.position.update({
      where: { id: req.params.id },
      data: {
        name,
        code,
        departmentId,
        description,
        responsibilities,
        requirements,
        salaryRangeMin,
        salaryRangeMax,
        active
      }
    });
    
    res.json(position);
  } catch (error) {
    console.error('❌ Update position error:', error);
    res.status(500).json({ error: 'Lavozim yangilashda xatolik' });
  }
});

// ============ HODIMLAR (EMPLOYEES) ============

// Barcha hodimlarni olish
router.get('/employees', async (req, res) => {
  try {
    const { departmentId, positionId, status, search } = req.query;
    
    const where: any = { active: true };
    
    if (departmentId) where.departmentId = departmentId;
    if (positionId) where.positionId = positionId;
    if (status) where.status = status;
    
    if (search) {
      where.OR = [
        { fullName: { contains: search as string, mode: 'insensitive' } },
        { employeeCode: { contains: search as string, mode: 'insensitive' } },
        { phone: { contains: search as string } }
      ];
    }
    
    const employees = await prisma.employee.findMany({
      where,
      include: {
        department: true,
        position: true
      },
      orderBy: { fullName: 'asc' }
    });
    
    res.json(employees);
  } catch (error) {
    console.error('❌ Get employees error:', error);
    res.status(500).json({ error: 'Hodimlarni yuklashda xatolik' });
  }
});

// Hodim statistikasini olish
router.get('/employees/stats', async (req, res) => {
  try {
    const totalEmployees = await prisma.employee.count({ where: { active: true } });
    const activeEmployees = await prisma.employee.count({ where: { active: true, status: 'ACTIVE' } });
    const onLeave = await prisma.employee.count({ where: { active: true, status: 'ON_LEAVE' } });
    const probation = await prisma.employee.count({ where: { active: true, status: 'PROBATION' } });
    
    // Bo'limlar bo'yicha
    const byDepartment = await prisma.employee.groupBy({
      by: ['departmentId'],
      where: { active: true },
      _count: { id: true }
    });
    
    const departmentIds = byDepartment.map(d => d.departmentId);
    const departments = await prisma.department.findMany({
      where: { id: { in: departmentIds } }
    });
    
    const byDepartmentWithName = byDepartment.map(d => ({
      ...d,
      departmentName: departments.find(dep => dep.id === d.departmentId)?.name || 'Noma\'lum'
    }));
    
    res.json({
      total: totalEmployees,
      active: activeEmployees,
      onLeave,
      probation,
      byDepartment: byDepartmentWithName
    });
  } catch (error) {
    console.error('❌ Get employee stats error:', error);
    res.status(500).json({ error: 'Statistikani yuklashda xatolik' });
  }
});

// Yangi hodim yaratish
router.post('/employees', authorize('ADMIN', 'HR_MANAGER'), async (req: AuthRequest, res) => {
  try {
    const {
      firstName, lastName, middleName,
      phone, email, address, emergencyContact,
      departmentId, positionId,
      hireDate, employmentType, workSchedule,
      salary, birthDate, education, skills, notes
    } = req.body;
    
    // Hodim kodini avtomatik yaratish
    const lastEmployee = await prisma.employee.findFirst({
      orderBy: { employeeCode: 'desc' }
    });
    
    let newCode = 'EMP001';
    if (lastEmployee) {
      const lastNumber = parseInt(lastEmployee.employeeCode.replace('EMP', ''));
      newCode = `EMP${String(lastNumber + 1).padStart(3, '0')}`;
    }
    
    const fullName = middleName 
      ? `${lastName} ${firstName} ${middleName}`
      : `${lastName} ${firstName}`;
    
    const employee = await prisma.employee.create({
      data: {
        employeeCode: newCode,
        firstName,
        lastName,
        middleName,
        fullName,
        phone,
        email,
        address,
        emergencyContact,
        departmentId,
        positionId,
        hireDate: new Date(hireDate),
        employmentType,
        workSchedule,
        salary,
        birthDate: birthDate ? new Date(birthDate) : null,
        education,
        skills,
        notes,
        status: 'ACTIVE'
      },
      include: {
        department: true,
        position: true
      }
    });
    
    res.status(201).json(employee);
  } catch (error) {
    console.error('❌ Create employee error:', error);
    res.status(500).json({ error: 'Hodim yaratishda xatolik' });
  }
});

// Hodim ma'lumotlarini olish
router.get('/employees/:id', async (req, res) => {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: req.params.id },
      include: {
        department: true,
        position: true,
        attendances: {
          orderBy: { date: 'desc' },
          take: 30
        },
        leaveRequests: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        applications: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });
    
    if (!employee) {
      return res.status(404).json({ error: 'Hodim topilmadi' });
    }
    
    res.json(employee);
  } catch (error) {
    console.error('❌ Get employee error:', error);
    res.status(500).json({ error: 'Hodim ma\'lumotlarini yuklashda xatolik' });
  }
});

// Hodimni yangilash
router.put('/employees/:id', authorize('ADMIN', 'HR_MANAGER'), async (req: AuthRequest, res) => {
  try {
    const {
      firstName, lastName, middleName,
      phone, email, address, emergencyContact,
      departmentId, positionId,
      status, employmentType, workSchedule,
      salary, birthDate, education, skills, notes, photoUrl
    } = req.body;
    
    const fullName = middleName 
      ? `${lastName} ${firstName} ${middleName}`
      : `${lastName} ${firstName}`;
    
    const employee = await prisma.employee.update({
      where: { id: req.params.id },
      data: {
        firstName,
        lastName,
        middleName,
        fullName,
        phone,
        email,
        address,
        emergencyContact,
        departmentId,
        positionId,
        status,
        employmentType,
        workSchedule,
        salary,
        birthDate: birthDate ? new Date(birthDate) : null,
        education,
        skills,
        notes,
        photoUrl
      },
      include: {
        department: true,
        position: true
      }
    });
    
    res.json(employee);
  } catch (error) {
    console.error('❌ Update employee error:', error);
    res.status(500).json({ error: 'Hodim yangilashda xatolik' });
  }
});

// Hodimni ishdan bo'shatish
router.post('/employees/:id/terminate', authorize('ADMIN', 'HR_MANAGER'), async (req: AuthRequest, res) => {
  try {
    const { fireDate, reason } = req.body;
    
    const employee = await prisma.employee.update({
      where: { id: req.params.id },
      data: {
        status: 'FIRED',
        fireDate: new Date(fireDate),
        notes: reason,
        active: false
      }
    });
    
    res.json(employee);
  } catch (error) {
    console.error('❌ Terminate employee error:', error);
    res.status(500).json({ error: 'Hodimni ishdan bo\'shatishda xatolik' });
  }
});

export default router;
