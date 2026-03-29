import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { ADMIN_ROLE } from '../../constants/IMPData';

@Injectable({
  providedIn: 'root',
})
export class UserLoginGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('id');
    const role = localStorage.getItem('role');
    const roleNormalized = String(role || '').toLowerCase();
    const isAdminRole = role === ADMIN_ROLE || roleNormalized === 'admin';

    if (!token || !userId) {
      return this.router.parseUrl('/login-page');
    }

    const allowedRoles = (route.data?.['roles'] as string[]) || [];
    const roleAllowed =
      allowedRoles.length === 0 ||
      allowedRoles.includes(role || '') ||
      (allowedRoles.includes(ADMIN_ROLE) && isAdminRole) ||
      (allowedRoles.includes('admin') && isAdminRole);

    if (!roleAllowed) {
      if (allowedRoles.includes(ADMIN_ROLE)) {
        return this.router.parseUrl('/');
      }
      return this.router.parseUrl('/login-page');
    }

    return true;
  }
}
