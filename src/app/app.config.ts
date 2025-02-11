import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), importProvidersFrom(provideFirebaseApp(() => initializeApp({"projectId":"join-68e48","appId":"1:6207862627:web:9bdb9ca8319425be918556","storageBucket":"join-68e48.firebasestorage.app","apiKey":"AIzaSyCPBSd0ZgKnP1Fjjx4lTGfQfm1xcRUcReA","authDomain":"join-68e48.firebaseapp.com","messagingSenderId":"6207862627"}))), importProvidersFrom(provideAuth(() => getAuth())), importProvidersFrom(provideFirestore(() => getFirestore()))]
};
