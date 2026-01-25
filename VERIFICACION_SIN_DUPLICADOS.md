# ✅ Verificación: Sin Duplicación de Registros

## 📋 Arquitectura del Sistema

### Un Solo Registro en la Base de Datos
Cuando un **aspirante** sube un documento:
1. Se crea **UN SOLO registro** en la tabla `documentos_postulacion` con:
   - `id_documento` (único)
   - `id_postulacion` (relacionado con la postulación)
   - `tipo_documento`
   - `nombre_archivo`
   - `url_archivo`
   - `estado_documento`
   - `observaciones`

2. Este **mismo registro** es visible para:
   - **Admin**: Ve TODOS los documentos (sin filtros)
   - **Asesor**: Ve TODOS los documentos (sin filtros)
   - **Aspirante**: Ve solo SUS documentos (filtrado por `id_cliente` en el frontend)

### ✅ NO HAY DUPLICACIÓN
- **Un documento = Un registro en BD**
- El filtrado se hace en el **frontend** según el rol
- El backend devuelve todos los documentos, el frontend decide qué mostrar

## 🔍 Flujo de Datos

### 1. Cuando un Aspirante Sube un Documento

```
Aspirante sube documento
    ↓
POST /documentos-postulacion
    ↓
Backend guarda UN registro en BD
    ↓
Backend devuelve el documento guardado
    ↓
Frontend actualiza estado local
    ↓
Frontend dispara evento "documentosUpdated"
    ↓
Todas las páginas se actualizan:
  - AspiranteDocumentosPage (filtrado por id_cliente)
  - ProcesoAdmisionPage (filtrado por id_cliente)
  - DocumentosPage Admin/Asesor (sin filtros - todos)
```

### 2. Cómo se Filtran los Documentos

#### Admin/Asesor (`DocumentosPage.tsx`)
```typescript
// NO filtra - muestra TODOS los documentos
docService.getDocumentosPostulacion()
  .then((r) => setItems(Array.isArray(r) ? r : []))
```

#### Aspirante (`AspiranteDocumentosPage.tsx`)
```typescript
// Filtra por id_cliente del usuario
const docsCliente = docsList.filter((d: DocumentoPostulacion) => {
  const postulacion = postulsList.find((p: Postulacion) => {
    return p.id_postulacion === d.id_postulacion && 
           p.id_cliente === user.id_cliente;
  });
  return !!postulacion;
});
```

## ✅ Verificaciones Implementadas

### 1. Logging Mejorado
- **Admin**: Muestra todos los documentos recibidos del backend
- **Aspirante**: Muestra el filtrado aplicado y qué documentos se incluyen/excluyen
- **Evento**: Muestra qué documento se guardó y que aparecerá para todos los roles

### 2. Actualización Automática
- **Admin/Asesor**: Escuchan el evento `documentosUpdated` y recargan automáticamente
- **Aspirante**: Se actualiza inmediatamente después de guardar
- **Otras páginas**: Se actualizan cuando reciben el evento

### 3. Validación de Datos
- Verifica que el documento guardado tenga `url_archivo` válido
- Verifica que el documento se recupere correctamente del backend
- Muestra advertencias si hay problemas

## 🧪 Cómo Verificar que NO Hay Duplicación

### 1. En la Base de Datos
```sql
-- Contar documentos por tipo y postulación
SELECT 
  id_postulacion,
  tipo_documento,
  COUNT(*) as cantidad
FROM documentos_postulacion
GROUP BY id_postulacion, tipo_documento
HAVING COUNT(*) > 1;
-- Si esto devuelve resultados, HAY duplicados (no debería)
```

### 2. En el Frontend (Consola del Navegador)

**Cuando un aspirante sube un documento:**
```
📤 Enviando documento al backend: { id_postulacion: "...", tipo_documento: "..." }
✅ Documento guardado exitosamente: { id_documento: "abc123", ... }
📢 Evento 'documentosUpdated' disparado
```

**En Admin/Asesor (debe aparecer automáticamente):**
```
📄 Admin: Evento de actualización de documentos recibido
📄 Admin: Recargando documentos para mostrar el nuevo documento
📊 Admin: Documentos cargados: { total: X, documentos: [...] }
```

**En Aspirante:**
```
📊 Documentos filtrados para aspirante: { total_filtrados: X, documentos: [...] }
```

### 3. Verificación Manual

1. **Aspirante sube un documento** → Anota el `id_documento`
2. **Admin abre la página de documentos** → Debe ver el mismo `id_documento`
3. **Asesor abre la página de documentos** → Debe ver el mismo `id_documento`
4. **Verificar en BD** → Debe haber UN SOLO registro con ese `id_documento`

## ⚠️ Posibles Problemas

### Si hay duplicación, puede ser por:

1. **Backend creando múltiples registros**:
   - Verificar que `createDocumentoPostulacion` no se llame múltiples veces
   - Verificar que no haya validaciones que permitan crear duplicados

2. **Frontend llamando múltiples veces**:
   - Verificar que el botón no se pueda hacer doble-click
   - Verificar que `handleSave` no se ejecute múltiples veces

3. **Problemas de sincronización**:
   - El evento `documentosUpdated` debe dispararse solo UNA vez
   - La recarga no debe crear nuevos registros

## ✅ Solución Implementada

1. **Un solo registro en BD**: El backend guarda un solo documento
2. **Filtrado en frontend**: Cada rol ve lo que corresponde sin duplicar
3. **Actualización automática**: Todos los roles ven el nuevo documento automáticamente
4. **Logging detallado**: Para diagnosticar cualquier problema

## 📝 Checklist de Verificación

- [x] El backend guarda un solo registro por documento
- [x] El frontend de admin/asesor muestra todos los documentos (sin filtros)
- [x] El frontend de aspirante filtra por `id_cliente` (solo sus documentos)
- [x] El evento `documentosUpdated` se dispara cuando se guarda un documento
- [x] Admin/Asesor escuchan el evento y se actualizan automáticamente
- [x] No hay duplicación de registros en la BD
- [x] El mismo `id_documento` aparece en admin, asesor y aspirante
