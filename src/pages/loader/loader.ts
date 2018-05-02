import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Storage } from '@ionic/storage';
import firebase from 'firebase';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';

@IonicPage()
@Component({
  selector: 'page-loader',
  templateUrl: 'loader.html',
})
export class LoaderPage {

  constructor(private navCtrl: NavController,
    private navParams: NavParams,
    private splashScreen: SplashScreen,
    private storage: Storage,
    private afAuth: AngularFireAuth,
    private afDB: AngularFireDatabase,
    private zone: NgZone) {
  }

  ionViewWillEnter() {
    // Show the splashScreen while the page to show to the user is still loading.
    this.splashScreen.show();
    this.storage.get('introShown').then((introShown: boolean) => {
      // Check if user is loading the app for the very first time and show the IntroPage.
      // if (introShown) {
        // Check if user is authenticated on Firebase or not.
        this.afAuth.authState.subscribe((user) => {
          if (!user) {
            // User is not authenticated, proceed to LoginPage.
            this.navCtrl.setRoot('LoginPage');
            this.splashScreen.hide();
          } else {
            // Check if userData is already created on Firestore.
            if(!user["emailVerified"]){
              this.zone.run(()=> {
                this.navCtrl.setRoot('VerificationPage');
              })
            }
            else{
              this.afDB.database.ref('accounts/' + user.uid).once('value', account => {
                if(!account.exists()){

                  this.zone.run(()=> {
                    this.navCtrl.setRoot('ProfileCreatePage');
                  })
                  this.splashScreen.hide();
                }
                else {
                  
                  this.zone.run(() => {
                    this.navCtrl.setRoot('TabsPage');
                  });
                  this.splashScreen.hide();
                }
              }).catch(() => { });
            }
            
          }
        })
      // } else {
      //   // User is loading the app for the very first time, show IntroPage.
      //   this.navCtrl.setRoot('IntroPage');
      //   this.splashScreen.hide();
      //   this.storage.set('introShown', true);
      // }
    }).catch(() => { });
  }


   
}
