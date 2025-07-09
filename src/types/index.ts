// Tipos centralizados para todo el proyecto

// =============================================================================
// TIPOS BASE
// =============================================================================

export type ID = string;
export type Email = string;
export type Phone = string;
export type URL = string;
export type ISODate = string;
export type Timestamp = string;

// =============================================================================
// MANEJO DE ERRORES
// =============================================================================

export interface BaseError {
  code: string;
  message: string;
  details?: unknown;
  cause?: Error;
  timestamp?: Date;
}

export interface Result<T, E = BaseError> {
  success: boolean;
  data?: T;
  error?: E;
}

export interface ValidationErrorDetails {
  field?: string;
  value?: unknown;
}

export interface ServiceError extends BaseError {
  service: string;
  operation: string;
}

// =============================================================================
// VALIDACIÓN DE FORMULARIOS
// =============================================================================

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface ValidationContext {
  fieldName: string;
  formData: FormData;
  additionalData?: Record<string, unknown>;
}

export interface ValidationRule<T = unknown> {
  validate(value: T, context?: ValidationContext): ValidationResult | Promise<ValidationResult>;
  getMessage(): string;
}

export interface FormValidator {
  addRule(fieldName: string, rule: ValidationRule): void;
  validate(formData: FormData): Promise<ValidationResult>;
  validateField(fieldName: string, value: unknown, context?: ValidationContext): Promise<ValidationResult>;
}

export type ValidatorType = 'required' | 'email' | 'phone' | 'length' | 'pattern' | 'custom';

// =============================================================================
// UI FEEDBACK
// =============================================================================

export enum NotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
  LOADING = 'loading'
}

export interface NotificationConfig {
  duration?: number;
  persistent?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center';
  showCloseButton?: boolean;
}

export interface UIFeedbackManager {
  showSuccess(message: string): void;
  showError(message: string): void;
  showWarning(message: string): void;
  showLoading(message?: string): void;
  hide(): void;
  clear(): void;
}

export interface ButtonStateManager {
  setLoading(loadingText?: string): void;
  resetState(): void;
  disable(): void;
  enable(): void;
  isDisabled(): boolean;
}

export interface NotificationManager {
  show(message: string, type: NotificationType, duration?: number): void;
  hide(): void;
  clear(): void;
}

// =============================================================================
// FORM SUBMISSION
// =============================================================================

export interface SubmissionResult {
  success: boolean;
  data?: unknown;
  error?: string;
  redirectTo?: string;
  validationErrors?: Record<string, string[]>;
}

export interface FormSubmissionHandler {
  submit(formData: FormData): Promise<SubmissionResult>;
  canHandle(formType: string): boolean;
}

export interface FormHandler {
  initialize(): void;
  cleanup?(): void;
}

export interface FormSubmissionStrategy {
  execute(formData: FormData, endpoint: string): Promise<SubmissionResult>;
}

export interface RetryPolicy {
  shouldRetry(attempt: number, error: Error): boolean;
  getDelay(attempt: number): number;
  getMaxAttempts(): number;
}

export type SubmissionMethod = 'fetch' | 'action' | 'xhr';
export type FormType = 'contact' | 'booking' | 'login' | 'admin' | 'generic';

export interface SubmissionConfig {
  method: SubmissionMethod;
  endpoint: string;
  headers?: Record<string, string>;
  timeout?: number;
  retryPolicy?: RetryPolicy;
  validateBeforeSubmit?: boolean;
}

// =============================================================================
// COMPONENT INITIALIZATION
// =============================================================================

export interface ComponentHandler {
  initialize(): void;
  cleanup?(): void;
  isInitialized(): boolean;
}

export interface InitializationStrategy {
  shouldInitialize(): boolean;
  execute(handler: ComponentHandler): void;
}

export interface ComponentConfig {
  name: string;
  selector?: string;
  retryAttempts?: number;
  retryDelay?: number;
  useIdleCallback?: boolean;
  autoCleanup?: boolean;
}

export type ComponentEventType = 'initialized' | 'cleanup' | 'error' | 'retry';

export interface ComponentEvent {
  type: ComponentEventType;
  componentName: string;
  timestamp: Date;
  data?: unknown;
}

// =============================================================================
// BOOKING SYSTEM
// =============================================================================

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed'
}

export interface CreateBookingData {
  name: string;
  email: Email;
  phone: Phone;
  company?: string;
  studio_space: string;
  package_duration: string;
  preferred_date: ISODate;
  preferred_time: string;
  participants: number;
  session_type: string;
  notes?: string;
  discount_code?: string;
  discount_percentage?: number;
  total_price: number;
}

