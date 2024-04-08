import { Request as ExpressRequest } from 'express';
import { JwtPayload, UserPayload } from '../auth/dto/authorization.dto';

export interface Request extends ExpressRequest {
  user?: JwtPayload;
}

export interface UserRequest extends ExpressRequest {
  user?: UserPayload;
}
