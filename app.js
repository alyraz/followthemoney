var express       = require('express')
,   http          = require('http')
,   _             = require('underscore')
,   parser        = require('xml2json')
,   fs            = require('fs')
,   async         = require('async')
,   app           = express();

var donationEvents = [];
     
var hitContributionsAPI = function(candidateID, cb){
  
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
      var JSONdata = parser.toJson(data, {object: true});
      console.log(JSONdata)
      var contributionsData = JSONdata['candidates.contributions.php'];
      
      if(contributionsData){ // do we care about else? 

        var candidateName     = contributionsData.candidate_name;
        var candidateParty    = contributionsData.party;
        var candidateDistrict = contributionsData.distric; 
        //  TODO: get legislator chamber (house or senate). but these are candidates, not legislators? Maybe look at other APIs. 

        _.each(contributionsData.contribution, function(contribution){
          donationEvents.push(
          { candidate:            candidateName, 
            candidateParty:       candidateParty, 
            candidateDistrict:    candidateDistrict,
            contributionDate:     contribution.date, 
            contributionAmount:   contribution.amount, 
            contributorName:      contribution.contributor_name, 
            contributorIndustry:  contribution.industry_name, 
            contributorSector:    contribution.sector_name, 
          }); // other possible vars of interest: contributor_zipcode, business_name, imsp_sector_code, imsp_industry_code
          console.log("pushed a donationEvent")
        }); // each

        cb();
      } else {
        cb();
      }// if
    }); // res.on('end')
  }); // http.get
}


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
      var JSONdata = parser.toJson(data, {object: true});
      var hawaiiCandidates = JSONdata['candidates.list.php'].candidate;

      var hawaiiCandidatesIDs = [];
      _.each(hawaiiCandidates, function(candidate){
        hawaiiCandidatesIDs.push(candidate.imsp_candidate_id);
      })

      async.eachSeries(hawaiiCandidatesIDs, hitContributionsAPI, function(err){
        console.log(err);
        fs.writeFile('donationEvents.json', JSON.stringify(donationEvents),function(err) {
          if(err) console.log(err);
        }) // fs.writeFile
      }) // async.eachSeries
    }); // on('end')
  }); // http.get
});

app.listen(3000);

