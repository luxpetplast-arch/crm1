// Professional Data Loss Prevention (DLP) and Security System

// Data Classification Levels
export enum DataClassification {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  CONFIDENTIAL = 'confidential',
  RESTRICTED = 'restricted',
  CRITICAL = 'critical',
}

// Threat Levels
export enum ThreatLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Action Types
export enum ActionType {
  ALLOW = 'allow',
  BLOCK = 'block',
  QUARANTINE = 'quarantineine',
  LOG = 'log',
  ALERT = 'alert',
  ENCRYPT = 'encrypt',
  REDACT = 'redact',
}

// Data Sensitivity Rules
export interface DataRule {
  id: string;
  name: string;
  description: string;
  classification: DataClassification;
  patterns: RegExp[];
  keywords: string[];
  action: ActionType;
  enabled: boolean;
  priority: number;
}

// Security Event
export interface SecurityEvent {
  id: string;
  timestamp: Date;
  type: 'data_access' | 'data_modification' | 'data_export' | 'data_deletion' | 'security_breach';
  severity: ThreatLevel;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  dataClassification: DataClassification;
  action: ActionType;
  description: string;
  details: Record<string, any>;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
}

// Data Access Log
export interface DataAccessLog {
  id: string;
  timestamp: Date;
  userId: string;
  action: 'read' | 'write' | 'delete' | 'export' | 'import';
  resource: string;
  resourceId: string;
  classification: DataClassification;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  reason?: string;
}

// Backup Verification
export interface BackupVerification {
  backupId: string;
  timestamp: Date;
  status: 'pending' | 'verified' | 'failed';
  checksum: string;
  integrity: 'intact' | 'corrupted' | 'partial';
  location: string;
  verifiedBy: string;
  notes?: string;
}

// Data Integrity Check
export interface DataIntegrityCheck {
  id: string;
  timestamp: Date;
  table: string;
  recordCount: number;
  checksum: string;
  status: 'passed' | 'failed' | 'warning';
  issues: string[];
  checkedBy: string;
}

// DLP Configuration
export interface DLPConfig {
  enableRealTimeMonitoring: boolean;
  enableDataClassification: boolean;
  enableBackupVerification: boolean;
  enableIntegrityChecks: boolean;
  enableAccessLogging: boolean;
  enableEncryption: boolean;
  retentionDays: number;
  alertThresholds: {
    failedLogins: number;
    dataExports: number;
    suspiciousActivity: number;
  };
  encryptionKey: string;
  backupLocations: string[];
}

// Professional Data Loss Prevention Manager
export class ProfessionalDataLossPreventionManager {
  private static instance: ProfessionalDataLossPreventionManager;
  private config: DLPConfig;
  private rules: Map<string, DataRule> = new Map();
  private securityEvents: SecurityEvent[] = [];
  private accessLogs: DataAccessLog[] = [];
  private backupVerifications: BackupVerification[] = [];
  private integrityChecks: DataIntegrityCheck[] = [];
  private isMonitoring = false;

  constructor(config: DLPConfig) {
    this.config = config;
    this.initializeDefaultRules();
    this.loadSecurityData();
  }

  static getInstance(config?: DLPConfig): ProfessionalDataLossPreventionManager {
    if (!ProfessionalDataLossPreventionManager.instance) {
      if (!config) {
        throw new Error('DLP config required for first initialization');
      }
      ProfessionalDataLossPreventionManager.instance = new ProfessionalDataLossPreventionManager(config);
    }
    return ProfessionalDataLossPreventionManager.instance;
  }

