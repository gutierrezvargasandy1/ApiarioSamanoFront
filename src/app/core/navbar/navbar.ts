import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
  standalone: true,
  imports: [CommonModule]
})
export class Navbar {
  constructor(public router: Router) {}

  shouldShowNavbar(): boolean {
    
    return this.router.url !== '/login';
  }
  // Métodos para redireccionar
  goToHome() {
    this.router.navigate(['/home']);
  }

  goToCosechas() {
    this.router.navigate(['/cosechas']);
  }

  goToLotes() {
    this.router.navigate(['/lotes']);
  }

  goToApiarios() {
    this.router.navigate(['/apiarios']);
  }

  goToAlmacenes() {
    this.router.navigate(['/almacenes']);
  }
   goToHerramientas() {
    this.router.navigate(['/herramientas']);
  }

  goToMateriasPrimas() {
    this.router.navigate(['/materias-primas']);
  }

  goToProveedores() {
    this.router.navigate(['/proveedores']);
  }
  goToUsuarios() {
    this.router.navigate(['/usuarios']);
  }
  goToHistorialMedico() {
    this.router.navigate(['/historial-medico']);
  }


}
