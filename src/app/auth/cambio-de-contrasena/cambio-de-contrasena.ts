import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { DataService } from '../../services/data/data';
@Component({
  selector: 'app-cambio-de-contrasena',
  standalone: false,
  templateUrl: './cambio-de-contrasena.html',
  styleUrl: './cambio-de-contrasena.css'
})
export class CambioDeContrasena {

  email: string = '';
  nuevaContrasena: string = '';
  confirmarContrasena: string = ''
  errorMensaje: string = '';
  otp: string = '';

  constructor(private router: Router, private authService: AuthService, private dataService: DataService) {}
  ngOnInit(): void {
    this.email = this.dataService.getEmail()
    this.otp = this.dataService.getOtp()
  }

  cambiarContrasena(): void {
    if (this.nuevaContrasena !== this.confirmarContrasena) {
      alert('Las contraseñas no coinciden.');
      return;
    }
  }

  reenviarContrasena(): void {
    this.authService.cambiarContrasena(this.email, this.nuevaContrasena, this.otp).subscribe({
      next: (response) => {
        this.dataService.clearData();
        alert('Contraseña cambiada con éxito. Ahora puedes iniciar sesión con tu nueva contraseña.');
        this.router.navigate(['login']);
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

}
