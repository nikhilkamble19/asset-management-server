//Initiallising node modules
var express = require("express");
var bodyParser = require("body-parser");
var sql = require("mssql");
var app = express();

// Body Parser Middleware
app.use(bodyParser.json());

//CORS Middleware
app.use(function (req, res, next) {
  //Enabling CORS
  res.header("Access-Control-Allow-Origin", "https://audit-asset-management.herokuapp.com");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header("Access-Control-Allow-Headers", "xhttp, Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization");
  next();
});

//Setting up server
 var server = app.listen(process.env.PORT || 3000, function () {
  var port = server.address().port;
  console.log("App now running on port", port);
 });

//Initiallising connection string (production)
var DataBaseConfig = {
  user: 'DB_A409E6_jobnikhilkamble_admin',
  password: 'briot123',
  server: 'SQL6004.site4now.net',
  database: 'DB_A409E6_jobnikhilkamble',
  port: 1433,
  options: {
    encrypt: false // Use this to true if you're on Windows Azure
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

var DBConfig = DataBaseConfig;

var  executeQuery = function(res, query) {
  console.log("executeQuery: " + query);
  sql.close();
  sql.connect(DBConfig, function (err) {
     if (err) {
        console.log("Error while connecting database :- " + err);
        sql.close();
        res.status(500).send(err);
      } else {
         // create Request object
        var request = new sql.Request();
         // query to the database
        request.query(query, function (err, result) {
          if (err) {
            sql.close();
            console.log("Error while querying database :- " + err);
              res.send(err);
          } else {
              sql.close();
              console.log("success for " + query);
              console.log("result", result);
              if (result.recordset.length > 0) {
                  console.log(result.recordset);
                  res.send(result.recordset[0]);
              } else {
                  return res.status(404).send({
                      message: "0"
                  });
              }
            }
          });
       }
  });
}

var  allrecordexecuteQuery = function(res, query) {
	console.log("executeQuery: " + query);
  sql.close();
	sql.connect(DBConfig, function (err) {
    if (err) {
      console.log("Error while connecting database :- " + err);
      sql.close();
      res.status(500).send(err);
    } else {
       // create Request object
      var request = new sql.Request();
      request.query(query, function (err, result) {
        if (err) {
          sql.close();
          console.log("Error while querying database :- " + err);
            res.send(err);
        } else {
          sql.close();
          console.log("success for " + query);
          console.log("result", result);
          if (result.recordset.length > 0) {
              console.log(result.recordset);
              res.send(result.recordset);
          } else {
              return res.status(404).send({
                  message: "result not found"
              });
          }
      	}	
      });
    }
  });
}

var executeUpdateQuery = function(res, query, callback) {
  console.log("executeQuery: " + query);
  sql.connect(DBConfig, function (err) {
     if (err) {
	       console.log("Error while connecting database :- " + err);
	       sql.close();
	       var error = new Error("Error while connecting database");
	       callback(error, null);
      } else {
         // create Request object
         var request = new sql.Request();
         // query to the database
        request.query(query, function (err, result) {
          if (err) {
            sql.close();
            console.log("Error while querying database :- " + err);
            var error = new Error("Error while querying database");
            callback(error, null);
          } else {
            sql.close();
            // console.log("success for " + query);
            // console.log("result", result);
            if (result.rowsAffected.length > 0) {
              if (result.rowsAffected[0] > 0) {
                var my_response = JSON.parse('{ "rowsAffected" : ' + result.rowsAffected[0] + '}');
                // console.log(my_response);
                // res.send(my_response);
                callback(null, my_response);
              } else {
                var error = new Error("result not found");
                callback(error, null);
              }
            }else {
              var error = new Error("result not found");
              callback(error, null);
            }
          }
        });
      }
  });
}

//Insert to New Asset Query
app.get("/api/insertAsset", function(req, res) {
  var d = new Date();
  var curr_date = d.getDate();
  //if(curr_date == 1 || curr_date == 2 || curr_date == 3 || curr_date == 4 || curr_date == 5 || curr_date == 6 || curr_date == 7 || curr_date == 8 || curr_date == 9 ){
  if(curr_date < 10){
    curr_date = "0" + curr_date.toString();
  }
  var curr_month = parseInt(d.getMonth()) + 1;
  // if(curr_month == 1 || curr_month == 2 || curr_month == 3 || curr_month == 4 || curr_month == 5 || curr_month == 6 || curr_month == 7 || curr_month == 8 || curr_month == 9 ){
  if(curr_month < 10){  
    curr_month = "0" + curr_month.toString();
  }
  var curr_year = d.getFullYear();
  var newDate = curr_year.toString() + curr_month.toString() + curr_date.toString();

  // var data = JSON.parse(req.query.data);
    // console.log(data["AssetType"]);
    if (req.query.OEMNumber != undefined) {
      var query = "insert into AssetMaster values ('" + req.query.OEMNumber + "','" + req.query.AssetSubType + "','" + req.query.AssetDescription + "','" + req.query.Manufacturer + "','" + req.query.Model + "','" + req.query.Site + "','" + req.query.Location + "','" + req.query.SubLocation + "','" + req.query.OwnerName + "','" + req.query.Department + "','" + req.query.CostCenter + "','" + req.query.CreatedBy + "','" + newDate + "','" + req.query.UpdatedBy + "','" + newDate + "','" + "" + "')";
      executeUpdateQuery(res, query, function(error, result) {
        if (error) {
          res.send({
            message: error.message
          });
        } else {
          var materialQuery = "select * from AssetMaster order by BarcodeSerial DESC";
          executeQuery (res, materialQuery);
        }
      });
    } else {
      return res.status(400).send({
        message: "Bad Request: invalid parameters"
      });
    }
});

//get all Asset Record
app.get("/api/getallAsset", function(req, res) {
      var query = "select * from AssetMaster";
      allrecordexecuteQuery (res, query);
});

//get all Location Record
app.get("/api/getallLocation", function(req, res) {
      var query = "select * from AllLocations";
      allrecordexecuteQuery (res, query);
});

//get all Asset Record
app.get("/api/getAsset", function(req, res) {
    // console.log(req.query);
    if (req.query.BarcodeSerial != undefined) {
      var query = "select * from AssetMaster where BarcodeSerial = '" + req.query.BarcodeSerial + "'";
      allrecordexecuteQuery (res, query);
    } else {
      return res.status(400).send({
        message: "Bad Request: invalid parameters"
      });
    }
});

//login Api
app.get("/api/Login", function(req, res) {
    // console.log(req.query);
    if (req.query.username != undefined && req.query.password != undefined) {
      var query = "select * from Login where Username = '" + req.query.username + "' and Password = '" + req.query.password + "'";
      allrecordexecuteQuery (res, query);
    } else {
      return res.status(400).send({
        message: "Bad Request: invalid parameters"
      });
    }
});

//putaway location scan
app.get("/api/locationScan", function(req, res) {
    // console.log(req.query);
    if (req.query.Location != undefined) {
      var query = "select * from AssetMaster where Location = '" + req.query.Location + "'";
      allrecordexecuteQuery (res, query);
    } else {
      return res.status(400).send({
        message: "Bad Request: invalid parameters"
      });
    }
});

//putaway location scan
app.get("/api/siteScan", function(req, res) {
    // console.log(req.query);
    if (req.query.Site != undefined) {
      var query = "select * from AssetMaster where Site = '" + req.query.Site + "'";
      allrecordexecuteQuery (res, query);
    } else {
      return res.status(400).send({
        message: "Bad Request: invalid parameters"
      });
    }
});

//putaway location scan
app.get("/api/siteLocationScan", function(req, res) {
    // console.log(req.query);
    if (req.query.Site != undefined && req.query.Location != undefined) {
      var query = "select * from AssetMaster where Site = '" + req.query.Site + "' and Location = '" + req.query.Location + "'";
      allrecordexecuteQuery (res, query);
    } else {
      return res.status(400).send({
        message: "Bad Request: invalid parameters"
      });
    }
});

//putaway location scan
app.get("/api/NonITassetTypeScan", function(req, res) {
    // console.log(req.query);
    // if (req.query.AssetSubType != undefined) {
      var query = "select * from AssetMaster where AssetSubType = '"+"Files"+"'";
      allrecordexecuteQuery (res, query);
    // } else {
      // return res.status(400).send({
        // message: "Bad Request: invalid parameters"
      // });
    // }
});

//putaway location scan
app.get("/api/ITassetTypeScan", function(req, res) {
    // console.log(req.query);
    // if (req.query.AssetSubType != undefined) {
      var query = "select * from AssetMaster where AssetSubType != '"+"Files"+"'";
      allrecordexecuteQuery (res, query);
    // } else {
      // return res.status(400).send({
        // mes/sage: "Bad Request: invalid parameters"
      // });
    // }
});

app.get("/api/NonITassetTypeLocationScan", function(req, res) {
    // console.log(req.query);
    if (req.query.Location != undefined) {
      var query = "select * from AssetMaster where AssetSubType = '"+"Files"+"' and Location = '"+req.query.Location+"'";
      allrecordexecuteQuery (res, query);
    } else {
      return res.status(400).send({
        message: "Bad Request: invalid parameters"
      });
    }
});

//putaway location scan
app.get("/api/ITassetTypeLocationScan", function(req, res) {
    // console.log(req.query);
    if (req.query.Location != undefined) {
      var query = "select * from AssetMaster where AssetSubType != '"+"Files"+"' and Location = '"+req.query.Location+"'";
      allrecordexecuteQuery (res, query);
    } else {
      return res.status(400).send({
        message: "Bad Request: invalid parameters"
      });
    }
});

app.get("/api/NonITassetTypeSiteScan", function(req, res) {
    // console.log(req.query);
    if (req.query.Site != undefined) {
      var query = "select * from AssetMaster where AssetSubType = '"+"Files"+"' and Site = '"+req.query.Site+"'";
      allrecordexecuteQuery (res, query);
    } else {
      return res.status(400).send({
        message: "Bad Request: invalid parameters"
      });
    }
});

//putaway location scan
app.get("/api/ITassetTypeSiteScan", function(req, res) {
    // console.log(req.query);
    if (req.query.Site != undefined) {
      var query = "select * from AssetMaster where AssetSubType != '"+"Files"+"' and Site = '"+req.query.Site+"'";
      allrecordexecuteQuery (res, query);
    } else {
      return res.status(400).send({
        message: "Bad Request: invalid parameters"
      });
    }
});

app.get("/api/NonITassetTypeLocationSiteScan", function(req, res) {
    // console.log(req.query);
    if (req.query.Site != undefined && req.query.Location != undefined) {
      var query = "select * from AssetMaster where AssetSubType = '"+"Files"+"' and Site = '"+req.query.Site+"' and Location = '"+req.query.Location+"'";
      allrecordexecuteQuery (res, query);
    } else {
      return res.status(400).send({
        message: "Bad Request: invalid parameters"
      });
    }
});

//putaway location scan
app.get("/api/ITassetTypeLocationSiteScan", function(req, res) {
    // console.log(req.query);
    if (req.query.Site != undefined && req.query.Location != undefined) {
      var query = "select * from AssetMaster where AssetSubType != '"+"Files"+"' and Site = '"+req.query.Site+"' and Location = '"+req.query.Location+"'";
      allrecordexecuteQuery (res, query);
    } else {
      return res.status(400).send({
        message: "Bad Request: invalid parameters"
      });
    }
});

//putaway asset scan
app.get("/api/assetScan", function(req, res) {
    // console.log(req.query);
    if (req.query.BarcodeSerial != undefined) {
      var query = "select * from AssetMaster where BarcodeSerial = '" + req.query.BarcodeSerial + "'";
      allrecordexecuteQuery (res, query);
    } else {
      return res.status(400).send({
        message: "Bad Request: invalid parameters"
      });
    }
});

//get all Site Record
app.get("/api/getallSite", function(req, res) {
      var query = "SELECT Distinct Site FROM AssetMaster";
      allrecordexecuteQuery (res, query);
});

//get all Location Record
app.get("/api/getallLocations", function(req, res) {
      var query = "SELECT Distinct Location FROM AssetMaster";
      allrecordexecuteQuery (res, query);
});

//get all Location Record
app.get("/api/getallSubLocations", function(req, res) {
      var query = "SELECT Distinct SubLocation FROM AssetMaster";
      allrecordexecuteQuery (res, query);
});

//get all Location Record fro Site
app.get("/api/getallLocationsforSite", function(req, res) {
    // console.log(req.query);
    if (req.query.Site != undefined) {
      var query = "select Location from AssetMaster where Site = '" + req.query.Site + "'";
      allrecordexecuteQuery (res, query);
    } else {
      return res.status(400).send({
        message: "Bad Request: invalid parameters"
      });
    }
});

app.get("/api/getbySublocation", function(req, res) {
    // console.log(req.query);
    if (req.query.SubLocation != undefined) {
      var query = "select * from AssetMaster where SubLocation = '" + req.query.SubLocation + "'";
      allrecordexecuteQuery (res, query);
    } else {
      return res.status(400).send({
        message: "Bad Request: invalid parameters"
      });
    }
});

app.get("/api/getbylocation", function(req, res) {
    // console.log(req.query);
    if (req.query.Location != undefined) {
      var query = "select * from AssetMaster where Location = '" + req.query.Location + "'";
      allrecordexecuteQuery (res, query);
    } else {
      return res.status(400).send({
        message: "Bad Request: invalid parameters"
      });
    }
});

app.get("/api/getbysite", function(req, res) {
    // console.log(req.query);
    if (req.query.Site != undefined) {
      var query = "select * from AssetMaster where Site = '" + req.query.Site + "'";
      allrecordexecuteQuery (res, query);
    } else {
      return res.status(400).send({
        message: "Bad Request: invalid parameters"
      });
    }
});

app.get("/api/getbylocationandsublocation", function(req, res) {
    // console.log(req.query);
    if (req.query.Location != undefined && req.query.SubLocation != undefined) {
      var query = "select * from AssetMaster where Location = '" + req.query.Location + "' and SubLocation = '" + req.query.SubLocation + "'";
      allrecordexecuteQuery (res, query);
    } else {
      return res.status(400).send({
        message: "Bad Request: invalid parameters"
      });
    }
});

app.get("/api/getbylocationandsite", function(req, res) {
    // console.log(req.query);
    if (req.query.Location != undefined && req.query.Site != undefined) {
      var query = "select * from AssetMaster where Location = '" + req.query.Location + "' and Site = '" + req.query.Site + "'";
      allrecordexecuteQuery (res, query);
    } else {
      return res.status(400).send({
        message: "Bad Request: invalid parameters"
      });
    }
});

app.get("/api/getbysublocationandsite", function(req, res) {
    // console.log(req.query);
    if (req.query.SubLocation != undefined && req.query.Site != undefined) {
      var query = "select * from AssetMaster where SubLocation = '" + req.query.SubLocation + "' and Site = '" + req.query.Site + "'";
      allrecordexecuteQuery (res, query);
    } else {
      return res.status(400).send({
        message: "Bad Request: invalid parameters"
      });
    }
});

app.get("/api/getbysublocationandsiteandlocation", function(req, res) {
    // console.log(req.query);
    if (req.query.SubLocation != undefined && req.query.Site != undefined && req.query.Location != undefined) {
      var query = "select * from AssetMaster where SubLocation = '" + req.query.SubLocation + "' and Site = '" + req.query.Site + "' and Location = '" + req.query.Location + "'";
      allrecordexecuteQuery (res, query);
    } else {
      return res.status(400).send({
        message: "Bad Request: invalid parameters"
      });
    }
});

app.get("/api/getAuditID", function(req, res) {
      var query = "SELECT * FROM AuditMaster ORDER BY AuditID DESC";
      executeQuery (res, query);
});

app.get("/api/getallAuditID", function(req, res) {
      var query = "SELECT * FROM AuditMaster ORDER BY AuditID DESC";
      allrecordexecuteQuery (res, query);
});

app.get("/api/getAuditDetails", function(req, res) {
    // console.log(req.query);
    if (req.query.AuditID != undefined ) {
      var query = "select * from AuditMaster where AuditID = '" + req.query.AuditID + "'";
      allrecordexecuteQuery (res, query);
    } else {
      return res.status(400).send({
        message: "Bad Request: invalid parameters"
      });
    }
});

//Insert to New Asset Query
app.get("/api/insertAudit", function(req, res) {
    if (req.query.Site != undefined && req.query.Location != undefined && req.query.SubLocation != undefined) {
      var query = "insert into AuditMaster values ('" + req.query.Site + "','" + req.query.Location + "','" + req.query.SubLocation + "')";
      executeUpdateQuery(res, query, function(error, result) {
        if (error) {
          res.send({
            message: error.message
          });
        } else {
          var materialQuery = "select * from AuditMaster order by AuditID DESC";
          executeQuery (res, materialQuery);
        }
      });
    } else {
      return res.status(400).send({
        message: "Bad Request: invalid parameters"
      });
    }
});