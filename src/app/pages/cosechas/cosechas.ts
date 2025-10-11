import { Component } from '@angular/core';

@Component({
  selector: 'app-cosechas',
  standalone: false,
  templateUrl: './cosechas.html',
  styleUrl: './cosechas.css'
})

export class Cosechas {
  cosechas = [
    { id: 'C001', fecha: new Date('2025-06-01'), calidad: 'Sabor', cantidad: 25, apiario: 'A001' },
    { id: 'C002', fecha: new Date('2025-05-15'), calidad: 'Color', cantidad: 40, apiario: 'A002' },
    { id: 'C003', fecha: new Date('2025-04-10'), calidad: 'Densidad', cantidad: 30, apiario: 'A003' }
  ];

  terminoBusqueda: string = '';
  mostrarFormulario: boolean = false;
  editando: boolean = false;
  cosechaSeleccionada: any = {};

  filtrarCosechas() {
    return this.cosechas.filter(c =>
      c.calidad.toLowerCase().includes(this.terminoBusqueda.toLowerCase()) ||
      c.fecha.toLocaleDateString().includes(this.terminoBusqueda)
    );
  }

  abrirFormulario(cosecha?: any) {
    this.mostrarFormulario = true;
    if (cosecha) {
      this.editando = true;
      this.cosechaSeleccionada = { ...cosecha };
    } else {
      this.editando = false;
      this.cosechaSeleccionada = {};
    }
  }

  cerrarFormulario() {
    this.mostrarFormulario = false;
  }

  guardarCosecha() {
    if (this.editando) {
      const index = this.cosechas.findIndex(c => c.id === this.cosechaSeleccionada.id);
      this.cosechas[index] = this.cosechaSeleccionada;
    } else {
      this.cosechas.push({ ...this.cosechaSeleccionada });
    }
    this.cerrarFormulario();
  }

  editarCosecha(cosecha: any) {
    this.abrirFormulario(cosecha);
  }

  eliminarCosecha(cosecha: any) {
    this.cosechas = this.cosechas.filter(c => c !== cosecha);
  }
}
