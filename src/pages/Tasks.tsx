import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/Table';
import api from '../lib/api';
import { formatDate } from '../lib/utils';
import { CheckSquare, Clock, AlertCircle, User, Calendar, Plus } from 'lucide-react';

export default function Tasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'MEDIUM',
    dueDate: '',
  });

  useEffect(() => {
    loadTasks();
    loadUsers();
  }, []);

  const loadTasks = async () => {
    try {
      const { data } = await api.get('/tasks');
      setTasks(data);
    } catch (error) {
      console.error('Failed to load tasks');
    }
  };

  const loadUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/tasks', {
        ...form,
        dueDate: form.dueDate ? new Date(form.dueDate) : null,
      });
      setShowModal(false);
      setForm({
        title: '',
        description: '',
        assignedTo: '',
        priority: 'MEDIUM',
        dueDate: '',
      });
      loadTasks();
    } catch (error) {
      alert('Xatolik yuz berdi');
    }
  };

  const updateTaskStatus = async (id: string, status: string) => {
    try {
      await api.put(`/tasks/${id}/status`, { status });
      loadTasks();
    } catch (error) {
      alert('Status yangilanmadi');
    }
  };

  const getPriorityBadge = (priority: string) => {
    const variants: any = {
      LOW: 'info',
      MEDIUM: 'warning',
      HIGH: 'danger',
      URGENT: 'danger',
    };
    return variants[priority] || 'default';
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      TODO: 'info',
      IN_PROGRESS: 'warning',
      COMPLETED: 'success',
      CANCELLED: 'danger',
    };
    return variants[status] || 'default';
  };

  const getPriorityLabel = (priority: string) => {
    const labels: any = {
      LOW: 'Past',
      MEDIUM: 'O\'rta',
      HIGH: 'Yuqori',
      URGENT: 'Shoshilinch',
    };
    return labels[priority] || priority;
  };

  const getStatusLabel = (status: string) => {
    const labels: any = {
      TODO: 'Bajarilmagan',
      IN_PROGRESS: 'Jarayonda',
      COMPLETED: 'Tugallangan',
      CANCELLED: 'Bekor qilingan',
    };
    return labels[status] || status;
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const todoCount = tasks.filter(t => t.status === 'TODO').length;
  const inProgressCount = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const completedCount = tasks.filter(t => t.status === 'COMPLETED').length;
  const overdueCount = tasks.filter(t => 
    t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'COMPLETED'
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Vazifalar</h1>
        <Button onClick={() => setShowModal(true)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Yangi Vazifa
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Bajarilmagan</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-500">{todoCount}</p>
              </div>
              <CheckSquare className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Jarayonda</p>
                <p className="text-xl sm:text-2xl font-bold text-yellow-500">{inProgressCount}</p>
              </div>
              <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Tugallangan</p>
                <p className="text-xl sm:text-2xl font-bold text-green-500">{completedCount}</p>
              </div>
              <CheckSquare className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Muddati O'tgan</p>
                <p className="text-xl sm:text-2xl font-bold text-red-500">{overdueCount}</p>
              </div>
              <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={filter === 'all' ? 'primary' : 'secondary'}
          onClick={() => setFilter('all')}
          size="sm"
          className="text-xs sm:text-sm"
        >
          Barchasi ({tasks.length})
        </Button>
        <Button
          variant={filter === 'TODO' ? 'primary' : 'secondary'}
          onClick={() => setFilter('TODO')}
          size="sm"
          className="text-xs sm:text-sm"
        >
          Bajarilmagan ({todoCount})
        </Button>
        <Button
          variant={filter === 'IN_PROGRESS' ? 'primary' : 'secondary'}
          onClick={() => setFilter('IN_PROGRESS')}
          size="sm"
          className="text-xs sm:text-sm"
        >
          Jarayonda ({inProgressCount})
        </Button>
        <Button
          variant={filter === 'COMPLETED' ? 'primary' : 'secondary'}
          onClick={() => setFilter('COMPLETED')}
          size="sm"
          className="text-xs sm:text-sm"
        >
          Tugallangan ({completedCount})
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vazifalar Ro'yxati</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vazifa</TableHead>
                <TableHead>Mas'ul</TableHead>
                <TableHead>Muhimlik</TableHead>
                <TableHead>Muddat</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Harakatlar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => {
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED';
                return (
                  <TableRow key={task.id} className={isOverdue ? 'bg-red-50 dark:bg-red-950/20' : ''}>
                    <TableCell>
                      <div>
                        <p className="font-semibold">{task.title}</p>
                        {task.description && (
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {task.assignedUser?.name || 'Tayinlanmagan'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPriorityBadge(task.priority)}>
                        {getPriorityLabel(task.priority)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {task.dueDate ? (
                        <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-500' : ''}`}>
                          <Calendar className="w-3 h-3" />
                          {formatDate(task.dueDate)}
                          {isOverdue && <AlertCircle className="w-3 h-3" />}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Muddat yo'q</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadge(task.status)}>
                        {getStatusLabel(task.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {task.status === 'TODO' && (
                          <Button
                            size="sm"
                            onClick={() => updateTaskStatus(task.id, 'IN_PROGRESS')}
                          >
                            Boshlash
                          </Button>
                        )}
                        {task.status === 'IN_PROGRESS' && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => updateTaskStatus(task.id, 'COMPLETED')}
                          >
                            Tugallash
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Yangi Vazifa"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Vazifa Nomi"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />

          <div>
            <label className="text-sm font-medium">Tavsif</label>
            <textarea
              className="w-full px-3 py-2 bg-background border border-border rounded-lg"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Mas'ul Shaxs</label>
            <select
              className="w-full px-3 py-2 bg-background border border-border rounded-lg"
              value={form.assignedTo}
              onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
              required
            >
              <option value="">Foydalanuvchini tanlang</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Muhimlik Darajasi</label>
              <select
                className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option value="LOW">Past</option>
                <option value="MEDIUM">O'rta</option>
                <option value="HIGH">Yuqori</option>
                <option value="URGENT">Shoshilinch</option>
              </select>
            </div>

            <Input
              label="Muddat"
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
          </div>

          <Button type="submit" className="w-full">
            Vazifa Yaratish
          </Button>
        </form>
      </Modal>
    </div>
  );
}