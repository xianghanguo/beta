import { Component } from '@angular/core';
import { IonicPage, NavParams } from 'ionic-angular';
import { ViewController } from 'ionic-angular/navigation/view-controller';


@IonicPage()
@Component({
  selector: 'page-contest-profile',
  templateUrl: 'contest-profile.html',
})
export class ContestProfilePage {

  public candidate: any;
  
  constructor(public viewCtrl: ViewController, public navParam: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ContestProfilePage');
    this.candidate = this.navParam.get('candidate');
    
  }
  closeProfile() {
    this.viewCtrl.dismiss();
  }

}
