var express       = require('express')
,   http          = require('http')
,   _             = require('underscore')
,   app           = express();



app.get('/', function(req, res){
  res.send('/dirtymoney');
});

app.get('/dirtymoney', function(req, res){
  var candidatesURI = {
    host: 'api.followthemoney.org',
    path: '/candidates.list.php?key=44154ac0d5a8a934977a29c1cd071326&state=hawaii&year=2012&sort=total_dollars'
  };
  http.get(candidatesURI, function(res){
    var data = '';
      res.on('data', function(chunk){
      data += chunk;
    });
    res.on('end', function(){
      var parser = require('xml2json');
      var JSONdata = parser.toJson(data, {object: true});
      var hawaiiCandidates = JSONdata['candidates.list.php'].candidate;

      var hawaiiCandidatesIDs = [];
      _.each(hawaiiCandidates, function(candidate){
        hawaiiCandidatesIDs.push(candidate.imsp_candidate_id);
      })

      var hitContributionsAPI = function(candidateID){
        console.log(candidateID)
        var contributionsURI = {
          host: 'api.followthemoney.org',
          path: '/candidates.contributions.php?key=44154ac0d5a8a934977a29c1cd071326&imsp_candidate_id=' + candidateID
        };
        http.get(contributionsURI, function(res){
          var data = '';
          res.on('data', function(chunk){
            data += chunk;
          });
          res.on('end', function(){
            var contributionData = parser.toJson(data, {object: true});
            console.log(contributionData);
          });
        }); // http.get
      }

      var throttledhitContributionsAPI = _.throttle(hitContributionsAPI, 500);

      console.log("Getting contributions for " +hawaiiCandidatesIDs.length+ " candidates.")

      for (var i=0; i<hawaiiCandidatesIDs.length; i++){
        
        console.log(hawaiiCandidatesIDs[i])
        throttledhitContributionsAPI(hawaiiCandidatesIDs[i])
      }

      // var fs = require('fs');
      // fs.writeFile('public/data/caCities.json', JSON.stringify(caCitiesJSON),function(err) {
      //   if(err) {
      //     console.log(err);
      //   }
      // })

      // donation event
      //   legislator name
      //   legislator party
      //   legislator district
      //   legislator chamber (house or senate)
      //   donation date
      //   donation amount
      //   donator name
      //   donator industry
      //   donator sector

      // they all fire at the same time
      // _.each(hawaiiCandidatesIDs, function(candidateID){
      //   console.log(candidateID)
      //   throttledhitContributionsAPI(candidateID)
      // }); // each

      // also doesnt work
      // var throttledhitContributionsAPI = _.throttle( function(hawaiiCandidatesIDs){
      //   _.each( hawaiiCandidatesIDs, hitContributionsAPI );
      // }, 2000);
      // throttledhitContributionsAPI(hawaiiCandidatesIDs);

    }); // on('end')
  }); // http.get
});

app.listen(3000);

