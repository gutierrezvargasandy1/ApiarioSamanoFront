import { NgModule, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Login } from './auth/login/login';
import { ForgotPassword } from './auth/forgot-password/forgot-password';
import { Navbar } from './core/navbar/navbar';
import { Header } from './core/header/header';
import { Home } from './pages/home/home';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Cosechas } from './pages/cosechas/cosechas';
import { Lotes } from './pages/lotes/lotes';
import { Apiarios } from './pages/apiarios/apiarios';
import { HttpClientModule } from '@angular/common/http';
import { Almacenes } from './pages/almacenes/almacenes';
import { Usuarios } from './pages/usuarios/usuarios';
import { HistorialMedico } from './pages/historial-medico/historial-medico';
import { Herramientas } from './pages/herramientas/herramientas';
import { MateriasPrimas } from './pages/materias-primas/materias-primas';
import { Proveedores } from './pages/proveedores/proveedores';
import { Footer } from './core/footer/footer';

@NgModule({
  declarations: [
    App,
    Login,
    ForgotPassword,
    Home,
    Cosechas,
    Lotes,
    Apiarios,
    Almacenes,
    Usuarios,
    HistorialMedico,
    Herramientas,
    MateriasPrimas,
    Proveedores,
    Footer
  // 
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    Navbar,
    Header,
    FormsModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideClientHydration(withEventReplay())
  ],
  bootstrap: [App]
})
export class AppModule { }
