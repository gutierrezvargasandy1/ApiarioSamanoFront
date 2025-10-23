import { Component } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';

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
  userRole: string = '';


  constructor(private authService: AuthService) {}

  toggleProfile() {
    this.showProfile = !this.showProfile;
  }

  closeProfile() {
    this.showProfile = false;
  }

  logout() {
    this.authService.cerrarSesion;
  }
}
