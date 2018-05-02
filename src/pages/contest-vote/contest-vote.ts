import { Component } from '@angular/core';
import { IonicPage, NavParams, AlertController } from 'ionic-angular';
import { ViewController } from 'ionic-angular/navigation/view-controller';
import { AngularFireDatabase } from 'angularfire2/database';
import * as firebase from 'firebase';
import { DataProvider } from '../../providers';

@IonicPage()
@Component({
  selector: 'page-contest-vote',
  templateUrl: 'contest-vote.html',
})
export class ContestVotePage {

  public candidate: any;
  public currentScore: any;
  public currentRound: any;
  public lastContest: any;
  public scoreRef: any;
  public upvotesRef: any;
  public voteList = [];
  public myVote: any;
  private user: any;

  constructor(public viewCtrl: ViewController,
              public alertCtrl: AlertController,
              public navParam: NavParams,
              public dataProvider: DataProvider,
              public afDB: AngularFireDatabase) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ContestVotePage');
    this.user = this.navParam.get('user');
    this.candidate = this.navParam.get('candidate');
    this.lastContest = this.navParam.get('lastContest');
    switch(this.navParam.get('round')){
      case 1 : this.currentRound = 'round_1'
      break;

      case 2 : this.currentRound = 'round_2'
      break;

      case 3 : this.currentRound = 'round_3'
      break;
    }

    this.scoreRef = firebase.database().ref('/contests/'+ this.lastContest.key + '/candidate/' + this.candidate.key + '/score/' + this.currentRound);
    this.upvotesRef = firebase.database().ref('/contests/'+ this.lastContest.key + '/vote/' + this.candidate.key);

    this.dataProvider.getVoteList(this.lastContest.key, this.candidate.key, this.currentRound).snapshotChanges().subscribe(voteList => {
      switch(this.currentRound){
        case 'round_1' : {
          this.voteList = voteList.slice().reverse().filter(e => {
            return e.payload.val().round_1
          })
        } break;
        case  'round_2' : {
          this.voteList = voteList.slice().reverse().filter(e => {
            return e.payload.val().round_2
          })
        } break;    
        case  'round_3' : {
          this.voteList = voteList.slice().reverse().filter(e => {
            return e.payload.val().round_3
          })
        } break;
      } 
        
    })

    
  }

  vote(){
   
    let alert = this.alertCtrl.create({
      title: '투표하기',
      message: '몇 포인트를 투표하겠습니까?',
      
      inputs: [
        {
          label: '1',
          value: '1',
          type: 'radio'
        },
        {
          label: '5',
          value: '5',
          type: 'radio'
        },
        {
          label: '10',
          value: '10',
          type: 'radio'
        },
        {
          label: '50',
          value: '50',
          type: 'radio'
        },
        {
          label: '100',
          value: '100',
          type: 'radio'
        }
      ],
      buttons: [
        {
          text: '취소',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: '투표',
          handler: data => {
           
            this.upvotesRef.child(this.user.key).once('value', snapshot => {
              if(snapshot.exists()){
                let myVote = snapshot.val().vote;
                let total;
                this.upvotesRef.child(this.user.key).child(this.currentRound).once('value',snapshot => {
                  total = snapshot.val() + +data;
                  console.log(total);
                });
                myVote.push({
                  date: firebase.database['ServerValue'].TIMESTAMP,
                  stage: this.currentRound,
                  score: +data
                })
                

                this.afDB.object('/contests/'+ this.lastContest.key + '/vote/' + this.candidate.key + '/' + this.user.key).update({
                  vote: myVote,
                  [this.currentRound]: total
                }).then((success)=> {
                  this.scoreRef.transaction(currentScore => {
                    return (currentScore || 0) + +data;
                  });
                });
              }
              else{
                var myVote = [];
                
                myVote.push({
                  date: firebase.database['ServerValue'].TIMESTAMP,
                  stage: this.currentRound,
                  score: +data
                })
                this.afDB.object('/contests/'+ this.lastContest.key + '/vote/' + this.candidate.key + '/' + this.user.key).update({
                  vote: myVote,
                  [this.currentRound]: +data,
                  username: this.user.payload.val().username
                }).then((success)=> {
                  this.scoreRef.transaction(currentScore => {
                    return (currentScore || 0) + +data;
                  });
                });
              }
            })
          }
        }
      ]
    });
   
    alert.present();
    
    
  }

  closeVote() {
    this.viewCtrl.dismiss();
  }

}
