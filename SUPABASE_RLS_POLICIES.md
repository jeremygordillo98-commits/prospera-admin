# SQL COMPLETO - Políticas RLS para Colaboradores en Prospera Pymes
# Ejecutar en Supabase SQL Editor — Proyecto Pymes/Contable
# Cada bloque puede ejecutarse de forma independiente.

## ¿Por qué esto es necesario?
## Las políticas existentes solo dan acceso al DUEÑO (id_usuario = auth.uid()).
## Estas nuevas políticas dan acceso IGUAL al colaborador cuando está asignado
## en la tabla colaboradores_empresa con id_usuario = auth.uid().

-- ============================================================
-- 1. ENTIDADES (clientes, proveedores, empleados)
-- ============================================================
CREATE POLICY "Colaboradores pueden gestionar entidades"
ON entidades FOR ALL TO authenticated
USING (id_empresa IN (
  SELECT id_empresa FROM colaboradores_empresa WHERE id_usuario = auth.uid()
))
WITH CHECK (id_empresa IN (
  SELECT id_empresa FROM colaboradores_empresa WHERE id_usuario = auth.uid()
));

-- ============================================================
-- 2. PLAN_CUENTAS
-- ============================================================
CREATE POLICY "Colaboradores pueden gestionar plan_cuentas"
ON plan_cuentas FOR ALL TO authenticated
USING (id_empresa IN (
  SELECT id_empresa FROM colaboradores_empresa WHERE id_usuario = auth.uid()
))
WITH CHECK (id_empresa IN (
  SELECT id_empresa FROM colaboradores_empresa WHERE id_usuario = auth.uid()
));

-- ============================================================
-- 3. TRANSACCIONES (asientos contables)
-- ============================================================
CREATE POLICY "Colaboradores pueden gestionar transacciones"
ON transacciones FOR ALL TO authenticated
USING (id_empresa IN (
  SELECT id_empresa FROM colaboradores_empresa WHERE id_usuario = auth.uid()
))
WITH CHECK (id_empresa IN (
  SELECT id_empresa FROM colaboradores_empresa WHERE id_usuario = auth.uid()
));

-- ============================================================
-- 4. MOVIMIENTOS (líneas de asientos)
-- ============================================================
CREATE POLICY "Colaboradores pueden gestionar movimientos"
ON movimientos FOR ALL TO authenticated
USING (id_transaccion IN (
  SELECT t.id FROM transacciones t
  WHERE t.id_empresa IN (
    SELECT id_empresa FROM colaboradores_empresa WHERE id_usuario = auth.uid()
  )
))
WITH CHECK (id_transaccion IN (
  SELECT t.id FROM transacciones t
  WHERE t.id_empresa IN (
    SELECT id_empresa FROM colaboradores_empresa WHERE id_usuario = auth.uid()
  )
));

-- ============================================================
-- 5. DOCUMENTOS_SRI (XMLs del SRI)
-- ============================================================
CREATE POLICY "Colaboradores pueden gestionar documentos_sri"
ON documentos_sri FOR ALL TO authenticated
USING (id_empresa IN (
  SELECT id_empresa FROM colaboradores_empresa WHERE id_usuario = auth.uid()
))
WITH CHECK (id_empresa IN (
  SELECT id_empresa FROM colaboradores_empresa WHERE id_usuario = auth.uid()
));

-- ============================================================
-- 6. TESORERIA_DOCUMENTOS (cuentas por cobrar/pagar)
-- ============================================================
CREATE POLICY "Colaboradores pueden gestionar tesoreria_documentos"
ON tesoreria_documentos FOR ALL TO authenticated
USING (id_empresa IN (
  SELECT id_empresa FROM colaboradores_empresa WHERE id_usuario = auth.uid()
))
WITH CHECK (id_empresa IN (
  SELECT id_empresa FROM colaboradores_empresa WHERE id_usuario = auth.uid()
));

-- ============================================================
-- 7. TESORERIA_MOVIMIENTOS (pagos y cobros)
-- ============================================================
CREATE POLICY "Colaboradores pueden gestionar tesoreria_movimientos"
ON tesoreria_movimientos FOR ALL TO authenticated
USING (id_empresa IN (
  SELECT id_empresa FROM colaboradores_empresa WHERE id_usuario = auth.uid()
))
WITH CHECK (id_empresa IN (
  SELECT id_empresa FROM colaboradores_empresa WHERE id_usuario = auth.uid()
));

-- ============================================================
-- 8. CUENTAS_FINANCIERAS (cuentas de banco/caja para tesorería)
-- ============================================================
CREATE POLICY "Colaboradores pueden gestionar cuentas_financieras"
ON cuentas_financieras FOR ALL TO authenticated
USING (id_empresa IN (
  SELECT id_empresa FROM colaboradores_empresa WHERE id_usuario = auth.uid()
))
WITH CHECK (id_empresa IN (
  SELECT id_empresa FROM colaboradores_empresa WHERE id_usuario = auth.uid()
));

-- ============================================================
-- 9. CONFIGURACION_NOTIFICACIONES
-- ============================================================
CREATE POLICY "Colaboradores pueden gestionar config_notif"
ON configuracion_notificaciones FOR ALL TO authenticated
USING (id_empresa IN (
  SELECT id_empresa FROM colaboradores_empresa WHERE id_usuario = auth.uid()
))
WITH CHECK (id_empresa IN (
  SELECT id_empresa FROM colaboradores_empresa WHERE id_usuario = auth.uid()
));

-- ============================================================
-- 10. EMPRESAS_GESTIONADAS - lectura de datos de la empresa
--     (necesario para mostrar nombre, RUC, logo en reportes/PDFs)
-- ============================================================
-- NOTA: Ya agregamos antes "Colaboradores pueden ver empresas asignadas"
-- Si no funciona, ejecuta esto:
-- CREATE POLICY "Colaboradores leen datos empresa"
-- ON empresas_gestionadas FOR SELECT TO authenticated
-- USING (id IN (
--   SELECT id_empresa FROM colaboradores_empresa WHERE id_usuario = auth.uid()
-- ));

-- ============================================================
-- VERIFICACIÓN FINAL
-- Ejecuta esto para ver todas las políticas de una tabla:
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'transacciones';
-- ============================================================
