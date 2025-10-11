import { Component } from '@angular/core';

@Component({
  selector: 'app-almacenes',
  standalone: false,
  templateUrl: './almacenes.html',
  styleUrl: './almacenes.css'
})


export class Almacenes {
  almacenes = [
    { id: 'A001', ubicacion: 'Centro', espaciosOcupados: 15, capacidad: 30 },
    { id: 'A002', ubicacion: 'Norte', espaciosOcupados: 10, capacidad: 25 },
    { id: 'A003', ubicacion: 'Sur', espaciosOcupados: 20, capacidad: 40 }
  ];

  terminoBusqueda: string = '';
  mostrarFormulario: boolean = false;
  editando: boolean = false;
  almacenSeleccionado: any = {};

  filtrarAlmacenes() {
    return this.almacenes.filter(a =>
      a.ubicacion.toLowerCase().includes(this.terminoBusqueda.toLowerCase())
    );
  }

  abrirFormulario(almacen?: any) {
    this.mostrarFormulario = true;
    if (almacen) {
      this.editando = true;
      this.almacenSeleccionado = { ...almacen };
    } else {
      this.editando = false;
      this.almacenSeleccionado = {};
    }
  }

  cerrarFormulario() {
    this.mostrarFormulario = false;
  }

  guardarAlmacen() {
    if (this.editando) {
      const index = this.almacenes.findIndex(a => a.id === this.almacenSeleccionado.id);
      this.almacenes[index] = this.almacenSeleccionado;
    } else {
      this.almacenes.push({ ...this.almacenSeleccionado });
    }
    this.cerrarFormulario();
  }

  editarAlmacen(almacen: any) {
    this.abrirFormulario(almacen);
  }

  eliminarAlmacen(almacen: any) {
    this.almacenes = this.almacenes.filter(a => a !== almacen);
  }
}

