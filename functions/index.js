const functions = require('firebase-functions');
const admin = require('firebase-admin');
const firebase = require('firebase');
// const translate = require('google-translate-api');

// const LANGUAGES = ['en', 'es', 'de', 'fr', 'sv', 'ga', 'it', 'jp', 'ko'];

admin.initializeApp(functions.config().firebase);

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

exports.participation = functions.https.onRequest((req, res)=> {
    console.log('test Cron');

    var db = admin.database();
    var ref = db.ref(`/contests/`).push({
        date: firebase.database['ServerValue'].TIMESTAMP,
        numOfMale: 0,
        numOfFemale: 0,
        stage: 'join'
    }).then((success)=>{
        return res.status(200).json('new Contest!');
    }).catch(err => {
        console.error(err);
    })
});

exports.roundOne = functions.https.onRequest((req,res)=> {
    var db = admin.database();
    var ref = db.ref(`/contests/`);
    var lastContestId;
    const femaleList = [];
    const maleList = [];
    ref.limitToLast(1).once('child_added', snapshot => {        
        db.ref(`/contests/` + snapshot.key + `/applicant`).orderByValue().once('value', applicants => {
           
            applicants.forEach(applicant => {
                
                if(applicant.val() === 'male') maleList.push(applicant.key);
                else femaleList.push(applicant.key);
            });
            var chosenMale = choosePeople(maleList);
            var chosenFemale = choosePeople(femaleList);
            chosenMale.forEach(male => {
                db.ref(`/contests/` + snapshot.key + `/candidate`).update({[male] : {gender: 'male', score: {round_1 : 0}}});
                
            })

            chosenFemale.forEach(female => {
                db.ref(`/contests/` + snapshot.key + `/candidate`).update({[female] : {gender: 'female', score: {round_1 : 0}}});
               
            })

            var updates = {};
            updates['/contests/' + snapshot.key + '/stage'] = 'round_1';

            admin.database().ref().update(updates);

            //db.ref(`/contests/` + snapshot.key).update({round_1 : {male: chosenMale, female: chosenFemale}, stage: 'round_1'});
            return res.status(200).json('round 1!');
    }).catch(err => {
        console.error(err);
    });
});

admin.messaging().sendToDevice();
    
});

exports.roundTwo = functions.https.onRequest((req,res)=> {
    var db = admin.database();
    var ref = db.ref(`/contests/`);
    var lastContestId;
    const femaleList = [];
    const maleList = [];
    ref.limitToLast(1).once('child_added', snapshot => {
        db.ref(`/contests/` + snapshot.key + `/candidate` ).orderByChild('gender').once('value', candidates => {
           
            var winnerMale;
            var winnerFemale;
            candidates.forEach(candidate => {
                
                var round1_score = candidate.child('score').child('round_1').val();
                
                if(candidate.val() === 'male') maleList.push({key:candidate.key, round_1: round1_score});
                else femaleList.push({key:candidate.key, round_1: round1_score});
            });
            winnerFemale = chunckCanditates(femaleList);
            winnerFemale.forEach(female => {
                var winner = female[0].round_1> female[1].round_1 ? female[0] : female[1];
                
                db.ref(`/contests/` + snapshot.key + `/candidate/` + winner.key +`/score`).update({round_2 : 0});
            });
    
            winnerMale = chunckCanditates(maleList);
            winnerMale.forEach(male => {
                var winner = male[0].round_1 > male[1].round_1? male[0] : male[1]
                
                db.ref(`/contests/` + snapshot.key + `/candidate/` + winner.key +`/score`).update({round_2 : 0});
            });

            var updates = {};
            updates['/contests/' + snapshot.key + '/stage'] = 'round_2';

            admin.database().ref().update(updates);
            return res.status(200).json('round 2!');
           
    }).catch(err => {
        console.error(err);
    });
});
    
});

exports.roundThree = functions.https.onRequest((req,res)=> {
    var db = admin.database();
    var ref = db.ref(`/contests/`);
    var lastContestId;
    const femaleList = [];
    const maleList = [];
    ref.limitToLast(1).once('child_added', snapshot => {
        db.ref(`/contests/` + snapshot.key + `/candidate` ).orderByChild('gender').once('value', candidates => {
            var winnerMale;
            var winnerFemale;
            candidates.forEach(candidate => {
                
                var round2_score = candidate.child('score').child('round_2');
                if(candidate.child('gender').val() === 'male' && round2_score.exists()) maleList.push({key:candidate.key, round_2: round2_score.val() });
                else if(candidate.child('gender').val() === 'female' && round2_score.exists()) femaleList.push({key:candidate.key, round_2: round2_score.val()});
            });
            winnerFemale = chunckCanditates(femaleList);
            winnerFemale.forEach(female => {
                var winner = female[0].round_2 > female[1].round_2 ? female[0] : female[1];
                console.log(winner);
                db.ref(`/contests/` + snapshot.key + `/candidate/` + winner.key +`/score`).update({round_3 : 0});
            });
    
            winnerMale = chunckCanditates(maleList);
            winnerMale.forEach(male => {
                var winner = male[0].round_2 > male[1].round_2 ? male[0] : male[1]
                
                db.ref(`/contests/` + snapshot.key + `/candidate/` + winner.key +`/score`).update({round_3 : 0});
            });

            var updates = {};
            updates['/contests/' + snapshot.key + '/stage'] = 'round_3';

            admin.database().ref().update(updates);
            return res.status(200).json('round 3!');
    }).catch(err => {
        console.error(err);
    });
});
});

