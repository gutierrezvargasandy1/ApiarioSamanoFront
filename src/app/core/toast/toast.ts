import { Component, OnInit, OnDestroy } from '@angular/core';
import { ToastService, ToastMessage } from '../../services/toastService/toast-service';
import { Subscription } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-toast',
  standalone: false,
  templateUrl: './toast.html',
  styleUrls: ['./toast.css'],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 }))
      ])
    ])
  ]
})
export class Toast implements OnInit, OnDestroy {
  toasts: ToastMessage[] = [];
  private subscription: Subscription = new Subscription();
  private timeouts: Map<number, any> = new Map();

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.subscription = this.toastService.toasts$.subscribe(toast => {
      this.toasts.push(toast);

      // Auto-cierre con duración
      if (toast.duration) {
        const timeout = setTimeout(() => {
          this.removeToast(toast.id);
        }, toast.duration);

        this.timeouts.set(toast.id, timeout);
      }
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.timeouts.forEach(timeout => clearTimeout(timeout));
    this.timeouts.clear();
  }

  removeToast(id: number) {
    const timeout = this.timeouts.get(id);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(id);
    }
    this.toasts = this.toasts.filter(toast => toast.id !== id);
  }

  getIcon(type: 'success' | 'error' | 'warning' | 'info'): string {
    const icons: Record<string, string> = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    return icons[type] || 'ℹ️';
  }
}