  // Initialize default DLP rules
  private initializeDefaultRules(): void {
    const defaultRules: DataRule[] = [
      {
        id: 'credit_card_numbers',
        name: 'Credit Card Numbers',
        description: 'Detect and protect credit card numbers',
        classification: DataClassification.CRITICAL,
        patterns: [
          /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3[0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\b/g,
        ],
        keywords: ['credit card', 'card number', 'cvv', 'expiry'],
        action: ActionType.ENCRYPT,
        enabled: true,
        priority: 1,
      },
      {
        id: 'personal_identification',
        name: 'Personal Identification Numbers',
        description: 'Detect and protect personal identification',
        classification: DataClassification.RESTRICTED,
        patterns: [
          /\b\d{4}-\d{4}-\d{4}-\d{4}\b/g, // UUID-like
          /\b\d{2}-\d{2}-\d{4}\b/g, // Date-like
        ],
        keywords: ['passport', 'id number', 'social security', 'personal id'],
        action: ActionType.REDACT,
        enabled: true,
        priority: 2,
      },
      {
        id: 'financial_data',
        name: 'Financial Information',
        description: 'Detect and protect financial data',
        classification: DataClassification.CONFIDENTIAL,
        patterns: [
          /\b\$?\s?\d{1,3}(?:,\d{3})*(?:\.\d{2})?\b/g, // Currency
          /\b\d{1,3}(?:\s?\d{3})*(?:\.\d{2})?\s?(?:UZS|USD|EUR|RUB)\b/g, // Currency with codes
        ],
        keywords: ['salary', 'income', 'revenue', 'profit', 'debt', 'credit'],
        action: ActionType.ENCRYPT,
        enabled: true,
        priority: 3,
      },
      {
        id: 'contact_information',
        name: 'Contact Information',
        description: 'Detect and protect contact information',
        classification: DataClassification.INTERNAL,
        patterns: [
          /\b\+998\d{9}\b/g, // Uzbek phone numbers
          /\b\d{3}-\d{3}-\d{4}\b/g, // US phone numbers
          /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email addresses
        ],
        keywords: ['phone', 'email', 'address', 'contact'],
        action: ActionType.LOG,
        enabled: true,
        priority: 4,
      },
    ];

    defaultRules.forEach(rule => {
      this.rules.set(rule.id, rule);
    });
  }

  // Load security data from storage
  private loadSecurityData(): void {
    try {
      const events = localStorage.getItem('security_events');
      if (events) {
        this.securityEvents = JSON.parse(events).map((e: SecurityEvent) => ({
          ...e,
          timestamp: new Date(e.timestamp),
          resolvedAt: e.resolvedAt ? new Date(e.resolvedAt) : undefined,
        }));
      }

      const logs = localStorage.getItem('access_logs');
      if (logs) {
        this.accessLogs = JSON.parse(logs).map((log: DataAccessLog) => ({
          ...log,
          timestamp: new Date(log.timestamp),
        }));
      }

      const verifications = localStorage.getItem('backup_verifications');
      if (verifications) {
        this.backupVerifications = JSON.parse(verifications).map((bv: BackupVerification) => ({
          ...bv,
          timestamp: new Date(bv.timestamp),
        }));
      }

      const checks = localStorage.getItem('integrity_checks');
      if (checks) {
        this.integrityChecks = JSON.parse(checks).map((ic: DataIntegrityCheck) => ({
          ...ic,
          timestamp: new Date(ic.timestamp),
        }));
      }
    } catch (error) {
      console.error('Failed to load security data:', error);
    }
  }

  // Save security data to storage
  private saveSecurityData(): void {
    try {
      localStorage.setItem('security_events', JSON.stringify(this.securityEvents));
      localStorage.setItem('access_logs', JSON.stringify(this.accessLogs));
      localStorage.setItem('backup_verifications', JSON.stringify(this.backupVerifications));
      localStorage.setItem('integrity_checks', JSON.stringify(this.integrityChecks));
    } catch (error) {
      console.error('Failed to save security data:', error);
    }
  }

  // Start monitoring
  startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    console.log('DLP monitoring started');
    
    // Start real-time monitoring
    this.startRealTimeMonitoring();
    
    // Start periodic checks
    this.startPeriodicChecks();
  }

  // Stop monitoring
  stopMonitoring(): void {
    this.isMonitoring = false;
    console.log('DLP monitoring stopped');
  }

  // Start real-time monitoring
  private startRealTimeMonitoring(): void {
    if (!this.config.enableRealTimeMonitoring) return;
    
    // Simulate real-time monitoring
    setInterval(() => {
      if (this.isMonitoring) {
        this.performSecurityCheck();
      }
    }, 30000); // Every 30 seconds
  }

  // Start periodic checks
  private startPeriodicChecks(): void {
    // Backup verification every 6 hours
    if (this.config.enableBackupVerification) {
      setInterval(() => {
        if (this.isMonitoring) {
          this.verifyBackupIntegrity();
        }
      }, 6 * 60 * 60 * 1000);
    }

    // Data integrity check every hour
    if (this.config.enableIntegrityChecks) {
      setInterval(() => {
        if (this.isMonitoring) {
          this.performDataIntegrityCheck();
        }
      }, 60 * 60 * 1000);
    }

    // Cleanup old logs daily
    setInterval(() => {
      if (this.isMonitoring) {
        this.cleanupOldLogs();
      }
    }, 24 * 60 * 60 * 1000);
  }

