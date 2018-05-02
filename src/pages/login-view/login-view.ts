import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,Platform, ViewController, Toast } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators, ValidatorFn } from '@angular/forms';
import { AuthProvider, ToastProvider, TranslateProvider } from '../../providers';

import { LoadingProvider } from '../../providers/loading/loading';
import { AlertProvider } from '../../providers/alert/alert';


@IonicPage()
@Component({
  selector: 'page-login-view',
  templateUrl: 'login-view.html',
})
export class LoginViewPage {

  private viewType : any;
  private loginForm: FormGroup;
  private registerForm: FormGroup;
  private hasError: boolean;
  private loginText : string;
  private registerText : string;

  private emailValidator: ValidatorFn = Validators.compose([
    Validators.required,
    Validators.email,
    Validators.pattern('^[a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,15})$')
  ]);
  private passwordValidator: ValidatorFn = Validators.compose([
    Validators.required,
    Validators.minLength(6),
    Validators.pattern('^[a-zA-Z0-9!@#$%^&*()_+-=]*$')
  ]);

  constructor(public navCtrl: NavController, 
              public navParams: NavParams, 
              public authProvider: AuthProvider,
              public loadingProvider: LoadingProvider, 
              public alertProvider: AlertProvider,
              public toastProvider: ToastProvider,
              public translate: TranslateProvider,
              public formBuilder: FormBuilder, 
              public viewCtrl: ViewController, 
    ) {
    this.viewType = this.navParams.get('type');

    this.loginForm = formBuilder.group({
      email: ['', this.emailValidator],
      password: ['', this.passwordValidator]
    });
  
    this.registerForm = formBuilder.group({
      email: ['', this.emailValidator],
      password: ['', this.passwordValidator],
      confirmPassword: ['', this.passwordValidator]
    });
   
    this.loginText = this.translate.get('auth.login.text');
    this.registerText = this.translate.get('auth.register.text');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginViewPage');
  }


  login() {

    if (!this.loginForm.valid) {
      this.hasError = true;
      this.loginText = this.translate.get('auth.form.error.email');
    } else {
      this.loadingProvider.show();
      this.authProvider.loginWithEmail(this.loginForm.value['email'], this.loginForm.value['password']).then(res => {
        this.loadingProvider.hide();
        this.viewCtrl.dismiss();
        this.navCtrl.setRoot('LoaderPage');
      }).catch(err => {
        this.toastProvider.show(this.translate.get(err.code));
        this.loadingProvider.hide();
      });
    }

    // this.loadingProvider.show();
    // this.authProvider.loginWithEmail(this.loginForm.value["email"], this.loginForm.value["password"])
    // .then((success) => {
    //   this.loadingProvider.hide();
    //   this.viewCtrl.dismiss();
    // })
    // .catch((error) => {
    //   this.loadingProvider.hide();
    //   // let code = error["code"];
    //   // this.alertProvider.showErrorMessage(code);
    //   this.explain_login='아이디 혹은 비밀번호가 잘못되었습니다.';
    //   this.loginForm.get('password').reset();
    // });
    
  }

  register() {

    if (!this.registerForm.valid || this.registerForm.value['password'] != this.registerForm.value['confirmPassword']) {
      this.hasError = true;
      this.registerText = this.translate.get('auth.form.error.mismatch');
    } else {
      this.loadingProvider.show();
      this.authProvider.registerWithEmail(this.registerForm.value['email'], this.registerForm.value['password']).then(res => {
        this.loadingProvider.hide();
        this.navCtrl.setRoot('LoaderPage');
        this.loadingProvider.hide();
      }).catch(err => {
        this.toastProvider.show(this.translate.get(err.code));
        this.loadingProvider.hide();
      });
    }
    // this.loadingProvider.show();
    // this.authProvider.registerWithEmail(this.registerForm.value["email"], this.registerForm.value["password"])
    //   .then((success) => {
    //     this.loadingProvider.hide();
    //     this.navCtrl.setRoot('LoaderPage');
    //   })
    //   .catch((error) => {
    //     this.loadingProvider.hide();
    //     this.explain_join='회원가입에 실패하였습니다.';
    //     // let code = error["code"];
    //     // this.alertProvider.showErrorMessage(code);
    //   });
  }

  // // Call loginProvider and send a password reset email.
  // forgotPassword() {
  //   this.loginProvider.sendPasswordReset(this.emailForm.value["email"]);
  //   this.clearForms();
  // }

  // // Clear the forms.
  // clearForms() {
  //   this.emailPasswordForm.reset();
  //   this.emailForm.reset();
  // }


}
