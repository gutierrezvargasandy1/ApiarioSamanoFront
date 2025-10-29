import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { UsuariosService, Usuario } from '../../services/usuariosService/usuarios-service';
import { ToastService } from '../../services/toastService/toast-service';

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
  mensaje: string = '';
  cargando: boolean = false;

  usuarioSeleccionado: Usuario = {
    nombre: '',
    apellidoPa: '',
    apellidoMa: '',
    email: '',
    contrasena: '',
    rol: ''
  };

  constructor(
    private usuariosService: UsuariosService,
    private toastService: ToastService,
    private ngZone: NgZone,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.cargando = true;
    this.cd.detectChanges();

    this.usuariosService.obtenerUsuarios().subscribe({
      next: (response) => {
        this.ngZone.run(() => {
          this.usuarios = response.data || [];
          console.log('Usuarios cargados:', this.usuarios);
          this.cargando = false;
          this.cd.detectChanges();
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          this.cargando = false;
          this.toastService.error('Error', 'No se pudieron cargar los usuarios');
          this.cd.detectChanges();
        });
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
    this.ngZone.run(() => {
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
      this.cd.detectChanges();
    });
  }

  cerrarFormulario(): void {
    this.ngZone.run(() => {
      this.mostrarFormulario = false;
      this.editando = false;
      this.cd.detectChanges();
    });
  }

  guardarUsuario(): void {
    this.cargando = true;
    this.cd.detectChanges();

    if (this.editando) {
      this.usuariosService.actualizarUsuarioPorEmail(
        this.usuarioSeleccionado.email,
        this.usuarioSeleccionado
      ).subscribe({
        next: (res) => {
          this.ngZone.run(() => {
            const index = this.usuarios.findIndex(u => u.email === this.usuarioSeleccionado.email);
            if (index !== -1) this.usuarios[index] = { ...this.usuarioSeleccionado };
            this.cerrarFormulario();
            this.cargando = false;
            this.toastService.success('Éxito', 'Usuario actualizado correctamente');
            this.cd.detectChanges();
          });
        },
        error: (err) => {
          this.ngZone.run(() => {
            console.error('Error al actualizar usuario:', err);
            this.cargando = false;
            this.toastService.error('Error', 'No se pudo actualizar el usuario');
            this.cd.detectChanges();
          });
        }
      });
    } else {
      this.usuariosService.crearUsuario(this.usuarioSeleccionado).subscribe({
        next: (respuesta) => {
          this.ngZone.run(() => {
            this.usuarios.push({ ...this.usuarioSeleccionado });
            this.cerrarFormulario();
            this.cargando = false;
            this.toastService.success('Éxito', 'Usuario creado correctamente');
            this.cd.detectChanges();
          });
        },
        error: (err) => {
          this.ngZone.run(() => {
            console.error('Error al crear usuario:', err);
            this.cargando = false;
            this.toastService.error('Error', 'No se pudo crear el usuario');
            this.cd.detectChanges();
          });
        }
      });
    }
  }

  editarUsuario(usuario: Usuario): void {
    this.abrirFormulario(usuario);
  }

  eliminarUsuario(usuario: Usuario): void {
    if (confirm(`¿Seguro que deseas eliminar a ${usuario.nombre}?`)) {
      this.cargando = true;
      this.cd.detectChanges();

      this.usuariosService.obtenerUsuarioPorEmail(usuario.email).subscribe({
        next: (res) => {
          this.ngZone.run(() => {
            const id = res.data?.id;
            if (id) {
              this.usuariosService.eliminarUsuario(id).subscribe({
                next: () => {
                  this.ngZone.run(() => {
                    this.usuarios = this.usuarios.filter(u => u.email !== usuario.email);
                    this.cargando = false;
                    this.toastService.success('Éxito', 'Usuario eliminado correctamente');
                    this.cd.detectChanges();
                  });
                },
                error: (err) => {
                  this.ngZone.run(() => {
                    console.error('Error al eliminar usuario:', err);
                    this.cargando = false;
                    this.toastService.error('Error', 'No se pudo eliminar el usuario');
                    this.cd.detectChanges();
                  });
                }
              });
            } else {
              console.error('⚠️ No se encontró el ID del usuario para eliminar.');
              this.cargando = false;
              this.toastService.warning('Advertencia', 'No se encontró el usuario');
              this.cd.detectChanges();
            }
          });
        },
        error: (err) => {
          this.ngZone.run(() => {
            console.error('Error al buscar usuario por email:', err);
            this.cargando = false;
            this.toastService.error('Error', 'Error al buscar usuario');
            this.cd.detectChanges();
          });
        }
      });
    }
  }
}
