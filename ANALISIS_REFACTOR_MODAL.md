# Análisis de Refactorización: BaseModal.tsx - Problemas de Accesibilidad

## Problemas Identificados por SonarQube

1. **Non-interactive elements should not be assigned mouse or keyboard event listeners** (Línea 135)
   - El `div` con `role="dialog"` tiene `onClick` y `onKeyDown`
   - **Impacto**: Accesibilidad - Los elementos no interactivos no deben tener event listeners

2. **Use `<dialog>` instead of the "dialog" role** (Línea 135)
   - Se usa `<div role="dialog">` en lugar del elemento HTML5 nativo `<dialog>`
   - **Impacto**: Accesibilidad - El elemento nativo `<dialog>` proporciona mejor soporte de accesibilidad

3. **Avoid non-native interactive elements** (Línea 152)
   - El `div` interno usa `onClick` para prevenir propagación
   - **Impacto**: Accesibilidad - Debería usar elementos interactivos nativos o agregar soporte completo de accesibilidad

4. **Visible, non-interactive elements with click handlers must have at least one keyboard listener** (Línea 152)
   - El `div` interno tiene `onClick` pero no tiene listener de teclado
   - **Impacto**: Accesibilidad - Falta soporte de teclado

## Análisis de la Solución Recomendada

### Opción 1: Usar `<dialog>` nativo (RECOMENDADO, pero requiere refactorización significativa)

**Ventajas:**
- ✅ Mejora la accesibilidad automáticamente
- ✅ Maneja el backdrop automáticamente
- ✅ API nativo para abrir/cerrar
- ✅ Mejor soporte de lectores de pantalla
- ✅ Manejo nativo del foco (focus trap)

**Desventajas:**
- ❌ Requiere refactorización significativa
- ❌ El drag actual (positioning absoluto) necesita cambios
- ❌ El portal rendering puede necesitar ajustes
- ❌ El elemento `<dialog>` tiene posicionamiento centrado por defecto
- ❌ Necesita polyfill para navegadores antiguos (IE)

**Cambios Necesarios:**
1. Cambiar `<div role="dialog">` por `<dialog>`
2. Usar `dialogRef.current?.showModal()` y `dialogRef.current?.close()` en lugar de `open` prop
3. Refactorizar el sistema de drag:
   - El `<dialog>` no puede usar `position: absolute` fácilmente
   - Necesitaría usar `transform: translate()` o un wrapper
   - O deshabilitar el centrado nativo y usar positioning manual
4. Mantener el portal rendering (el `<dialog>` puede estar en un portal)
5. Manejar el backdrop con `::backdrop` pseudo-elemento
6. Ajustar los event listeners (el dialog maneja Escape automáticamente)

**Estimación de Esfuerzo:** 4-6 horas (refactorización completa)

### Opción 2: Mejorar la accesibilidad del componente actual (SOLUCIÓN PARCIAL)

**Ventajas:**
- ✅ Cambios mínimos al código existente
- ✅ Mantiene la funcionalidad actual (drag, portal)
- ✅ No requiere cambios en componentes que usan BaseModal

**Desventajas:**
- ❌ No resuelve completamente los problemas de SonarQube
- ❌ Sigue usando elementos no nativos
- ❌ Requiere manejo manual de accesibilidad

**Cambios Necesarios:**
1. Convertir el overlay `div` en un `button` o agregar `role="button"` y `tabIndex={0}`
2. Agregar `onKeyDown` al `div` interno si tiene `onClick`
3. Mantener `role="dialog"` pero agregar más atributos ARIA
4. Agregar `aria-labelledby` y `aria-describedby`
5. Mejorar el manejo de foco (focus trap manual)

**Estimación de Esfuerzo:** 1-2 horas (mejoras incrementales)

### Opción 3: Crear dos componentes (RECOMENDADO PARA FUTURO)

**Ventajas:**
- ✅ Mantiene BaseModal actual para casos que necesitan drag avanzado
- ✅ Crea nuevo `AccessibleDialog` usando `<dialog>` nativo
- ✅ Migración gradual de componentes

**Desventajas:**
- ❌ Requiere crear y mantener dos componentes
- ❌ Migración gradual de componentes existentes

**Cambios Necesarios:**
1. Crear nuevo `AccessibleDialog` component usando `<dialog>`
2. Migrar componentes simples primero (ConfirmModal, etc.)
3. Mantener BaseModal para casos complejos
4. Documentar cuándo usar cada uno

**Estimación de Esfuerzo:** 6-8 horas (nuevo componente + migración parcial)

## Recomendación

### A Corto Plazo (Solución Rápida):
**Opción 2**: Mejorar la accesibilidad del componente actual con cambios mínimos. Esto resuelve algunos problemas y mejora la accesibilidad sin romper funcionalidad.

### A Largo Plazo (Solución Completa):
**Opción 3**: Crear un nuevo componente `AccessibleDialog` usando `<dialog>` nativo y migrar gradualmente. Esto proporciona la mejor solución de accesibilidad mientras mantiene la funcionalidad actual.

## Implementación de Opción 2 (Mejoras Incrementales)

### Cambios Específicos:

1. **Overlay (Línea 135-150):**
   ```tsx
   // Cambiar de div a button para overlay click
   <button
     type="button"
     className="fixed inset-0 z-9999 bg-transparent border-0 p-0"
     style={{ zIndex }}
     onClick={(e) => {
       if (e.target === e.currentTarget) {
         onClose();
       }
     }}
     onKeyDown={(e) => {
       if (e.key === 'Escape') {
         onClose();
       }
     }}
     aria-label="Close modal"
   >
     {/* Modal content */}
   </button>
   ```
   
   **O mantener div pero agregar atributos de accesibilidad:**
   ```tsx
   <div
     className="fixed inset-0 z-9999"
     style={{ zIndex }}
     role="dialog"
     aria-modal="true"
     aria-labelledby="modal-title"
     onClick={(e) => {
       if (e.target === e.currentTarget) {
         onClose();
       }
     }}
     onKeyDown={(e) => {
       if (e.key === 'Escape') {
         onClose();
       }
     }}
     tabIndex={-1}
   >
   ```

2. **Modal Content (Línea 152-157):**
   ```tsx
   <div
     ref={modalRef}
     className={containerClass}
     style={classNameOverride ? {} : { left: pos.x, top: pos.y }}
     role="document"
     onClick={(e) => e.stopPropagation()}
     onKeyDown={(e) => e.stopPropagation()} // Agregar para accesibilidad
   >
   ```

3. **Focus Trap:**
   - Agregar hook para manejar el focus trap
   - Enfocar el modal al abrir
   - Retornar focus al elemento anterior al cerrar

## Conclusión

La **Opción 2** es la mejor solución a corto plazo porque:
- Resuelve los problemas de accesibilidad inmediatos
- Mantiene toda la funcionalidad existente (drag, portal)
- Requiere cambios mínimos
- No rompe componentes existentes

La **Opción 3** debería considerarse para el futuro cuando haya tiempo para una refactorización más completa.

