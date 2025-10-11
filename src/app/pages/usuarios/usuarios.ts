import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-usuarios',
  standalone: false,
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
  
})

export class Usuarios {
  usuarios = [
    { nombre: 'Carlos', correo: 'carlos@example.com', apellidoPat: 'Ramírez', apellidoMat: 'Gómez', rol: 'Administrador' },
    { nombre: 'María', correo: 'maria@example.com', apellidoPat: 'López', apellidoMat: 'Hernández', rol: 'Empleado' }
  ];

  terminoBusqueda: string = '';
  mostrarFormulario: boolean = false;
  editando: boolean = false;
  usuarioSeleccionado: any = {};

  filtrarUsuarios() {
    return this.usuarios.filter(u =>
      (u.nombre + u.apellidoPat + u.apellidoMat)
        .toLowerCase()
        .includes(this.terminoBusqueda.toLowerCase())
    );
  }

  abrirFormulario(usuario?: any) {
    this.mostrarFormulario = true;
    if (usuario) {
      this.editando = true;
      this.usuarioSeleccionado = { ...usuario };
    } else {
      this.editando = false;
      this.usuarioSeleccionado = {};
    }
  }

  cerrarFormulario() {
    this.mostrarFormulario = false;
  }

  guardarUsuario() {
    if (this.editando) {
      const index = this.usuarios.findIndex(u => u.correo === this.usuarioSeleccionado.correo);
      this.usuarios[index] = this.usuarioSeleccionado;
    } else {
      this.usuarios.push({ ...this.usuarioSeleccionado });
    }
    this.cerrarFormulario();
  }

  editarUsuario(usuario: any) {
    this.abrirFormulario(usuario);
  }

  eliminarUsuario(usuario: any) {
    this.usuarios = this.usuarios.filter(u => u !== usuario);
  }
}
