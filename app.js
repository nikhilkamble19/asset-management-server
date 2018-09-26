// Load required packages
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// https://www.npmjs.com/package/mssql
const sql = require('mssql');

// https://github.com/mysqljs/mysql
// const sql = require('mysql')

// var userController = require('./controllers/UserController');
// var inventoryMasterController = require('./controllers/InventoryMasterController');

// Create our Express application
var app = express();

// Use the body-parser package in our application
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));


const config = {
    user: 'DB_A3C0DF_litens_admin',
    password: 'litens2018',
    server: 'SQL6003.site4now.net',
    database: 'DB_A3C0DF_litens',
    // port: 1433,
    options: {
      encrypt: false // Use this to true if you're on Windows Azure
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
}

// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    // // Set to true if you need the website to include cookies in the requests sent
    // // to the API (e.g. in case you use sessions)
    // res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

// Create our Express router
var router = express.Router();

// State end-point
router.route('/materialdetails')
  .get(function (req, res) {
    console.log('materialdetails');
    loadMaterialDetails(req, res);
      // res.send('material details')
  })

router.route('/users')
  .get(function (req, res) {
      res.send('user details')
  })

router.route('/locations')
  .get(function (req, res) {
      res.send('locations details')
  })

router.route('/picklist')
  .get(function (req, res) {
      res.send('picklist details')
  })

// // parts
// // Parts end-point
// router.route('/parts')
//   .get(partController.list)
//   .post(partController.create);

// router.route('/parts/:partId')
//   .get(partController.read)
//   .put(partController.update)
//   .delete(partController.delete);

// router.param('partId', partController.partByID);

// Register all our routes with /api
app.use('/api', router);

// Start the server
app.listen(process.env.PORT || 3000);


var loadMaterialDetails = function (req, res) {

    // var dbConn = sql.Connection(config);

    sql.connect(config).then(function() {
        var request = new sql.Request();
        request.query("select * from Login").then(function (recordSet) {
            console.log(recordSet);
            sql.close();
            res.send(recordSet);
        }).catch(function (err) {
            console.log(err);
            sql.close();
            res.send("test 1");
        });
    }).catch(function (err) {
        console.log(err);
        res.send("test 2");
    });
};

