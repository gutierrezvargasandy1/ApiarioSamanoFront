import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HistorialMedico } from './pages/historial-medico/historial-medico';
import { Herramientas } from './pages/herramientas/herramientas';
import { MateriasPrimas } from './pages/materias-primas/materias-primas';
import { Proveedores } from './pages/proveedores/proveedores';
import { Login } from './auth/login/login';
import { ForgotPassword } from './auth/forgot-password/forgot-password';
import { Home } from './pages/home/home';
import { Cosechas } from './pages/cosechas/cosechas';
import { Lotes } from './pages/lotes/lotes';
import { Apiarios } from './pages/apiarios/apiarios';
import { Almacenes} from './pages/almacenes/almacenes';
import { Usuarios } from './pages/usuarios/usuarios';
import path from 'path';

const routes: Routes = [
  { path: '', component: Login },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'home', component: Home},
  { path: 'cosechas', component: Cosechas },
  { path: 'lotes', component: Lotes },
  { path: 'apiarios', component: Apiarios },
  { path: 'almacenes', component: Almacenes },
  {path: 'usuarios',component: Usuarios},
  {path: 'historial-medico', component: HistorialMedico},
  {path: 'herramientas', component: Herramientas},
  {path: 'materias-primas', component: MateriasPrimas},
  {path: 'proveedores', component: Proveedores},
  {path: 'login', component: Login },
  { path: '**', redirectTo: 'login' } 
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
