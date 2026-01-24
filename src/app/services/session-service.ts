import { StorageService } from '@/storage/StorageService';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SessionService extends StorageService {
  constructor(){
    super(window.sessionStorage)
  }
}
