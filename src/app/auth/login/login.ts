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
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    const credentials = {
      email: this.email,
      contrasena: this.contrasena
    };

    this.authService.login(credentials).subscribe({
      next: (res) => {
    
        if (res.data) {
          this.authService.guardarToken(res.data);
          this.router.navigate(['/home']);
          console.log(res.data);
        } else {
          this.errorMessage = res.message || 'Credenciales incorrectas.';
        }
      },
      error: (err) => {
        console.error('Error en login:', err);
      }
    });
  }
}
