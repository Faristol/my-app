import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  isSubmitted = false;
  hide = true;
  hideC = true;

  registerForm = this.fb.group(
    {
      firstname: new FormControl('', [
        Validators.required,
        Validators.minLength(4),
      ]),
      lastname: new FormControl('', [
        Validators.required,
        Validators.minLength(4),
      ]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(4),
      ]),
      confirmPassword: new FormControl('', [Validators.required]),
    },
    {
      validators: this.matchValidator('password', 'confirmPassword'),
    }
  );
  matchValidator(
    controlName: string,
    matchingControlName: string
  ): ValidatorFn {
    return (abstractControl: AbstractControl) => {
      const control = abstractControl.get(controlName);
      const matchingControl = abstractControl.get(matchingControlName);

      if (
        matchingControl!.errors &&
        !matchingControl!.errors?.['confirmedValidator']
      ) {
        return null;
      }

      if (control!.value !== matchingControl!.value) {
        const error = { confirmedValidator: 'Passwords do not match' };
        matchingControl!.setErrors(error);
        return error;
      } else {
        matchingControl!.setErrors(null);
        return null;
      }
    };
  }
  constructor(
    private fb: FormBuilder,
    private router: Router,
    public userServices: UsersService,
    @Inject(ToastrService) private toastr: ToastrService
  ) {}
  async onSubmit() {
    this.isSubmitted = true;
    if (this.registerForm.invalid) {
      this.toastr.warning('Please fill in all fields correctly', 'Warning', {
        easing: 'ease-out',
        timeOut: 2000,
      });
      return;
    }
    const firstname = this.registerForm.value.firstname;
    const lastname = this.registerForm.value.lastname;
    const email = this.registerForm.value.email;
    const password = this.registerForm.value.password;
    if (firstname && lastname && password && email) {
      let signup = await this.userServices.signUp(email, password);
      console.log(signup);
      if (signup === 'authenticated') {
        this.toastr.success(
          'The user already exists. Please login', 'Success',
          {
            easing: 'ease-out',
            timeOut: 2000,
          }
        );
        this.router.navigate(['login']);
      } else if (signup) {
        this.toastr.success(
          'Registration successful, please confirm your email',
          'Success',
          {
            easing: 'ease-out',
            timeOut: 2000,
          }
        );
        this.router.navigate(['login']);
      } else {
        console.log(signup);
        this.toastr.error(`Registration failed`, 'Error', {
          easing: 'ease-out',
          timeOut: 2000,
        });
      }
    }
  }
  login() {
    this.router.navigate(['login']);
  }
}
