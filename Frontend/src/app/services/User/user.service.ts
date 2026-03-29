import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_PATH, TOKEN_PREFIX } from 'src/app/constants/IMPData';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private userSubject = new BehaviorSubject<any[]>([]);
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    const token = localStorage.getItem('token');

    if (token) {
      const userData = {
        email: localStorage.getItem('email'),
        id: localStorage.getItem('id'),
        role: localStorage.getItem('role'),
        username: localStorage.getItem('username'),
        name: localStorage.getItem('name'),
      };

      this.userSubject.next([userData]);
    }
  }

  // ✅ FIXED: return observable directly
  getCurrentUser() {
    return this.user$;
  }

  signupUser(user: any) {
    return this.http.post(`${API_PATH}/auth/signup`, {
      username: user.username,
      password: user.password,
      phoneNo: user.phoneNo,
      email: user.email,
      name: user.name,
    });
  }

  loginUser(user: any) {
    return this.http.post(`${API_PATH}/auth/login`, {
      username: user.username,
      password: user.password,
    });
  }

  // ✅ Call this after successful login
  setUser(userData: any) {
    localStorage.setItem('email', userData.email);
    localStorage.setItem('id', userData.id);
    localStorage.setItem('role', userData.role);
    localStorage.setItem('username', userData.username);
    localStorage.setItem('name', userData.name);

    this.userSubject.next([userData]);
  }

  logoutUser() {
    localStorage.clear();
    this.userSubject.next([]); // 🔥 triggers UI update instantly
  }

  // Account settings
  getCurrentUserData() {
    const jwt_token = localStorage.getItem('token');

    return this.http.post(
      `${API_PATH}/user/userdata`,
      {},
      {
        headers: {
          authorization: `${TOKEN_PREFIX} ${jwt_token}`,
        },
      }
    );
  }

  getLoginUserData() {
    const jwt_token = localStorage.getItem('token');

    return this.http.get(`${API_PATH}/auth/me`, {
      headers: {
        authorization: `${TOKEN_PREFIX} ${jwt_token}`,
      },
    });
  }

  updateAccountDetails(data: any) {
    const jwt_token = localStorage.getItem('token');

    return this.http.post(
      `${API_PATH}/user/updatedata`,
      { data: data },
      {
        headers: {
          authorization: `${TOKEN_PREFIX} ${jwt_token}`,
        },
      }
    );
  }

  changeUserPassword(data: any) {
    const jwt_token = localStorage.getItem('token');

    return this.http.post(
      `${API_PATH}/user/changepassword`,
      {
        data: {
          oldpassword: data.oldPassword,
          newpassword: data.newPassword,
        },
      },
      {
        headers: {
          authorization: `${TOKEN_PREFIX} ${jwt_token}`,
        },
      }
    );
  }
}