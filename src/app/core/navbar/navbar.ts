import { Component, OnInit, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

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

  constructor(
    public router: Router, 
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object // ✅ INYECTAR PLATFORM_ID
  ) {}

  ngOnInit(): void {
    // ✅ SOLO EJECUTAR EN EL NAVEGADOR
    if (isPlatformBrowser(this.platformId)) {
      this.verificarRol(); 

      this.routerSub = this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe(() => {
          this.verificarRol();
        });
    }
  }

  ngOnDestroy(): void {
    if (this.routerSub) this.routerSub.unsubscribe();
  }

  shouldShowNavbar(): boolean {
    return this.router.url !== '/login';
  }

  verificarRol(): void {
    // ✅ YA NO NECESITA VERIFICACIÓN ADICIONAL PORQUE ngOnInit YA LO HIZO
    const rol = this.authService.getRoleFromToken();
    this.isOperator = rol === 'OPERADOR';
  }

  // === NAVEGACIÓN ===
  goToHome() { this.router.navigate(['/home']); }
  goToProduccion() { this.router.navigate(['/produccion']); }
  goToLotes() { this.router.navigate(['/lotes']); }
  goToApiarios() { this.router.navigate(['/apiarios']); }
  goToAlmacenes() { this.router.navigate(['/almacenes']); }
  goToHerramientas() { this.router.navigate(['/herramientas']); }
  goToMateriasPrimas() { this.router.navigate(['/materias-primas']); }
  goToProveedores() { this.router.navigate(['/proveedores']); }
  goToUsuarios() { this.router.navigate(['/usuarios']); }
  goToHistorialMedico() { this.router.navigate(['/medicamentos']); }
}