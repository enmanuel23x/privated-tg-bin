var express = require('express'),app = express();
var session = require('express-session');
var bodyParser = require('body-parser')
var multer = require('multer');
var fs = require("fs");
var upload = multer({ dest: '/tmp' })
app.use(bodyParser.urlencoded({ extended: false }))
app.set('view engine','ejs')
app.use('/css',express.static(__dirname+'/src/css'));
app.use('/img',express.static(__dirname+'/src/img'));
app.use('/js',express.static(__dirname+'/src/js'));
app.use('/font',express.static(__dirname+'/src/font-awesome-4.7.0/css'));
app.use(session({
	name: "not",
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: false,
  cookie: {name: "not",type:"" ,secure: false }
}))
var mysql = require('mysql');
var connection = mysql.createConnection({host: 'localhost',port: 3306,user: 'newuser',password: 'root',database: 'app',insecureAuth: true});
var connection2 = mysql.createConnection({host: 'localhost',port: 3306,user: 'newuser',password: 'root',database: 'app',insecureAuth: true});
var connection3 = mysql.createConnection({host: 'localhost',port: 3306,user: 'newuser',password: 'root',database: 'app',insecureAuth: true});
var connection4 = mysql.createConnection({host: 'localhost',port: 3306,user: 'newuser',password: 'root',database: 'app',insecureAuth: true});
var connection5 = mysql.createConnection({host: 'localhost',port: 3306,user: 'newuser',password: 'root',database: 'app',insecureAuth: true});
var connection6 = mysql.createConnection({host: 'localhost',port: 3306,user: 'newuser',password: 'root',database: 'app',insecureAuth: true});
var connection7 = mysql.createConnection({host: 'localhost',port: 3306,user: 'newuser',password: 'root',database: 'app',insecureAuth: true});
var connection8 = mysql.createConnection({host: 'localhost',port: 3306,user: 'newuser',password: 'root',database: 'app',insecureAuth: true});
var auth = function(req, res, next) {
	if (req.session.userID!=undefined)
		if(req.session.act==0 && req.session.type==1 && (req.originalUrl=="/inicio" || req.originalUrl=="/proyectos" || req.originalUrl=="/organizacion" || req.originalUrl=="/perfil")){
			res.redirect('/aptitudes')
		}else{
			return next();
		}
	else
		return res.redirect('/login')
	};
app.get('/logout',function(req,res) {
	req.session.destroy();
	res.redirect('/login');
	});
