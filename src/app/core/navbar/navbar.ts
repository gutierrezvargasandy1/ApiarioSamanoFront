import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
  standalone: true,
  imports: [CommonModule]
})
export class Navbar implements OnInit, OnDestroy {
  isOperator: boolean = false;
  private routerSub!: Subscription;

  constructor(public router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.verificarRol(); 

    this.routerSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.verificarRol();
      });
  }

  ngOnDestroy(): void {
    if (this.routerSub) this.routerSub.unsubscribe();
  }

  shouldShowNavbar(): boolean {
    return this.router.url !== '/login';
  }

  verificarRol(): void {
    const rol = this.authService.getRoleFromToken();
    this.isOperator = rol === 'OPERADOR';
  }

  // === NAVEGACIÓN ===
  goToHome() { this.router.navigate(['/home']); }
  goToCosechas() { this.router.navigate(['/cosechas']); }
  goToLotes() { this.router.navigate(['/lotes']); }
  goToApiarios() { this.router.navigate(['/apiarios']); }
  goToAlmacenes() { this.router.navigate(['/almacenes']); }
  goToHerramientas() { this.router.navigate(['/herramientas']); }
  goToMateriasPrimas() { this.router.navigate(['/materias-primas']); }
  goToProveedores() { this.router.navigate(['/proveedores']); }
  goToUsuarios() { this.router.navigate(['/usuarios']); }
  goToHistorialMedico() { this.router.navigate(['/historial-medico']); }
}
