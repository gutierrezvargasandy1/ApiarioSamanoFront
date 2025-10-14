import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { DataService } from '../../services/data/data';
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
  isSubmitting: boolean = false;

  constructor(private authService: AuthService, private router: Router, private dataService: DataService) {}
  ngOnInit(): void {
   
  }

  login() {
    this.errorMessage = ''; // Limpiamos errores previos

    // Validación de campos vacíos
    if (!this.email.trim() || !this.contrasena.trim()) {
      this.errorMessage = 'Por favor, ingresa correo y contraseña.';
      return;
    }

    this.isSubmitting = true;

    const credentials = {
      email: this.email.trim(),
      contrasena: this.contrasena
    };

    this.authService.login(credentials).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        
        if (res.data) {
          this.authService.guardarToken(res.data);
          if( this.authService.getEstadoFromToken() === true){
             this.dataService.setContrasenaTemporal(this.contrasena);
             this.dataService.setEmail(this.email);
             console.log("credenciales enviadas", this.contrasena,this.email)
            this.router.navigate(['cambiar-contrasena-temporal']);

          }else{
            this.router.navigate(['home']);
          }
        } else {
          this.errorMessage = res.message || 'Credenciales incorrectas.';
        }
      },
      error: (err: HttpErrorResponse) => {
        this.isSubmitting = false;
        console.error('Error en login:', err);

        // Si el backend devuelve 401 (usuario no encontrado o contraseña incorrecta)
        if (err.status === 401) {
          this.errorMessage = 'Credenciales incorrectas.';
        } else {
          this.errorMessage = 'Ocurrió un error, intenta nuevamente.';
        }
      }
    });
  }

  validarCampos() {
  if (!this.email.trim() || !this.contrasena.trim()) {
    this.errorMessage = 'Por favor, ingresa correo y contraseña.';
  } else {
    this.errorMessage = '';
  }
}

irARecuperacionContrasena(){
  this.router.navigate(['forgot-password']);
}


}
