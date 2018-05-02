import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, Platform  } from 'ionic-angular';
import { FormBuilder, FormGroup } from '@angular/forms';

import { Validator } from '../../validator';


@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  private opts_login: any = {
    showBackdrop: true,
    enableBackdropDismiss: true,
    cssClass:'x-login-view'
  }

  private opts_join: any = {
    showBackdrop: true,
    enableBackdropDismiss: true,
    cssClass:'x-join-view'
  }


  constructor(
    public navCtrl: NavController, public navParams: NavParams, public modalCtrl: ModalController) {
  }


  viewLogin(){
    let loginModal = this.modalCtrl.create('LoginViewPage',{type:'login'},this.opts_login);
    loginModal.present();
  }
  viewJoin(){
    let joinModal = this.modalCtrl.create('LoginViewPage',{type:'join'},this.opts_join);
    joinModal.present();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
  }

}
