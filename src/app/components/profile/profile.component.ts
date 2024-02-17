import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { UsersService } from '../../services/users.service';
import { IUser } from '../../interfaces/user';
import { Subscription, map } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogComponent } from '../mat-dialog/mat-dialog.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  renderize!: boolean;
  formulario!: FormGroup;
  profile!: IUser;
  avatarPreview: string | ArrayBuffer | null = null;

  isSubmitted = false;
  constructor(
    private formBuilder: FormBuilder,
    private userService: UsersService,
    private matDialog: MatDialog,
    @Inject(ToastrService) private toastr: ToastrService
  ) {
    this.renderize = this.userService.getUserId() ? true : false;
    console.log(this.renderize);
    console.log(this.userService.getUserId());

    //mostrem un pop up indiquant q per a accedir a les favorites ha d'estar registrat
  }

  ngOnInit(): void {
    this.userService.isLogged().then((logged) => {
      if (logged) {
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
          .subscribe((profile: IUser) => this.crearFormulario(profile));
      } else {
        this.matDialog.open(MatDialogComponent, {
          height: 'min-content',
          width: 'max-content',
          data: {
            title: 'Content not available',
            content: 'You need to login to see your profile',
          },
        });
      }
    });
  }
  onAvatarChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.formulario.patchValue({ avatar_url: reader.result });
        this.formulario.get('avatar_url')?.updateValueAndValidity();
      };
      reader.readAsDataURL(file);
    }
  }

  crearFormulario(profile: IUser) {
    this.profile = profile;
    console.log(profile.id);
    this.formulario = new FormGroup({
      id: new FormControl({ value: profile.id, disabled: true }),
      username: new FormControl(profile.username, [
        Validators.minLength(5),
        Validators.pattern('.*[a-zA-Z].*'),
      ]),
      full_name: new FormControl(profile.full_name, [
        Validators.minLength(5),
        Validators.pattern('.*[a-zA-Z].*'),
      ]),
      avatar_url: new FormControl(profile.avatar_url),
      website: new FormControl(
        profile.website,
        this.websiteValidator('http.*')
      ),
    });
    this.formulario.updateValueAndValidity();
  }
  websiteValidator(pattern: string): ValidatorFn {
    return (c: AbstractControl): { [key: string]: any } | null => {
      if (c.value) {
        let regexp = new RegExp(pattern);

        return regexp.test(c.value) ? null : { website: c.value };
      }
      return null;
    };
  }

  get usernameNoValid() {
    return (
      this.formulario.get('username')!.invalid &&
      this.formulario.get('username')!.touched
    );
  }
  onSubmit() {
    if (this.formulario.valid) {
      this.userService.setProfile(this.formulario);
      this.toastr.success('Profile updated', 'Success', {
        easing: 'ease-out',
        timeOut: 2000,
      });

    }else{
      this.toastr.success('Profile not updated', 'Error', {
        easing: 'ease-out',
        timeOut: 2000,
      });

    }
  }
}
