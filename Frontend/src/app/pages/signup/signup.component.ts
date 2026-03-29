import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserService } from 'src/app/services/User/user.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent implements OnInit {
  user: any[] = [];
  name: string = '';
  email: string = '';
  phoneNo: string = '';
  password: string = '';
  repeatPassword: string = '';
  rememberMe: boolean = false;

  displayModal = false;

  constructor(
    private router: Router,
    private userService: UserService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.userService.getCurrentUser().subscribe((userData) => {
      this.user = userData;

      // ✅ FIX: Move condition inside subscribe
      if (this.user && this.user.length > 0) {
        this.router.navigate(['/']);
      }
    });
  }

  handleFormSubmit(event: Event) {
    event.preventDefault();

    // ✅ Password validation
    if (this.password !== this.repeatPassword) {
      this.toastr.error('Password not matched', 'Error');
      return;
    }

    // ✅ Username from email
    const username = this.email.split('@')[0];

    const newData = {
      name: this.name,
      username: username,
      email: this.email,
      phoneNo: this.phoneNo,
      password: this.password,
      rememberMe: this.rememberMe,
    };

    this.displayModal = true;

    this.userService.signupUser(newData).subscribe(
      (result: any) => {
        if (result && result.isDone) {
          // ✅ Success
          this.toastr.success('Account Created Successfully', 'Please Login');

          // ✅ Clear form
          this.name = '';
          this.email = '';
          this.phoneNo = '';
          this.password = '';
          this.repeatPassword = '';
          this.rememberMe = false;

          // ✅ REDIRECT TO LOGIN PAGE
          setTimeout(() => {
            this.router.navigate(['/login-page']);
          }, 1500); // small delay to show toast
        } else {
          this.toastr.error(
            result?.err?.writeErrors?.[0]?.errmsg || 'Signup Failed',
            'Error'
          );
        }

        this.displayModal = false;
      },
      (error) => {
        this.toastr.error(error?.error?.msg || 'Something went wrong', 'Error');
        this.displayModal = false;
      }
    );
  }
}