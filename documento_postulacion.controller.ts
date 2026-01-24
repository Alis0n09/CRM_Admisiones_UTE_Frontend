import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { DocumentosPostulacionService } from './documento_postulacion.service';
import { CreateDocumentosPostulacionDto } from './dto/create-documento_postulacion.dto';
import { UpdateDocumentosPostulacionDto } from './dto/update-documento_postulacion.dto';
import { PostulacionService } from 'src/postulacion/postulacion.service';
import type { Request } from 'express';

import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';

@Controller('documentos-postulacion')
export class DocumentosPostulacionController {
  constructor(
    private readonly service: DocumentosPostulacionService,
    private readonly postulacionService: PostulacionService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ASESOR', 'ASPIRANTE')
  @Post()
  async create(@Body() dto: CreateDocumentosPostulacionDto, @Req() req: Request) {
    const user: any = (req as any).user;
    const roles: string[] = user?.roles ?? [];
    const isAspirante = roles.includes('ASPIRANTE');

    // Validación de seguridad: los aspirantes solo pueden crear documentos de sus propias postulaciones
    if (isAspirante) {
      const postulacion = await this.postulacionService.findOne(dto.id_postulacion);
      if (!postulacion) {
        throw new ForbiddenException('Postulación no encontrada');
      }
      if (postulacion.id_cliente !== user.id_cliente) {
        throw new ForbiddenException('No puedes crear documentos para otras postulaciones');
      }
    }

    return await this.service.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ASESOR', 'ASPIRANTE')
  @Get()
  async findAll(@Req() req: Request) {
    const user: any = (req as any).user;

    const roles: string[] = user?.roles ?? [];
    const isAspirante = roles.includes('ASPIRANTE');

    if (isAspirante) {
      const idCliente = user?.id_cliente;
      if (!idCliente) {
        throw new ForbiddenException('Acceso no permitido');
      }
      return await this.service.findAllByClienteId(String(idCliente));
    }

    return await this.service.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ASESOR', 'ASPIRANTE')
  @Get('por-usuario')
  async findAllByUsuario(@Req() req: Request) {
    const user: any = (req as any).user;
    return await this.service.findAllByUsuarioId(user.id_usuario);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ASESOR', 'ASPIRANTE')
  @Get(':id_documento')
  async findOne(@Param('id_documento') id_documento: string, @Req() req: Request) {
    const user: any = (req as any).user;
    const roles: string[] = user?.roles ?? [];
    const isAspirante = roles.includes('ASPIRANTE');

    const doc = await this.service.findOne(id_documento);

    // Validación de seguridad: los aspirantes solo pueden ver sus propios documentos
    if (isAspirante) {
      if (doc.postulacion?.id_cliente !== user.id_cliente) {
        throw new ForbiddenException('No tienes acceso a este documento');
      }
    }

    return doc;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ASESOR', 'ASPIRANTE')
  @Put(':id_documento')
  async updatePut(
    @Param('id_documento') id_documento: string,
    @Body() dto: UpdateDocumentosPostulacionDto,
    @Req() req: Request,
  ) {
    const user: any = (req as any).user;
    const roles: string[] = user?.roles ?? [];
    const isAspirante = roles.includes('ASPIRANTE');

    // Validación de seguridad: los aspirantes solo pueden actualizar sus propios documentos
    if (isAspirante) {
      const doc = await this.service.findOne(id_documento);
      if (doc.postulacion?.id_cliente !== user.id_cliente) {
        throw new ForbiddenException('No puedes actualizar documentos de otras postulaciones');
      }
      
      // Verificar que la nueva postulación también pertenece al cliente
      if (dto.id_postulacion) {
        const postulacion = await this.postulacionService.findOne(dto.id_postulacion);
        if (postulacion.id_cliente !== user.id_cliente) {
          throw new ForbiddenException('No puedes mover documentos a otras postulaciones');
        }
      }
    }

    return await this.service.update(id_documento, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ASESOR', 'ASPIRANTE')
  @Patch(':id_documento')
  async updatePatch(
    @Param('id_documento') id_documento: string,
    @Body() dto: UpdateDocumentosPostulacionDto,
    @Req() req: Request,
  ) {
    const user: any = (req as any).user;
    const roles: string[] = user?.roles ?? [];
    const isAspirante = roles.includes('ASPIRANTE');

    // Validación de seguridad: los aspirantes solo pueden actualizar sus propios documentos
    if (isAspirante) {
      const doc = await this.service.findOne(id_documento);
      if (doc.postulacion?.id_cliente !== user.id_cliente) {
        throw new ForbiddenException('No puedes actualizar documentos de otras postulaciones');
      }
      
      // Verificar que la nueva postulación también pertenece al cliente
      if (dto.id_postulacion) {
        const postulacion = await this.postulacionService.findOne(dto.id_postulacion);
        if (postulacion.id_cliente !== user.id_cliente) {
          throw new ForbiddenException('No puedes mover documentos a otras postulaciones');
        }
      }
    }

    return await this.service.update(id_documento, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ASESOR')
  @Delete(':id_documento')
  async remove(@Param('id_documento') id_documento: string) {
    await this.service.remove(id_documento);
    return { message: 'Documento eliminado correctamente' };
  }
}