exports.roundFinal = functions.https.onRequest((req,res)=> {
    var db = admin.database();
    var ref = db.ref(`/contests/`);
    var lastContestId;
    const femaleList = [];
    const maleList = [];
    ref.limitToLast(1).once('child_added', snapshot => {
        db.ref(`/contests/` + snapshot.key + `/candidate` ).orderByChild('gender').once('value', candidates => {
            var winnerMale;
            var winnerFemale;
            candidates.forEach(candidate => {
                
                var round3_score = candidate.child('score').child('round_3');
                if(candidate.child('gender').val() === 'male' && round3_score.exists()) maleList.push({key:candidate.key, round_3: round3_score.val() });
                else if(candidate.child('gender').val() === 'female' && round3_score.exists()) femaleList.push({key:candidate.key, round_3: round3_score.val()});
            });
            winnerFemale = chunckCanditates(femaleList);
            winnerFemale.forEach(female => {
                var winner = female[0].round_3> female[1].round_3 ? female[0] : female[1];
                
                db.ref(`/contests/` + snapshot.key + `/champion/`).update({[winner.key]:'female'});
            });
    
            winnerMale = chunckCanditates(maleList);
            winnerMale.forEach(male => {
                var winner = male[0].round_3 > male[1].round_3 ? male[0] : male[1]
                
                db.ref(`/contests/` + snapshot.key + `/champion/`).update({[winner.key]:'male'});
            });

            var updates = {};
            updates['/contests/' + snapshot.key + '/stage'] = 'final';

            admin.database().ref().update(updates);
            return res.status(200).json('final!');
    }).catch(err => {
        console.error(err);
    });
});

});

exports.notification = functions.https.onRequest((req, res)=> {
    const payload = {
        notification: {
          title: `New message by fff`,
          body: 'sdfsdfsdfsdfsdf',
          click_action:"FCM_PLUGIN_ACTIVITY",
        }
      };
       

      admin.messaging().sendToTopic('test', payload).then( success => {
        return res.status(200).json('pushed!');
      }).catch(err => {
        console.error(err);
    });



});




// exports.translate = functions.https.onRequest((req, res) => {

    
//       const text = JSON.parse(req.body).text;
//       const key = JSON.parse(req.body).key;
      
//       var db = admin.database();
//       var ref = db.ref(`/feed/${key}`);
      
      
//       translate(text, { to: 'ko' }).then(res => {
        
//         admin.database().ref(`/feed/${key}/`).
//         update({ translated: res.text });
//         // console.log(res);
//         // console.log(res.text);
//         // //=> I speak English
//         // console.log(res.from.language.iso);
//         // //=> nl
//       }).then(()=>{
//         ref.once("value", function(snapshot){
//           var data = snapshot.val().translated;
//           //console.log(data);
//           return res.status(200).json({ data: data });
//         })
//         return
//       })
//       .catch(err => {
//         console.error(err);
//       });
      
    
  
     
    
//   });


function choosePeople(applicant)  {
    var db = admin.database();
    
    var chosen = [];
    var n = applicant.length;
    var ar = new Array();
    var temp;
    var rnum;

    if(n > 8) {
        for(i=0; i<n; i++){
            ar.push(i);
        }

        for( i=0; i< ar.length ; i++)
        {
            rnum = Math.floor(Math.random() *n);
            temp = ar[i];
            ar[i] = ar[rnum];
            ar[rnum] = temp;
        }
        for( i = 0; i < ar.length ; i++){
            if(i<8) chosen.push(applicant[ar[i]]);
            else {
               db.ref(`/accounts/` + applicant[ar[i]] + `/contest/`).update({myContest: 'fail'});
            }
        }
        return chosen;
    }
    else return applicant;

}

function chooseWinner(candidate) {

}

function chunckCanditates(candidates){
    
    var chunk_size = 2;
              
    var chunkedList = candidates.map((e,i) =>{ 
        return i%chunk_size===0 ? candidates.slice(i,i+chunk_size) : null; 
    })
    .filter((e) =>{ return e; });
    
    
   return chunkedList;
  }


 