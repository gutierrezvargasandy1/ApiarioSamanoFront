import { Component } from '@angular/core';

@Component({
  selector: 'app-historial-medico',
  standalone: false,
  templateUrl: './historial-medico.html',
  styleUrl: './historial-medico.css'
})


export class HistorialMedico{
  historiales = [
    { id: 1, medicamento: 'Oxitetraciclina', detalles: 'Tratamiento de varroasis', notas: 'Dosis: 1ml por colmena' },
    { id: 2, medicamento: 'Fumagilina', detalles: 'Prevención de Nosema', notas: 'Aplicar en jarabe de azúcar' }
  ];

  terminoBusqueda: string = '';
  historialSeleccionado: any = null;
  mostrarFormulario: boolean = false;
  editando: boolean = false;

  filtrarHistoriales() {
    return this.historiales.filter(h =>
      h.medicamento.toLowerCase().includes(this.terminoBusqueda.toLowerCase())
    );
  }

  seleccionarHistorial(historial: any) {
    this.historialSeleccionado = historial;
  }

  abrirFormulario(historial?: any) {
    this.mostrarFormulario = true;
    if (historial) {
      this.editando = true;
      this.historialSeleccionado = { ...historial };
    } else {
      this.editando = false;
      this.historialSeleccionado = {};
    }
  }

  cerrarFormulario() {
    this.mostrarFormulario = false;
  }

  guardarHistorial() {
    if (this.editando) {
      const index = this.historiales.findIndex(h => h.id === this.historialSeleccionado.id);
      this.historiales[index] = this.historialSeleccionado;
    } else {
      const nuevoId = this.historiales.length ? Math.max(...this.historiales.map(h => h.id)) + 1 : 1;
      this.historialSeleccionado.id = nuevoId;
      this.historiales.push({ ...this.historialSeleccionado });
    }
    this.cerrarFormulario();
  }

  editarHistorial(historial: any) {
    this.abrirFormulario(historial);
  }

  imprimirHistorial() {
    window.print();
  }
}
