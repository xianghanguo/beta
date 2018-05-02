import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, LoadingController, AlertController } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import * as firebase from 'firebase';
import { Observable } from '@firebase/util';
import { DataProvider, LoadingProvider } from '../../providers';
import { filter } from 'rxjs/operator/filter';
import { ChatPage } from '../chat/chat';

@IonicPage()
@Component({
  selector: 'page-contest',
  templateUrl: 'contest.html',
})
export class ContestPage {

  private contestProgress : any;
  opts: any = {
    showBackdrop: true,
    enableBackdropDismiss: true,
    cssClass:'mini-modal'
  }


  private pageFlag: boolean = false;
  lastContest: any;
  currentStage: any;
  currentGender: any;
  candidates = {female:[], male:[]};
  candidatesByGender = {candidates: [], round_1: [], round_2: [], round_3: [], final: []}
  chuncked_round1 = {female:[], male: []};
  chuncked_round2 = {female:[], male: []};
  chuncked_round3 = {female:[], male: []};
  champions = [];
  applicants: any [];
  user: any;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public modalCtrl: ModalController, 
    public alertCtrl: AlertController,
    public afDB: AngularFireDatabase, 
    public loadingProvider: LoadingProvider,
    public dataProvider: DataProvider) {

  

  }


  ionViewDidLoad() {
    console.log('ionViewDidLoad MatchingPage');
    
    
    this.loadingProvider.show();
    this.dataProvider.getCurrentUser().valueChanges().subscribe((user: any) => {
      
      this.user = user;
      this.user.key = firebase.auth().currentUser.uid;
      this.currentGender = user.gender;
      
    })
    this.dataProvider.getLastContest().snapshotChanges().take(1).subscribe( snapshot => {
      
      if(snapshot.length != 0){
        
        this.lastContest = snapshot[0];
        firebase.database().ref('/contests/' + this.lastContest.key +'/stage').on('value', snapshot => {
  
          
          this.currentStage = snapshot.val();
          this.contestProgress = snapshot.val();
         
                    
          if( snapshot.val()  == 'join' ){
            
  
            this.dataProvider.getApplicant(this.lastContest.key).snapshotChanges().subscribe(applicants => {
              this.applicants = applicants;
            }); 
            this.loadingProvider.hide();
          }
          else if (snapshot.val() != 'join'){
            
            
              this.dataProvider.getCandidate(this.lastContest.key).snapshotChanges().take(1).subscribe(candidates => {
                candidates.forEach((candidate, i) => {
                  this.dataProvider.getUser(candidate.key).valueChanges().take(1).subscribe((user : any) => {
                    user.key = candidate.key;
                    user.index = user.gender == 'female'? i : i-8;
                    this.dataProvider.getScores(this.lastContest.key, candidate.key).valueChanges().subscribe((score: any) => {                  
                      user.round_1 = score.round_1;
                      user.total = user.round_1;
                      if(score.round_2 >= 0){
                        user.round_2 = score.round_2;
                        user.total += user.round_2
                      }
                      if(score.round_3 >= 0){
                        user.round_3 = score.round_3;
                        user.total += user.round_3
                      }
                      if(user.gender == 'male') this.addOrUpdateMaleCandidate(user);
                      else this.addOrUpdateFemaleCandidate(user);
                    });
                   
                  });
                });
              });
             
          }
          if(snapshot.val() =='final'){
            
            this.dataProvider.getChampions(this.lastContest.key).snapshotChanges().take(1).subscribe(champions => {
              champions.forEach(champ => {
                this.champions.push(champ.key);
              })           
            });
          }
        });

      }
      else{

        console.log('없다')
        this.loadingProvider.hide();
      }
      
    });
  }


  addOrUpdateMaleCandidate(candidate): void {
    if (this.candidates.male) {
      let index = -1;
      for (let i = 0; i < this.candidates.male.length; i++) {
        if (candidate.key == this.candidates.male[i].key) {
          index = i;
        }
      }
      if (index > -1) {
        this.candidates.male[index] = candidate;
      }
      else {
        this.candidates.male.push(candidate);
      }
    } else {
      this.candidates.male = [candidate];
    }
    if(this.candidates.male.length == 8) {
      this.chuncked_round1.male = this.chunckCanditates(this.candidates.male, 1);
      this.chuncked_round2.male = this.chunckCanditates(this.candidates.male, 2);
      this.chuncked_round3.male = this.chunckCanditates(this.candidates.male, 3);
      this.changeGender(this.currentGender)
      if(this.champions.length == 2){
        this.findChampions()
      }
      this.loadingProvider.hide();
    }
  }

  addOrUpdateFemaleCandidate(candidate): void {
    if (this.candidates.male) {
      let index = -1;
      for (let i = 0; i < this.candidates.female.length; i++) {
        if (candidate.key == this.candidates.female[i].key) {
          index = i;
        }
      }
      if (index > -1) {
        this.candidates.female[index] = candidate;
      }
      else {
        this.candidates.female.push(candidate);
      }
    } else {
      this.candidates.female = [candidate];
    }
    if(this.candidates.female.length == 8) {
      this.chuncked_round1.female = this.chunckCanditates(this.candidates.female, 1);
      this.chuncked_round2.female = this.chunckCanditates(this.candidates.female, 2);
      this.chuncked_round3.female = this.chunckCanditates(this.candidates.female, 3);
      
    }
  }

  // initializeCandidates(candidates){
  //   candidates.forEach((candidate, i) => {
  //     let user;
  //     this.dataProvider.getUser(candidate.key).snapshotChanges().take(1).subscribe(account => {
  //       candidate.profileImg = account.payload.val().profileImg;
  //       candidate.username = account.payload.val().username;
  //       candidate.birth = account.payload.val().birth;
  //       candidate.gender = account.payload.val().gender;
  //       candidate.contest = account.payload.val().contest;
  //       candidate.index = i;
  //       firebase.database().ref('/contests/' + this.lastContest.key + '/candidate/' + candidate.key + '/score').on('value', snapshot => {
          
  //         candidate.round_1 = snapshot.val().round_1;
  //         candidate.total = candidate.round_1;
  //         if(snapshot.child('round_2').exists()) {
            
  //           candidate.round_2 = snapshot.val().round_2;
  //           candidate.total += candidate.round_2;
  //         }
  //         if(snapshot.child('round_3').exists()) {
  //           candidate.round_3 = snapshot.val().round_3;
  //           candidate.total += candidate.round_3;
  //         }
  //         if(i == candidates.length -1) this.chunckCanditates(this.candidates);
  //       })
        
  //     })
  //   })
   
    
  // }


  checkApplied(applicants){

    return applicants.filter(e => {
      return e.key === this.user.key;
    }).length;
  }

  chunckCanditates(candidates, round){
    
    var chunk_size = 2;
    var candidates_rounded;

    if(round == 1){
      candidates_rounded= candidates;
    }
    else if(round == 2){
      candidates_rounded = candidates.filter(e => {
        return e.round_2 > -1;
        });
    }
    else {
      candidates_rounded = candidates.filter(e => {
        return e.round_3 > -1;
        });
    }
    
  

     return candidates_rounded.map( (e,i) => { 
     
        return i%chunk_size===0 ? candidates_rounded.slice(i,i+chunk_size) : null; 
    })
    .filter(e =>{ return e; });

  
    
   


  }


  openProfile(candidate) {

    let profileModal = this.modalCtrl.create('ContestProfilePage', {candidate: candidate},this.opts);

    profileModal.present();
  }
  openVote(candidate, round) {

    let voteModal = this.modalCtrl.create('ContestVotePage',{user: this.user, candidate: candidate, lastContest:this.lastContest, round: round},this.opts);
    voteModal.present();
  }

  openApply(){
    let applyModal = this.modalCtrl.create('ContestApplyPage',{lastContest: this.lastContest, user: this.user},this.opts)
    applyModal.onDidDismiss(data => {
      if(data){
        if(this.user.gender == 'male') {
          this.afDB.database.ref('/contests/' + this.lastContest.key).child('numOfMale').transaction(function(currentCount){
            return currentCount+1;
          })
        }
        else{
          this.afDB.database.ref('/contests/' + this.lastContest.key).child('numOfFemale').transaction(function(currentCount){
            return currentCount+1;
          })
        }
        let alert = this.alertCtrl.create({
          title: '지원 완료',
          subTitle: '참가 지원이 완료되었습니다!',
          buttons: ['확인']
        });
        alert.present();

      }
    })
    applyModal.present();
  }

  

  cancelApply(){
    let alert = this.alertCtrl.create({
      title: '지원 취소',
      message: '정말로 후보 지원을 취소하겠습니까?',
      buttons: [
        {
          text: '아니오',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: '예',
          handler: () => {
            this.afDB.database.ref('/contests/' + this.lastContest.key + '/applicant/' + this.user.key).remove()
            .then((success) => {

              this.dataProvider.getCurrentUser().update({contest: null});
              if(this.user.gender == 'male') {
                this.afDB.database.ref('/contests/' + this.lastContest.key).child('numOfMale').transaction(function(currentCount){
                  return currentCount-1;
                })
              }
              else{
                this.afDB.database.ref('/contests/' + this.lastContest.key).child('numOfFemale').transaction(function(currentCount){
                  return currentCount-1;
                })
              }
            })
          }
        }
      ]
    });
    alert.present();



    
  }

  changeGender(gender){

    if(gender == 'female'){
      this.candidatesByGender.candidates = this.candidates.male;
      this.candidatesByGender.round_1 = this.chuncked_round1.male;
      this.candidatesByGender.round_2 = this.chuncked_round2.male;
      this.candidatesByGender.round_3 = this.chuncked_round3.male;
    }
    else{
      this.candidatesByGender.candidates = this.candidates.female;
      this.candidatesByGender.round_1 = this.chuncked_round1.female;
      this.candidatesByGender.round_2 = this.chuncked_round2.female;
      this.candidatesByGender.round_3 = this.chuncked_round3.female;
    }


  }

  findChampions(){
    let candidates = this.candidates.female.concat(this.candidates.male);

    this.candidatesByGender.final = candidates.filter((user)=> {
      return this.champions.indexOf(user.key) != -1;
    })
    console.log(this.candidatesByGender.final );
  }
}