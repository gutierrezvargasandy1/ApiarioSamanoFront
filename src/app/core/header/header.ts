import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
  standalone: true
})
export class Header {
  showProfile = false;
  userName = 'Raul Samano';
  userEmail = 'demo@empresa.com';
  userPhone = '1234567890';

  toggleProfile() {
    this.showProfile = !this.showProfile;
  }

  closeProfile() {
    this.showProfile = false;
  }

  logout() {
    // lógica para cerrar sesión
    console.log('Cerrando sesión...');
  }
}
