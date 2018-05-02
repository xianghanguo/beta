import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, ModalController } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-heart-charge',
  templateUrl: 'heart-charge.html',
})
export class HeartChargePage {

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController, public modalCtrl:ModalController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad HeartChargePage');
  }

 
  presentHeartHistory(){
    let viewHistory = this.modalCtrl.create('HeartHistoryPage',  {
      enterAnimation: 'modal-slide-in',
      leaveAnimation: 'modal-slide-out'
    });
    viewHistory.onDidDismiss(data => {
      if(data){
        this.ionViewDidLoad();
      }
    });
    viewHistory.present();
  }

}