import { SetMetadata } from "@nestjs/common";
import { Roles } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const AcceptedRoles = (...roles: Roles[]) => 
    SetMetadata(ROLES_KEY, roles);