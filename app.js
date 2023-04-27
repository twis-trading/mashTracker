var mysql = require('mysql');
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server, { pingTimeout: 3000, pingInterval: 1000 });
var port = process.env.PORT || 8080;

var cc = { CommandCenter : '' };
var sms = {socket_id: ''};
var mayor = {socket_id: ''};
var eut = {socket_id: ''};
var kobe = {socket_id: ''};
var fire = {fire:''};
var police = {police:''};
var tracking = [];
var arr = {};


var pool = mysql.createPool({
    connectionLimit : 20,
    host : 'localhost',
    user : 'senyas',
    password : '1234',
    database : 'senyas'
});
//serve server in port 8080
server.listen(port, function(){
  console.log('Server is now running');
});

/*console.log(__dirname + '../public');
app.use(express.static(__dirname + '../public'));*/

io.on('connection', function(socket){
    console.log('New device is connected: ' + socket.id);

    //register custom socket event
    socket.on('disconnect', onDisconnect);
    socket.on('check_user', onCheckUser);
    socket.on('check_version', onCheckVersion);
  	socket.on('update_apk', onUpdateApk);
    socket.on('login_user', onLoginUser);
    socket.on('user_login', onUserLogin);
    socket.on('dept_login', onDeptLogin);
    socket.on('RESP_LOGIN', onRespLogin);
    socket.on('rejoin', onReJoin);
    socket.on('send_notification', onSendNotification);
    socket.on('track_alert', onTrackAlert);
    socket.on('send_alert_dept', onSendAlertDept);
    socket.on('RESPOND_ALERT', onRespondAlert);
    socket.on('location_update', onLocationUpdate);
    socket.on('RESP_UPDATE', onRespUpdate);
    socket.on('send_alert', onSendAlert);
    socket.on('accept_alert', onAcceptAlert);
    socket.on('send_alert_ac', onSendAlertAc);
    socket.on('send_alert_resp', onSendAlertResp);
    socket.on('resp_reg', onRespRegister);
    socket.on('incident_status', onIncidentStatus);
    socket.on('user_reg', onUserRegister);
    socket.on('login_sms', onLoginSms);
    socket.on('check_resp_alert', onCheckRespAlert);
    socket.on('request_end', onRequestEnd);
    socket.on('alert_end', onAlertEnd);
    socket.on('end_alert', onEndAlert);
    socket.on('auto_login', onAutoLogin);
    socket.on('user_end', onUserEndAlert);
    socket.on('track_message', onTrackMessage);
    socket.on('track_this', onTrackThis);
    socket.on('on_alert_accepted', onAccepted);

    socket.on('dept_end_track', onDeptEndTrack);
    socket.on('end_dept_alert', onCloseTrackDept);
    socket.on('arrival_time' , onArrivalTime);
    socket.on('arrival_time_resp' , onArrivalTimeResp);
    socket.on('RESP_LOC', onRespLoc);
    socket.on('track_resp', onTrackresp);
    socket.on('checkNum', onCheckNum);
    socket.on('checkNottif', onCheckNottif);
    socket.on('pause_sound', onPauseSound);
    socket.on('send_confirm', onSendConfirms);
    socket.on('update_usernum', onUpdateNum);
    socket.on('resend_code', onResendCode);
    socket.on('report_info', onReportInfo);
    socket.on('load_markers', onLoadMarkers);
    socket.on('login_mayor', onLoginMayor);
    socket.on('login_eut', onLoginEut);
    socket.on('login_kobe', onLoginKobe);
    socket.on('call_alert', onSendAlertCall);

    socket.on('RESP_REPORT', onRespReport);

    socket.on('track_resp2', onTrackresp2);
    socket.on('logs', onLog);
    socket.on('snipping', onSnipping);

    socket.on('manualstopalert', manualStopAlert);
    socket.on('close_tab', close_Tab);


    function close_Tab(data){
           socket.broadcast.emit('closettab', data);
    }

    function manualStopAlert(data){
      console.log("=========== Manual Stop Alert ================");
       console.log({data});
           socket.broadcast.emit('manualStopAlerts', data);
    }

    function onRespReport(data){
      console.log("=========== RESPONDER REPORT ================");
       console.log({data});

       pool.getConnection(function (error, connection) {
           if (error) throw error;
           connection.query("UPDATE alerts SET  patient='"+ data.name +"', pstatus='"+ data.pstatus +"', hospital='"+ data.hospital +"', remarks='"+ data.remarks +"' WHERE imei='" + data.aimei + "' AND status='1'", function (err, result) {
           console.log("=========== UPDATED ALERT REPORT ================");

           });
           connection.release();
           socket.broadcast.emit('RESP_REPORTd', data);
       });
    }

    function onLog(userlogin){
      console.log("logout: "+userlogin);
    }

    function onLoginEut(){
      console.log("eut app connected");
      eut.socket_id = socket.id;
    }
    function onLoginKobe(){
      console.log("kobe app connected");
      kobe.socket_id = socket.id;
    }
    function onLoginMayor(){
      console.log("mayor app connected");
      mayor.socket_id = socket.id;
    }

  function onUpdateApk(data){
      pool.getConnection(function (error, connection) {
          if (error) throw error;
          connection.query("INSERT INTO `apk_update` (`version`) VALUES ('"+data+"')", function (err, result) {
              // if(result.length !== 0){
                 // console.log(result);
              // }
          });
          connection.release();
      });
    }
    function onLoadMarkers(data){
      console.log(data);
      if(data.alert_type == "POLICE"){
        pool.getConnection(function (error, connection) {
            if (error) throw error;
            connection.query("SELECT * FROM alerts WHERE alert_type='"+data.alert_type+"' AND incident='"+data.incident+"' AND YEAR(time)='"+data.year+"' AND MONTH(time)='"+data.month+"'", function (err, result) {
                // if(result.length !== 0){
                   // console.log(result);
                  socket.emit('display_markers', result);
                // }
            });
            connection.release();
        });
      }
      else{
        pool.getConnection(function (error, connection) {
            if (error) throw error;
            connection.query("SELECT * FROM alerts WHERE alert_type='"+data.alert_type+"' AND YEAR(time)='"+data.year+"' AND MONTH(time)='"+data.month+"'", function (err, result) {
                // if(result.length !== 0){
                  // console.log(result);
                  socket.emit('display_markers', result);
                // }
            });
            connection.release();
        });
      }
    }

    function onPauseSound(){
        socket.broadcast.emit('pause_alert');
        console.log("===========pause");
    }

    function onReportInfo(data){

        console.log("=========== REPORT INFO ================");
         console.log({data});

        pool.getConnection(function (error, connection) {
          var imgpath, user, alert, incidents, appuser, patient, pstatus, hospital, remarks;
          var resp = "";
          appuser = data.apkuser;
            if (error) throw error;
            connection.query("SELECT * FROM alerts WHERE imei='" + data.imei + "' AND time='" + data.time + "'", function (err, result) {
                if(result.length !== 0){
                console.log(result[0].id);
                img = result[0].imgpath;
                user = result[0].logged_user;
                incidents = result[0].incident;
                alert = result[0].alert_type;

                patient = result[0].patient;
                pstatus = result[0].pstatus;
                hospital = result[0].hospital;
                remarks = result[0].remarks;


                  connection.query("SELECT barangay FROM barangay WHERE barangay.id IN (SELECT st_id FROM alert_resp WHERE alert_id='"+result[0].id+"')", function (err, result2) {

                          var info = {
                              imgpath : img,
                              user : user,
                              apk_user: appuser,
                              incident: incidents,
                              alert_type: alert,
                              patient: patient,
                              pstatus: pstatus,
                              hospital: hospital,
                              remarks: remarks
                          };

                    console.log(info, result2);
                    socket.emit('retrieve_info', info, result2);

                  });

                }
            });

            connection.release();
        });
  }

    function onSendConfirms(data){

        console.log("=========== SMS CONFIRM ================");
         console.log({data});

        pool.getConnection(function (error, connection) {
            if (error) throw error;
            connection.query("SELECT password FROM app_users WHERE contact='" + data + "'", function (err, result) {
                if(result.length !== 0){
                  console.log(result[0].password);
                  socket.to(sms.socket_id).emit('act_number', {mobile: data, password: result[0].password});
                }
            });
            connection.query("SELECT id FROM app_users WHERE status=0", function (err, result) {
                if (err) throw err;
                var count = result.length;
                  socket.emit('reg_nottifs', count);
            });
            connection.release();
        });


        // socket.emit('activate_number', data);

    }
    function onResendCode(data){

        console.log("=========== RESEND CODE ================");
         console.log({data});

        pool.getConnection(function (error, connection) {
            if (error) throw error;
            connection.query("SELECT contact FROM app_users WHERE imei='" + data.imei + "'", function (err, result) {
                if(result.length !== 0){
                  console.log(result[0].contact);
                  var length = 6,
                        charset = "ABCDEFGHIJKLMNPQRSTUVWXYZ123456789",
                        hashpw = "";
                    for (var i = 0, n = charset.length; i < length; ++i) {
                        hashpw += charset.charAt(Math.random() * n);
                        }
                  connection.query("UPDATE app_users SET password='" + hashpw +"' WHERE imei='" + data.imei +"'");
                  socket.to(sms.socket_id).emit('act_number', {mobile: result[0].contact, password: hashpw});
                }

            });
            connection.release();
        });

    }

    function onUpdateNum(data){

        console.log("=========== UPDATE NUM ================");
        console.log({data});
        var length = 6,
              charset = "ABCDEFGHIJKLMNPQRSTUVWXYZ123456789",
              hashpw = "";
          for (var i = 0, n = charset.length; i < length; ++i) {
              hashpw += charset.charAt(Math.random() * n);
              }

        pool.getConnection(function (error, connection) {
            if (error) throw error;
            connection.query("UPDATE app_users SET  password='"+ hashpw +"', contact='"+ data.contact +"', ser_num='"+ data.sirnum +"' WHERE imei='" + data.imei + "'", function (err, result) {
            console.log("=========== UPDATED NUM ================");
            socket.to(sms.socket_id).emit('act_number', {mobile: data.contact, password: hashpw});
            });
            connection.release();
        });


        // socket.emit('activate_number', data);

    }

    function onDeptEndTrack(data){
        socket.broadcast.emit('dept_end_message', data);
    }

    function onCloseTrackDept(data){
        socket.broadcast.emit('dept_close_tab', data);
    }
    function onAccepted(data){
      socket.broadcast.emit('on_alert_acceptede', data);
    }
    function onCheckNottif(){
      pool.getConnection(function (error, connection) {
          // console.log(data);
          if (error) throw error;
          connection.query("SELECT id FROM app_users WHERE status=0", function (err, result) {
              if (err) throw err;
              var count = result.length;
                socket.emit('reg_nottifs', count);
          });
          connection.release();
      });
    }

    function onArrivalTime(data){
      pool.getConnection(function (error, connection) {
          console.log(data);
          if (error) throw error;
          connection.query("UPDATE alert_dept SET arrival_time='"+ data.date +"' WHERE alert_id IN (SELECT id FROM alerts WHERE imei='" + data.imei + "' AND status=1) AND dept_id IN (SELECT id FROM users WHERE position='" + data.position + "') AND status=1", function (err, result) {
              //connection.query("UPDATE alert_dept SET status=1, accept_time ='?' WHERE alert_id IN (SELECT id FROM alerts WHERE imei='?' AND status=1) AND dept_id IN (SELECT id FROM users WHERE socket_id='?') AND status=0",[date, room, socket.id], function (err, result) {
              if (err) throw err;
              console.log('update result');
              console.log(result);
		socket.broadcast.emit('RESP_ATd', data);
          });
          connection.release();
      });
    }
    function onCheckNum(data){
      pool.getConnection(function (error, connection) {
          console.log("------------- CHECK NUM ----------------");
          console.log({data});
          if (error) throw error;
          connection.query("SELECT ser_num FROM app_users  WHERE imei ='"+data.imei+"' ", function (err, result) {
              //connection.query("UPDATE alert_dept SET status=1, accept_time ='?' WHERE alert_id IN (SELECT id FROM alerts WHERE imei='?' AND status=1) AND dept_id IN (SELECT id FROM users WHERE socket_id='?') AND status=0",[date, room, socket.id], function (err, result) {
              if (err) throw err;
              if(result.length !== 0){
                // connection.query("UPDATE app_users SET contact='"+ data.no +"' WHERE imei = '"+data.imei+"'", function (err, result) {
                //
                //     // console.log('update number');
                    console.log("==== OLD Serial Num =====");
                    console.log(result[0].ser_num);
                    socket.emit('ser_num', {sirnum: result[0].ser_num});
                // });
                // connection.release();
              }
              // else {
              //   connection.release();
              // }

          });
          connection.release();
      });
    }

    function onArrivalTimeResp(data){
      pool.getConnection(function (error, connection) {
          console.log(data);
          if (error) throw error;
          connection.query("UPDATE alert_resp SET arrival_time='"+ data.date +"' WHERE alert_id IN (SELECT id FROM alerts WHERE imei='" + data.imei + "' AND status=1) AND st_id IN (SELECT id FROM barangay WHERE barangay='" + data.rtype + "') AND status=1", function (err, result) {
              //connection.query("UPDATE alert_dept SET status=1, accept_time ='?' WHERE alert_id IN (SELECT id FROM alerts WHERE imei='?' AND status=1) AND dept_id IN (SELECT id FROM users WHERE socket_id='?') AND status=0",[date, room, socket.id], function (err, result) {
              if (err) throw err;
              console.log('update arrival resp');
              console.log(result);
              socket.broadcast.emit('RESP_AT', data);
          });
          connection.release();
      });
    }

    function onDisconnect(){
        console.log('Device is disconnected android: ' + socket.id);
        console.log(cc.CommandCenter);
        if (socket.id === cc.CommandCenter){
            console.log('CommandCenter');
            cc.CommandCenter = '';

            //-------------- idol offline user --------------
            pool.getConnection(function (error, connection) {
                if (error) throw error;
                connection.query("UPDATE users SET log_status='offline' WHERE socket_id='" + socket.id + "'", function(err){
                    if (err) throw err;
                });

                connection.query("SELECT * FROM users WHERE 1 ORDER BY username ASC", function(err, result){
                    if (err) throw err;

                    socket.broadcast.emit('change_status_logs', result);
                });


                connection.release();
            });
            //-----------------------------------------------
        }else{
          console.log(socket.id);
            pool.getConnection(function(error, connection){
                if (error) throw error;
                /*connection.query("UPDATE action_center SET socket_id='' WHERE socket_id='" + socket.id + "'", function(err){
                    if (err) throw err;
                });*/
                connection.query("SELECT id, dep_id, status FROM responder WHERE socket_id=?",[socket.id], function (err, result) {
                  console.log("#################");
                    // console.log({result});
                    if (result.length !== 0){
                        if (result[0].status !== 'occupied'){
                            change_status(result[0], 'inactive');
                            socket.broadcast.emit('disconnect_resp', result[0].id);
                            socket.broadcast.emit('disconnect_resp2', result[0].id);
                        }
                          socket.broadcast.emit('disconnect_resp', result[0].id);
                          socket.broadcast.emit('disconnect_resp2', result[0].id);
                        change_marker(result[0], 'offline');

                    }
                });
                connection.query("UPDATE responder SET socket_id='', status='inactive' WHERE socket_id='" + socket.id + "' AND status!='occupied'", function(err, result){
                    if (err) throw err;

                });
                // connection.query("UPDATE users SET socket_id='', log_status='offline' WHERE socket_id='" + socket.id + "'", function(err){
                //     if (err) throw err;
                //
                // }); old code
                // if (error) throw error;
                connection.query("UPDATE users SET log_status='offline' WHERE socket_id='" + socket.id + "'", function(err){
                    if (err) throw err;
                });

                connection.query("SELECT username, position, log_status as status FROM users WHERE socket_id='" + socket.id + "'", function(err, result){
                    if (err) throw err;

                    socket.broadcast.emit('change_userStatus', result);
                    // socket.broadcast.emit('change_status_logs', result);
                });

                connection.query("SELECT * FROM users WHERE 1 ORDER BY username ASC", function(err, result){
                    if (err) throw err;

                    socket.broadcast.emit('change_status_logs', result);
                });

                connection.query("UPDATE app_users SET socket_id='' WHERE socket_id='" + socket.id + "'", function(err){
                    if (err) throw err;
                    console.log("################# users login");
                });
                trackThis([socket.id, '', 'disconnect']);
                connection.release();
            });
        }
    }
    function onCheckUser(data){
        console.log(data);
        pool.getConnection(function (error, connection) {
            if (error) throw error;
            connection.query("SELECT id, status, password, contact FROM app_users WHERE imei='" + data +"'", function (err, result) {
                if (err) throw err;
                //console.log(result);
                if (result.length !== 0) {
                    var x = Boolean(result[0].status !== 0);
                    console.log(x);
                    socket.emit('check_user', {isExist: true, isVerify: x});

                    console.log('user exist');
                }else{
                    socket.emit('check_user', {isExist: false, isVerify: false});
                    console.log('user not exist');
                }
                connection.release();
            });
        });
    }

    function onCheckVersion(data){
	  var version = "";
        console.log(data);
        pool.getConnection(function (error, connection) {
            if (error) throw error;
            connection.query("SELECT version FROM apk_update", function (err, result) {
                if(result.length !== 0){
                    console.log(result);
                    for (var i = 0; i <= result.length - 1; i++){
                    version = result[i].version;
                  }
                }
           // });
	    console.log("======== version =======");
            console.log(version);
            if (version === data) {
                socket.emit('check_version', {isVersion: true});
                console.log('isVersion');
            }else{
                socket.emit('check_version', {isVersion: false, version: version});
                console.log('not isVersion');
            }
	   });
            connection.release();
          });



    }

    function onLoginUser(data){
        pool.getConnection(function (error, connection) {
            connection.query("SELECT password FROM app_users WHERE imei=?", [data.imei], function (err, res) {
                if (err) throw  err;
                if (res.length !== 0){
                     // bcrypt.compare(data.password, res[0].password, function (error, isMatch) {
                        // if (error) throw error;
                        // console.log(isMatch);
                        console.log("============ PASSWORD ===========");
                        console.log(res[0].password);
                        console.log(data.password);
                        console.log("=================================");
                        if (data.password === res[0].password){
                            connection.query("SELECT * FROM app_users WHERE imei=?", [data.imei], function (err, result) {
                                if (err) throw err;
                                //console.log(result);
                                var ssid = getNewSessionId();

                                if (result.length !== 0){
                                    var info = {
                                        isSuccess : true,
                                        imei : result[0].imei,
                                        username : result[0].username,
                                        password : result[0].password,
                                        fname : result[0].fname,
                                        mname : result[0].mname,
                                        lname : result[0].lname,
                                        birthdate : result[0].birthdate,
                                        contact : result[0].contact,
                                        street : result[0].street,
                                        barangay : result[0].barangay,
                                        municipality : result[0].municipality,
                                        province : result[0].province,
                                        reg_date : result[0].created_at,
                                        ssid: ssid
                                    };
                                    connection.query("UPDATE app_users SET session_id='" + ssid + "' WHERE imei='" + data.imei + "'");
                                    console.log("============== login app user ============");
                                    socket.emit('login_user', info);


                                    connection.release();
                                }
                            });
                        }else{
                            socket.emit('login_user', {isSuccess : false});
                            connection.release();
                        }
                    // });
                }else{
                    socket.emit('login_user', {isSuccess : false});
                    connection.release();
                }
            });
        });
    }
    function onUserLogin(data){
        console.log(data);
        console.log("------------ username -----------");
        console.log(data.username);
        //check user that login is Command Center
        if (data.name === 'CommandCenter'){
            //set cc.CommandCenter = new socket.id
            cc.CommandCenter = socket.id;
            console.log(cc.CommandCenter);
            pool.getConnection(function(error, connection){
                if (error) throw error;
                connection.query("SELECT alerts.id, tr.id, alerts.imei, tr.lat, tr.lng, alerts.alert_type, CONCAT(app_users.fname, ' ', app_users.lname) as name, app_users.contact FROM alerts JOIN app_users ON alerts.imei=app_users.imei LEFT JOIN tracking tr ON alerts.id=tr.alert_id WHERE alerts.status=0 ORDER BY tr.id DESC LIMIT 1", function(err, result){
                    if (err) throw err;
                    console.log(result);
                    socket.emit('init_alert', result);
                });

                connection.query("SELECT alerts.imei, alerts.alert_type, CONCAT(app_users.fname, ' ', app_users.lname) as name, app_users.contact FROM alerts JOIN app_users ON alerts.imei=app_users.imei WHERE alerts.status=1 and alerts.logged_user = '" + data.username + "'", function(err, result){
                    if (err) throw err;
                    socket.emit('init_ongoing', result);
                  });
                  connection.query("UPDATE users SET log_status='online', socket_id='" + cc.CommandCenter + "' WHERE username='" + data.username + "'", function (err) {
                    // connection.query("UPDATE users SET socket_id='" + cc.CommandCenter + "' WHERE position='AC'", function (err) { old code
                  if (err) throw err;
                  console.log("update success");
                  });
                //-------------------- idol login ac ------------------------
                connection.query("SELECT * FROM users WHERE 1 ORDER BY username ASC", function(err, result){
                    if (err) throw err;
                    // console.log(result);

                    socket.broadcast.emit('change_status_logs', result);
                });

                //--------------------------------------------------------------
                connection.release();
            });
        }else {
            pool.getConnection(function(error, connection){
                if (error) throw error;
                connection.query("UPDATE action_center SET socket_id='" + socket.id + "' WHERE name='" + data.name + "'", function(err, result){
                    if (err) throw err;
                    console.log(result.affectedRows + " record(s) updated");
                });
                connection.query("SELECT alerts.alert_type, alerts.imei, CONCAT(app_users.fname, ' ', app_users.lname) as name, app_users.contact, alert_ac.status FROM alerts JOIN app_users on alerts.imei = app_users.imei LEFT JOIN alert_ac ON alerts.id=alert_ac.alert_id WHERE  alert_ac.ac_id IN (SELECT id FROM action_center WHERE name='" + data.name + "') AND alert_ac.status IN (0,1)", function (err, result) {
                    if (err) throw err;
                    socket.emit('alerts_ac', result);
                });

                connection.release();
            });
        }
    }

    function onDeptLogin(data){
        pool.getConnection(function (error, connection) {
          console.log("------------------------ dept login ------------------");
            console.log(data);
            if (error) throw error;
            if (data.dept.toLowerCase() === "police") police.police = socket.id;
            if (data.dept.toLowerCase() === "fire") fire.fire = socket.id;
            connection.query("UPDATE users SET log_status='online', socket_id='" + socket.id + "' WHERE position='" + data.dept + "' AND municipality='" + data.name + "'", function (err) {
                if (err) throw err;
            });
            /*connection.query("SELECT alerts.alert_type, alerts.imei, CONCAT(app_users.fname, ' ', app_users.lname) as name, app_users.contact, alert_dept.status FROM alerts JOIN app_users on alerts.imei = app_users.imei LEFT JOIN alert_dept ON alerts.id=alert_dept.alert_id WHERE  alert_dept.dept_id IN (SELECT id FROM users WHERE municipality='" + data.name + "' AND position='" + data.dept + "') AND alert_dept.status IN (0,1)", function (err, result) {*/
                connection.query("SELECT alerts.alert_type, alerts.imei, CONCAT(app_users.fname, ' ', app_users.lname) as name, app_users.contact, CONCAT(app_users.street, ', ', app_users.barangay) AS address, alert_dept.status FROM alerts JOIN app_users on alerts.imei = app_users.imei LEFT JOIN alert_dept ON alerts.id=alert_dept.alert_id WHERE  alert_dept.dept_id IN (SELECT id FROM users WHERE municipality='" + data.name + "' AND position='" + data.dept + "') AND alert_dept.status IN (0,1)", function (err, result) {
                //connection.query("SELECT alerts.alert_type, alerts.imei, CONCAT(app_users.fname, ' ', app_users.lname) as name, app_users.contact FROM alerts JOIN app_users on alerts.imei = app_users.imei WHERE alerts.id='" + result[j].alert_id + "'", function (err, result) {
                if (err) throw err;
                //console.log(result);
                socket.emit('alerts_ac', result);
            });
            //-------------------- idol login dept ------------------------
            connection.query("SELECT username, position, log_status as status, user_type as type, user_tag as tag FROM users WHERE socket_id='" + socket.id + "'", function(err, result){
                if (err) throw err;
                // console.log(result);

                socket.broadcast.emit('change_userStatus', result);
                // socket.emit('change_status_logs', result);
            });

            connection.query("SELECT * FROM users WHERE 1 ORDER BY username ASC", function(err, result){
                if (err) throw err;
                // console.log(result);

                socket.broadcast.emit('change_status_logs', result);
            });
            //--------------------------------------------------------------
            connection.release();
        });
    }
    function onRespLogin(data){
        console.log('respondernew2 : ', {data});
        pool.getConnection(function (error, connection) {
            connection.query("SELECT resp.id, dept.department, brgy.barangay, ac.name, resp.dep_id FROM responder resp JOIN department dept ON resp.dep_id=dept.id JOIN barangay brgy ON resp.st_id=brgy.id JOIN action_center ac ON resp.ac_id=ac.id WHERE resp_unique_id='" + data.id + "' AND imei='" + data.imei + "'", function (err, rInfo) {
                if (err) throw err;
                console.log('responders2 : ', {rInfo});
                if (rInfo.length !== 0){
                    connection.query("SELECT al.imei, ar.status, ar.st_id FROM alert_resp ar JOIN alerts al ON ar.alert_id=al.id WHERE (resp_id=(SELECT id FROM responder WHERE imei='" + data.imei + "') AND ar.status=1) OR (ar.st_id=(SELECT st_id FROM responder WHERE imei='" + data.imei + "') AND ar.status=0 AND ar.resp_id=0) ORDER BY ar.status DESC", function (err, result) {
                        if (err) throw err;
                        if (result.length !== 0){
                            switch (result[0].status){
                                case 1:
                                    socket.join(result[0].imei, function () {
                                        connection.query("SELECT tracking.lat, tracking.lng, alerts.alert_type FROM tracking JOIN alerts ON tracking.alert_id=alerts.id WHERE imei='" + result[0].imei + "' AND status=1 ORDER BY tracking.id DESC LIMIT 1", function(err, result){
                                            if (err) throw err;
                                            console.log("select tr: " + result[0]);
                                            socket.emit('init_track', result[0]);
                                        });
                                        change_status(rInfo[0], 'occupied');
                                        console.log("----------------- rinfo --------------");
                                        console.log(rInfo[0]);
                                        change_marker(rInfo[0], 'online');
                                        connection.query("UPDATE responder SET socket_id='" + socket.id + "', status='occupied' WHERE id='" + rInfo[0].id + "'", function (err) {
                                            if (err) throw err.message;
                                            connection.release();
                                        });
                                    });
                                    break;
                                case 0:
                                    change_status(rInfo[0],'active');
                                    connection.query("SELECT alerts.alert_type, alerts.imei, CONCAT(app_users.fname,' ',app_users.lname) as name, app_users.contact FROM alerts JOIN app_users on alerts.imei = app_users.imei WHERE alerts.id=(SELECT id FROM alerts WHERE imei='" + result[0].imei + "' AND status=1)", function (err, result) {
                                        if (err) throw err.message;
                                       // console.log(result);
                                        if (result.length !==0){
                                            socket.emit('SEND_RESP', result[0]);
                                        }
                                    });
                                    connection.query("UPDATE responder SET socket_id='" + socket.id + "', status='active' WHERE id='" + rInfo[0].id + "'", function (err, result) {
                                        if (err) throw err.message;
                                        connection.release();
                                    });
                                    socket.emit('LOGIN_SUCCESS', {status: 1, rtype: rInfo[0].dep_id, type: rInfo[0].barangay, dept: rInfo[0].department, ac: rInfo[0].name});
                                      // socket.broadcast.emit('new_resp_login');
                                    break;
                            }
                        }else {
                            change_status(rInfo[0],'active');
                            connection.query("UPDATE responder SET socket_id='" + socket.id + "', status='active' WHERE id='" + rInfo[0].id + "'", function (err, result) {
                                if (err) throw err.message;
                                connection.release();
                            });
                            // socket.broadcast.emit('new_resp_login');
                            socket.emit('LOGIN_SUCCESS', {  status: 1, rtype: rInfo[0].dep_id, type: rInfo[0].barangay, dept: rInfo[0].department, ac: rInfo[0].name});
                        }
                    });
                }else{
                    connection.release();
                      // socket.broadcast.emit('new_resp_login');
                    socket.emit('LOGIN_SUCCESS', {status: 0});
                }
            });
        });
    }
    function onReJoin(data){
        pool.getConnection(function (error, connection) {
            connection.query("SELECT id FROM alerts WHERE imei='" + data + "' AND status IN (0,1)", function (err, result) {
                if (err) throw err;
                if (result.length !== 0){
                    socket.join(data, function(){
                        console.log(data + " was reconnected to the room.");
                    });
                }
                connection.release();
            });
        });
    }
    function onSendNotification(data){
        console.log(data);
        var info_blast = [];
        pool.getConnection(function (error, connection) {
           if (error) throw error;

           connection.query("INSERT INTO notification (title, content, image) VALUES (?,?,?)",[data.title, data.content, data.image], function (err) {
               if (err) throw err;
               // connection.release();
           });

           connection.query("SELECT * FROM notification WHERE 1 ORDER BY id DESC LIMIT 5", function (err, result) {
               if (err) throw err;
               console.log("============= send infoblast ==============");
               console.log(result);
               // socket.emit('receive_notifications', result);
               //info_blast = result;
               connection.query("SELECT socket_id FROM app_users WHERE socket_id<>''", function (err, result2) {
                   if (err) throw err;
                   if (result2 !== null){
                       console.log(result);
                       console.log("==================== info blast data null filter ===============");
                       console.log(info_blast);
                       console.log("====================================================");
                       for (var i = 0; i <= result2.length - 1; i++){
                           socket.to(result2[i].socket_id).emit('receive_notification', result);
                       }
                   }
                   connection.release();
               });
           });

        });
        //socket.broadcast.emit('receive_notification', data);
    }
    function onTrackAlert(room, dept, date){ //change from join to track_alert
        socket.join(room, function() {
            console.log('ontrackAlert room');
            console.log(room);
            pool.getConnection(function (error, connection) {
                if (error) throw  error;
                connection.query("SELECT tracking.lat, tracking.lng, alerts.alert_type, alerts.imgpath FROM tracking JOIN alerts ON tracking.alert_id=alerts.id WHERE imei='" + room + "' AND status=1 ORDER BY tracking.id DESC LIMIT 1", function(err, result){
                    if (err) throw err;
                    //console.log(result);
                    if (result.length !== 0){
                        console.log(result[0]);
                        socket.emit('init_track', result[0]);
                    }
                });
                //connection.query("SELECT lat, lng, ar.resp_id FROM tracking_resp tr JOIN alert_resp ar ON tr.ar_id=ar.id WHERE ar.alert_id =(SELECT id FROM alerts WHERE imei='" + room + "' AND status IN (0,1)) AND ar.resp_id<>0 AND status=1 AND tr.id IN (SELECT MAX(id) FROM tracking_resp GROUP BY ar_id)", function (err, result) {
                connection.query("SELECT lat, lng, ar.resp_id AS id, resp.dep_id AS type FROM tracking_resp tr JOIN alert_resp ar ON tr.ar_id=ar.id LEFT JOIN responder resp ON ar.resp_id=resp.id WHERE ar.resp_id<>0 AND tr.id IN (SELECT MAX(id) FROM tracking_resp WHERE alert_id =(SELECT id FROM alerts WHERE imei='" + room + "' AND status=1) GROUP BY ar_id)", function (err, result) {
                    if (err) throw err;
                    socket.emit('init_resp', result);
                });
                console.log(socket.id);
                connection.query("UPDATE alert_ac SET status=1, accept_time ='"+ date +"' WHERE alert_id IN (SELECT id FROM alerts WHERE imei='" + room + "' AND status=1) AND ac_id IN (SELECT id FROM action_center WHERE socket_id='" + socket.id + "') AND status=0", function (err, result) {
                    //console.log(result);
                });
                console.log('ontrackAlert room update');
                console.log(room);
                console.log('position');
                console.log(dept);
                console.log('------------------ DTATE ----------------------');
                console.log(date);
                console.log('------------------ DTATE END ----------------------');

                // connection.query("UPDATE alert_dept SET status=1, accept_time ='"+ date +"' WHERE alert_id IN (SELECT id FROM alerts WHERE imei='" + room + "' AND status=1) AND dept_id IN (SELECT id FROM users WHERE socket_id='" + socket.id + "') AND status=0", function (err, result) { eruel
                connection.query("UPDATE alert_dept SET status=1, accept_time ='"+ date +"' WHERE alert_id IN (SELECT id FROM alerts WHERE imei='" + room + "' AND status=1) AND dept_id IN (SELECT id FROM users WHERE position='" + dept + "') AND status=0", function (err, result) {
                    //connection.query("UPDATE alert_dept SET status=1, accept_time ='?' WHERE alert_id IN (SELECT id FROM alerts WHERE imei='?' AND status=1) AND dept_id IN (SELECT id FROM users WHERE socket_id='?') AND status=0",[date, room, socket.id], function (err, result) {
                    if (err) throw err;
                    console.log('update result');
                    console.log(result);
                });
                connection.release();
            });
        });
    }
    function onRespondAlert(room, date){
        console.log("respond_alert" + room);
        socket.join(room, function() {
            console.log("responder join room");
            pool.getConnection(function (error, connection) {
                if (error) throw error;
                connection.query("UPDATE alert_resp SET status=1, accept_time='"+ date +"', resp_id=(SELECT id FROM responder WHERE socket_id='" + socket.id + "') WHERE alert_id= (SELECT id FROM alerts WHERE imei='" + room + "' AND status=1) AND status=0", function (err, result) {
                    if (err) throw err;
                    //console.log(result);
                    if (result.affectedRows === 1){
                        connection.query("UPDATE responder SET status='occupied' WHERE socket_id='" + socket.id + "'", function (err, result) {
                            if (err) throw err;
                            //console.log(result);
                            // socket.broadcast.emit('change_status', {name: data.id, status: status});
                            // connection.query("SELECT id, st_id AS brgy_id, status, dep_id AS type FROM responder WHERE socket_id='" + socket.id + "' AND dep_id<>'4'", function (err, result) { eruel code
                            connection.query("SELECT id, st_id AS brgy_id, status, dep_id AS type FROM responder WHERE socket_id='" + socket.id + "'", function (err, result) {
                                if (err) throw err;
                                console.log('================RESP_ALERT============');
                                console.log(result);
                                console.log('======================================');
                                if (result.length !== 0){
                                    socket.to(room).emit('RESP_ALERT', result[0]);
                                }
                                connection.release();
                            });
                        });
                        connection.query("SELECT tracking.lat, tracking.lng, alert_type FROM tracking JOIN alerts ON tracking.alert_id=alerts.id WHERE imei='" + room + "' AND status=1 ORDER BY tracking.id DESC LIMIT 1", function(err, result){
                            if (err) throw err;
                            console.log("select tr: " + result[0]);
                            socket.emit('init_track', result[0]);
                        });
                        connection.query("SELECT socket_id FROM responder WHERE st_id=(SELECT id FROM barangay WHERE id=(SELECT st_id FROM responder WHERE socket_id='" + socket.id + "')) AND socket_id != '" + socket.id + "'", function (err, result) {
                            if (err) throw err;
                            //console.log(result);
                            for (var i=0; i<=result.length - 1; i++){
                                socket.to(result[i].socket_id).emit('alert_accepted');
                            }
                        });
                    }else{
                        socket.emit("message", {message: "Someone already accept alert."});
                        connection.release();
                    }
                });
                  // socket.broadcast.emit('new_resp_login'); //gawa lnng ni idol echos reload
            });
        });
    }
    function onLocationUpdate(data){
        console.log(data);
        console.log('location_update');
        //send location update to all user inside alert room
        socket.to(data.imei).emit('location_update', data);
        pool.getConnection(function (error, connection) {
            if (error) throw error;
            connection.query("SELECT id FROM alerts WHERE imei='"+ data.imei + "' AND status IN (0,1)", function (err, result) {
                if (err) throw err;
                if (result.length !== 0){
                    connection.query("INSERT INTO tracking (alert_id, lat, lng, time) VALUES (?,?,?,?)",[result[0].id, data.lat, data.lng, data.time], function (err) {
                        if (err) throw err;
                        connection.release();
                    });
                }else{
                    connection.release();
                    socket.emit('end_alert',{});
                }
            });
        });
    }
    function onRespUpdate(data){
        //printLog('RESP_UPDATE', data)
        console.log("RESP_UPDATE:" + data.lat + ", " + data.lng + ", " + data.aimei);
        pool.getConnection(function (error, connection) {
            if (error) throw error.message;
            //console.log("SELECT id, resp_id FROM alert_resp WHERE alert_id IN (SELECT id FROM alerts WHERE imei='" + data.aimei + "' AND status=1) AND resp_id IN (SELECT id FROM responder WHERE imei='" + data.imei + "')");
            connection.query("SELECT id, resp_id FROM alert_resp WHERE alert_id IN (SELECT id FROM alerts WHERE imei='" + data.aimei + "' AND status=1) AND resp_id IN (SELECT id FROM responder WHERE imei='" + data.imei + "')", function (err, result) {
                if (err) throw err.message;
                if (result.length !==0){
                    var newLoc = {
                        id  :   result[0].resp_id,
                        lat :   data.lat,
                        lng :   data.lng
                    };
                    connection.query("INSERT INTO tracking_resp (ar_id, lat, lng, time) VALUES (?,?,?,?)",[result[0].id, data.lat, data.lng, data.time], function (err) {
                        if (err) throw err.message;
                        connection.release();
                    });
                    socket.to(data.aimei).emit('RESP_UPDATE', newLoc);
                    // socket.to(data.aimei).emit('RESP_UPDATE2', newLoc);//idol

                    console.log("emit resp update");
                }else{
                    connection.release();
                }

            });
            // connection.query("INSERT INTO track_resp (resp_id, dept_id, lat, lng) VALUES(?,?,?,?)",data.lat, data.lng, function (err, result) {
            //     if (err) throw err.message;
            //             connection.release();
            // });

            // connection.query("SELECT id, dep_id as type FROM responder WHERE imei = '" + data.imei +"'", function (err, result) {
            //     if (err) throw err.message;
            //     if (result.length !==0){
            //         var newLoc = {
            //             type: result[0].type,
            //             id  :   result[0].id,
            //             lat :   data.lat,
            //             lng :   data.lng
            //         };
            //           console.log(newLoc);
            //           socket.broadcast.emit('resp_update2', newLoc);
            //           console.log("resp update2 --------------------");
            //       }else{
            //             connection.release();
            //         }
            // });

        });
    }

    function onRespLoc(data){
        //printLog('RESP_UPDATE', data)
try{
        console.log("RESP_LOCATION:" + data.lat + ", " + data.lng + ", " + data.aimei);
        
pool.getConnection(function (error, connection) {
                if (error) throw error.message;
                connection.query("SELECT status FROM alerts WHERE imei = '" + data.aimei +"' ORDER BY id DESC LIMIT 1", function (err, result) {
                    if (err) throw err.message;

                    if (result.length !== 0){
                      var resp_stat = result[0].status;

                      console.log("status " + resp_stat);
                      if(resp_stat === 2){
                        console.log("end resp");
                          socket.emit('end_alert', data.aimei);
                          connection.query("UPDATE responder SET status='active' WHERE id IN (SELECT resp_id FROM alert_resp WHERE alert_id=(SELECT MAX(id) FROM alerts WHERE imei='" + data.imei + "' AND status=1)) AND status='occupied'", function (err) {
                          console.log("resp updated");
                          if (err) throw err;
                          });
                          connection.query("UPDATE alert_resp SET status=2 WHERE alert_id=(SELECT MAX(id) FROM alerts WHERE imei='" + data.imei + "' AND status=1) AND status IN (0,1)",function (err) {
                          console.log("alert resp updated");
                          if (err) throw err.message;

                          });

                      }
                    }
                      connection.release();
                });
            });

pool.getConnection(function (error, connection) {

            if (error) throw error.message;
            connection.query("SELECT id, dep_id as type FROM responder WHERE imei = '" + data.imei +"'", function (err, result) {
                if (err) throw err.message;
                var resp_id = result[0].id;
                var dept_id = result[0].type;

                console.log("dept id " + result.length);
                if (result.length !==0){
                  connection.query("SELECT id, resp_id FROM track_resp WHERE resp_id = '" + resp_id + "'", function (err, result2) {
                        if (err) throw err.message;
                        if (result2.length !==0){
                          connection.query("UPDATE track_resp SET lat = '"+ data.lat +"', lng = '"+ data.lng +"' WHERE resp_id='"+ result2[0].resp_id +"'", function (err, result) {
                              if (err) throw err.message;
                              connection.release();
                          });
                        }
                        else{
                          // console.log("else ");
                          connection.query("INSERT INTO track_resp (resp_id, dept_id, lat, lng) VALUES(?,?,?,?)",[resp_id, dept_id, data.lat, data.lng], function (err, result) {
                              if (err) throw err.message;
                              connection.release();
                          });

                        }
                          // connection.release();
                    });
                    connection.query("SELECT barangay FROM barangay WHERE id IN (SELECT st_id FROM responder WHERE imei = '"+ data.imei +"')", function (err, result) {
                        if (err) throw err.message;
                          var barangay = result[0].barangay;



                  console.log("BARANGAY RESPLOC===============================");
                  console.log(barangay);
                    var newLoc = {
                        type: dept_id,
                        id  :   resp_id,
                        lat :   data.lat,
                        lng :   data.lng,
                        label : barangay
                    };
                      console.log(newLoc);
                      socket.broadcast.emit('resp_update2', newLoc);
                      socket.broadcast.emit('resp_updatecall', newLoc);
                      socket.broadcast.emit('RESP_UPDATE', newLoc);
                       socket.broadcast.emit('newLoc', newLoc);
                      console.log("resp update2 s--------------------");
                        });
                  }else{
                        connection.release();
                    }
            });

        });
   }
	catch(e){
	console.log("Error",e);
	}

}
    function onTrackresp(){
        //printLog('RESP_UPDATE', data)
        console.log("RESP_RELOAD: ++++++--------");
        pool.getConnection(function (error, connection) {
            var barangay;
            var dept_id;
            var resp_id;
            var lat;
            var lng;
            if (error) throw error.message;
            //console.log("SELECT id, resp_id FROM alert_resp WHERE alert_id IN (SELECT id FROM alerts WHERE imei='" + data.aimei + "' AND status=1) AND resp_id IN (SELECT id FROM responder WHERE imei='" + data.imei + "')");
            connection.query("SELECT resp_id, dept_id, lat, lng FROM track_resp WHERE resp_id IN (SELECT id FROM responder WHERE status!='inactive')", function (err, result) {
                if (err) throw err.message;
                console.log("result ********************");
                console.log(result.length);
                if (result.length !==0){

                  for (i = 0; i <result.length; i++) {
                    console.log("result ********************" + i);
                    console.log(result[i].resp_id);
                    connection.query("SELECT barangay, track_resp.resp_id as resp_id, track_resp.dept_id as dept_id, track_resp.lat as lat, track_resp.lng as lng FROM barangay, track_resp WHERE barangay.id IN (SELECT st_id FROM responder WHERE id = '"+ result[i].resp_id +"') AND track_resp.resp_id ='"+ result[i].resp_id +"'", function (err, result2) {
                    // console.log(result2[0].resp_id);
                    if (err) throw err.message;
                    barangay = result2[0].barangay;
                    resp_id = result2[0].resp_id;
                    dept_id = result2[0].dept_id;
                    lat = result2[0].lat;
                    lng = result2[0].lng;

                    // connection.release();
                    var newLoc = {
                        type: dept_id,
                        id  : resp_id,
                        lat : lat,
                        lng : lng,
                        label : barangay
                    };
                    console.log("resp load sam--------------------");
                    console.log(newLoc);
                    socket.emit('resp_update2', newLoc);
                    socket.emit('resp_updatecall', newLoc);
                    socket.emit('RESP_UPDATE', newLoc);
                      console.log("resp load emit s--------------------");
                    });
                  }
                  connection.release();

                }else{
                    connection.release();
                }
                // connection.release();
            });

        });
    }

    function onTrackresp2(){
        //printLog('RESP_UPDATE', data)
        console.log("RESP_RELOAD: ++++++--------");
        pool.getConnection(function (error, connection) {
            var barangay;
            var dept_id;
            var resp_id;
            var lat;
            var lng;
            var status;
            if (error) throw error.message;
            //console.log("SELECT id, resp_id FROM alert_resp WHERE alert_id IN (SELECT id FROM alerts WHERE imei='" + data.aimei + "' AND status=1) AND resp_id IN (SELECT id FROM responder WHERE imei='" + data.imei + "')");
            connection.query("SELECT resp_id, dept_id, lat, lng FROM track_resp WHERE resp_id IN (SELECT id FROM responder)", function (err, result) {
                if (err) throw err.message;
                console.log("result ********************");
                console.log(result.length);
                if (result.length !==0){

                  for (i = 0; i <result.length; i++) {
                    console.log("result ********************" + i);
                    console.log(result[i].resp_id);
                    connection.query("SELECT barangay, track_resp.resp_id as resp_id, track_resp.dept_id as dept_id, track_resp.lat as lat, track_resp.lng as lng, responder.status as status FROM barangay, track_resp, responder WHERE barangay.id IN (SELECT st_id FROM responder WHERE id = '"+ result[i].resp_id +"') AND track_resp.resp_id ='"+ result[i].resp_id +"' AND responder.id ='"+ result[i].resp_id +"'", function (err, result2) {
                    // console.log(result2[0].resp_id);
                    if (err) throw err.message;
                    barangay = result2[0].barangay;
                    resp_id = result2[0].resp_id;
                    dept_id = result2[0].dept_id;
                    lat = result2[0].lat;
                    lng = result2[0].lng;
                    status = result2[0].status;

                    // connection.release();
                    var newLoc = {
                        type: dept_id,
                        id  : resp_id,
                        lat : lat,
                        lng : lng,
                        label : barangay,
                        status : status
                    };
                    console.log("resp load sam--------------------");
                    console.log(newLoc);
                    socket.emit('RESP_UPDATE2', newLoc);
			socket.broadcast.emit('RESP_UPDATE2', newLoc);
                      console.log("resp load emit s--------------------");
                    });
                  }
                  connection.release();

                }else{
                    connection.release();
                }
                // connection.release();
            });

        });
    }


    function onSendAlert(data){
        console.log('Alert : ' + {data});
        pool.getConnection(function(error, connection) { //create Pool connection to db
            //select query to check and get user info
            connection.query("SELECT CONCAT(app_users.fname, ' ', app_users.lname) as name, contact FROM app_users WHERE imei='" + data.imei + "' AND status=1", function(err, info){
                //if statement if user exist
                if (info.length !== 0){
                    connection.query("SELECT id FROM alerts WHERE imei='" + data.imei + "' AND status IN (0,1)", function (err, result) {
                        if (err) throw err;
                        if (result.length === 0){
                            //console.log(cc.CommandCenter);
                            //create new key name in data
                            data['name'] = info[0].name;
                            data['contact'] = info[0].contact;
                            socket.broadcast.emit('new_alert', data);
                            console.log('alert: ' + cc.CommandCenter);
                            connection.query("INSERT INTO alerts(imei, lat, lng, alert_type, time, incident) VALUES (?,?,?,?,?,?) ",[data.imei, data.lat, data.lng, data.alert_type, data.time, data.pnpi], function(err){
                                if (err) throw err;
                                connection.query("SELECT id FROM alerts WHERE imei=? AND alert_type=? AND status IN (0,1)", [data.imei, data.alert_type], function (err, result) {
                                    if (err) throw err;
                                    if (result.length !== 0){
                                        connection.query("INSERT INTO tracking (alert_id, lat, lng, time) VALUES (?,?,?,?)", [result[0].id, data.lat, data.lng, data.time], function (err) {
                                            if (err) throw err;
                                            connection.release();
                                        });
                                    }else{
                                        connection.release();
                                    }
                                });
                            });
                            socket.join(data.imei, function(){
                                console.log('room has been created!');
                            });
                        }else{
                            connection.release();
                        }
                    });
                }else{
                    //if user is not  user
                    socket.emit('end_alert',{});
                    connection.release();
                    console.log('IMEI is register not recognized. Someone Infiltrated the system. Intruder Alert!')
                }
            });
        });
    }

    function onSendAlertCall(data){
      pool.getConnection(function (error, connection) {

        socket.broadcast.emit('new_alert', data);
        console.log('alert: ' + cc.CommandCenter);
        connection.query("INSERT INTO app_users (imei, fname, lname, contact, barangay, status) VALUES (?,?,?,?,?,?)", [data.imei, data.fname, data.lname,data.contact,"Hotline Call", 1], function (err) {
            if (err) throw err;
            // connection.release();
        });

        connection.query("INSERT INTO alerts(imei, lat, lng, alert_type, time, incident) VALUES (?,?,?,?,?,?) ",[data.imei, data.lat, data.lng, data.alert_type, data.date, data.incident], function(err){
            if (err) throw err;
            connection.query("SELECT id FROM alerts WHERE imei=? AND alert_type=? AND status IN (0,1)", [data.imei, data.alert_type], function (err, result) {
                if (err) throw err;
                if (result.length !== 0){
                    connection.query("INSERT INTO tracking (alert_id, lat, lng, time) VALUES (?,?,?,?)", [result[0].id, data.lat, data.lng, data.date], function (err) {
                        if (err) throw err;
                        connection.release();
                    });
                }else{
                    connection.release();
                }
            });
        });

      });


    }


    function onAcceptAlert(data){
      var alert_id, fullname, alert_type, lat, lng;
        pool.getConnection(function(error, connection){
            console.log(data.user_name);
            connection.query("UPDATE alerts SET status=1, logged_user = '" + data.user_name + "' WHERE imei='" + data.id + "' AND status=0", function (err, result) {
                if (err) console.log(err);
                if (result.affectedRows === 1){
                    socket.emit('alert_accepted');
                    connection.query("SELECT socket_id, contact FROM app_users WHERE imei=?",[data.id], function (err, result) {
                        var info = {
                            contact : result[0].contact
                        };

                        socket.to(sms.socket_id).emit('alert_accepted', info);

                    });
                      connection.query("SELECT CONCAT(app_users.fname, ' ', app_users.lname) as name, contact FROM app_users WHERE imei='" + data.id + "'", function(err, info){
                        fullname = info[0].name;
                        if(info.length !== 0){
                          connection.query("SELECT * FROM alerts WHERE imei='" + data.id + "'", function(err, info2){
                            if(info2.length !== 0){
                               for (var i = 0; i <= info2.length - 1; i++){
                                 alert_id = info2[i].id;
                                 alert_type = info2[i].alert_type;
                                 lat = info2[i].lat;
                                 lng = info2[i].lng;
                              }

                              var infomayor = {
                                name : fullname,
                                id : alert_id,
                                alert_type : alert_type,
                                lat : lat,
                                lng : lng
                              }
                              console.log(infomayor);
                              socket.to(mayor.socket_id).emit('alert_mayor', infomayor);
                              socket.to(eut.socket_id).emit('alert_eut', infomayor);
                              socket.to(kobe.socket_id).emit('alert_kobe', infomayor);
                            }

                          });
                          connection.release();
                        }
                    });

                }

            });
        });
    }
    function onSendAlertAc(data){
        var alert_id;
        var ac_id;
        var socket_id;
        pool.getConnection(function(error, connection) {
            connection.query("SELECT id FROM alert_ac WHERE ac_id IN (SELECT id FROM action_center WHERE name='" + data.name + "') AND alert_id IN (SELECT id FROM alerts WHERE imei='" + data.imei + "' AND status IN (0,1))", function (err, result) {
                if (err) throw  err;
                if (result.length === 0){
                    connection.query("Select MAX(alerts.id) as alerts_id from alerts where alerts.imei = '" + data.imei + "' and status=1", function(err, result) {
                        if (err) throw err;
                        if (result.length !==0){
                            alert_id = result[0].alerts_id;

                            connection.query("SELECT id as acs_id, socket_id FROM action_center WHERE name='" + data.name + "'", function (err, result) {
                                //console.log(result);
                                socket_id= result.length === 0 ? 0 : result[0].socket_id;
                                ac_id = result[0].acs_id;
                                connection.query("INSERT INTO alert_ac(alert_id, ac_id, status) VALUES (?,?,?) ",[alert_id, ac_id, 0], function(err){
                                    if (err) throw err;
                                });
                                connection.query("SELECT alerts.alert_type, alerts.imei, CONCAT(app_users.fname, app_users.lname) as name, CONCAT(app_users.street, ', ', app_users.barangay) AS address, app_users.contact FROM alerts JOIN app_users ON alerts.imei = app_users.imei WHERE alerts.imei='" + data.imei + "' AND alerts.status='1'" , function (err, result) {
                                    //console.log(result);
                                    if (err) throw err;
                                    socket.to(socket_id).emit('send_ac', result[0]);
                                    connection.release();
                                });

                            });
                        }
                    });
                }else{
                    connection.release();
                    socket.emit('already_sent', data);
                }
            });
        });
    }
    function onSendAlertDept(data){
	console.log('onSendAlertDept',data);
        var sid = [];
        var id = "";
        pool.getConnection(function (error, connection) {
            if(error) throw error;
            /*if (!isInt(data.type)){*/
            connection.query("SELECT id FROM alert_dept WHERE dept_id IN(SELECT id FROM users WHERE municipality='" + data.name + "' AND position='" + data.type + "') AND alert_id IN (SELECT id FROM alerts WHERE imei='" + data.imei + "' AND status IN (0,1))", function (err, result) {
                if (err) throw err;
                if (result.length === 0){
                    connection.query("SELECT id, socket_id FROM users WHERE municipality='" + data.name + "' AND position='" + data.type + "'", function (err, result) {
                        if (err) throw err;
                        //console.log(result);
                        sid = result;
                        id = result[0].id;

                        connection.query("INSERT INTO alert_dept (alert_id, dept_id, status) VALUES ((SELECT IF(id IS NULL,0,id) AS id FROM alerts WHERE imei= '" + data.imei +"' AND status=1),?,?)", [id,0], function (err, result) {
                            if (err) throw err;
                            //console.log(result);
                            connection.release();
                        });
                    });
                    connection.query("SELECT alerts.alert_type, alerts.imei, CONCAT(app_users.fname,' ',app_users.lname) as name, CONCAT(app_users.street, ', ', app_users.barangay) AS address, app_users.contact FROM alerts JOIN app_users on alerts.imei = app_users.imei WHERE alerts.id=(SELECT id FROM alerts WHERE imei='" + data.imei + "' AND status=1)", function (err, result) {
                        if (err) throw err.message;
                        //console.log(result);
                        for (var i = 0; i<=sid.length-1;i++){
                            socket.to(sid[i].socket_id).emit('send_dept', result[0]);
                            // socket.broadcast(sid[i].socket_id).emit('send_dept', result[0]);
                        }
                        socket.emit('track_message', {'message': 'Alert is successfully send.'});
                    });
                }else {
                    connection.release();
                    socket.emit('track_message', {'message': 'Alert is already send.'});
                }
            });

        });
    }
    function onSendAlertResp(data){
        console.log("Marshal ");
        console.log({data});
        var sid = [];
        var st_id;
        pool.getConnection(function(error, connection) {
            if(error) throw error;
            connection.query("SELECT st_id, socket_id FROM responder WHERE st_id=(SELECT id FROM barangay WHERE ac_id=(SELECT id FROM action_center WHERE name='" + data.name + "') AND dept_id='" + data.type + "' AND barangay='"+ data.value + "') AND status='active'", function (err, result) {
                if (err) throw err;
                if (result.length !==0){
                    //console.log(result);
                    st_id = result[0].st_id;
                    sid = result;
                    connection.query("SELECT id FROM alert_resp WHERE resp_id=0 AND status=0 AND status<>2", function (err, result) {
                        if (err) throw err;
                        if (result.length === 0){
                            connection.query("INSERT INTO alert_resp (alert_id, st_id, resp_id, status) VALUES ((SELECT IF(id IS NULL,0,id) AS id FROM alerts WHERE imei= '" + data.imei +"' AND status=1),?,?,?)", [st_id, 0, 0], function (err, result) {
                                if (err) throw err;

                                //console.log(result);
                            });
                            console.log(data.imei);
                        }else    {
                            socket.emit('no_resp', {message: "No responder accept the alert."});
                        }
                        connection.query("SELECT alerts.alert_type as alert_type, alerts.imei as imei, CONCAT(app_users.fname,' ',app_users.lname) as name, app_users.contact as contact,  CONCAT(app_users.street, ', ', app_users.barangay) AS address FROM alerts JOIN app_users on alerts.imei = app_users.imei WHERE alerts.id=(SELECT id FROM alerts WHERE imei='" + data.imei + "' AND status=1)", function (err, result) {
                            if (err) throw err.message;
                            console.log(result);
                            for (var i = 0; i<=sid.length-1;i++){
                                console.log("alert send to " + data.value);
                                var img = {
                                  alert_type : result[0].alert_type,
                                  imei : result[0].imei,
                                  name : result[0].name,
                                  contact : result[0].contact,
                                  address : result[0].address,
                                  imgpath : data.imgpath
                                }
                                socket.to(sid[i].socket_id).emit('SEND_RESP', img);
                            }
                            connection.release();
                        });
                    });
                }else {
                    connection.release();
                    socket.emit('no_resp', {message: "No available responder."});
                }
            });
            /*connection.query("SELECT alert_type as atype, CONCAT(app.fname, ' ', app.lname) as user, alerts.imei as aimie FROM app_users app JOIN alerts ON app.imei =, alerts.imei WHERE alerts.imei='" + data.imei + "'", function(err, result){
                if (err) throw err;
                console.log(result.length);
                console.log("alertinfo: " + result);
                /!*for (var i = 0; i<=sid.length-1;i++){
                    //socket.to(sid[i].socket_id).emit('SEND_RESP', result);
                }*!/
            });*/
        });
    }
    function onRespRegister(data){
        console.log(data);
        pool.getConnection(function(error, connection) {
            connection.query("INSERT INTO responder(imei, fname, mname, lname, resp_unique_id, st_id,  dep_id, ac_id, status) VALUES ('" + data.imei + "','" + data.fname + "','" + data.mname + "','" + data.lname + "','" + uniqueID() + "',(SELECT id as bid from barangay where barangay = '" + data.st_id + "' and ac_id = (SELECT id from action_center where name = '" + data.act_center + "') and dept_id =(SELECT id from department where department = '" + data.department + "')),(SELECT id from department WHERE department ='" + data.department + "'),(SELECT id from action_center WHERE name ='" + data.act_center + "'),'inactive')", function (err, result){
                if (err) throw err;
                //console.log(result);
                /* flash()->overlay('New Responder Successfully Added!', 'Yay');*/
                // connection.release();
            });
            connection.query("UPDATE barangay SET status=1 WHERE barangay='"+data.st_id+"'", function (err) {
                console.log("barngay updated");
                if (err) throw err.message;
                // connection.release();
            });
            connection.release();
        });
    }

    function onIncidentStatus(data){
        socket.to(data.imei).emit('incident_status', data);
        console.log('alert_end: ' + data.imei);
        socket.leave(data.imei, function () {
            pool.getConnection(function (error, connection) {
                socket.emit('end_alert', data.imei);
                connection.query("UPDATE responder SET status='active' WHERE id IN (SELECT resp_id FROM alert_resp WHERE alert_id=(SELECT MAX(id) FROM alerts WHERE imei='" + data.imei + "' AND status=1)) AND status='occupied'", function (err) {
                    console.log("resp updated");
                    if (err) throw err;
                });
                connection.query("UPDATE alert_resp SET status=2 WHERE alert_id=(SELECT MAX(id) FROM alerts WHERE imei='" + data.imei + "' AND status=1) AND status IN (0,1)",function (err) {
                    console.log("alert resp updated");
                    if (err) throw err.message;
                    connection.release();
                });
            });
        });
    }
    function onUserRegister(data){
        console.log(data);
        pool.getConnection(function(error, connection) {
            connection.query("SELECT * from app_users where imei = '" + data.imei + "'", function (err, result1) {
                if (result1.length == 0){
                    // var hashpw = bcrypt.hashSync(data.password);
                    var length = 6,
                          charset = "ABCDEFGHIJKLMNPQRSTUVWXYZ123456789",
                          hashpw = "";
                      for (var i = 0, n = charset.length; i < length; ++i) {
                          hashpw += charset.charAt(Math.random() * n);
                          }

                    connection.query("INSERT INTO app_users(imei, username, email, password, fname, mname, lname, contact, street, barangay, status, ser_num) VALUES ('" + data.imei + "','" + data.username + "','" + data.email + "','" + hashpw + "','" + data.fname + "','" + data.mname + "','" + data.lname + "','" + data.contact + "','" + data.street + "','" + data.barangay + "', 0, '" + data.sirnum + "')", function (err, result){
                        if (err) throw err;
                        var x = Boolean(result.affectedRows !== 0);
                        socket.emit("registration_status", {isSuccess:x});
                        socket.broadcast.emit('reg_nottif', 1);
                        connection.release();
                    });
                }


            });


        });
    }
    function onLoginSms(){
        console.log("sms receiver connected");
        sms.socket_id = socket.id;
    }
    function onCheckRespAlert(data){
        pool.getConnection(function (error, connection) {
            if (error) throw error;
            connection.query("SELECT al.imei FROM alert_resp ar JOIN alerts al ON ar.alert_id=al.id WHERE resp_id=(SELECT id FROM responder WHERE imei='" + data.imei + "') AND ar.status=1", function (err, result) {
                if (result.length !== 0){
                    socket.join(result[0].imei, function () {
                        connection.query("SELECT tracking.lat, tracking.lng, alert_type FROM tracking JOIN alerts ON tracking.alert_id=alerts.id WHERE imei='" + result[0].imei + "' AND status=1 ORDER BY tracking.id DESC LIMIT 1", function(err, result){
                            if (err) throw err;
                            console.log("select tr: " + result[0]);
                            socket.emit('init_track', result[0]);
                            connection.release();
                        });
                    });
                }
            });
        });
    }
    function onRequestEnd(data){
        socket.broadcast.emit('request_end', data);
        socket.to(data.imei).emit('request_end', data);
    }

    function onTrackThis(data) {
        trackThis([socket.id, data, 'connect']);
    }

    function trackThis(data) {
        if (data[2] === 'connect'){
            tracking.push({ 'socket_id': data[0], 'imei': data[1]});
        }else{
            for (var tr in tracking){
                if (data[0] === tracking[tr]['socket_id']){
                    tracking.splice(tr,1);
                    break;
                }
            }
        }
        console.log(tracking);
    }

    function onAlertEnd(data){
        console.log('alert_end: ' + data.imei);
        socket.leave(data.imei, function () {
            pool.getConnection(function (error, connection) {
                socket.emit('end_alert', data.imei);
                connection.query("UPDATE responder SET status='active' WHERE id IN (SELECT resp_id FROM alert_resp WHERE alert_id=(SELECT MAX(id) FROM alerts WHERE imei='" + data.imei + "' AND status=1)) AND status='occupied'", function (err) {
                    console.log("resp updated");
                    if (err) throw err;
                });
                connection.query("UPDATE alert_resp SET status=2 WHERE alert_id=(SELECT MAX(id) FROM alerts WHERE imei='" + data.imei + "' AND status=1) AND status IN (0,1)",function (err) {
                    console.log("alert resp updated");
                    if (err) throw err.message;
                    connection.release();
                });

            });
        });
    }
    function onEndAlert(data){
      var fullname, alert_id, alert_type;
        console.log("END PUTANG INAs " + data.imei);
        pool.getConnection(function (error, connection) {
            if (error) console.log(error.message);

            connection.query("SELECT socket_id FROM users WHERE id IN (SELECT dept_id FROM alert_dept WHERE alert_id=(SELECT MAX(id) FROM alerts WHERE imei='" + data.imei + "' AND status=1))", function (err, result) {
                if (err) throw err;
                console.log(result.length);
                //console.log(result);
                for (var i=0;i<=result.length-1;i++){
                    console.log(result[i]);
                    socket.to(result[i].socket_id).emit('end_alert', data.imei);

                }
            });

            connection.query("UPDATE alert_dept SET status=2 WHERE alert_id=(SELECT MAX(id) FROM alerts WHERE imei='" + data.imei + "' AND status=1) AND status IN (0,1)",function (err, result) {
                console.log("alert ac updated");
                //console.log(result);
                if (err) throw err.message;
            });
            socket.to(data.imei).emit('end_alert', data.imei);
            connection.query("UPDATE responder SET status='active' WHERE id IN (SELECT resp_id FROM alert_resp WHERE alert_id=(SELECT MAX(id) FROM alerts WHERE imei='" + data.imei + "' AND status=1)) AND status='occupied'", function (err) {
                console.log("resp updated");

                // socket.emit('LOGIN_SUCCESS', {status: 1});
                if (err) throw err;
                socket.broadcast.emit('new_resp_login')
            });
            connection.query("UPDATE alert_resp SET status=2 WHERE alert_id=(SELECT MAX(id) FROM alerts WHERE imei='" + data.imei + "' AND status=1) AND status IN (0,1)",function (err) {
                console.log("alert resp updated");
                if (err) throw err.message;
            });


            connection.query("SELECT imei, contact FROM app_users WHERE imei='" + data.imei + "'", function (err, result) {
                if (err) throw err;
                var info = {
                    contact : result[0].contact,
                    imei : result[0].imei
                };
                console.log("send sms");
                console.log(info);
                socket.to(sms.socket_id).emit('stop_tracking', info);
            });
            connection.query("UPDATE alerts SET status=2, end_time='" + data.date + "' WHERE imei='" + data.imei + "' AND status=1",function (err) {
                console.log("alerts updated");
                if (err) throw err.message;
                socket.broadcast.emit('end_alert', data.imei);
                // socket.to(cc.CommandCenter).emit('end_alert', data.imei);
            });

            connection.query("SELECT CONCAT(app_users.fname, ' ', app_users.lname) as name, contact FROM app_users WHERE imei='" + data.imei + "'", function(err, info){
              fullname = info[0].name;
              if(info.length !== 0){
                connection.query("SELECT * FROM alerts WHERE imei='" + data.imei + "'", function(err, info2){
                  console.log("========== MAYOR END ===============")
                  console.log(info2.length)
                  if(info2.length !== 0){
                     for (var i = 0; i <= info2.length - 1; i++){
                       alert_id = info2[i].id;
                       alert_type = info2[i].alert_type;
                    }

                    var infomayor = {
                      name : fullname,
                      id : alert_id,
                      alert_type : alert_type,
                    }
                    console.log(infomayor);
                    socket.to(mayor.socket_id).emit('end_mayor', infomayor);
                    socket.to(eut.socket_id).emit('end_eut', infomayor);
                    socket.to(kobe.socket_id).emit('end_kobe', infomayor);
                  }

                });
                // connection.release();
              }
          });
            connection.release();

              // socket.broadcast.emit('new_resp_login');
        });
    }
    function onAutoLogin(data) {
        console.log(data);
        console.log("============= update socket users ================ ");
        console.log(socket.id);
        pool.getConnection(function (error, connection) {
            connection.query("SELECT session_id, status FROM app_users WHERE imei='" + data.imei + "'",function (err, result) {
                if (err) throw err;
                console.log(result);
                if (result.length !== 0){
                    if (result[0].session_id === data.id){
                        connection.query("UPDATE app_users SET socket_id='" + socket.id + "' WHERE imei='" + data.imei + "'", function (err) {
                            if (err) throw err;
                        });
                        //====== check infoblasst =======
                        connection.query("SELECT * FROM notification WHERE 1 ORDER BY id DESC LIMIT 5", function (err, result) {
                            if (err) throw err;
                            console.log("============= check infoblast ================ ");
                            console.log(socket.id);
                            console.log(result);
                            console.log("============================================== ");
                            socket.emit('receive_notification', result);
                            // socket.to(socket.id).emit('receive_notification', result);

                        });
                        //======
                        connection.query("SELECT id FROM alerts WHERE imei='" + data.imei + "' AND status IN (0,1)", function (err, result) {
                            if (err) throw err;
                            if (result.length > 0){
                                socket.join(data.imei);
                            }
                        });
                    }else{
                        socket.emit('check_user', {isExist: true, isVerify: result[0].status});
                    }
                    connection.release();
                }else{
                    socket.disconnect(true);
                    connection.release();
                }
            });
        });
    }
    function onUserEndAlert(data) {

    }

    function onTrackMessage(data) {
	  console.log("============= TRACK MESSAGE ==========");
	  console.log(data.tag);
	  console.log("======================================");
        switch (data.tag){
            case 'cc':
            case 'police':
                socket.broadcast.emit('track_message', data);
                for (var tr in tracking){
                    if (data.imei === tracking[tr]['imei']){
                        socket.to(tracking[tr]['socket_id']).emit('track_message', data);
                        break;
                    }
                }
                break;
            case 'fire':
                socket.broadcast.emit('track_message', data);
                break;
           /* case 'police':
                socket.to(police.police).emit('track_message', data);
                break;*/
        }
    }

    //non-socket event functions
    function uniqueID(){
        var randNum = Math.random();
        var str = randNum.toString(36);
        str = str.substr(2,15);
        for (var i=1;i<=2;i++){
            var index = Math.floor(Math.random() * (str.length + 1));
            str = str.substr(0, index) + '$' + str.substr(index + 1);
        }
        return "_" + str
    }
    function getNewSessionId(){
        //return crypto.randomBytes(64).toString('hex');
        var ssid="";
        for(var b=0; 60>b; b++){
            var c = Math.floor(62 * Math.random() + 1);
            10 >= c ? c += 47 : 36 >= c ? c += 54 : 62 >= c && (c += 60);
            ssid += String.fromCharCode(c);
        }
        return ssid;
    }
    function isInt(value){
        var x;
        if (isNaN(value)) {
            return false;
        }
        x = parseFloat(value);
        return (x | 0) === x;
    }
    function  change_status(data, status) {

        console.log("change_status : " + status);
        console.log('resp s: ' + data.dep_id +" st_id "+ data.id)
        switch (data.dep_id){
            case 2:
                console.log(data.dep_id);
                socket.to(fire.fire).emit('change_status', {name: data.id, status: status});
                break;
            case 3:
                  console.log('333333333333 : ' + data.dep_id);
                /*console.log(3);
                socket.to(police.police).emit('change_status', {name: data.id, status: status});
                break;*/
            case 1:
                  // console.log(data.dep_id);
            case 4:
                console.log({data});
                socket.broadcast.emit('change_status', {name: data.id, status: status});
                for (var tr in tracking){
                    console.log('socket_id:  ' + tracking[tr]['socket_id']);
                    // socket.to(tracking[tr]['socket_id']).emit('change_status', {name: data.id, status: status});
                    // socket.emit('change_status', {name: data.id, status: status});

                }
                break;


                socket.broadcast.emit('change_status', {name: data.id, status: status});
        }


    }

    function  change_marker(data, status) {
        console.log("---------------------- change marker -------------------");
        // console.log(data + " : " + fire.fire);
        console.log({data});
          console.log("---------------------- end change marker -------------------");
        console.log(status);
        socket.to(fire.fire).emit('change_marker', {name: data.id, type: data.dep_id, status: status});
        for (var tr in tracking){
            socket.to(tracking[tr]['socket_id']).emit('change_marker', {name: data.id, type: data.dep_id, status: status});
        }
    }
});


