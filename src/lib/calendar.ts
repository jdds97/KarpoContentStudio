// Calendario para The Content Studio

interface CalendarDetail {
  date: string | null;
  time: string | null;
  space: string;
  duration: string;
}

interface AvailabilityData {
  [date: string]: {
    status: 'available' | 'partial' | 'busy' | 'full';
  };
}

interface DayDetailsData {
  occupied_slots: string[];
  pending_slots?: string[];
  bookings?: Array<{
    occupied_slots: string[];
    studio_space: string;
  }>;
}

interface ValidationResult {
  valid: boolean;
  message: string;
}

class CalendarFinal {
  private currentDate: Date;
  private selectedDate: Date | null;
  private selectedTime: string | null;
  private selectedSpace: string;
  private selectedPackage: string;
  private availabilityData: AvailabilityData;
  private dayDetailsData: DayDetailsData | null;
  private initAttempts: number;
  private readonly maxInitAttempts: number;
  private readonly timeSlots: string[];
  private readonly monthNames: string[];

  constructor() {
    this.currentDate = new Date();
    this.selectedDate = null;
    this.selectedTime = null;
    this.selectedSpace = 'all';
    this.selectedPackage = '';
    this.availabilityData = {};
    this.dayDetailsData = null;
    this.initAttempts = 0;
    this.maxInitAttempts = 10;
    
    this.timeSlots = [
      '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
      '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'
    ];
    
    this.monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    this.init();
  }

  private formatDateLocal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private createLocalDate(year: number, month: number, day: number): Date {
    return new Date(year, month, day);
  }

  private async init(): Promise<void> {
    this.initAttempts++;
    
    if (this.initAttempts > this.maxInitAttempts) {
      return;
    }
    
    const container = document.getElementById('calendar-container');
    if (!container) {
      setTimeout(() => this.init(), 100);
      return;
    }
    
    const requiredElements = [
      'calendar-month-year',
      'calendar-days-grid',
      'prev-month-btn',
      'next-month-btn',
      'studio-space-filter',
      'package-duration-filter'
    ];
    
    const allElementsReady = requiredElements.every(id => {
      const element = document.getElementById(id);
      return element !== null;
    });
    
    if (!allElementsReady) {
      setTimeout(() => this.init(), 100);
      return;
    }
    
    try {
      this.bindEvents();
      this.render();
      await this.loadAvailability();
      
      (window as any).calendarFinal = this;
      
      window.dispatchEvent(new CustomEvent('calendar:initialized', {
        detail: { instance: this }
      }));
      
    } catch (error) {
      setTimeout(() => this.init(), 200);
    }
  }

  private bindEvents(): void {
    const prevBtn = document.getElementById('prev-month-btn');
    const nextBtn = document.getElementById('next-month-btn');
    
    prevBtn?.addEventListener('click', () => {
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
      this.render();
      this.loadAvailability();
    });

    nextBtn?.addEventListener('click', () => {
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
      this.render();
      this.loadAvailability();
    });

    const spaceFilter = document.getElementById('studio-space-filter') as HTMLSelectElement;
    spaceFilter?.addEventListener('change', (e) => {
      const target = e.target as HTMLSelectElement;
      this.selectedSpace = target.value;
      this.updateSpaceInfo();
      
      this.selectedDate = null;
      this.selectedTime = null;
      const timePanel = document.getElementById('time-selection-panel');
      timePanel?.classList.add('hidden');
      
      this.render();
      this.loadAvailability();
      this.syncWithForm();
    });

    const packageFilter = document.getElementById('package-duration-filter') as HTMLSelectElement;
    packageFilter?.addEventListener('change', (e) => {
      const target = e.target as HTMLSelectElement;
      this.selectedPackage = target.value;
      this.updatePackageInfo();
      
      if (this.selectedDate && this.dayDetailsData) {
        this.renderTimeSlots(this.dayDetailsData);
      }
      
      this.selectedTime = null;
      this.updatePackageInfo();
      this.validateTimeSelection();
      this.syncWithForm();
    });
  }

  private render(): void {
    this.renderMonthHeader();
    this.renderCalendarDays();
  }

