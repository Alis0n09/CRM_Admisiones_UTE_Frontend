# Modificaciones Requeridas en el Backend

---

## 1. Postulaciones no se actualizan (filtro por `id_cliente`)

### Problema
Al crear una postulación desde el detalle del aspirante, la lista no se actualiza. El frontend llama a `GET /postulacion` sin filtros; el backend devuelve solo la primera página (p. ej. 10 registros). Las postulaciones del cliente se filtran en el frontend. La nueva suele no estar en esa primera página, por eso no aparece.

### Solución
Soportar el query param `id_cliente` en `GET /postulacion` y filtrar en el backend.

**Controller** (`postulacion.controller.ts`): leer `id_cliente` del query y pasarlo al servicio.

```typescript
@Get()
@Roles('ADMIN', 'ASESOR')
async findAll(@Query() query: QueryDto & { id_cliente?: string }) {
  const options = { page: query.page || 1, limit: query.limit || 10, id_cliente: query.id_cliente };
  return await this.postulacionService.findAll(options);
}
```

**Service** (`postulacion.service.ts`): en `findAll`, si viene `id_cliente`, añadir `WHERE id_cliente = :id_cliente` al `QueryBuilder` antes de `paginate()`. Opcional: cuando se filtra por `id_cliente`, usar `limit` mayor (p. ej. 500) o sin tope razonable para ese cliente.

El frontend ya envía `GET /postulacion?id_cliente=xxx&limit=500` al cargar el detalle del aspirante. Con esto, las postulaciones (incluidas las recién creadas) se actualizan correctamente.

---

## 2. Documentos: ASPIRANTE no puede subir

### Problema
El endpoint `POST /documentos-postulacion` solo permite que ADMIN y ASESOR creen documentos, pero los ASPIRANTES también necesitan poder subir sus documentos.

### Solución
Modificar el controlador `documento_postulacion.controller.ts` para permitir que ASPIRANTE también pueda crear y actualizar documentos.

### Cambio necesario en el controlador:

```typescript
// ANTES (solo ADMIN y ASESOR):
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'ASESOR')
@Post()
async create(@Body() dto: CreateDocumentosPostulacionDto) {
  return await this.service.create(dto);
}

// DESPUÉS (incluir ASPIRANTE):
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'ASESOR', 'ASPIRANTE')
@Post()
async create(@Body() dto: CreateDocumentosPostulacionDto) {
  return await this.service.create(dto);
}

// También actualizar los endpoints PUT y PATCH:
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'ASESOR', 'ASPIRANTE')
@Put(':id_documento')
async updatePut(
  @Param('id_documento') id_documento: string,
  @Body() dto: UpdateDocumentosPostulacionDto,
) {
  return await this.service.update(id_documento, dto);
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'ASESOR', 'ASPIRANTE')
@Patch(':id_documento')
async updatePatch(
  @Param('id_documento') id_documento: string,
  @Body() dto: UpdateDocumentosPostulacionDto,
) {
  return await this.service.update(id_documento, dto);
}
```

### Consideración de seguridad adicional (opcional):
Si quieres asegurar que los ASPIRANTES solo puedan crear/actualizar documentos de sus propias postulaciones, puedes agregar validación en el servicio o controlador:

```typescript
@Post()
async create(@Body() dto: CreateDocumentosPostulacionDto, @Req() req: Request) {
  const user: any = (req as any).user;
  const roles: string[] = user?.roles ?? [];
  const isAspirante = roles.includes('ASPIRANTE');

  if (isAspirante) {
    // Verificar que la postulación pertenece al cliente
    const postulacion = await this.postulacionService.findOne(dto.id_postulacion);
    if (postulacion.id_cliente !== user.id_cliente) {
      throw new ForbiddenException('No puedes crear documentos para otras postulaciones');
    }
  }

  return await this.service.create(dto);
}
```
