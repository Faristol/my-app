import { Component, Inject, Input, ViewEncapsulation } from '@angular/core';
import { UsersService } from '../../services/users.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  constructor(
    private usersService: UsersService,
    private router: Router,
    private fb: FormBuilder,
    @Inject(ToastrService) private toastr: ToastrService
  ) {}

  isSubmitted = false;
  hide = true;

  email: string = '';
  password: string = '';

  loginForm = this.fb.group({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(4),
    ]),
  });

  async onSubmit() {
    this.isSubmitted = true;
    if (this.loginForm.invalid) {
      this.toastr.warning('Please fill in all fields correctly', 'Warning', {
        easing: 'ease-out',
        timeOut: 2000,
      });
      console.log('entra');
      return;
    }
    if (await this.usersService.isLogged()) {
      this.toastr.warning('User already logged in', 'Warning', {
        easing: 'ease-out',
        timeOut: 2000,
      });
      this.router.navigate(['favorites']);
      return;
    }
    const email = this.loginForm.value.email;
    const password = this.loginForm.value.password;
    console.log(email, password);
    
    if ( password && email) {
    let logged = await this.usersService.login(email, password);
    if (logged) {
      this.toastr.success('Login successful', 'Success', {
        easing: 'ease-out',
        timeOut: 2000,
      });
      console.log(logged)
      this.router.navigate(['favorites']);
    } else {
      this.toastr.error('Login failed', 'Error', {
        easing: 'ease-out',
        timeOut: 2000,
      });
    }
  }
}
  signUp() {
    this.router.navigate(['register']);
  }
}
