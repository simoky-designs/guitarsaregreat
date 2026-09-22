import { Component } from '@angular/core';
import { LOGIN_MESSAGE } from '../../shared/const/app-const';

@Component({
  imports: [],
  selector: 'app-login',
  styleUrl: './login.scss',
  templateUrl: './login.html',
})
export class Login {
  readonly loginMessage = LOGIN_MESSAGE;
}
