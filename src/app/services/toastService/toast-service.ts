import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ToastMessage {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastSubject = new Subject<ToastMessage>();
  public toasts$ = this.toastSubject.asObservable();
  private idCounter = 0;

  show(type: 'success' | 'error' | 'warning' | 'info', title: string, message: string, duration: number = 4000) {
    const toast: ToastMessage = { id: this.idCounter++, type, title, message, duration };
    this.toastSubject.next(toast);
  }

  success(title: string, message: string, duration?: number) {
    this.show('success', title, message, duration);
  }

  error(title: string, message: string, duration?: number) {
    this.show('error', title, message, duration);
  }

  warning(title: string, message: string, duration?: number) {
    this.show('warning', title, message, duration);
  }

  info(title: string, message: string, duration?: number) {
    this.show('info', title, message, duration);
  }
}
