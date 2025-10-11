
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {

  email = '';
  contrasena = '';
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    this.authService.login({ email: this.email, contrasena: this.contrasena }).subscribe({
      next: (res) => {
        if (res.exito) {
          this.authService.guardarToken(res.datos.token);
          console.log("inicio de secion exitoso ")
          this.router.navigate(['/home']);
        } else {
          this.errorMessage = res.mensaje;
        }
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Error al iniciar sesión. Verifica tus credenciales.';
      }
    });
  }
}
