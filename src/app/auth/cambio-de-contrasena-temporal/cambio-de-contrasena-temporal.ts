import { Component, OnInit } from '@angular/core';
import { AuthService, ResponseDTO } from '../../services/auth/auth.service';
import { DataService } from '../../services/data/data';

@Component({
  selector: 'app-cambio-de-contrasena-temporal',
  standalone: false,
  templateUrl: './cambio-de-contrasena-temporal.html',
  styleUrls: ['./cambio-de-contrasena-temporal.css']
})
export class CambioDeContrasenaTemporal implements OnInit {

  email: string = '';
  contrasenaTemporal: string = '';
  nuevaContrasena: string = '';
  confirmarContrasena: string = '';
  mensaje: string = '';
  cargando: boolean = false;

  constructor(
    private authService: AuthService,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    // Recupera el email y la contraseña temporal desde otra página
    this.email = this.dataService.getEmail();
    this.contrasenaTemporal = this.dataService.getContrasenaTemporal();
  }

  cambiarContrasenaTemporal(): void {
    // Validaciones básicas
    if (!this.email || !this.contrasenaTemporal || !this.nuevaContrasena) {
      this.mensaje = '⚠️ Todos los campos son obligatorios.';
      return;
    }

    if (this.nuevaContrasena !== this.confirmarContrasena) {
      this.mensaje = '⚠️ Las contraseñas no coinciden.';
      return;
    }

    this.cargando = true;
    this.mensaje = 'Procesando solicitud...';

    this.authService.cambiarContrasenaTemporal(this.email, this.contrasenaTemporal, this.nuevaContrasena)
      .subscribe({
        next: (response: ResponseDTO<string>) => {
          this.cargando = false;
          this.mensaje = (response.message || 'Contraseña cambiada correctamente.');
        },
        error: (error) => {
          this.cargando = false;
          console.error('Error:', error);
          if (error.error?.message) {
            this.mensaje =  error.error.message;
          } else {
            this.mensaje = 'Error al cambiar la contraseña temporal.';
          }
        }
      });
  }
}
