import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UseGuards,
  applyDecorators,
} from '@nestjs/common';
import { Request } from 'src/types/request';
import { UserAuth } from './user-auth.guard';
import { InjectModel } from '@nestjs/mongoose';
import { Role, User } from '@modules/user/user.schema';
import { Model } from 'mongoose';

/** Protects endpoints against non-owners of the User entity */
@Injectable()
export class UserUpdateGuard implements CanActivate {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const { user: requestUser, params } = request;
    const { id } = params;

    if (!id) return true;
    if (!requestUser) return false;

    const user = await this.userModel.findById(id);

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    } else if (user.role === Role.Superadmin) {
      throw new ForbiddenException('Cannot update user with Superadmin role');
    } else if (requestUser.role === Role.Superadmin) return true;
    // else if (requestUser.id === user.id) return true;
    else throw new ForbiddenException("You don't own this user");
  }
}

export function UserOwnerAuth() {
  return applyDecorators(UserAuth(), UseGuards(UserUpdateGuard));
}