  // Perform security check
  private performSecurityCheck(): void {
    // Simulate security monitoring
    const suspiciousActivity = Math.random() > 0.95; // 5% chance
    
    if (suspiciousActivity) {
      this.createSecurityEvent({
        type: 'security_breach',
        severity: ThreatLevel.HIGH,
        description: 'Suspicious activity detected',
        details: {
          activity: 'multiple_failed_logins',
          count: Math.floor(Math.random() * 10) + 5,
          timeWindow: '5_minutes'
        }
      });
    }
  }

  // Scan data for sensitive information
  scanData(data: string, userId?: string): {
    classification: DataClassification;
    matches: Array<{
      rule: DataRule;
      matches: string[];
      action: ActionType;
    }>;
    recommendation: ActionType;
  } {
    let maxClassification = DataClassification.PUBLIC;
    const matches: Array<{
      rule: DataRule;
      matches: string[];
      action: ActionType;
    }> = [];

    // Check against all enabled rules
    for (const rule of this.rules.values()) {
      if (!rule.enabled) continue;

      const foundMatches: string[] = [];

      // Check patterns
      for (const pattern of rule.patterns) {
        const patternMatches = data.match(pattern);
        if (patternMatches) {
          foundMatches.push(...patternMatches);
        }
      }

      // Check keywords
      for (const keyword of rule.keywords) {
        if (data.toLowerCase().includes(keyword.toLowerCase())) {
          foundMatches.push(keyword);
        }
      }

      if (foundMatches.length > 0) {
        matches.push({
          rule,
          matches: foundMatches,
          action: rule.action,
        });

        // Update classification based on rule priority
        if (rule.classification > maxClassification) {
          maxClassification = rule.classification;
        }
      }
    }

    // Determine recommendation based on highest classification
    let recommendation = ActionType.ALLOW;
    if (maxClassification >= DataClassification.CRITICAL) {
      recommendation = ActionType.BLOCK;
    } else if (maxClassification >= DataClassification.RESTRICTED) {
      recommendation = ActionType.ENCRYPT;
    } else if (maxClassification >= DataClassification.CONFIDENTIAL) {
      recommendation = ActionType.LOG;
    }

    // Log the scan
    if (this.config.enableAccessLogging) {
      this.logAccess({
        userId: userId || 'system',
        action: 'read',
        resource: 'data_scan',
        resourceId: 'scan_result',
        classification: maxClassification,
        ipAddress: 'localhost',
        userAgent: 'DLP Scanner',
        success: true,
        reason: `Found ${matches.length} sensitive data patterns`
      });
    }

    return {
      classification: maxClassification,
      matches,
      recommendation
    };
  }

  // Process data based on DLP rules
  processData(data: string, userId?: string): {
    processed: string;
    actions: ActionType[];
    warnings: string[];
  } {
    const scanResult = this.scanData(data, userId);
    const actions: ActionType[] = [];
    const warnings: string[] = [];
    let processed = data;

    for (const match of scanResult.matches) {
      actions.push(match.action);
      
      switch (match.action) {
        case ActionType.ENCRYPT:
          warnings.push(`Sensitive data encrypted: ${match.rule.name}`);
          processed = this.encryptData(processed);
          break;
        case ActionType.REDACT:
          warnings.push(`Sensitive data redacted: ${match.rule.name}`);
          processed = this.redactData(processed, match.matches);
          break;
        case ActionType.BLOCK:
          warnings.push(`Data blocked due to: ${match.rule.name}`);
          processed = '[DATA BLOCKED - SENSITIVE INFORMATION DETECTED]';
          break;
        case ActionType.LOG:
          warnings.push(`Sensitive data logged: ${match.rule.name}`);
          break;
        case ActionType.ALERT:
          warnings.push(`ALERT: ${match.rule.name} detected`);
          this.createSecurityEvent({
            type: 'data_access',
            severity: ThreatLevel.MEDIUM,
            description: `Sensitive data access: ${match.rule.name}`,
            details: {
              ruleId: match.rule.id,
              matches: match.matches,
              userId
            }
          });
          break;
      }
    }

    return {
      processed,
      actions,
      warnings
    };
  }

