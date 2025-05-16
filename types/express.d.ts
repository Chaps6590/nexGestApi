import { Request } from 'express';

export interface User {
  _id: string;
  email: string;
  isVerified:boolean;
  verificationCode:String;
  roles?: {
    admin?: boolean;
    seller?: boolean;
  };
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}