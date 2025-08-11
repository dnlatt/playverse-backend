// src/roles/roles.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard) 
@Roles('Admin')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post() // POST /roles
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get() // GET /roles
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id') // GET /roles/:id
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(+id);
  }

  @Patch(':id') // PATCH /roles/:id
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(+id, updateRoleDto);
  }

  @Delete(':id') // DELETE /roles/:id
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.rolesService.remove(+id);
  }
}