  private renderMonthHeader(): void {
    const header = document.getElementById('calendar-month-year');
    if (header) {
      header.textContent = `${this.monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
    }
  }

  private renderCalendarDays(): void {
    const grid = document.getElementById('calendar-days-grid');
    if (!grid) return;

    grid.innerHTML = '';

    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = (firstDay.getDay() + 6) % 7;
    
    const prevMonth = new Date(year, month, 0);
    for (let i = startDay - 1; i >= 0; i--) {
      const day = prevMonth.getDate() - i;
      this.createDayElement(grid, day, 'prev-month', this.createLocalDate(year, month - 1, day));
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = this.createLocalDate(year, month, day);
      this.createDayElement(grid, day, 'current-month', date);
    }

    const totalCells = 42;
    const cellsUsed = startDay + lastDay.getDate();
    for (let day = 1; day <= totalCells - cellsUsed; day++) {
      this.createDayElement(grid, day, 'next-month', this.createLocalDate(year, month + 1, day));
    }
  }

  private createDayElement(grid: HTMLElement, day: number, monthType: string, date: Date): void {
    const dayElement = document.createElement('div');
    const dateStr = this.formatDateLocal(date);
    const today = this.formatDateLocal(new Date());
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const isPast = date < todayStart;
    const isToday = dateStr === today;
    
    const availability = this.availabilityData[dateStr];
    let availabilityClass = 'bg-gray-300';
    
    if (isPast) {
      availabilityClass = 'bg-gray-400';
    } else if (availability) {
      switch (availability.status) {
        case 'available': availabilityClass = 'bg-green-400'; break;
        case 'partial': availabilityClass = 'bg-yellow-400'; break;
        case 'busy': availabilityClass = 'bg-orange-400'; break;
        case 'full': availabilityClass = 'bg-red-400'; break;
        default: availabilityClass = 'bg-green-400';
      }
    } else {
      availabilityClass = 'bg-green-400';
    }
    
    dayElement.className = `
      relative p-3 text-center cursor-pointer border-r border-b border-gray-100 
      min-h-[70px] flex flex-col justify-center transition-all duration-200
      ${monthType === 'current-month' ? 'text-gray-900' : 'text-gray-400'}
      ${isPast ? 'bg-gray-50 cursor-not-allowed opacity-60' : 'hover:bg-blue-50'}
      ${isToday ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
      ${this.selectedDate && dateStr === this.formatDateLocal(this.selectedDate) ? 'bg-blue-100 ring-2 ring-blue-600' : ''}
    `;
    
    dayElement.innerHTML = `
      <span class="text-sm font-medium mb-1">${day}</span>
      <div class="availability-dot w-3 h-3 rounded-full mx-auto ${availabilityClass}"></div>
    `;

    if (!isPast && monthType === 'current-month') {
      dayElement.addEventListener('click', () => this.selectDate(date, dayElement));
      const weekday = date.toLocaleDateString('es-ES', { weekday: 'long' });
      dayElement.title = `${weekday}, ${day} de ${this.monthNames[date.getMonth()]}`;
    }

    dayElement.setAttribute('data-date', dateStr);
    grid.appendChild(dayElement);
  }

  private async selectDate(date: Date, element: HTMLElement): Promise<void> {
    const allDays = document.querySelectorAll('[data-date]');
    allDays.forEach(el => {
      el.classList.remove('bg-blue-100', 'ring-2', 'ring-blue-600');
    });

    element.classList.add('bg-blue-100', 'ring-2', 'ring-blue-600');
    
    this.selectedDate = date;
    this.selectedTime = null;
    
    const dateText = document.getElementById('selected-date-text');
    if (dateText) {
      const formattedDate = date.toLocaleDateString('es-ES', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      dateText.textContent = formattedDate;
    }
    
    await this.loadDayDetails(date);
    
    const timePanel = document.getElementById('time-selection-panel');
    if (timePanel) {
      timePanel.classList.remove('hidden');
      timePanel.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'nearest' 
      });
    }
    
    this.syncWithForm();
  }

  private async loadAvailability(): Promise<void> {
    try {
      const loadingIndicator = document.getElementById('loading-indicator');
      loadingIndicator?.classList.remove('hidden');
      
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth() + 1;
      const spaceParam = this.selectedSpace !== 'all' ? `&studio_space=${this.selectedSpace}` : '';
      
      const response = await fetch(`/api/calendar/availability?year=${year}&month=${month}${spaceParam}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      this.availabilityData = data.availability || {};
      this.render();
      
    } catch (error) {
      this.availabilityData = {};
      this.render();
    } finally {
      const loadingIndicator = document.getElementById('loading-indicator');
      loadingIndicator?.classList.add('hidden');
    }
  }

  private async loadDayDetails(date: Date): Promise<void> {
    try {
      const dateStr = date.toISOString().split('T')[0];
      const spaceParam = this.selectedSpace !== 'all' ? `&studio_space=${this.selectedSpace}` : '';
      
      const response = await fetch(`/api/calendar/day-details?date=${dateStr}${spaceParam}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      this.dayDetailsData = data;
      this.renderTimeSlots(data);
      
    } catch (error) {
      this.dayDetailsData = null;
      this.renderFallbackTimeSlots();
    }
  }

  private renderTimeSlots(data: DayDetailsData): void {
    const occupiedSlots = data.occupied_slots || [];
    const availableSlots = this.timeSlots.filter(time => !occupiedSlots.includes(time));
    
    const availableGrid = document.getElementById('available-times-grid');
    const occupiedGrid = document.getElementById('occupied-times-grid');
    const occupiedSection = document.getElementById('occupied-times-section');
    
    if (availableGrid) {
      availableGrid.innerHTML = '';
      availableSlots.forEach(time => {
        this.createTimeSlot(time, availableGrid);
      });
    }
    
    if (occupiedGrid && occupiedSection) {
      occupiedGrid.innerHTML = '';
      
      if (occupiedSlots.length > 0) {
        occupiedSection.classList.remove('hidden');
        occupiedSlots.forEach(time => {
          this.createOccupiedTimeSlot(time, occupiedGrid);
        });
      } else {
        occupiedSection.classList.add('hidden');
      }
    }
  }

  private createOccupiedTimeSlot(time: string, container: HTMLElement): void {
    const slot = document.createElement('div');
    
    slot.className = `
      p-2 text-sm font-medium rounded-lg border 
      bg-red-50 border-red-200 text-red-700 cursor-not-allowed opacity-75
    `;
    
    slot.textContent = time;
    slot.title = `Horario ocupado: ${time}`;
    
    container.appendChild(slot);
  }

  private renderFallbackTimeSlots(): void {
    const availableGrid = document.getElementById('available-times-grid');
    if (availableGrid) {
      availableGrid.innerHTML = '';
      this.timeSlots.forEach(time => {
        this.createTimeSlot(time, availableGrid);
      });
    }
  }

  private createTimeSlot(time: string, container: HTMLElement): void {
    const slot = document.createElement('button');
    const isAvailableForPackage = this.canSelectTimeForPackage(time);
    
    if (isAvailableForPackage) {
      slot.className = `
        p-2 text-sm font-medium rounded-lg border transition-all duration-200
        bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300
        focus:ring-2 focus:ring-green-500 focus:outline-none
      `;
      slot.addEventListener('click', () => this.selectTime(time, slot));
    } else {
      slot.className = `
        p-2 text-sm font-medium rounded-lg border transition-all duration-200
        bg-red-50 border-red-200 text-red-700 cursor-not-allowed opacity-60
      `;
      slot.disabled = true;
      
      const duration = parseInt(this.selectedPackage?.replace('h', '') || '1');
      const startHour = parseInt(time.split(':')[0]);
      const occupiedSlots = this.dayDetailsData?.occupied_slots || [];
      const conflictingSlots: string[] = [];
      
      for (let i = 0; i < duration; i++) {
        const hour = startHour + i;
        const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
        if (occupiedSlots.includes(timeSlot)) {
          conflictingSlots.push(timeSlot);
        }
      }
      
      if (conflictingSlots.length > 0) {
        slot.title = `❌ Conflicto: horas ${conflictingSlots.join(', ')} ya ocupadas`;
      } else if (startHour + duration > 23) {
        slot.title = `❌ El paquete de ${this.selectedPackage} terminaría después del horario de cierre (23:00)`;
      } else {
        slot.title = `❌ No disponible para paquete de ${this.selectedPackage}`;
      }
    }
    
    slot.textContent = time;
    container.appendChild(slot);
  }

  private canSelectTimeForPackage(time: string): boolean {
    if (!this.selectedPackage || !this.dayDetailsData) {
      return true;
    }
    
    const duration = parseInt(this.selectedPackage.replace('h', ''));
    const startHour = parseInt(time.split(':')[0]);
    const occupiedSlots = this.dayDetailsData.occupied_slots || [];
    const pendingSlots = this.dayDetailsData.pending_slots || [];
    const allOccupiedSlots = [...occupiedSlots, ...pendingSlots];
    
    const requiredSlots: string[] = [];
    for (let i = 0; i < duration; i++) {
      const hour = startHour + i;
      if (hour > 22) {
        return false;
      }
      const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
      requiredSlots.push(timeSlot);
    }
    
    const hasConflict = requiredSlots.some(slot => allOccupiedSlots.includes(slot));
    return !hasConflict;
  }

  private selectTime(time: string, element: HTMLButtonElement): void {
    const allTimeSlots = document.querySelectorAll('#available-times-grid button');
    allTimeSlots.forEach(el => {
      el.classList.remove('time-selected', 'ring-2', 'ring-blue-500', 'bg-blue-100');
      el.classList.add('bg-green-50');
    });

    element.classList.add('time-selected', 'ring-2', 'ring-blue-500', 'bg-blue-100');
    element.classList.remove('bg-green-50');
    
    this.selectedTime = time;
    this.updatePackageInfo();
    this.validateTimeSelection();
    this.syncWithForm();
  }

  private updateSpaceInfo(): void {
    const spaceInfo = document.getElementById('space-info');
    const spaceName = document.getElementById('current-space-name');
    
    if (this.selectedSpace !== 'all') {
      const spaceNames: Record<string, string> = {
        'principal': 'Zona Principal',
        'black-zone': 'Zona Negra',
        'cyclorama': 'Ciclorama'
      };
      if (spaceName) {
        spaceName.textContent = spaceNames[this.selectedSpace] || this.selectedSpace;
      }
      spaceInfo?.classList.remove('hidden');
    } else {
      spaceInfo?.classList.add('hidden');
    }
  }

  private updatePackageInfo(): void {
    const packageInfo = document.getElementById('package-info');
    const packageDuration = document.getElementById('current-package-duration');
    const startTime = document.getElementById('selected-start-time');
    const endTime = document.getElementById('calculated-end-time');
    
    if (this.selectedPackage && this.selectedTime) {
      const duration = parseInt(this.selectedPackage.replace('h', ''));
      const startHour = parseInt(this.selectedTime.split(':')[0]);
      const endHour = startHour + duration;
      
      if (packageDuration) packageDuration.textContent = this.selectedPackage;
      if (startTime) startTime.textContent = this.selectedTime;
      if (endTime) endTime.textContent = `${endHour.toString().padStart(2, '0')}:00`;
      
      packageInfo?.classList.remove('hidden');
    } else {
      packageInfo?.classList.add('hidden');
    }
  }

  private validateTimeSelection(): boolean {
    if (!this.selectedTime || !this.selectedPackage) return true;
    
    const duration = parseInt(this.selectedPackage.replace('h', ''));
    const startHour = parseInt(this.selectedTime.split(':')[0]);
    const endHour = startHour + duration;
    
    if (endHour > 23) {
      this.showValidationError(`⚠️ El paquete de ${this.selectedPackage} desde las ${this.selectedTime} terminaría a las ${endHour}:00, pero el estudio cierra a las 23:00. Por favor, elige un horario más temprano o un paquete más corto.`);
      this.resetTimeSelection();
      return false;
    }
    
    if (startHour < 8) {
      this.showValidationError(`⚠️ El estudio abre a las 8:00. No puedes reservar antes de esa hora.`);
      this.resetTimeSelection();
      return false;
    }
    
    const conflictResult = this.validatePackageConflicts();
    if (!conflictResult.valid) {
      this.showValidationError(conflictResult.message);
      this.resetTimeSelection();
      return false;
    }
    
    if (this.selectedSpace === 'all') {
      const spaceAvailabilityResult = this.validateAllSpacesAvailability();
      if (!spaceAvailabilityResult.valid) {
        this.showValidationError(spaceAvailabilityResult.message);
        this.resetTimeSelection();
        return false;
      }
    }
    
    return true;
  }

  private validatePackageConflicts(): ValidationResult {
    if (!this.dayDetailsData) {
      return { valid: true, message: '' };
    }
    
    const duration = parseInt(this.selectedPackage.replace('h', ''));
    const startHour = parseInt(this.selectedTime!.split(':')[0]);
    const occupiedSlots = this.dayDetailsData.occupied_slots || [];
    const pendingSlots = this.dayDetailsData.pending_slots || [];
    const allOccupiedSlots = [...occupiedSlots, ...pendingSlots];
    
    const requiredSlots: string[] = [];
    for (let i = 0; i < duration; i++) {
      const hour = startHour + i;
      const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
      requiredSlots.push(timeSlot);
    }
    
    const conflicts = requiredSlots.filter(slot => allOccupiedSlots.includes(slot));
    
    if (conflicts.length > 0) {
      const conflictTimes = conflicts.join(', ');
      const endTime = `${(startHour + duration).toString().padStart(2, '0')}:00`;
      
      return {
        valid: false,
        message: `❌ Conflicto de horarios detectado:\n\n📦 Paquete solicitado: ${this.selectedPackage} (${this.selectedTime} - ${endTime})\n⚠️ Horas conflictivas: ${conflictTimes}\n\n💡 Estas horas ya están ocupadas por otras reservas. Por favor:\n• Elige un horario más temprano o tardío\n• Selecciona un paquete más corto\n• Considera otro espacio disponible`
      };
    }
    
    return { valid: true, message: '' };
  }

  private validateAllSpacesAvailability(): ValidationResult {
    if (!this.dayDetailsData || this.selectedSpace !== 'all') {
      return { valid: true, message: '' };
    }
    
    const duration = parseInt(this.selectedPackage.replace('h', ''));
    const startHour = parseInt(this.selectedTime!.split(':')[0]);
    const bookings = this.dayDetailsData.bookings || [];
    
    const requiredSlots: string[] = [];
    for (let i = 0; i < duration; i++) {
      const hour = startHour + i;
      const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
      requiredSlots.push(timeSlot);
    }
    
    const occupiedSpacesBySlot: Record<string, string[]> = {};
    
    bookings.forEach(booking => {
      const bookingSlots = booking.occupied_slots || [];
      const space = booking.studio_space;
      
      bookingSlots.forEach(slot => {
        if (!occupiedSpacesBySlot[slot]) {
          occupiedSpacesBySlot[slot] = [];
        }
        if (!occupiedSpacesBySlot[slot].includes(space)) {
          occupiedSpacesBySlot[slot].push(space);
        }
      });
    });
    
    for (const slot of requiredSlots) {
      const occupiedSpaces = occupiedSpacesBySlot[slot] || [];
      if (occupiedSpaces.length > 0) {
        const unavailableSpaces = occupiedSpaces.join(', ');
        return {
          valid: false,
          message: `❌ No se pueden reservar todos los espacios: A las ${slot}, los siguientes espacios ya están ocupados: ${unavailableSpaces}. Para reservar todos los espacios, deben estar completamente libres en todo el período solicitado.`
        };
      }
    }
    
    return { valid: true, message: '' };
  }

  private resetTimeSelection(): void {
    this.selectedTime = null;
    const allTimeSlots = document.querySelectorAll('#available-times-grid button');
    allTimeSlots.forEach(el => {
      el.classList.remove('time-selected', 'ring-2', 'ring-blue-500', 'bg-blue-100');
      el.classList.add('bg-green-50');
    });
    this.updatePackageInfo();
  }

  private showValidationError(message: string): void {
    let errorDiv = document.getElementById('validation-error');
    if (!errorDiv) {
      errorDiv = document.createElement('div');
      errorDiv.id = 'validation-error';
      errorDiv.className = 'mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm';
      
      const timePanel = document.getElementById('time-selection-panel');
      timePanel?.appendChild(errorDiv);
    }
    
    errorDiv.innerHTML = `
      <div class="flex items-start">
        <svg class="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        <div>
          <p class="font-medium">Error de validación</p>
          <p class="mt-1">${message}</p>
        </div>
      </div>
    `;
    
    setTimeout(() => {
      errorDiv?.remove();
    }, 8000);
    
    errorDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  private syncWithForm(): void {
    const dateInput = document.querySelector('input[name="date"]') as HTMLInputElement;
    const timeInput = document.querySelector('input[name="time"]') as HTMLInputElement;
    const spaceSelect = document.querySelector('select[name="studio-space"]') as HTMLSelectElement;
    const packageSelect = document.querySelector('select[name="package"]') as HTMLSelectElement;

    if (dateInput && this.selectedDate) {
      dateInput.value = this.formatDateLocal(this.selectedDate);
      this.highlightFormField(dateInput);
    }

    if (timeInput && this.selectedTime) {
      timeInput.value = this.selectedTime;
      this.highlightFormField(timeInput);
    }

    if (spaceSelect && this.selectedSpace !== 'all') {
      spaceSelect.value = this.selectedSpace;
      this.highlightFormField(spaceSelect);
    }

    if (packageSelect && this.selectedPackage) {
      packageSelect.value = this.selectedPackage;
      this.highlightFormField(packageSelect);
    }

    window.dispatchEvent(new CustomEvent<CalendarDetail>('calendar:selectionChanged', {
      detail: {
        date: this.selectedDate ? this.formatDateLocal(this.selectedDate) : null,
        time: this.selectedTime,
        space: this.selectedSpace,
        duration: this.selectedPackage
      }
    }));
  }

  private highlightFormField(field: HTMLElement): void {
    const element = field as HTMLElement;
    element.style.background = '#dcfce7';
    element.style.borderColor = '#22c55e';
    setTimeout(() => {
      element.style.background = '';
      element.style.borderColor = '';
    }, 1500);
  }
}

// Función de inicialización mejorada
function initCalendarFinal(): void {
  // Verificar si estamos en un entorno de navegador
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  // Check if calendar container exists
  const calendarContainer = document.getElementById('calendar-container');
  if (!calendarContainer) {
    return;
  }

  // Check if already initialized
  if ((window as any).calendarFinal || calendarContainer.hasAttribute('data-calendar-initialized')) {
    return;
  }
  
  try {
    const instance = new CalendarFinal();
    (window as any).calendarFinal = instance;
    calendarContainer.setAttribute('data-calendar-initialized', 'true');
  } catch (error) {
    // Error creating instance
  }
}

// Function to cleanup calendar instance
function cleanupCalendar(): void {
  if (typeof window !== 'undefined') {
    delete (window as any).calendarFinal;
  }
  const calendarContainer = document.getElementById('calendar-container');
  if (calendarContainer) {
    calendarContainer.removeAttribute('data-calendar-initialized');
  }
}

// Auto-initialize with better lifecycle management for Astro
if (typeof document !== 'undefined') {
  // Function to handle initialization
  const handleCalendarInit = () => {
    // Check if calendar container exists
    const calendarContainer = document.getElementById('calendar-container');
    if (!calendarContainer) {
      return;
    }

    // Check if already initialized
    if (calendarContainer.hasAttribute('data-calendar-initialized')) {
      return;
    }
    
    initCalendarFinal();
  };

  // Multiple initialization strategies
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', handleCalendarInit);
  } else {
    handleCalendarInit();
    // Also try with a small delay in case of timing issues
    setTimeout(handleCalendarInit, 100);
  }

  // Handle Astro page transitions
  document.addEventListener('astro:page-load', () => {
    setTimeout(handleCalendarInit, 50);
  });
  
  // Cleanup on page unload for Astro transitions
  document.addEventListener('astro:before-preparation', cleanupCalendar);
}

export { CalendarFinal, initCalendarFinal, cleanupCalendar };