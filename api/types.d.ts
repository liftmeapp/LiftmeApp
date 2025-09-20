// /api/types.d.ts
import { AuthObject } from '@clerk/clerk-expo';

declare global {
  namespace Express {
    export interface Request {
      auth: AuthObject;
    }
  }
}