app.post('/log',function(req,res) {
	let band=0,pass = req.body.pass,user= req.body.user
	connection.query('SELECT * FROM app.usuario', (err, rows) => {
		for (i = 0; i < rows.length; i++) {
			if (rows[i].correo == user && rows[i].contraseña == pass) {
				req.session.userID = rows[i].id
				req.session.names = rows[i].nombres + " " + rows[i].apellidos
				req.session.type=rows[i].rol
				req.session.act=rows[i].inicializado
				res.redirect('/inicio');
				band = 1;
				break
				}
			}
			if(band==0){
				res.sendFile(__dirname+'/src/error-login.html');
			}

	});	
});
app.post('/reg',function(req,res){
	let type
	if(req.body.type=="Desarrollador"){
		type=1
	}else{
		type=2
	}
	let sql = "INSERT INTO `app`.`usuario` (`nombres`, `apellidos`, `correo`, `contraseña`, `rol`, `inicializado`) VALUES ?";
	let values=[[req.body.name,req.body.name2,req.body.user,req.body.pass,type,0]]
	connection.query(sql,[values], function (err, result) {
		connection2.query('SELECT * FROM app.usuario', (err, rows) => {
			for (i = 0; i < rows.length; i++) {
				if (rows[i].correo == req.body.user) {
					req.session.userID = rows[i].id
					req.session.names = rows[i].nombres + " " + rows[i].apellidos
					req.session.type=rows[i].rol
					req.session.act=rows[i].inicializado
					res.redirect('/inicio');
					band = 1;
					break
					}
				}
				if(band==0){
					res.sendFile(__dirname+'/src/error-login.html');
				}
	
		});	
		});
});
app.get('/inicio', auth ,function(req,res) {
	connection.query("SELECT * FROM app.notificaciones WHERE ((`id_user_emisor` = '"+req.session.userID +"' OR `id_user_receptor` = '"+req.session.userID +"') AND `tipo` != '1')", (err, rows) => {
		res.render(__dirname+'/src/home',{type:req.session.type,rows:rows,id:req.session.userID});
		});
	
});
app.get('/proyectos', auth ,function(req,res) {
	res.render(__dirname+'/src/projects',{type:req.session.type});
});
app.post('/rechazar_org',auth ,function(req,res) {
	connection.query("SELECT * FROM app.notificaciones WHERE (`id` = '"+req.body.id+"')", (err, rows) => {
		if(rows.length!=0){
			let sql= "UPDATE `app`.`notificaciones` SET `status` = '"+0+"' WHERE (`id` = '"+req.body.id+"')"
			connection2.query(sql, function (err, result) {
				let d = new Date(),dia=ajuste(d.getDate())+"/"+ajuste((d.getMonth()+1))+"/"+ajuste(d.getFullYear()),hora=ajuste(d.getHours())+":"+ajuste(d.getMinutes())
				sql = "INSERT INTO `app`.`notificaciones` (`id_user_emisor`,`nombre_emisor`, `id_user_receptor`,`nombre_receptor`, `tipo`, `status`, `fecha`, `hora`) VALUES ?";
				let values=[[req.session.userID,req.session.names,rows[0].id_user_emisor,rows[0].nombre_emisor,3,0,dia,hora]]
				connection3.query(sql,[values], function (err, result) {
					res.redirect('/organizacion')
					});
				});
		}else{
			res.redirect('/inicio')
			}
	});
});
app.post('/aceptar_org',auth ,function(req,res) {
	connection.query("SELECT * FROM app.notificaciones WHERE (`id` = '"+req.body.id+"')", (err, rows) => {
		if(rows.length!=0){
			let sql= "UPDATE `app`.`notificaciones` SET `status` = '"+0+"' WHERE (`id` = '"+req.body.id+"')"
			connection2.query(sql, function (err, result) {
				let d = new Date(),dia=ajuste(d.getDate())+"/"+ajuste((d.getMonth()+1))+"/"+ajuste(d.getFullYear()),hora=ajuste(d.getHours())+":"+ajuste(d.getMinutes())
				sql = "INSERT INTO `app`.`notificaciones` (`id_user_emisor`,`nombre_emisor`, `id_user_receptor`,`nombre_receptor`, `tipo`, `status`, `fecha`, `hora`) VALUES ?";
				let values=[[req.session.userID,req.session.names,rows[0].id_user_emisor,rows[0].nombre_emisor,2,0,dia,hora]]
				connection3.query(sql,[values], function (err, result) {
					connection4.query("SELECT * FROM app.integrantes_organizacion WHERE (`id_usuario` = '"+rows[0].id_user_emisor+"')", (err, rows2) => {
						sql = "INSERT INTO `app`.`integrantes_organizacion` (`id_usuario`, `nombres`,`id_organizacion`,`rol`,`activo`) VALUES ?";
						let type="Desarrollador"
						if(req.session.type==2){
							type="Administrador:1"
						}
						values=[[req.session.userID,req.session.names,rows2[0].id_organizacion,type,1]]
						connection5.query(sql,[values], function (err, result) {

							res.redirect('/organizacion')
							});
						});
					
					});
				});
		}else{
			res.redirect('/inicio')
			}
	});
});
app.post('/anadir_usuario', auth ,function(req,res) {
	if(req.session.type==2){
		connection.query("SELECT * FROM app.integrantes_organizacion WHERE (`id_usuario` = '"+req.session.userID+"')", (err, rows) => {
			if(rows.length!=0){
				connection2.query("SELECT * FROM app.integrantes_organizacion WHERE (`id_organizacion` = '"+rows[0].id_organizacion+"')", (err, rows2) => {
					connection3.query("SELECT * FROM app.usuario", (err, rows3) => {

						for(i=0;i<rows2.length;i++){
							for(j=0;j<rows3.length;j++){
									if(rows2[i].id_usuario==rows3[j].id){
										rows3.splice(j, 1);
									}
								}
							}
							let band=0,temp
							for(j=0;j<rows3.length;j++){
								if(req.body.name==rows3[j].correo){
									temp=rows3[j]
									band=1
									break
								}
							}
							if(band==0){
								res.render(__dirname+'/src/add_org_user',{rows: list,error:1});
								}else{
									let d = new Date(),dia=ajuste(d.getDate())+"/"+ajuste((d.getMonth()+1))+"/"+ajuste(d.getFullYear()),hora=ajuste(d.getHours())+":"+ajuste(d.getMinutes())
									let sql = "INSERT INTO `app`.`notificaciones` (`id_user_emisor`,`nombre_emisor`, `id_user_receptor`,`nombre_receptor`, `tipo`, `status`, `fecha`, `hora`) VALUES ?";
									let values=[[req.session.userID,req.session.names,temp.id,temp.nombres+" "+temp.apellidos,1,1,dia,hora]]
									connection.query(sql,[values], function (err, result) {
										res.redirect('/organizacion')
									});
								}
						});
					});
			}else{
				res.redirect('/inicio')
			}
			});
	}else{
		res.redirect('/inicio')
	}
});
app.get('/anadir_usuario', auth ,function(req,res) {

	if(req.session.type==2){
		connection.query("SELECT * FROM app.integrantes_organizacion WHERE (`id_usuario` = '"+req.session.userID+"')", (err, rows) => {
			if(rows.length!=0){
				connection2.query("SELECT * FROM app.integrantes_organizacion WHERE (`id_organizacion` = '"+rows[0].id_organizacion+"')", (err, rows2) => {
					connection3.query("SELECT * FROM app.usuario", (err, rows3) => {

						for(i=0;i<rows2.length;i++){
							for(j=0;j<rows3.length;j++){
									if(rows2[i].id_usuario==rows3[j].id){
										rows3.splice(j, 1);
									}
								}
							}
							let list=[]
							for(j=0;j<rows3.length;j++){
								list.push(rows3[j].correo)
							}
							res.render(__dirname+'/src/add_org_user',{rows: list,error:0});
						});
					});
			}else{
				res.redirect('/inicio')
			}
			});
	}else{
		res.redirect('/inicio')
	}
});
app.post('/minus_user',auth ,function(req,res) {
	connection.query("SELECT * FROM app.integrantes_organizacion WHERE (`id_usuario` = '"+req.session.userID+"')", (err, rows) => {
		if(rows.length!=0){
			if(rows[0].rol=="Administrador:2" || rows[0].rol=="Lider" || rows[0].rol=="Dueño"){
				let sql= "UPDATE `app`.`integrantes_organizacion` SET `rol` = 'Administrador:1' WHERE (`id_usuario` = '"+req.body.id+"')"
				connection2.query(sql, function (err, result) {
					res.redirect('/organizacion')
					});
			}else{
				res.redirect('/inicio')
				}
		}else{
			res.redirect('/inicio')
		}
	});
});
app.post('/plus_user',auth ,function(req,res) {
	connection.query("SELECT * FROM app.integrantes_organizacion WHERE (`id_usuario` = '"+req.session.userID+"')", (err, rows) => {
		if(rows.length!=0){
			if(rows[0].rol=="Administrador:2" || rows[0].rol=="Lider" || rows[0].rol=="Dueño"){
				let sql= "UPDATE `app`.`integrantes_organizacion` SET `rol` = 'Administrador:2' WHERE (`id_usuario` = '"+req.body.id+"')"
				connection2.query(sql, function (err, result) {
					res.redirect('/organizacion')
					});
			}else{
				res.redirect('/inicio')
				}
		}else{
			res.redirect('/inicio')
		}
	});
});
app.post('/eliminar_user_org',auth ,function(req,res) {
	connection.query("SELECT * FROM app.integrantes_organizacion WHERE (`id_usuario` = '"+req.session.userID+"')", (err, rows) => {
		if(rows[0].rol=="Administrador:2" || rows[0].rol=="Lider" || rows[0].rol=="Dueño"){
			connection2.query("SELECT * FROM app.integrantes_proyectos WHERE (`id_usuario` = '"+req.body.id+"')", (err, rows2) => {
				let temp=1,band=0
				if(rows2.length!=0){
					temp=rows2[rows2.length-1].id_proyecto
					band=1
				}
				connection3.query("SELECT * FROM app.proyecto WHERE (`id` = '"+temp+"')", (err, rows3) => {
					if(band!=0){
						band=false
						if(rows3[0].status==0 || rows3.length==0){
							band=true
						}
					}else{
						band=true
					}
					let d = new Date(),dia=ajuste(d.getDate())+"/"+ajuste((d.getMonth()+1))+"/"+ajuste(d.getFullYear()),hora=ajuste(d.getHours())+":"+ajuste(d.getMinutes())
					sql = "INSERT INTO `app`.`notificaciones` (`id_user_emisor`,`nombre_emisor`, `id_user_receptor`, `tipo`, `status`, `fecha`, `hora`) VALUES ?";
					values=[[req.session.userID,req.session.names,req.body.id,5,0,dia,hora]]
					if(band){
						connection4.query("DELETE FROM app.integrantes_organizacion WHERE (`id_usuario` = '"+req.body.id+"')", (err, rows4) => {
							connection5.query(sql,[values], function (err, result) {
								res.redirect('/organizacion')
								});
							});
					}else{
						connection4.query("DELETE FROM app.integrantes_organizacion WHERE (`id_usuario` = '"+req.body.id+"')", (err, rows4) => {
							connection5.query("DELETE FROM app.integrantes_proyectos WHERE (`id` = '"+rows2[rows2.length-1].id+"')", (err, rows5) => {
								connection6.query(sql,[values], function (err, result) {
									res.redirect('/organizacion')
									});
								});
							});
					}
					});
				});
			}else{
				res.redirect('/inicio')
				}
			});
});
app.get('/organizacion', auth ,function(req,res) {
	connection.query("SELECT * FROM app.integrantes_organizacion WHERE (`id_usuario` = '"+req.session.userID+"')", (err, rows) => {
		connection2.query("SELECT * FROM app.notificaciones WHERE (`id_user_receptor` = '"+req.session.userID+"' AND `status` = '1'  AND `tipo` ='1')", (err2, rows2) => {
			let temp=1,band=0
			if(rows.length!=0){
				temp=rows[0].id_organizacion
				band=1
			}
			connection3.query("SELECT * FROM app.integrantes_organizacion WHERE (`id_organizacion` = '"+temp+"')", (err3, rows3) => {
				connection4.query("SELECT * FROM app.organizacion WHERE (`id` = '"+temp+"')", (err4, rows4) => {	
					let name,grade=undefined
					if(band==0){
						rows3=[]
						rows4=[]
						name=undefined
					}else{
						if(rows[0].rol=="Administrador:1"){
							grade=1
							}else if(rows[0].rol=="Administrador:2"){
								grade=2
							}else if(rows[0].rol=="Lider"){
								grade=3
							}else if(rows[0].rol=="Dueño"){
								grade=4
							}
						name=rows4[0].nombre
					}
					res.render(__dirname+'/src/orgs',{rows: rows3,rows2: rows2,type:req.session.type,name:name,grade:grade,id:req.session.userID});
					});
				});
			});
		});
});
app.get('/perfil', auth ,function(req,res) {
	connection.query("SELECT * FROM app.usuario WHERE (`id` = '"+req.session.userID+"')", (err, rows) => {
		res.render(__dirname+'/src/profile',{rows: rows,type:req.session.type});
		});
});
app.get('/aptitudes', auth ,function(req,res) {
	connection.query('SELECT * FROM app.aptitudes', (err, rows) => {
		let band=0
		for(i=0;i<rows.length;i++){
			if(rows[i].id_usuario==req.session.userID){
				res.render(__dirname+'/src/aptitudes',{rows: rows[i],type:req.session.type});
				band=1;
				break;
			}
		}
		if(band==0){
			res.render(__dirname+'/src/aptitudes',{rows: undefined,type:req.session.type});
		}
	});
});
app.get('/new_org', auth ,function(req,res) {
	res.render(__dirname+'/src/new_org',{status:"1",name:""})
});
app.post('/getout_org', auth ,function(req,res) {
	if(req.body.band==1){
		connection.query("SELECT * FROM app.integrantes_organizacion WHERE (`id_usuario` = '"+req.session.userID+"')", (err, rows) => {
			connection2.query("SELECT * FROM app.organizacion WHERE (`id` = '"+rows[0].id_organizacion+"')", (err2, rows2) => {
				connection3.query("DELETE FROM app.integrantes_organizacion WHERE (`id_usuario` = '"+req.session.userID+"')", (err3, rows3) => {
					connection4.query("DELETE FROM app.integrantes_proyectos WHERE  (`id_usuario` = '"+req.session.userID+"')", (err4, rows4) => {
						let d = new Date(),dia=ajuste(d.getDate())+"/"+ajuste((d.getMonth()+1))+"/"+ajuste(d.getFullYear()),hora=ajuste(d.getHours())+":"+ajuste(d.getMinutes())
						let sql = "INSERT INTO `app`.`notificaciones` (`id_user_emisor`,`nombre_emisor`, `id_user_receptor`,`nombre_receptor`, `tipo`, `status`, `fecha`, `hora`) VALUES ?";
						let values=[[req.session.userID,req.session.names,req.session.userID,req.session.names,8,0,dia,hora]]
						connection5.query(sql,[values], function (err, result) {
							if(rows2[0].id_jefe==req.session.userID){
								connection6.query("SELECT * FROM app.integrantes_organizacion WHERE (`id_organizacion` = '"+rows[0].id_organizacion+"')", (err, rows6) => {
									if(rows6.length!=0){
										let temp,band=0,grade=['Lider','Administrador:2','Administrador:1','Desarrollador']
										for(j=0;j<grade.length;j++){
											for(i=0;i<rows6.length;i++){
												if(grade[j]==rows6[i].rol){
													temp=rows6[i]
													band=1
													break
												}
											}
											if(band==1){
												break;
											}
										}
										sql= "UPDATE `app`.`integrantes_organizacion` SET `rol` = 'Dueño' WHERE (`id_usuario` = '"+temp.id_usuario+"')"
										connection7.query(sql, function (err, result) {
											d = new Date(),dia=ajuste(d.getDate())+"/"+ajuste((d.getMonth()+1))+"/"+ajuste(d.getFullYear()),hora=ajuste(d.getHours())+":"+ajuste(d.getMinutes())
											sql = "INSERT INTO `app`.`notificaciones` (`id_user_emisor`,`nombre_emisor`, `id_user_receptor`,`nombre_receptor`, `tipo`, `status`, `fecha`, `hora`) VALUES ?";
											values=[[req.session.userID,req.session.names,temp.id_usuario,temp.nombres,9,0,dia,hora]]
											connection8.query(sql,[values], function (err, result) {
												res.redirect('/organizacion')
												});
											});
										}
									});
							}else{
								res.redirect('/inicio')
							}
							});
						});
					});
				});
			});
		}else{
			res.redirect('/inicio')
		}
});
app.post('/add_org', auth ,function(req,res) {
	if(req.session.type==2){
		connection.query("SELECT * FROM app.organizacion WHERE (`nombre` = '"+req.body.name+"')", (err, rows) => {
			if(rows.length==0){
				let sql = "INSERT INTO `app`.`organizacion` (`nombre`, `id_jefe`) VALUES ?";
				let values=[[req.body.name,req.session.userID]]
				connection2.query(sql,[values], function (err, result) {
					connection3.query("SELECT * FROM app.organizacion WHERE (`nombre` = '"+req.body.name+"')", (err, rows2) => {
						let sql = "INSERT INTO `app`.`integrantes_organizacion` (`id_usuario`, `nombres`,`id_organizacion`,`rol`,`activo`) VALUES ?";
						let values=[[req.session.userID,req.session.names,rows2[0].id,"Dueño",1]]
						connection4.query(sql,[values], function (err, result) {
							res.redirect('/organizacion')
							});
						});
					
					});
			}else{
				res.render(__dirname+'/src/new_org',{status:"0",name:req.body.name})
			}
		});
	}
});
app.post('/apt', auth ,function(req,res) {
	let sql = "INSERT INTO `app`.`aptitudes` (`id_usuario`,`dev_quality`,`dev_exp`,`dev_on_time`,`team_chemistry`,`dev_errors`,`exp_python`,`exp_java`,`exp_c++`,`exp_php`,`exp_c`,`exp_ruby`,`exp_objective`,`exp_go`,`exp_visual`,`exp_scala`,`exp_sql`,`exp_nosql`,`exp_kotlin` ,`exp_r`,`exp_swift` ,`exp_clojure`,`exp_perl`,`exp_rust`,`exp_html_css`) VALUES ?";
	let values=[[req.session.userID,req.body.dev_quality,req.body.dev_exp,req.body.dev_on_time,
		req.body.team_chemistry,req.body.dev_errors,req.body.exp_python,req.body.exp_java,req.body.exp_c++,
		req.body.exp_php,req.body.exp_c,req.body.exp_ruby,req.body.exp_objective,req.body.exp_go,req.body.exp_visual,
		req.body.exp_scala,req.body.exp_sql,req.body.exp_nosql,req.body.exp_kotlin ,req.body.exp_r,req.body.exp_swift,
		req.body.exp_clojure,req.body.exp_perl,req.body.exp_rust,req.body.exp_html_css]]
	connection.query(sql,[values], function (err, result) {
		sql= "UPDATE `app`.`usuario` SET `inicializado` = '1' WHERE (`id` = '"+req.session.userID+"')"
			connection2.query(sql, function (err, result) {
				req.session.act=1
				res.redirect('/inicio')
			});
		});
});
app.get('/logout',function(req,res) {
	req.session.destroy();
	res.redirect('/login');
});
app.get('/login',function(req,res) {
	res.render(__dirname+'/src/login',{type:req.session.type});
});
app.get('/*', auth ,function(req,res) {
	res.redirect('/inicio')
});
app.set('port', (process.env.PORT || 5000));
app.listen(app.get('port'), function () {
	console.log('Example app listening on port '+app.get('port'));
	  });
function ajuste(data){
	if(data<10){
		return "0"+data
	}else{
		return data
	}
}