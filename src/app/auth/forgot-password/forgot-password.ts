import { Component } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';  
import { Router } from '@angular/router';
import { DataService } from '../../services/data/data';
@Component({
  selector: 'app-forgot-password',
  standalone: false,
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css'
})
export class ForgotPassword {
  constructor(private authService: AuthService, private router: Router, private dataService: DataService) {}
   
  email:string = '';

  inicioRecuperacion(): void{
    this.dataService.setEmail(this.email);
    this.authService.iniciarRecuperacion(this.email).subscribe({
      next: (response) => {
        this.router.navigate(['verificacion-otp']);
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

}
