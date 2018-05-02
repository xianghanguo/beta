import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { IonicImageLoader } from 'ionic-image-loader';
import { File } from '@ionic-native/file';
import { ScreenOrientation } from '@ionic-native/screen-orientation'
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { Environment } from "../environments/environment"
import { FCM } from '@ionic-native/fcm';

import { IonicStorageModule, Storage } from '@ionic/storage';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { MobileAccessibility } from '@ionic-native/mobile-accessibility';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireDatabase } from 'angularfire2/database-deprecated';


import { LoadingProvider, AlertProvider, DataProvider, ImageProvider, RequestProvider, AuthProvider, NotificationProvider, ToastProvider, TranslateProvider, Settings  } from '../providers';

import { InAppPurchase2 } from '@ionic-native/in-app-purchase-2';

import { Camera } from '@ionic-native/camera';
import { Keyboard } from '@ionic-native/keyboard';
import * as ionicGalleryModal from 'ionic-gallery-modal';
import { HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { StorageProvider } from '../providers/storage/storage';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export function provideSettings(storage: Storage) {
  /**
   * The Settings provider takes a set of default settings for your app.
   *
   * You can add new settings options at any time. Once the settings are saved,
   * these values will not overwrite the saved values (this can be done manually if desired).
   */
  return new Settings(storage, {
    option1: true,
    option2: 'Ionitron J. Framework',
    option3: '3',
    option4: 'Hello'
  });
}



@NgModule({
  declarations: [
    MyApp
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp, {
      scrollAssist: false,
    }),
    AngularFireModule.initializeApp(Environment.firebase),
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    IonicStorageModule.forRoot(),
    IonicImageLoader.forRoot(),
    ionicGalleryModal.GalleryModalModule,
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp
  ],
  providers: [
    StatusBar,
    SplashScreen,
    MobileAccessibility,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    FCM,
    File,
    Keyboard,
    LoadingProvider,
    AlertProvider,
    DataProvider,
    ImageProvider,
    RequestProvider,
    AuthProvider,
    NotificationProvider,
    ToastProvider,
    TranslateProvider,
    AngularFireDatabase,
    { provide: Settings, useFactory: provideSettings, deps: [Storage] },
    {
      provide: HAMMER_GESTURE_CONFIG,
      useClass: ionicGalleryModal.GalleryModalHammerConfig,
    },
    Camera,
    ScreenOrientation,
    InAppPurchase2,
    StorageProvider
  ]
})
export class AppModule {}
