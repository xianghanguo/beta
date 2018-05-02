import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Content } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import * as firebase from 'firebase';
import { DataProvider } from '../../providers';
import { AngularFireAuth } from 'angularfire2/auth';
import {  ElementRef } from '@angular/core';


@IonicPage()
@Component({
  selector: 'page-note-processing',
  templateUrl: 'note-processing.html',
})
export class NoteProcessingPage {
  
  @ViewChild(Content) content: Content;

  data = { type:'', nickname:'', message:'' };
  chats = [];
  roomkey:string;
  roomStatus:any;
  nickname:string;
  offStatus:boolean = false;


  // 채팅 방을 waiting단에서 만들어도 되나, 코드최적화를 위해서 여기서 푸시함 //
  constructor(public navCtrl: NavController, public navParams: NavParams, public afDB:AngularFireDatabase, public afAuth: AngularFireAuth) {

    this.roomkey = this.navParams.get("roomKey") as string;
    this.nickname = this.afAuth.auth.currentUser.displayName;
    this.data.type = 'message';
    this.data.nickname = this.nickname;

  }

  ionViewDidLoad() {
    
    this.data.message = '';

    this.afDB.database.ref('note-room/'+this.roomkey+'/chats').on('value', resp => {
      this.chats = [];
      this.chats = snapshotToArray(resp);
      setTimeout(() => {
        if(this.offStatus === false) {
          this.content.scrollToBottom(300);
        }
      }, 1000);
    });

    

  }
  sendMessage() {
    let newData = this.afDB.database.ref('note-room/'+this.roomkey+'/chats').push();
    newData.set({
      type:this.data.type,
      user:this.data.nickname,
      message:this.data.message,
      sendDate:Date()
    });
    this.data.message = '';
  }

  exitChat() {
    this.navCtrl.pop();
  }

}
export const snapshotToArray = snapshot => {
  let returnArr = [];

  snapshot.forEach(childSnapshot => {
      let item = childSnapshot.val();
      item.key = childSnapshot.key;
      returnArr.push(item);
  });

  return returnArr;
};
