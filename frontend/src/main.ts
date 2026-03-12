import './style.css';
import { handleLocation } from './router';

window.showToast = (message: string, isError: boolean = false): void => {
  const toast = document.createElement('div');
  toast.className = `toast ${isError ? 'toast-error' : 'toast-success'}`;
  toast.innerText = message;
  
  document.body.appendChild(toast);
  
  setTimeout(() => toast.classList.add('show'), 10);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};

document.addEventListener('DOMContentLoaded', () => {
  handleLocation();
});