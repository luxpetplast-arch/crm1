import { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent } from '../components/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/Table';
import api from '../lib/api';
import { formatDateTime, formatRelativeTime } from '../lib/dateUtils';
import { DetailedTime } from '../components/TimeStamp';
import { Shield, Search, Clock, Eye } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function AuditLog() {
  const { user: currentUser } = useAuthStore();
  const [logs, setLogs] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<any>(null);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/audit-logs');
      setLogs(data);
    } catch (error) {
      console.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const searchLower = search.toLowerCase();
    return (
      log.action.toLowerCase().includes(searchLower) ||
      log.entity.toLowerCase().includes(searchLower) ||
      log.user.name.toLowerCase().includes(searchLower)
    );
  });

  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Ruxsat yo'q</h2>
          <p className="text-muted-foreground">Faqat administratorlar audit loglarni ko'rishi mumkin</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Audit Log</h1>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Qidirish..."
                  className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Yuklanmoqda...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aniq Vaqt</TableHead>
                  <TableHead>Foydalanuvchi</TableHead>
                  <TableHead>Harakat</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Tafsilotlar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.slice(0, 100).map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="font-mono text-sm">
                            {formatDateTime(log.createdAt)}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatRelativeTime(log.createdAt)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-semibold">{log.user.name}</div>
                        <div className="text-xs text-muted-foreground">{log.user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`font-mono text-xs px-2 py-1 rounded ${
                        log.action.includes('CREATE') ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                        log.action.includes('UPDATE') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                        log.action.includes('DELETE') ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                        'bg-muted'
                      }`}>
                        {log.action}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-semibold">{log.entity}</div>
                        <div className="font-mono text-xs text-muted-foreground">
                          ID: {log.entityId.slice(0, 8)}...
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <Eye className="w-4 h-4" />
                        Ko'rish
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Tafsilotlar Modal */}
      {selectedLog && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedLog(null)}
        >
          <div 
            className="bg-background rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">Audit Log Tafsilotlari</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Foydalanuvchi</p>
                  <p className="font-semibold">{selectedLog.user.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedLog.user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Harakat</p>
                  <p className="font-semibold">{selectedLog.action}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Entity</p>
                  <p className="font-semibold">{selectedLog.entity}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Entity ID</p>
                  <p className="font-mono text-xs">{selectedLog.entityId}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground mb-2">Aniq Vaqt</p>
                <DetailedTime date={selectedLog.createdAt} />
              </div>

              {selectedLog.changes && (
                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground mb-2">O'zgarishlar</p>
                  <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                    {JSON.stringify(JSON.parse(selectedLog.changes), null, 2)}
                  </pre>
                </div>
              )}
            </div>
            <div className="p-6 border-t flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
