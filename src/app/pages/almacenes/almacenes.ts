import { Component, OnInit } from '@angular/core';
import { AlmacenService, Almacen, AlmacenRequest, ResponseDTO } from '../../services/almaceneService/almacen-service';

@Component({
  selector: 'app-almacenes',
  standalone: false,
  templateUrl: './almacenes.html',
  styleUrl: './almacenes.css'
})
export class Almacenes implements OnInit {
  almacenes: Almacen[] = [];
  terminoBusqueda: string = '';
  mostrarFormulario: boolean = false;
  editando: boolean = false;
  almacenSeleccionado: Partial<Almacen> = {};
  cargando: boolean = false;
  error: string = '';

  constructor(private almacenService: AlmacenService) {}

  ngOnInit(): void {
    this.cargarAlmacenes();
  }

  cargarAlmacenes(): void {
    this.cargando = true;
    this.error = '';
    console.log("comenzando el proceso")
    this.almacenService.obtenerAlmacenes().subscribe({
      next: (response: ResponseDTO<Almacen[]>) => {
        if (response.data) {
          this.almacenes = response.data;
          console.log("estos son los almacenes que tienes",this.almacenes);
        } else {
          this.error = response.message || 'Error al cargar almacenes';
        }
        this.cargando = false;
      },
      error: (err) => {
        this.error = 'Error de conexión al servidor';
        console.error('Error al cargar almacenes:', err);
        this.cargando = false;
      }
    });
  }

  filtrarAlmacenes(): Almacen[] {
    if (!this.terminoBusqueda.trim()) {
      return this.almacenes;
    }
    
    return this.almacenes.filter(a =>
      a.ubicacion.toLowerCase().includes(this.terminoBusqueda.toLowerCase()) ||
      a.numeroSeguimiento.toLowerCase().includes(this.terminoBusqueda.toLowerCase())
    );
  }

  abrirFormulario(almacen?: Almacen): void {
    this.mostrarFormulario = true;
    this.error = '';
    
    if (almacen) {
      this.editando = true;
      this.almacenSeleccionado = { ...almacen };
    } else {
      this.editando = false;
      this.almacenSeleccionado = {
        ubicacion: '',
        capacidad: 0
      };
    }
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.almacenSeleccionado = {};
    this.error = '';
  }

  guardarAlmacen(): void {
    // Validación básica
    if (!this.almacenSeleccionado.ubicacion || !this.almacenSeleccionado.capacidad) {
      this.error = 'Por favor complete todos los campos';
      return;
    }

    if (this.editando) {
      // Para editar necesitarías implementar el método actualizar en el servicio
      this.error = 'La funcionalidad de edición requiere implementar el endpoint de actualización en el backend';
      return;
    } else {
      // Crear nuevo almacén
      const request: AlmacenRequest = {
        ubicacion: this.almacenSeleccionado.ubicacion!,
        capacidad: this.almacenSeleccionado.capacidad!
      };

      this.cargando = true;
      this.almacenService.crearAlmacen(request).subscribe({
        next: (response: ResponseDTO<Almacen>) => {
          if (response.statusCode === 201 || response.statusCode === 200) {
            this.almacenes.push(response.data);
            this.cerrarFormulario();
          } else {
            this.error = response.message || 'Error al crear almacén';
          }
          this.cargando = false;
        },
        error: (err) => {
          this.error = 'Error al crear almacén';
          console.error('Error:', err);
          this.cargando = false;
        }
      });
    }
  }

  editarAlmacen(almacen: Almacen): void {
    this.abrirFormulario(almacen);
  }

  eliminarAlmacen(almacen: Almacen): void {
    if (!confirm(`¿Está seguro de eliminar el almacén ${almacen.numeroSeguimiento}?`)) {
      return;
    }

    this.cargando = true;
    this.almacenService.eliminarAlmacen(almacen.id).subscribe({
      next: (response: ResponseDTO<void>) => {
        if (response.statusCode === 200 || response.statusCode === 204) {
          this.almacenes = this.almacenes.filter(a => a.id !== almacen.id);
        } else {
          this.error = response.message || 'Error al eliminar almacén';
        }
        this.cargando = false;
      },
      error: (err) => {
        this.error = 'Error al eliminar almacén';
        console.error('Error:', err);
        this.cargando = false;
      }
    });
  }

  calcularEspaciosOcupados(almacen: Almacen): number {
    let ocupados = 0;
    
    if (almacen.herramientas) {
      ocupados += almacen.herramientas.length;
    }
    if (almacen.materiasPrimas) {
      ocupados += almacen.materiasPrimas.length;
    }
    if (almacen.medicamentos) {
      ocupados += almacen.medicamentos.length;
    }
    
    return ocupados;
  }
}