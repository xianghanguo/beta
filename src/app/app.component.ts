import { Component, ViewChild, NgZone } from '@angular/core';
import { Platform, Nav, Config, AlertController, IonicApp, ToastController, App } from 'ionic-angular';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { MobileAccessibility } from '@ionic-native/mobile-accessibility';
import { AngularFireAuth } from 'angularfire2/auth';
import { TranslateService } from '@ngx-translate/core';
import { TranslateProvider } from '../providers';
import { ImageLoaderConfig } from 'ionic-image-loader';
import { Keyboard } from '@ionic-native/keyboard';
import { AngularFireDatabase } from 'angularfire2/database';
import firebase from 'firebase';

@Component({
  templateUrl: 'app.html'
})

export class MyApp {
  @ViewChild(Nav) nav: Nav;
  rootPage: any;

  private user : any;
  private alertShown:boolean = false;

  constructor(
    private platform: Platform, 
    private statusBar: StatusBar, 
    private splashScreen: SplashScreen, 
    private mobileAccessibility: MobileAccessibility,
    private afAuth:AngularFireAuth,
    private translateService: TranslateService,
    private translate: TranslateProvider,
    private keyboard: Keyboard,
    private toastCtrl: ToastController,
    private app: App,
    private ionicApp: IonicApp,
    private imageLoader: ImageLoaderConfig,
    private afDB: AngularFireDatabase,
    private screenOrientation : ScreenOrientation

  
    ) {

    platform.ready().then(() => {

//       this.platform.pause.subscribe(() => {
//         this.afDB.database.ref('/accounts/'+this.afAuth.auth.currentUser.uid).update({
//           lastLogin: firebase.database['ServerValue'].TIMESTAMP
//         })
//       });
     

      if (this.platform.is('cordova')) { 
        this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);  
       }

      statusBar.styleDefault();
      splashScreen.hide();
      imageLoader.spinnerEnabled = false;
      imageLoader.fallbackAsPlaceholder = true;
      imageLoader.useImg = true;
      imageLoader.enableDebugMode();
      imageLoader.enableFallbackAsPlaceholder(true);
      imageLoader.setFallbackUrl('assets/imgs/logo.png')
      imageLoader.setMaximumCacheAge(7 * 24 * 60 * 60 * 1000);
      
      keyboard.disableScroll(true);
      mobileAccessibility.usePreferredTextZoom(false);
      
      translateService.setDefaultLang('en');
      translateService.use('en');
      translateService.getTranslation('en').subscribe(translations => {
      translate.setTranslations(translations);
      this.rootPage = 'LoaderPage';
      })
         

      let lastTimeBackPress = 0;
      let timePeriodToExit = 2000;

      platform.registerBackButtonAction(() => {
        let activePortal = this.ionicApp._loadingPortal.getActive() || // Close If Any Loader Active
        ionicApp._modalPortal.getActive() ||  // Close If Any Modal Active
        ionicApp._overlayPortal.getActive(); // Close If Any Overlay Active

        let nav = app.getActiveNavs()[0];   
        if (activePortal) {
            activePortal.dismiss();
        }
        else if(nav.canGoBack()){
          nav.pop();
        }else{
            //Double check to exit app
            if (new Date().getTime() - lastTimeBackPress < timePeriodToExit) {

              
                this.afDB.database.ref('/accounts/'+this.afAuth.auth.currentUser.uid).update({
                  connection:'disconnected'
                })
                platform.exitApp(); //Exit from app

            } else {
              toastCtrl.create({
                message: "Press back button again to exit",
                duration: 2000,
                position: 'bottom'
              }).present();
              lastTimeBackPress = new Date().getTime();
            }
        }            
      });
      
    }).catch(()=> {
      translateService.setDefaultLang('en');
      translateService.use('en');
      translateService.getTranslation('en').subscribe(translations => {
      translate.setTranslations(translations);
      this.rootPage = 'LoaderPage';
      })
    });
    
  }
}
