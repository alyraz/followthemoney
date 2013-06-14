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

      // trying to access for first candidate, #137927
      // currently getting error 101 = restricted access
      var contributionsURI = {
        host: 'api.followthemoney.org',
        path: '/candidates.contributions.php?key=44154ac0d5a8a934977a29c1cd071326&imsp_candidate_id=' + 137927
      };
      http.get(contributionsURI, function(res){
        var data = '';
        res.on('data', function(chunk){
          data += chunk;
        });
        res.on('end', function(){
          console.log("!!!!!!!!!!!!!!!!")
          console.log(data)
        });
      }); // http.get


      // trying to access for all 200 candidates
      // _.each(hawaiiCandidatesIDs, function(candidateID){
      //   var contributionsURI = {
      //     host: 'api.followthemoney.org',
      //     path: '/candidates.contributions.php?key=44154ac0d5a8a934977a29c1cd071326&imsp_candidate_id=' + candidateID
      //   };
      //   http.get(contributionsURI, function(res){
      //     var data = '';
      //     res.on('data', function(chunk){
      //       data += chunk;
      //     });
      //     res.on('end', function(){
      //       console.log("!!!!!!!!!!!!!!!!")
      //       console.log(data);
      //     });
      //   }); // http.get
      // }); // each



    }); // on('end')
  }); // http.get
});

app.listen(3000);

