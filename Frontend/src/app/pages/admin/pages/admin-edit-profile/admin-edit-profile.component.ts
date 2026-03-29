import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/User/user.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-edit-profile',
  templateUrl: './admin-edit-profile.component.html',
  styleUrls: ['./admin-edit-profile.component.css'],
})
export class AdminEditProfileComponent implements OnInit {
  profile = {
    name: '',
    username: '',
    email: '',
    phoneNo: '',
    address: '',
  };
  saving = false;

  constructor(
    private userService: UserService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.userService.getLoginUserData().subscribe({
      next: (res: any) => {
        const u = res?.user || res?.data?.[0] || res;
        this.profile = {
          name: u.name || localStorage.getItem('name') || '',
          username: u.username || localStorage.getItem('username') || '',
          email: u.email || localStorage.getItem('email') || '',
          phoneNo: u.phoneNo || '',
          address: u.address || '',
        };
      },
    });
  }

  saveProfile(): void {
    this.saving = true;
    this.userService.updateAccountDetails(this.profile).subscribe({
      next: () => {
        this.toastr.success('Profile updated');
        this.saving = false;
      },
      error: () => {
        this.toastr.error('Failed to update profile');
        this.saving = false;
      },
    });
  }
}