export interface BookingEntity extends CreateBookingData {
  id: ID;
  status: BookingStatus;
  created_at: Timestamp;
  updated_at?: Timestamp;
  confirmed_at?: Timestamp;
  cancelled_at?: Timestamp;
  cancellation_reason?: string;
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

// =============================================================================
// EMAIL SYSTEM
// =============================================================================

export interface EmailData {
  to: Email;
  from?: Email;
  subject: string;
  html: string;
  text?: string;
  attachments?: EmailAttachment[];
  replyTo?: Email;
  cc?: Email[];
  bcc?: Email[];
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

export interface EmailService {
  send(emailData: EmailData): Promise<EmailResult>;
  sendBatch(emails: EmailData[]): Promise<EmailResult[]>;
  validateEmailAddress(email: Email): boolean;
  getDeliveryStatus(messageId: string): Promise<DeliveryStatus>;
}

export interface EmailTemplateService {
  render(templateName: string, data: Record<string, unknown>): Promise<string>;
  registerTemplate(name: string, template: EmailTemplate): void;
  getTemplate(name: string): EmailTemplate | null;
}

// =============================================================================
// AUTHENTICATION & AUTHORIZATION
// =============================================================================

export interface LoginCredentials {
  email: Email;
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
  id: ID;
  email: Email;
  name?: string;
  roles: string[];
  permissions: string[];
}

export interface UserSession {
  id: ID;
  userId: ID;
  email: Email;
  roles: string[];
  permissions: string[];
  expiresAt: Date;
  createdAt: Date;
}

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

// =============================================================================
// DATABASE
// =============================================================================

export interface DatabaseService {
  query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]>;
  queryOne<T = unknown>(sql: string, params?: unknown[]): Promise<T | null>;
  insert<T = unknown>(table: string, data: Partial<T>): Promise<T>;
  update<T = unknown>(table: string, id: ID, data: Partial<T>): Promise<T>;
  delete(table: string, id: ID): Promise<boolean>;
  transaction<T>(callback: (db: DatabaseService) => Promise<T>): Promise<T>;
}

export interface BookingRepository {
  create(booking: CreateBookingData): Promise<BookingEntity>;
  findById(id: ID): Promise<BookingEntity | null>;
  findByEmail(email: Email): Promise<BookingEntity[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<BookingEntity[]>;
  update(id: ID, data: Partial<BookingEntity>): Promise<BookingEntity>;
  delete(id: ID): Promise<boolean>;
  findByStatus(status: BookingStatus): Promise<BookingEntity[]>;
  findConflicts(date: Date, timeSlots: string[], studioSpace?: string): Promise<BookingEntity[]>;
}

// =============================================================================
// CACHE & STORAGE
// =============================================================================

export interface CacheService {
  get<T = unknown>(key: string): Promise<T | null>;
  set<T = unknown>(key: string, value: T, ttl?: number): Promise<boolean>;
  delete(key: string): Promise<boolean>;
  clear(): Promise<boolean>;
  exists(key: string): Promise<boolean>;
  increment(key: string, amount?: number): Promise<number>;
  expire(key: string, ttl: number): Promise<boolean>;
}

// =============================================================================
// LOGGING & MONITORING
// =============================================================================

export interface LogContext {
  userId?: ID;
  requestId?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, unknown>;
  errorCode?: string;
  originalErrorCode?: string;
}

export interface LoggingService {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, error?: Error, context?: LogContext): void;
  critical(message: string, error?: Error, context?: LogContext): void;
}

// =============================================================================
// CONFIGURATION
// =============================================================================

export interface ConfigurationService {
  get<T = unknown>(key: string, defaultValue?: T): T;
  set<T = unknown>(key: string, value: T): void;
  has(key: string): boolean;
  getAll(): Record<string, unknown>;
  reload(): Promise<void>;
}

// =============================================================================
// AVAILABILITY SERVICE
// =============================================================================

export interface AvailabilityService {
  checkAvailability(request: AvailabilityRequest): Promise<AvailabilityResult>;
  getOccupiedSlots(date: Date, studioSpace?: string): Promise<string[]>;
  getBusinessHours(date: Date): Promise<BusinessHours>;
  isBusinessDay(date: Date): Promise<boolean>;
}

// =============================================================================
// NOTIFICATION SYSTEM
// =============================================================================

export interface NotificationData {
  userId: ID;
  title: string;
  message: string;
  type: NotificationType;
  channel: NotificationChannel;
  data?: Record<string, unknown>;
  scheduledFor?: Date;
}

export interface NotificationResult {
  success: boolean;
  notificationId?: string;
  error?: string;
}

export enum NotificationChannel {
  EMAIL = 'email',
  PUSH = 'push',
  SMS = 'sms',
  IN_APP = 'in_app'
}

export interface NotificationService {
  send(notification: NotificationData): Promise<NotificationResult>;
  sendBulk(notifications: NotificationData[]): Promise<NotificationResult[]>;
  subscribe(userId: ID, channel: string): Promise<boolean>;
  unsubscribe(userId: ID, channel: string): Promise<boolean>;
}

// =============================================================================
// CALENDAR SYSTEM
// =============================================================================

export interface CalendarDetail {
  date: string | null;
  time: string | null;
  space: string;
  duration: string;
}

export interface AvailabilityData {
  [date: string]: {
    status: 'available' | 'partial' | 'busy' | 'full';
  };
}

export interface DayDetailsData {
  occupied_slots: string[];
  pending_slots?: string[];
  bookings?: Array<{
    occupied_slots: string[];
    studio_space: string;
  }>;
}

export interface CalendarValidationResult {
  valid: boolean;
  message: string;
}

// =============================================================================
// SERVICE LOCATOR
// =============================================================================

export type ServiceKey = string;
export type ServiceFactory<T = unknown> = () => T;
export type ServiceInstance<T = unknown> = T;

export interface ServiceRegistration<T = unknown> {
  factory: ServiceFactory<T>;
  singleton: boolean;
  instance?: ServiceInstance<T>;
}

export interface IServiceLocator {
  register<T>(key: ServiceKey, factory: ServiceFactory<T>, singleton?: boolean): void;
  registerInstance<T>(key: ServiceKey, instance: T): void;
  get<T>(key: ServiceKey): T;
  has(key: ServiceKey): boolean;
  clear(): void;
  remove(key: ServiceKey): boolean;
}

// =============================================================================
// ERROR CLASSES
// =============================================================================

export class AppError extends Error implements BaseError {
  public readonly timestamp: Date;

