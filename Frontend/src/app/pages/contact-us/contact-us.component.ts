import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { API_PATH } from 'src/app/constants/IMPData';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.css'],
})
export class ContactUsComponent {
  isSubmitting = false;

  formData = {
    name: '',
    email: '',
    phoneNo: '',
    subject: '',
    message: '',
  };

  constructor(private http: HttpClient, private toastr: ToastrService) {}

  submitForm(): void {
    if (this.isSubmitting) return;

    const payload = {
      name: this.formData.name.trim(),
      email: this.formData.email.trim().toLowerCase(),
      phoneNo: this.formData.phoneNo.trim(),
      subject: this.formData.subject.trim(),
      message: this.formData.message.trim(),
    };

    if (!payload.name || !payload.email || !payload.subject || !payload.message) {
      this.toastr.error('Please fill all required fields');
      return;
    }

    this.isSubmitting = true;
    this.http.post(`${API_PATH}/contact/submit`, payload).subscribe(
      () => {
        this.toastr.success('Contact request submitted successfully');
        this.formData = {
          name: '',
          email: '',
          phoneNo: '',
          subject: '',
          message: '',
        };
        this.isSubmitting = false;
      },
      (error) => {
        const message =
          error?.error?.error || error?.error?.msg || 'Unable to submit contact request';
        this.toastr.error(message);
        this.isSubmitting = false;
      }
    );
  }
}
