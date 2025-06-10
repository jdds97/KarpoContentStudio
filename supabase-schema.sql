-- Schema para The Content Studio
-- Ejecutar en Supabase SQL Editor

-- 1. Tabla de reservas (bookings)
CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Información personal
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  company VARCHAR(100),
  
  -- Detalles de la reserva
  studio_space VARCHAR(50) NOT NULL,
  package_duration VARCHAR(50) NOT NULL,
  preferred_date DATE NOT NULL,
  preferred_time TIME NOT NULL,
  
  -- Información adicional
  participants INTEGER NOT NULL,
  session_type VARCHAR(50) NOT NULL,
  notes TEXT,
  
  -- Estado de la reserva
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  
  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Índices para consultas eficientes
  CONSTRAINT unique_booking_slot UNIQUE (studio_space, preferred_date, preferred_time)
);

-- 2. Tabla de configuración del estudio
CREATE TABLE studio_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(50) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabla de disponibilidad (opcional)
CREATE TABLE availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  studio_space VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  time_slot TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_availability_slot UNIQUE (studio_space, date, time_slot)
);

-- 4. Insertar configuración inicial
INSERT INTO studio_config (key, value, description) VALUES 
('studio_areas', '["Zona Principal", "Zona Negra", "Ciclorama"]', 'Áreas disponibles del estudio'),
('session_types', '["Sesión de Fotos", "Grabación de Video", "Podcast", "Evento"]', 'Tipos de sesión disponibles'),
('durations', '["2 horas", "4 horas", "6 horas", "8 horas", "Día completo"]', 'Duraciones de paquetes disponibles'),
('participants', '[{"value": "1-2", "label": "1-2 personas"}, {"value": "3-5", "label": "3-5 personas"}, {"value": "6-10", "label": "6-10 personas"}, {"value": "10+", "label": "Más de 10 personas"}]', 'Opciones de participantes');

-- 5. RLS (Row Level Security) policies
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserción de reservas (público)
CREATE POLICY "Allow booking creation" ON bookings
  FOR INSERT TO anon WITH CHECK (true);

-- Política para permitir lectura de configuración (público)
CREATE POLICY "Allow config read" ON studio_config
  FOR SELECT TO anon USING (true);

-- Política para permitir lectura de disponibilidad (público)
CREATE POLICY "Allow availability read" ON availability
  FOR SELECT TO anon USING (true);

-- 6. Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_studio_config_updated_at BEFORE UPDATE ON studio_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Función para verificar disponibilidad
CREATE OR REPLACE FUNCTION check_availability(
  p_studio_space VARCHAR(50),
  p_date DATE,
  p_time TIME
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM bookings 
    WHERE studio_space = p_studio_space 
    AND preferred_date = p_date 
    AND preferred_time = p_time
    AND status IN ('confirmed', 'pending')
  );
END;
$$ LANGUAGE plpgsql;
