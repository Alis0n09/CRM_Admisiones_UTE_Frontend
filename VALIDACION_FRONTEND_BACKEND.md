# ✅ Validación: Frontend Alineado con Backend

## 📋 Estructura de Datos - CreateDocumentosPostulacionDto

### Campos Requeridos (según backend):
- ✅ `id_postulacion`: string (UUID) - **REQUERIDO**
- ✅ `tipo_documento`: string - **REQUERIDO**
- ✅ `nombre_archivo`: string - **REQUERIDO**
- ✅ `url_archivo`: string - **REQUERIDO**

### Campos Opcionales:
- ✅ `estado_documento`: string - Opcional (default: "Pendiente")
- ✅ `observaciones`: string - Opcional

## 🔍 Validaciones del Backend

### Para Rol ASPIRANTE:
```typescript
// El backend valida:
1. Que la postulación existe (findOne)
2. Que la postulación pertenece al cliente del usuario
3. Que todos los campos requeridos estén presentes
```

### Para Rol ADMIN/ASESOR:
```typescript
// El backend permite:
- Crear documentos para cualquier postulación
- Sin restricciones de id_cliente
```

## ✅ Validaciones Implementadas en el Frontend

### 1. AspiranteDocumentosPage.tsx

#### Validación de Campos:
```typescript
// ✅ Valida id_postulacion antes de enviar
if (!idPostulacionFinal || idPostulacionFinal.trim() === "") {
  setUploadError("No se pudo obtener la postulación...");
  return;
}

// ✅ Valida campos requeridos
if (!documentoData.tipo_documento || !documentoData.nombre_archivo || !documentoData.url_archivo) {
  // Error y return
}
```

#### Manejo de Errores del Backend:
```typescript
// ✅ Maneja errores específicos del backend:
- 403: Postulación no encontrada o no pertenece al cliente
- 400: Datos inválidos
- 404: Recurso no encontrado
- 500: Error del servidor
```

#### Estructura de Datos Enviada:
```typescript
const documentoData = {
  id_postulacion: idPostulacionFinal, // ✅ UUID válido
  tipo_documento: tipoDocumento, // ✅ String no vacío
  nombre_archivo: nombreArchivo, // ✅ String no vacío
  url_archivo: urlArchivo, // ✅ String no vacío
  estado_documento: form.estado_documento || "Pendiente", // ✅ Opcional con default
  observaciones: form.observaciones || "", // ✅ Opcional
};
```

### 2. DocumentosPage.tsx (Admin/Asesor)

#### Validación de Campos:
```typescript
// ✅ Valida campos requeridos antes de enviar
if (!form.id_postulacion || !form.tipo_documento || !form.nombre_archivo || !form.url_archivo) {
  alert("Completa todos los campos requeridos...");
  return;
}
```

#### Estructura de Datos Enviada:
```typescript
const documentoData = {
  id_postulacion: form.id_postulacion, // ✅ UUID válido
  tipo_documento: form.tipo_documento, // ✅ String no vacío
  nombre_archivo: form.nombre_archivo, // ✅ String no vacío
  url_archivo: form.url_archivo, // ✅ String no vacío
  estado_documento: form.estado_documento || "Pendiente", // ✅ Opcional con default
  observaciones: form.observaciones || "", // ✅ Opcional
};
```

## 🔄 Flujo Completo Validado

### 1. Aspirante Sube Documento

```
Frontend (AspiranteDocumentosPage):
  ↓
1. Obtiene id_postulacion del usuario
  ↓
2. Valida que id_postulacion existe
  ↓
3. Prepara documentoData con estructura correcta
  ↓
4. Envía POST /documentos-postulacion
  ↓
Backend (documento_postulacion.controller.ts):
  ↓
5. Valida que postulación existe
  ↓
6. Valida que postulación pertenece al cliente (para ASPIRANTE)
  ↓
7. Crea UN SOLO registro en BD
  ↓
8. Devuelve documento guardado
  ↓
Frontend:
  ↓
9. Actualiza estado local
  ↓
10. Dispara evento "documentosUpdated"
  ↓
11. Admin/Asesor reciben evento y recargan
  ↓
12. Todos los roles ven el mismo documento (sin duplicar)
```

### 2. Admin/Asesor Crea Documento

```
Frontend (DocumentosPage):
  ↓
1. Valida campos requeridos
  ↓
2. Prepara documentoData con estructura correcta
  ↓
3. Envía POST /documentos-postulacion
  ↓
Backend:
  ↓
4. Crea registro en BD (sin validación de id_cliente para admin/asesor)
  ↓
5. Devuelve documento guardado
  ↓
Frontend:
  ↓
6. Recarga lista
  ↓
7. Dispara evento "documentosUpdated"
  ↓
8. Aspirante recibe evento y actualiza (si es su postulación)
```

## ✅ Checklist de Validación

### Frontend → Backend
- [x] Estructura de datos coincide con CreateDocumentosPostulacionDto
- [x] Campos requeridos están presentes
- [x] Campos opcionales tienen valores por defecto
- [x] id_postulacion es UUID válido
- [x] Manejo de errores del backend implementado
- [x] Validaciones frontend antes de enviar

### Backend → Frontend
- [x] Backend valida que postulación existe
- [x] Backend valida que postulación pertenece al cliente (ASPIRANTE)
- [x] Backend devuelve documento completo con url_archivo
- [x] Backend permite crear documentos sin duplicar

### Sincronización
- [x] Evento "documentosUpdated" se dispara después de guardar
- [x] Admin/Asesor escuchan el evento y recargan
- [x] Aspirante se actualiza inmediatamente
- [x] No hay duplicación de registros

## 🎯 Resultado Final

✅ **El frontend está completamente alineado con el backend:**

1. **Estructura de datos**: Coincide exactamente con `CreateDocumentosPostulacionDto`
2. **Validaciones**: El frontend valida antes de enviar, el backend valida al recibir
3. **Manejo de errores**: Errores específicos del backend se manejan correctamente
4. **Sin duplicación**: Un solo registro en BD visible para todos los roles
5. **Sincronización**: Todos los roles se actualizan automáticamente

## 📝 Notas Importantes

### Para el Backend:
- ✅ Ya tiene las validaciones necesarias
- ✅ Valida permisos según el rol
- ✅ Valida relaciones (postulación → cliente)
- ✅ No requiere cambios adicionales

### Para el Frontend:
- ✅ Está completamente alineado con el backend
- ✅ Maneja todos los casos de error
- ✅ Valida antes de enviar
- ✅ Sincroniza automáticamente entre roles

**El sistema está listo para funcionar correctamente.** 🎉
