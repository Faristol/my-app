import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { UsersService } from '../../services/users.service';
import { IUser } from '../../interfaces/user';
import { map } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  renderize = true;
  constructor(
    private formBuilder: FormBuilder,
    private userService: UsersService
  ) {
    if (!this.userService.getUserId()) {
      //mostrem un pop up indiquant q per a accedir a les favorites ha d'estar registrat
      console.log('no user');
      this.renderize = false;
    } else {
      this.crearFormulario();
    }
  }

  formulario!: FormGroup;

  ngOnInit(): void {
    if (this.userService.getUserId()) {
      this.userService.isLogged();
      this.userService.userSubject
        .pipe(
          map((p: IUser) => {
            return {
              id: p.id,
              username: p.username,
              full_name: p.full_name,
              avatar_url: p.avatar_url,
              website: p.website,
            };
          })
        )
        .subscribe((profile) => this.formulario?.setValue(profile));
    }
  }

  crearFormulario() {
    this.formulario = this.formBuilder.group({
      id: [''],
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.pattern('.*[a-zA-Z].*'),
        ],
      ],
      full_name: [''],
      avatar_url: [''],
      website: ['', websiteValidator('http.*')],
    });
  }

  get usernameNoValid() {
    return (
      this.formulario.get('username')!.invalid &&
      this.formulario.get('username')!.touched
    );
  }
}

function websiteValidator(pattern: string): ValidatorFn {
  return (c: AbstractControl): { [key: string]: any } | null => {
    if (c.value) {
      let regexp = new RegExp(pattern);

      return regexp.test(c.value) ? null : { website: c.value };
    }
    return null;
  };
}
