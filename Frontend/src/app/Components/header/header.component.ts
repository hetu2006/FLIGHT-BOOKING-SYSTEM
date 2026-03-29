import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ADMIN_ROLE } from 'src/app/constants/IMPData';
import { UserService } from 'src/app/services/User/user.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  displayWelcomeHeader: boolean;
  imageSrc = 'assets/Images/menu2.png';

  // ✅ FIX: correct type
  user$: Observable<any[]>;

  adminRole: any;

  constructor(private userService: UserService, private router: Router) {
    this.adminRole = ADMIN_ROLE;
    this.displayWelcomeHeader = true;

    // ✅ initialize observable
    this.user$ = this.userService.user$;
  }

  ngOnInit(): void {
    if (localStorage.getItem('displayWelcomeHeader')) {
      this.displayWelcomeHeader = false;
    }

    // ✅ (optional, already assigned in constructor)
    this.user$ = this.userService.user$;
  }

  // ✅ Debug using subscription (optional)
  displayUser() {
    this.user$.subscribe((user) => {
      console.log('user : ', user);
    });
  }

  isAdmin(user: any): boolean {
    const role = String(user?.role || '');
    return role === this.adminRole || role.toLowerCase() === 'admin';
  }

  handleLogout() {
    console.log('Logout clicked');

    // ❌ don't clear here
    // localStorage.clear();

    // ✅ service handles everything
    this.userService.logoutUser();

    this.router.navigateByUrl('/login-page');
  }

  handleHeaderRemove() {
    this.displayWelcomeHeader = false;
    localStorage.setItem('displayWelcomeHeader', 'false');
  }
}