import { Component } from '@angular/core';

@Component({
  selector: 'app-lotes',
  standalone: false,
  templateUrl: './lotes.html',
  styleUrl: './lotes.css'
})



export class Lotes {
  lotes = [
    { id: 'L001', fecha: new Date('2025-05-01'), cosechas: 3, estado: 'Activo' },
    { id: 'L002', fecha: new Date('2025-04-15'), cosechas: 2, estado: 'En proceso' },
    { id: 'L003', fecha: new Date('2025-03-10'), cosechas: 5, estado: 'Finalizado' }
  ];

  terminoBusqueda: string = '';
  mostrarFormulario: boolean = false;
  editando: boolean = false;
  loteSeleccionado: any = {};

  filtrarLotes() {
    return this.lotes.filter(l =>
      l.id.toLowerCase().includes(this.terminoBusqueda.toLowerCase()) ||
      l.estado.toLowerCase().includes(this.terminoBusqueda.toLowerCase())
    );
  }

  abrirFormulario(lote?: any) {
    this.mostrarFormulario = true;
    if (lote) {
      this.editando = true;
      this.loteSeleccionado = { ...lote };
    } else {
      this.editando = false;
      this.loteSeleccionado = {};
    }
  }

  cerrarFormulario() {
    this.mostrarFormulario = false;
  }

  guardarLote() {
    if (this.editando) {
      const index = this.lotes.findIndex(l => l.id === this.loteSeleccionado.id);
      this.lotes[index] = this.loteSeleccionado;
    } else {
      this.lotes.push({ ...this.loteSeleccionado });
    }
    this.cerrarFormulario();
  }

  editarLote(lote: any) {
    this.abrirFormulario(lote);
  }

  eliminarLote(lote: any) {
    this.lotes = this.lotes.filter(l => l !== lote);
  }
}
