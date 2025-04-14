import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "./roles.decorator";
import { Roles } from "@prisma/client";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.get<Roles[]>(
            ROLES_KEY,
            context.getHandler(),
        );
        
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();
        
        if (!user?.role) {
            return false;
        }

        return requiredRoles.some((requiredRole) => 
            user.role === requiredRole
        );
    }
}