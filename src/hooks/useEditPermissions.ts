import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { latinToCyrillic } from '../lib/transliterator';

interface AdminApproval {
  id: string;
  cashierId: string;
  cashierName: string;
  saleId: string;
  reason: string;
  changes: any;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  respondedAt?: string;
  respondedBy?: string;
  adminResponse?: string;
}

export function useEditPermissions() {
  const { user } = useAuthStore();
  const [pendingRequests, setPendingRequests] = useState<AdminApproval[]>([]);

  // Check if user can edit without approval
  const canEditDirectly = () => {
    return user?.role === 'ADMIN' || user?.role === 'SELLER';
  };

  // Check if user needs approval for editing
  const needsApproval = () => {
    return user?.role === 'CASHIER';
  };

  // Request admin approval for editing
  const requestEditApproval = async (saleId: string, reason: string, changes: any) => {
    try {
      const approvalData = {
        cashierId: user?.id,
        cashierName: user?.name,
        saleId,
        reason,
        changes,
        status: 'pending' as const
      };

      // Mock API call - real implementation would send to backend
      console.log('🔔 Admin ruxsati so\'ralmoqda:', approvalData);
      
      // Show alert to admin
      const message = `${latinToCyrillic('Admin ga ruxsat so\'rov yuborildi!')}\n${latinToCyrillic('Sabab:')} ${reason}\n${latinToCyrillic('Admin ruxsatini kuting...')}`;
      
      return { success: true, needsApproval: true, message };
    } catch (error) {
      console.error('Ruxsat so\'rovda xatolik:', error);
      return { success: false, needsApproval: true };
    }
  };

  return {
    canEditDirectly,
    needsApproval,
    requestEditApproval,
    pendingRequests
  };
}
