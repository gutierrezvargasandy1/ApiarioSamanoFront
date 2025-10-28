import { Component, OnInit } from '@angular/core';
import { UsuariosService, Usuario } from '../../services/usuariosService/usuarios-service';

@Component({
  selector: 'app-usuarios',
  standalone: false,
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})
export class Usuarios implements OnInit {

  usuarios: Usuario[] = [];
  terminoBusqueda: string = '';
  mostrarFormulario: boolean = false;
  editando: boolean = false;
  mensaje: string = ''; // ✅ mensaje visual
  cargando: boolean = false; // ✅ Propiedad agregada para loading state
  
  usuarioSeleccionado: Usuario = {
    nombre: '',
    apellidoPa: '',
    apellidoMa: '',
    email: '',
    contrasena: '',
    rol: ''
  };

  constructor(private usuariosService: UsuariosService) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.cargando = true; // ✅ Activar loading
    this.usuariosService.obtenerUsuarios().subscribe({
      next: (response) => {
        this.usuarios = response.data || [];
        console.log('Usuarios cargados:', this.usuarios);
        this.cargando = false; // ✅ Desactivar loading
      },
      error: (error) => {
        console.error('Error al obtener usuarios:', error);
        this.cargando = false; // ✅ Desactivar loading en caso de error
      }
    });
  }

  filtrarUsuarios(): Usuario[] {
    if (!this.usuarios) return [];
    if (!this.terminoBusqueda.trim()) return this.usuarios;

    const termino = this.terminoBusqueda.toLowerCase();
    return this.usuarios.filter(u =>
      (u.nombre + ' ' + u.apellidoPa + ' ' + u.apellidoMa)
        .toLowerCase()
        .includes(termino)
    );
  }

  abrirFormulario(usuario?: Usuario): void {
    this.mostrarFormulario = true;
    if (usuario) {
      this.editando = true;
      this.usuarioSeleccionado = { ...usuario };
    } else {
      this.editando = false;
      this.usuarioSeleccionado = {
        nombre: '',
        apellidoPa: '',
        apellidoMa: '',
        email: '',
        contrasena: '',
        rol: ''
      };
    }
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.editando = false;
  }

  mostrarMensaje(texto: string): void {
    this.mensaje = texto;
    setTimeout(() => (this.mensaje = ''), 3000); // Desaparece en 3s
  }

  guardarUsuario(): void {
    this.cargando = true; // ✅ Activar loading al guardar
    
    if (this.editando) {
      // ✅ Actualizar usuario
      this.usuariosService.actualizarUsuarioPorEmail(
        this.usuarioSeleccionado.email,
        this.usuarioSeleccionado
      ).subscribe({
        next: (res) => {
          // Actualiza localmente sin recargar todo
          const index = this.usuarios.findIndex(u => u.email === this.usuarioSeleccionado.email);
          if (index !== -1) this.usuarios[index] = { ...this.usuarioSeleccionado };
          this.cerrarFormulario();
          this.cargando = false; // ✅ Desactivar loading
          this.mostrarMensaje('✅ Usuario actualizado correctamente');
        },
        error: (err) => {
          console.error('Error al actualizar usuario:', err);
          this.cargando = false; // ✅ Desactivar loading en caso de error
          this.mostrarMensaje('❌ Error al actualizar usuario');
        }
      });
    } else {
      // ✅ Crear usuario nuevo
      this.usuariosService.crearUsuario(this.usuarioSeleccionado).subscribe({
        next: (respuesta) => {
          this.usuarios.push(this.usuarioSeleccionado); 
          this.cerrarFormulario();
          this.cargando = false; // ✅ Desactivar loading
          this.mostrarMensaje('✅ Usuario agregado correctamente');
        },
        error: (err) => {
          console.error('Error al crear usuario:', err);
          this.cargando = false; // ✅ Desactivar loading en caso de error
          this.mostrarMensaje('❌ Error al crear usuario');
        }
      });
    }
  }

  editarUsuario(usuario: Usuario): void {
    this.abrirFormulario(usuario);
  }

  eliminarUsuario(usuario: Usuario): void {
    if (confirm(`¿Seguro que deseas eliminar a ${usuario.nombre}?`)) {
      this.cargando = true; // ✅ Activar loading al eliminar
      
      this.usuariosService.obtenerUsuarioPorEmail(usuario.email).subscribe({
        next: (res) => {
          const id = res.data?.id;
          if (id) {
            this.usuariosService.eliminarUsuario(id).subscribe({
              next: () => {
                this.usuarios = this.usuarios.filter(u => u.email !== usuario.email);
                this.cargando = false; // ✅ Desactivar loading
                this.mostrarMensaje('🗑️ Usuario eliminado correctamente');
              },
              error: (err) => {
                console.error('Error al eliminar usuario:', err);
                this.cargando = false; // ✅ Desactivar loading en caso de error
                this.mostrarMensaje('❌ Error al eliminar usuario');
              }
            });
          } else {
            console.error('⚠️ No se encontró el ID del usuario para eliminar.');
            this.cargando = false; // ✅ Desactivar loading
            this.mostrarMensaje('⚠️ No se encontró el usuario');
          }
        },
        error: (err) => {
          console.error('Error al buscar usuario por email:', err);
          this.cargando = false; // ✅ Desactivar loading en caso de error
          this.mostrarMensaje('❌ Error al buscar usuario');
        }
      });
    }
  }
}