import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database-deprecated';
import { AngularFireAuth } from 'angularfire2/auth';


@IonicPage()
@Component({
  selector: 'page-note-request',
  templateUrl: 'note-request.html',
})
export class NoteRequestPage {

  private target : string;
  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl:ViewController, public afDB:AngularFireDatabase, public afAuth:AngularFireAuth) {
    this.target = navParams.get('target');
    console.log(this.target);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad NoteRequestPage');
  }

  noteRequestSubmit(){
    this.afDB.database.ref('/note-room/').push({
      roomType:'note',
      roomStatus:2
    }).then((success)=>{
      // 쪽지 보낸사람 릴레이션 추가 //
      this.afDB.database.ref('/note-link/'+this.afAuth.auth.currentUser.uid).push({
        roomKey:success.key,
        target:this.target,
        time:Date(),
        type:'send'
      });    
      // 쪽지 받은사람 릴레이션 추가 //
      this.afDB.database.ref('/note-link/'+this.target).push({
        roomKey:success.key,
        target:this.afAuth.auth.currentUser.uid,
        time:Date(),
        type:'receive'
      });
    });
    this.viewCtrl.dismiss();
  }
  noteRequestCancel(){
    this.viewCtrl.dismiss();
  }
}
