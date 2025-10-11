import { Component } from '@angular/core';
import { NgModel } from '@angular/forms';

@Component({
  selector: 'app-apiarios',
  standalone: false,
  templateUrl: './apiarios.html',
  styleUrl: './apiarios.css'
})

export class Apiarios {
  apiarios = [
    { id: 1, numeroApiario: 1, ubicacion: 'Rancho El Sol', salud: 'Excelente', medicionActual: '8.5' },
    { id: 2, numeroApiario: 2, ubicacion: 'Campo Los Olivos', salud: 'Buena', medicionActual: '7.9' },
    { id: 3, numeroApiario: 3, ubicacion: 'Colinas del Panal', salud: 'Regular', medicionActual: '6.2' }
  ];

  terminoBusqueda: string = '';
  mostrarFormulario: boolean = false;
  editando: boolean = false;
  apiarioSeleccionado: any = {};

  filtrarApiarios() {
    return this.apiarios
      .filter(a => a.ubicacion.toLowerCase().includes(this.terminoBusqueda.toLowerCase()))
      .sort((a, b) => a.numeroApiario - b.numeroApiario);
  }

  abrirFormulario(apiario?: any) {
    this.mostrarFormulario = true;
    if (apiario) {
      this.editando = true;
      this.apiarioSeleccionado = { ...apiario };
    } else {
      this.editando = false;
      this.apiarioSeleccionado = {};
    }
  }

  cerrarFormulario() {
    this.mostrarFormulario = false;
  }

  guardarApiario() {
    if (this.editando) {
      const index = this.apiarios.findIndex(a => a.id === this.apiarioSeleccionado.id);
      this.apiarios[index] = this.apiarioSeleccionado;
    } else {
      const nuevoId = this.apiarios.length ? Math.max(...this.apiarios.map(a => a.id)) + 1 : 1;
      this.apiarioSeleccionado.id = nuevoId;
      this.apiarios.push({ ...this.apiarioSeleccionado });
    }
    this.cerrarFormulario();
  }

  editarApiario(apiario: any) {
    this.abrirFormulario(apiario);
  }

  eliminarApiario(apiario: any) {
    this.apiarios = this.apiarios.filter(a => a !== apiario);
  }
}
