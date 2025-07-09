// Service Interfaces - Dependency Inversion Principle
// Abstracciones para servicios externos

// Interfaces para servicios de base de datos
export interface DatabaseService {
  query<T = any>(sql: string, params?: any[]): Promise<T[]>;
  queryOne<T = any>(sql: string, params?: any[]): Promise<T | null>;
  insert<T = any>(table: string, data: Partial<T>): Promise<T>;
  update<T = any>(table: string, id: string | number, data: Partial<T>): Promise<T>;
  delete(table: string, id: string | number): Promise<boolean>;
  transaction<T>(callback: (db: DatabaseService) => Promise<T>): Promise<T>;
}

export interface BookingRepository {
  create(booking: CreateBookingData): Promise<BookingEntity>;
  findById(id: string): Promise<BookingEntity | null>;
  findByEmail(email: string): Promise<BookingEntity[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<BookingEntity[]>;
  update(id: string, data: Partial<BookingEntity>): Promise<BookingEntity>;
  delete(id: string): Promise<boolean>;
  findByStatus(status: BookingStatus): Promise<BookingEntity[]>;
  findConflicts(date: Date, timeSlots: string[], studioSpace?: string): Promise<BookingEntity[]>;
}

// Interfaces para servicios de email
export interface EmailService {
  send(emailData: EmailData): Promise<EmailResult>;
  sendBatch(emails: EmailData[]): Promise<EmailResult[]>;
  validateEmailAddress(email: string): boolean;
  getDeliveryStatus(messageId: string): Promise<DeliveryStatus>;
}

export interface EmailTemplateService {
  render(templateName: string, data: Record<string, any>): Promise<string>;
  registerTemplate(name: string, template: EmailTemplate): void;
  getTemplate(name: string): EmailTemplate | null;
}

// Interfaces para servicios de autenticación
export interface AuthenticationService {
  authenticate(credentials: LoginCredentials): Promise<AuthResult>;
  validateToken(token: string): Promise<UserSession | null>;
  refreshToken(refreshToken: string): Promise<AuthResult>;
  logout(token: string): Promise<boolean>;
  createSession(user: UserData): Promise<UserSession>;
}

export interface AuthorizationService {
  hasPermission(user: UserSession, permission: string): boolean;
  hasRole(user: UserSession, role: string): boolean;
  canAccessResource(user: UserSession, resource: string, action: string): boolean;
}

// Interfaces para servicios de cache
export interface CacheService {
  get<T = any>(key: string): Promise<T | null>;
  set<T = any>(key: string, value: T, ttl?: number): Promise<boolean>;
  delete(key: string): Promise<boolean>;
  clear(): Promise<boolean>;
  exists(key: string): Promise<boolean>;
  increment(key: string, amount?: number): Promise<number>;
  expire(key: string, ttl: number): Promise<boolean>;
}

// Interfaces para servicios de logging
export interface LoggingService {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, error?: Error, context?: LogContext): void;
  critical(message: string, error?: Error, context?: LogContext): void;
}

// Interfaces para servicios de configuración
export interface ConfigurationService {
  get<T = any>(key: string, defaultValue?: T): T;
  set<T = any>(key: string, value: T): void;
  has(key: string): boolean;
  getAll(): Record<string, any>;
  reload(): Promise<void>;
}

// Interfaces para servicios de validación
export interface AvailabilityService {
  checkAvailability(request: AvailabilityRequest): Promise<AvailabilityResult>;
  getOccupiedSlots(date: Date, studioSpace?: string): Promise<string[]>;
  getBusinessHours(date: Date): Promise<BusinessHours>;
  isBusinessDay(date: Date): Promise<boolean>;
}

export interface NotificationService {
  send(notification: NotificationData): Promise<NotificationResult>;
  sendBulk(notifications: NotificationData[]): Promise<NotificationResult[]>;
  subscribe(userId: string, channel: string): Promise<boolean>;
  unsubscribe(userId: string, channel: string): Promise<boolean>;
}

// Tipos y entidades
export interface CreateBookingData {
  name: string;
  email: string;
  phone: string;
  company?: string;
  studio_space: string;
  package_duration: string;
  preferred_date: string;
  preferred_time: string;
  participants: number;
  session_type: string;
  notes?: string;
  discount_code?: string;
  discount_percentage?: number;
  total_price: number;
}

export interface BookingEntity extends CreateBookingData {
  id: string;
  status: BookingStatus;
  created_at: string;
  updated_at?: string;
  confirmed_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed'
}

export interface EmailData {
  to: string;
  from?: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: EmailAttachment[];
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface EmailTemplate {
  name: string;
  subject: string;
  html: string;
  text?: string;
  variables: string[];
}

export interface EmailAttachment {
  filename: string;
  content: string | Buffer;
  contentType?: string;
}

export enum DeliveryStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  BOUNCED = 'bounced',
  FAILED = 'failed',
  PENDING = 'pending'
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  user?: UserData;
  token?: string;
  refreshToken?: string;
  expiresAt?: Date;
  error?: string;
}

export interface UserData {
  id: string;
  email: string;
  name?: string;
  roles: string[];
  permissions: string[];
}

export interface UserSession {
  id: string;
  userId: string;
  email: string;
  roles: string[];
  permissions: string[];
  expiresAt: Date;
  createdAt: Date;
}

export interface LogContext {
  userId?: string;
  requestId?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export interface AvailabilityRequest {
  date: Date;
  timeSlot: string;
  duration: number;
  studioSpace?: string;
  excludeBookingId?: string;
}

export interface AvailabilityResult {
  available: boolean;
  reason?: string;
  conflicts?: string[];
  suggestedTimes?: string[];
}

export interface BusinessHours {
  openTime: string;
  closeTime: string;
  isOpen: boolean;
  breaks?: { start: string; end: string }[];
}

export interface NotificationData {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  channel: NotificationChannel;
  data?: Record<string, any>;
  scheduledFor?: Date;
}

export interface NotificationResult {
  success: boolean;
  notificationId?: string;
  error?: string;
}

export enum NotificationType {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  SUCCESS = 'success'
}

export enum NotificationChannel {
  EMAIL = 'email',
  PUSH = 'push',
  SMS = 'sms',
  IN_APP = 'in_app'
}

// Interfaces para errores tipados
export interface ServiceError {
  code: string;
  message: string;
  details?: any;
  cause?: Error;
}

export class DatabaseError extends Error implements ServiceError {
  constructor(
    public code: string,
    message: string,
    public details?: any,
    public cause?: Error
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class EmailError extends Error implements ServiceError {
  constructor(
    public code: string,
    message: string,
    public details?: any,
    public cause?: Error
  ) {
    super(message);
    this.name = 'EmailError';
  }
}

export class AuthenticationError extends Error implements ServiceError {
  constructor(
    public code: string,
    message: string,
    public details?: any,
    public cause?: Error
  ) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class ValidationError extends Error implements ServiceError {
  constructor(
    public code: string,
    message: string,
    public details?: any,
    public cause?: Error
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}