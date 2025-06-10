-- Corregir políticas RLS para permitir inserción pública de reservas
-- Ejecutar en Supabase SQL Editor

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Allow booking creation" ON bookings;
DROP POLICY IF EXISTS "Allow config read" ON studio_config;
DROP POLICY IF EXISTS "Allow availability read" ON availability;

-- Crear políticas más específicas
-- Permitir a usuarios anónimos crear reservas
CREATE POLICY "Enable insert for anon users" ON bookings
    FOR INSERT TO anon WITH CHECK (true);

-- Permitir a usuarios anónimos leer configuración
CREATE POLICY "Enable read for anon users on config" ON studio_config
    FOR SELECT TO anon USING (true);

-- Permitir a usuarios anónimos leer disponibilidad
CREATE POLICY "Enable read for anon users on availability" ON availability
    FOR SELECT TO anon USING (true);

-- Permitir a usuarios autenticados leer todas las reservas
CREATE POLICY "Enable read for authenticated users" ON bookings
    FOR SELECT TO authenticated USING (true);

-- Permitir a usuarios autenticados actualizar reservas
CREATE POLICY "Enable update for authenticated users" ON bookings
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Permitir acceso completo al service role
CREATE POLICY "Enable all for service role" ON bookings
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for service role on config" ON studio_config
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for service role on availability" ON availability
    FOR ALL TO service_role USING (true) WITH CHECK (true);