  // Encrypt data
  private encryptData(data: string): string {
    // Simplified encryption
    return Buffer.from(data).toString('base64');
  }

  // Redact data
  private redactData(data: string, matches: string[]): string {
    let redacted = data;
    for (const match of matches) {
      const regex = new RegExp(match.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      redacted = redacted.replace(regex, '[REDACTED]');
    }
    return redacted;
  }

  // Log access
  logAccess(log: Omit<DataAccessLog, 'id' | 'timestamp'>): void {
    const accessLog: DataAccessLog = {
      ...log,
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };

    this.accessLogs.push(accessLog);
    this.saveSecurityData();
  }

  // Create security event
  createSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp' | 'resolved'>): void {
    const securityEvent: SecurityEvent = {
      ...event,
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      resolved: false,
    };

    this.securityEvents.push(securityEvent);
    this.saveSecurityData();

    console.warn(`Security Event: ${event.description}`, event);
  }

  // Verify backup integrity
  async verifyBackupIntegrity(): Promise<void> {
    console.log('Verifying backup integrity...');
    
    // Simulate backup verification
    const backupId = `backup_${Date.now()}`;
    const verification: BackupVerification = {
      backupId,
      timestamp: new Date(),
      status: 'verified',
      checksum: this.generateChecksum('mock_backup_data'),
      integrity: 'intact',
      location: '/backups/latest',
      verifiedBy: 'DLP System'
    };

    this.backupVerifications.push(verification);
    this.saveSecurityData();
  }

  // Perform data integrity check
  async performDataIntegrityCheck(): Promise<void> {
    console.log('Performing data integrity check...');
    
    const tables = ['users', 'sales', 'products', 'customers'];
    
    for (const table of tables) {
      const check: DataIntegrityCheck = {
        id: `check_${Date.now()}_${table}`,
        timestamp: new Date(),
        table,
        recordCount: Math.floor(Math.random() * 10000) + 1000,
        checksum: this.generateChecksum(`mock_data_${table}`),
        status: Math.random() > 0.1 ? 'passed' : 'warning',
        issues: Math.random() > 0.9 ? ['Minor inconsistencies detected'] : [],
        checkedBy: 'DLP System'
      };

      this.integrityChecks.push(check);
      
      if (check.status === 'warning') {
        this.createSecurityEvent({
          type: 'data_modification',
          severity: ThreatLevel.MEDIUM,
          description: `Data integrity issues detected in ${table}`,
          details: {
            table,
            issues: check.issues,
            checksum: check.checksum
          }
        });
      }
    }

    this.saveSecurityData();
  }

  // Generate checksum
  private generateChecksum(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }

