// Role: route guards protecting temporary role-based spaces.
import { CanActivateFn } from '@angular/router';

import { AppRole } from '../models/auth.models';

export const authGuard: CanActivateFn = () => {
  return true;
};

export const roleGuard = (expectedRole: AppRole): CanActivateFn => () => {
  void expectedRole;
  return true;
};
