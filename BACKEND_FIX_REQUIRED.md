# Modificación Requerida en el Backend

## Problema
El endpoint `POST /documentos-postulacion` solo permite que ADMIN y ASESOR creen documentos, pero los ASPIRANTES también necesitan poder subir sus documentos.

## Solución
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
