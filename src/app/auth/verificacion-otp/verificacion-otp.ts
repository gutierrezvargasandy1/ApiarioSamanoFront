import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { DataService } from '../../services/data/data';
@Component({
  selector: 'app-verificacion-otp',
  standalone: false,
  templateUrl: './verificacion-otp.html',
  styleUrl: './verificacion-otp.css'
})
export class VerificacionOTP {

  codigoOTP: string = '';

  email: string = '';

  constructor(private authService: AuthService, private router: Router, private route: ActivatedRoute, private dataService: DataService) {}

   ngOnInit(): void {
    this.email = this.dataService.getEmail();
  }
   
  verificarOTP(): void {
    this.dataService.setOtp(this.codigoOTP);
    this.authService.verificarOtpYCambiarContrasena( this.email,this.codigoOTP ).subscribe({
      next: (response) => {
        this.router.navigate(['cambiar-contrasena']);
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  reenviarOTP(): void {
    this.authService.iniciarRecuperacion(this.email).subscribe({
      next: (response) => {
      },
      error: (error) => {
        console.log(error);
      }
    });
  }
}