  constructor(
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date();
    
    // Mantener el stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class ValidationError extends AppError {
  constructor(
    code: string,
    message: string,
    public readonly field?: string,
    public readonly value?: unknown,
    cause?: Error
  ) {
    super(code, message, { field, value }, cause);
  }
}

export class DatabaseError extends AppError {
  constructor(
    code: string,
    message: string,
    details?: unknown,
    cause?: Error
  ) {
    super(code, message, details, cause);
  }
}

export class EmailError extends AppError {
  constructor(
    code: string,
    message: string,
    details?: unknown,
    cause?: Error
  ) {
    super(code, message, details, cause);
  }
}

export class AuthenticationError extends AppError {
  constructor(
    code: string,
    message: string,
    details?: unknown,
    cause?: Error
  ) {
    super(code, message, details, cause);
  }
}

export class ComponentError extends AppError {
  constructor(
    code: string,
    message: string,
    public readonly componentName: string,
    details?: unknown,
    cause?: Error
  ) {
    const mergedDetails = details && typeof details === 'object' && !Array.isArray(details) 
      ? { componentName, ...details as Record<string, unknown> }
      : { componentName, additionalDetails: details };
    super(code, message, mergedDetails, cause);
  }
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type Nullable<T> = T | null;
export type Maybe<T> = T | undefined;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// =============================================================================
// COMMON PATTERNS
// =============================================================================

export interface Factory<T> {
  create(...args: unknown[]): T;
}

export interface Builder<T> {
  build(): T;
}

export interface Observer<T> {
  update(data: T): void;
}

export interface Command {
  execute(): Promise<void> | void;
  undo?(): Promise<void> | void;
}

export interface Strategy<T, R> {
  execute(input: T): R | Promise<R>;
}

// =============================================================================
// CONSTANTS
// =============================================================================

export const SERVICE_KEYS = {
  DATABASE: 'database',
  BOOKING_REPOSITORY: 'bookingRepository',
  EMAIL: 'email',
  EMAIL_TEMPLATE: 'emailTemplate',
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  CACHE: 'cache',
  LOGGING: 'logging',
  CONFIGURATION: 'configuration',
  AVAILABILITY: 'availability',
  NOTIFICATION: 'notification'
} as const;

export const ERROR_CODES = {
  // Validation
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  REQUIRED_FIELD: 'REQUIRED_FIELD',
  INVALID_EMAIL: 'INVALID_EMAIL',
  INVALID_PHONE: 'INVALID_PHONE',
  
  // Database
  DB_CONNECTION_FAILED: 'DB_CONNECTION_FAILED',
  DB_QUERY_FAILED: 'DB_QUERY_FAILED',
  RECORD_NOT_FOUND: 'RECORD_NOT_FOUND',
  DUPLICATE_RECORD: 'DUPLICATE_RECORD',
  
  // Authentication
  AUTH_FAILED: 'AUTH_FAILED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  
  // Email
  EMAIL_SEND_FAILED: 'EMAIL_SEND_FAILED',
  TEMPLATE_NOT_FOUND: 'TEMPLATE_NOT_FOUND',
  TEMPLATE_RENDER_FAILED: 'TEMPLATE_RENDER_FAILED',
  
  // Component
  COMPONENT_INIT_FAILED: 'COMPONENT_INIT_FAILED',
  ELEMENT_NOT_FOUND: 'ELEMENT_NOT_FOUND',
  
  // Business Logic
  BOOKING_CONFLICT: 'BOOKING_CONFLICT',
  UNAVAILABLE_TIME: 'UNAVAILABLE_TIME',
  INVALID_DISCOUNT_CODE: 'INVALID_DISCOUNT_CODE',
  
  // Network
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  
  // Generic
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  CONFIGURATION_ERROR: 'CONFIGURATION_ERROR'
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];