  // Cleanup old logs
  private cleanupOldLogs(): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);

    this.securityEvents = this.securityEvents.filter(event => event.timestamp > cutoffDate);
    this.accessLogs = this.accessLogs.filter(log => log.timestamp > cutoffDate);
    this.backupVerifications = this.backupVerifications.filter(bv => bv.timestamp > cutoffDate);
    this.integrityChecks = this.integrityChecks.filter(ic => ic.timestamp > cutoffDate);

    this.saveSecurityData();
  }

  // Get security dashboard data
  getSecurityDashboard(): {
    threatLevel: ThreatLevel;
    activeEvents: number;
    recentEvents: SecurityEvent[];
    accessLogs: DataAccessLog[];
    backupStatus: 'healthy' | 'warning' | 'critical';
    integrityStatus: 'healthy' | 'warning' | 'critical';
    dataClassification: Record<DataClassification, number>;
  } {
    const activeEvents = this.securityEvents.filter(event => !event.resolved);
    const recentEvents = this.securityEvents
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);
    
    const recentLogs = this.accessLogs
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 100);

    // Calculate threat level
    let threatLevel = ThreatLevel.LOW;
    if (activeEvents.some(e => e.severity === ThreatLevel.CRITICAL)) {
      threatLevel = ThreatLevel.CRITICAL;
    } else if (activeEvents.some(e => e.severity === ThreatLevel.HIGH)) {
      threatLevel = ThreatLevel.HIGH;
    } else if (activeEvents.some(e => e.severity === ThreatLevel.MEDIUM)) {
      threatLevel = ThreatLevel.MEDIUM;
    }

    // Calculate backup status
    const recentBackups = this.backupVerifications
      .filter(bv => bv.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000));
    
    const backupStatus = recentBackups.every(bv => bv.status === 'verified' && bv.integrity === 'intact') 
      ? 'healthy' : recentBackups.some(bv => bv.integrity === 'corrupted') 
      ? 'critical' : 'warning';

    // Calculate integrity status
    const recentChecks = this.integrityChecks
      .filter(ic => ic.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000));
    
    const integrityStatus = recentChecks.every(ic => ic.status === 'passed') 
      ? 'healthy' : recentChecks.some(ic => ic.status === 'failed') 
      ? 'critical' : 'warning';

    // Calculate data classification
    const dataClassification: Record<DataClassification, number> = {
      [DataClassification.PUBLIC]: 0,
      [DataClassification.INTERNAL]: 0,
      [DataClassification.CONFIDENTIAL]: 0,
      [DataClassification.RESTRICTED]: 0,
      [DataClassification.CRITICAL]: 0,
    };

    for (const log of recentLogs) {
      dataClassification[log.classification]++;
    }

    return {
      threatLevel,
      activeEvents: activeEvents.length,
      recentEvents,
      accessLogs: recentLogs,
      backupStatus,
      integrityStatus,
      dataClassification,
    };
  }

  // Resolve security event
  resolveSecurityEvent(eventId: string, resolvedBy: string): void {
    const event = this.securityEvents.find(e => e.id === eventId);
    if (event) {
      event.resolved = true;
      event.resolvedAt = new Date();
      event.resolvedBy = resolvedBy;
      this.saveSecurityData();
    }
  }

  // Add custom rule
  addRule(rule: DataRule): void {
    this.rules.set(rule.id, rule);
    this.saveSecurityData();
  }

  // Remove rule
  removeRule(ruleId: string): void {
    this.rules.delete(ruleId);
    this.saveSecurityData();
  }

  // Get all rules
  getRules(): DataRule[] {
    return Array.from(this.rules.values());
  }

  // Get security events
  getSecurityEvents(resolved?: boolean): SecurityEvent[] {
    return this.securityEvents
      .filter(event => resolved === undefined || event.resolved === resolved)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Get access logs
  getAccessLogs(userId?: string): DataAccessLog[] {
    return this.accessLogs
      .filter(log => userId === undefined || log.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Get backup verifications
  getBackupVerifications(): BackupVerification[] {
    return this.backupVerifications
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Get integrity checks
  getIntegrityChecks(): DataIntegrityCheck[] {
    return this.integrityChecks
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Test DLP system
  async testDLPSystem(): Promise<{
    classificationTest: boolean;
    encryptionTest: boolean;
    loggingTest: boolean;
    monitoringTest: boolean;
  }> {
    console.log('Testing DLP system...');
    
    const results = {
      classificationTest: false,
      encryptionTest: false,
      loggingTest: false,
      monitoringTest: false,
    };

    try {
      // Test data classification
      const testData = 'Credit card: 4111-1111-1111-1111, Email: test@example.com, Phone: +998901234567';
      const scanResult = this.scanData(testData);
      results.classificationTest = scanResult.classification > DataClassification.PUBLIC;
      
      // Test encryption
      const processedData = this.processData(testData);
      results.encryptionTest = processedData.processed !== testData;
      
      // Test logging
      this.logAccess({
        userId: 'test_user',
        action: 'read',
        resource: 'test',
        resourceId: 'test_id',
        classification: DataClassification.INTERNAL,
        ipAddress: '127.0.0.1',
        userAgent: 'Test Agent',
        success: true,
        reason: 'Test logging'
      });
      results.loggingTest = true;
      
      // Test monitoring
      results.monitoringTest = this.isMonitoring;
      
    } catch (error) {
      console.error('DLP system test failed:', error);
    }

    return results;
  }
}

// Create singleton instance
export const dlpManager = ProfessionalDataLossPreventionManager.getInstance;

// Convenience functions
export const scanData = (data: string, userId?: string) => {
  const manager = ProfessionalDataLossPreventionManager.getInstance();
  return manager.scanData(data, userId);
};

export const processData = (data: string, userId?: string) => {
  const manager = ProfessionalDataLossPreventionManager.getInstance();
  return manager.processData(data, userId);
};

export const getSecurityDashboard = () => {
  const manager = ProfessionalDataLossPreventionManager.getInstance();
  return manager.getSecurityDashboard();
};

export default ProfessionalDataLossPreventionManager;
