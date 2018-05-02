import { Injectable } from '@angular/core';
import { NavController, App } from 'ionic-angular';
import { LoadingProvider, AlertProvider } from '../';
import { AngularFireAuth } from 'angularfire2/auth';

@Injectable()
export class AuthProvider {
  
  private navCtrl: NavController;

  constructor(public loadingProvider: LoadingProvider, public alertProvider: AlertProvider, public afAuth: AngularFireAuth, public appCtrl: App) {
    console.log("Initializing Login Provider");
  }

  setNavController(navCtrl) {
    this.navCtrl = navCtrl;
  }
  // Anonymous Login, after successful authentication, triggers firebase.auth().onAuthStateChanged((user) on top and
  // redirects the user to its respective views. Make sure to enable Anonymous login on Firebase app authentication console.
  // Login on Firebase given the email and password.
  loginWithEmail(email: string, password: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.afAuth.auth.signInWithEmailAndPassword(email, password).then(res => {
        resolve(res);
      }).catch(err => {
        reject(err);
      });
    });
  }

  // Register user on Firebase given the email and password.
  registerWithEmail(email: string, password: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.afAuth.auth.createUserWithEmailAndPassword(email, password).then(res => {
        resolve(res);
      }).catch(err => {
        reject(err);
      });
    });
  }

  // Send Password Reset Email to the user.
  sendPasswordReset(email) {
    this.loadingProvider.show();
    this.afAuth.auth.sendPasswordResetEmail(email)
      .then((success) => {
        this.loadingProvider.hide();
        this.alertProvider.showPasswordResetMessage(email);
      })
      .catch((error) => {
        this.loadingProvider.hide();
        let code = error["code"];
        this.alertProvider.showErrorMessage(code);
      });
  }

  logout(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.afAuth.auth.signOut().then(() => {
        // this.facebook.logout();
        // this.googlePlus.logout();
        // this.twitterConnect.logout();
        resolve();
      }).catch(() => {
        reject();
      });
    });
  }

}