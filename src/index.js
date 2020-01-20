/*  Utilidades y librerias*/
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
var connection = mysql.createConnection({host: 'localhost',port: 3306,user: 'newuser',password: 'root',database: 'app',insecureAuth: true,multipleStatements: true});
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
/* /Utilidades y librerias */
/* Login-Register */
app.get('/login',function(req,res) {
	//Renderiza la plantilla Login-Register
	res.render(__dirname+'/src/login',{type:req.session.type});
});
app.post('/log',function(req,res) {
//Verificacion de los datos para iniciar sesion
	//Variables
	let band=0
	//Variables del formulario
	let pass = req.body.pass,user= req.body.user
	//Query a la tabla usuario
	connection.query('SELECT * FROM app.usuario', (err, rows) => {
		//Verificacion de usuario y contraseña
		for (i = 0; i < rows.length; i++) {
			if (rows[i].correo == user && rows[i].contraseña == pass) {
				//Creacion de session
				req.session.userID = rows[i].id
				req.session.names = rows[i].nombres + " " + rows[i].apellidos
				req.session.type=rows[i].rol
				req.session.act=rows[i].inicializado
				//Redireccion a inicio
				res.redirect('/inicio');
				band = 1;
				break
				}
			}
			//Si los datos de inicio de sesion no coinciden con ningun usuario
			if(band==0){
				res.sendFile(__dirname+'/src/error-login.html');
			}
	});	
});
app.post('/reg',function(req,res){
	//Registro de  usuario
	//Variable del formulario tipo de usuario
	let type
	if(req.body.type=="Desarrollador"){
		type=1
	}else{
		type=2
	}
	//Query para insertaral usuario 
	let sql = "INSERT INTO `app`.`usuario` (`nombres`, `apellidos`, `correo`, `contraseña`, `rol`, `inicializado`) VALUES ?";
	let values=[[req.body.name,req.body.name2,req.body.user,req.body.pass,type,0]]
	connection.query(sql,[values], function (err, result) {
		//Query para obtener datos restantes de session
		connection.query("SELECT * FROM app.usuario WHERE (`correo` = '" +req.body.user+"')", (err, rows) => {
			//Creacion de session
			req.session.userID = rows[0].id
			req.session.names = rows[0].nombres + " " + rows[0].apellidos
			req.session.type=rows[0].rol
			req.session.act=rows[0].inicializado
			//Redireccion a inicio
			res.redirect('/inicio');
			});	
		});
});
/* /Login-Register */
/* Logout */
app.get('/logout',function(req,res) {
	//Se destruye la sesion y se redirige al login
	req.session.destroy();
	res.redirect('/login');
});
/* /Logout */
/* Metodos GET vistas  */
app.get('/inicio', auth ,function(req,res) {
	//Query a notificaciones
	connection.query("SELECT * FROM app.notificaciones WHERE ((`id_user_emisor` = '"+req.session.userID +"' OR `id_user_receptor` = '"+req.session.userID +"') AND `tipo` != '1')", (err, rows) => {
		//Renderizado de platilla home con atributos 
		res.render(__dirname+'/src/home',{type:req.session.type,rows:rows,id:req.session.userID});
		});
	
});
app.get('/proyectos', auth ,function(req,res) {
	//Renderizado de platilla projects con atributos
	res.render(__dirname+'/src/projects',{type:req.session.type});
});
app.get('/anadir_usuario', auth ,function(req,res) {
	//Verificacion de tipo de usuario
	if(req.session.type==2){
		//Query a la tabla de integrantes de organizacion
		connection.query("SELECT * FROM app.integrantes_organizacion WHERE (`id_usuario` = '"+req.session.userID+"')", (err, rows) => {
			//Verificacion de que el usuario pertenezca a una organizacion
			if(rows.length!=0){
				//Query a la tabla de integrantes con filtro id_organizacion
				connection.query("SELECT * FROM app.integrantes_organizacion WHERE (`id_organizacion` = '"+rows[0].id_organizacion+"')", (err, rows2) => {
					//Query a la tabla usuario
					connection.query("SELECT * FROM app.usuario", (err, rows3) => {
						//Filtrado de usuarios no pertenecientes a la organizacion
						for(i=0;i<rows2.length;i++){
							for(j=0;j<rows3.length;j++){
									if(rows2[i].id_usuario==rows3[j].id){
										rows3.splice(j, 1);
									}
								}
							}
							//Generacion de lista solo con correos de usuarios no pertenecientes a la organizacion
							let list=[]
							for(j=0;j<rows3.length;j++){
								list.push(rows3[j].correo)
							}
							//Renderizado de platilla add_org_user con atributos
							res.render(__dirname+'/src/add_org_user',{rows: list,error:0});
						});
					});
			}else{
				//En caso de que el usuario no pertenezca se redirecciona a inicio
				res.redirect('/inicio')
			}
			});
	}else{
		//En caso de no ser administrador se redirecciona a inicio
		res.redirect('/inicio')
	}
});
app.get('/organizacion', auth ,function(req,res) {
	//Query a la tabla de integrantes_organizacion con filtro id_usuario
	connection.query("SELECT * FROM app.integrantes_organizacion WHERE (`id_usuario` = '"+req.session.userID+"')", (err, rows) => {
		//Query a la tabla de notificaciones con filtro id_user_receptor y status (Invitaciones)
		connection.query("SELECT * FROM app.notificaciones WHERE (`id_user_receptor` = '"+req.session.userID+"' AND `status` = '1'  AND `tipo` ='1')", (err2, rows2) => {
			let temp=1,band=0
			//Verificacion de que el usuario pertenezaca a una organizacion (Si=>band=1) o (No=>band=0)
			if(rows.length!=0){
				temp=rows[0].id_organizacion
				band=1
			}
			//Query a la tabla de integrantes_organizacion con filtro id_organizacion
			connection.query("SELECT * FROM app.integrantes_organizacion WHERE (`id_organizacion` = '"+temp+"')", (err3, rows3) => {
				//Query a la tabla de organizacion con filtro id
				connection.query("SELECT * FROM app.organizacion WHERE (`id` = '"+temp+"')", (err4, rows4) => {	
					let name,grade=undefined
					if(band==0){
						//Si el usuario no pertence a una organizacion envia las matrices vacias
						rows3=[]
						rows4=[]
						name=undefined
					}else{
						//Si el usuario pertence a una organizacion verifica el grado dentro de la misma
						if(rows[0].rol=="Administrador:1"){
							grade=1
							}else if(rows[0].rol=="Administrador:2"){
								grade=2
							}else if(rows[0].rol=="Lider"){
								grade=3
							}else if(rows[0].rol=="Dueño"){
								grade=4
							}
						//Variable de nombre de organizacion
						name=rows4[0].nombre
					}
					//Renderizado de platilla orgs con atributos
					res.render(__dirname+'/src/orgs',{rows: rows3,rows2: rows2,type:req.session.type,name:name,grade:grade,id:req.session.userID});
					});
				});
			});
		});
});
app.get('/perfil', auth ,function(req,res) {
	//Query a la tabla de usuario con filtro id
	connection.query("SELECT * FROM app.usuario WHERE (`id` = '"+req.session.userID+"')", (err, rows) => {
		//Renderizado de profile con atributos
		res.render(__dirname+'/src/profile',{rows: rows,type:req.session.type});
		});
});
app.get('/aptitudes', auth ,function(req,res) {
	//Query a la tabla de aptitudes con filtro id_usuario
	connection.query("SELECT * FROM app.aptitudes WHERE (`id_usuario` = '"+req.session.userID+"')", (err, rows) => {
		//Verifiacion de aptitudes inicializadas
		console.log(err)
			console.log(rows)
		if(rows.length!=0){
			//Aptitudes inicializadas
			//Renderizado de aptitudes con atributos
			res.render(__dirname+'/src/aptitudes',{rows: rows[0],type:req.session.type});
		}else{
			//Aptitudes no inicializadas
			//Renderizado de aptitudes con atributos (aptitudes indefinidas)
			res.render(__dirname+'/src/aptitudes',{rows: undefined,type:req.session.type});
		}
	});
});
app.get('/new_org', auth ,function(req,res) {
	//Renderizado de new_org con status 1 (Sin errores)
	res.render(__dirname+'/src/new_org',{status:"1",name:""})
});
/* /Metodos GET vistas */
/* Metodos POST*/
app.post('/rechazar_org',auth ,function(req,res) {
	//Query a la tabla de notificaciones con filtro id
	connection.query("SELECT * FROM app.notificaciones WHERE (`id` = '"+req.body.id+"')", (err, rows) => {
		//Verificacion de existencia de notificaciones
		if(rows.length!=0){
			//Query a la tabla de notificaciones con cambio en el status y con filtro id
			let sql= "UPDATE `app`.`notificaciones` SET `status` = '"+0+"' WHERE (`id` = '"+req.body.id+"')"
			connection.query(sql, function (err, result) {
				//Query a la tabla de notificaciones (notificacion de rechazo de solicitud de organizacion)
				let d = new Date(),dia=ajuste(d.getDate())+"/"+ajuste((d.getMonth()+1))+"/"+ajuste(d.getFullYear()),hora=ajuste(d.getHours())+":"+ajuste(d.getMinutes())
				sql = "INSERT INTO `app`.`notificaciones` (`id_user_emisor`,`nombre_emisor`, `id_user_receptor`,`nombre_receptor`, `tipo`, `status`, `fecha`, `hora`) VALUES ?";
				let values=[[req.session.userID,req.session.names,rows[0].id_user_emisor,rows[0].nombre_emisor,3,0,dia,hora]]
				connection.query(sql,[values], function (err, result) {
					//Redirecciona a organizacion
					res.redirect('/organizacion')
					});
				});
		}else{
			//En caso de no existir notificaciones se redirecciona a inicio
			res.redirect('/inicio')
			}
	});
});
app.post('/aceptar_org',auth ,function(req,res) {
	//Query a la tabla de notificaciones con filtro id
	connection.query("SELECT * FROM app.notificaciones WHERE (`id` = '"+req.body.id+"')", (err, rows) => {
		//Verificacion de existencia de notificaciones
		if(rows.length!=0){
			//Query a la tabla de notificaciones con cambio en el status y con filtro id
			let sql= "UPDATE `app`.`notificaciones` SET `status` = '"+0+"' WHERE (`id` = '"+req.body.id+"')"
			connection.query(sql, function (err, result) {
				//Query a la tabla de notificaciones (notificacion de aceptacion de solicitud de organizacion)
				let d = new Date(),dia=ajuste(d.getDate())+"/"+ajuste((d.getMonth()+1))+"/"+ajuste(d.getFullYear()),hora=ajuste(d.getHours())+":"+ajuste(d.getMinutes())
				sql = "INSERT INTO `app`.`notificaciones` (`id_user_emisor`,`nombre_emisor`, `id_user_receptor`,`nombre_receptor`, `tipo`, `status`, `fecha`, `hora`) VALUES ?";
				let values=[[req.session.userID,req.session.names,rows[0].id_user_emisor,rows[0].nombre_emisor,2,0,dia,hora]]
				connection.query(sql,[values], function (err, result) {
					//Query a la tabla de integrantes_organizacion con filtro id_usuario, para obtener id de organizacion
					connection.query("SELECT * FROM app.integrantes_organizacion WHERE (`id_usuario` = '"+rows[0].id_user_emisor+"')", (err, rows2) => {
						//Query a la tabla de notificaciones (añadir integrante a la organizacion organizacion)
						sql = "INSERT INTO `app`.`integrantes_organizacion` (`id_usuario`, `nombres`,`id_organizacion`,`rol`,`activo`) VALUES ?";
						let type="Desarrollador"
						if(req.session.type==2){type="Administrador:1"}
						values=[[req.session.userID,req.session.names,rows2[0].id_organizacion,type,1]]
						connection.query(sql,[values], function (err, result) {
							//Redirecciona a organizacion
							res.redirect('/organizacion')
							});
						});
					
					});
				});
		}else{
			//En caso de no existir notificaciones se redirecciona a inicio
			res.redirect('/inicio')
			}
	});
});
app.post('/anadir_usuario', auth ,function(req,res) {
	//Se verifica el tipo de usuario
	if(req.session.type==2){
		//Query a la tabla de integrantes_organizacion con filtro id_usuario
		connection.query("SELECT * FROM app.integrantes_organizacion WHERE (`id_usuario` = '"+req.session.userID+"')", (err, rows) => {
			//Se verifica que el usuario de la peticion pertenezca a una organizacion
			if(rows.length!=0){
				//Query a la tabla de integrantes_organizacion con filtro id_organizacion
				connection.query("SELECT * FROM app.integrantes_organizacion WHERE (`id_organizacion` = '"+rows[0].id_organizacion+"')", (err, rows2) => {
					//Query a la tabla de usuario
					connection.query("SELECT * FROM app.usuario", (err, rows3) => {
						//Se filtran los usuarios que no forman parte de la organizacion
						for(i=0;i<rows2.length;i++){for(j=0;j<rows3.length;j++){
							if(rows2[i].id_usuario==rows3[j].id){
										rows3.splice(j, 1);
									}
							}}
							let band=0,temp
							//Verifica que el correo seleccionado esta registrado (band=1)
							for(j=0;j<rows3.length;j++){
								if(req.body.name==rows3[j].correo){temp=rows3[j];band=1;break;}
							}
							if(band==0){
								//Renderiza add_org_user con error en correo ingresado y lista de usuarios
								res.render(__dirname+'/src/add_org_user',{rows: list,error:1});
								}else{
									//Query a la tabla de notificaciones (notificacion de invitacion de organizacion)
									let d = new Date(),dia=ajuste(d.getDate())+"/"+ajuste((d.getMonth()+1))+"/"+ajuste(d.getFullYear()),hora=ajuste(d.getHours())+":"+ajuste(d.getMinutes())
									let sql = "INSERT INTO `app`.`notificaciones` (`id_user_emisor`,`nombre_emisor`, `id_user_receptor`,`nombre_receptor`, `tipo`, `status`, `fecha`, `hora`) VALUES ?";
									let values=[[req.session.userID,req.session.names,temp.id,temp.nombres+" "+temp.apellidos,1,1,dia,hora]]
									connection.query(sql,[values], function (err, result) {
										//Redirecciona a organizacion
										res.redirect('/organizacion')
									});
								}
						});
					});
			}else{
				//En caso de que el usuario de la peticion no pertenezca a una organizacion se redirecciona a inicio
				res.redirect('/inicio')
			}
			});
	}else{
		//En caso de que el usuario de la peticion no sea de tipo administrador se redirecciona a inicio
		res.redirect('/inicio')
	}
});

app.post('/minus_user',auth ,function(req,res) {
	//MEJORAR
	//Disminuir rol en la organizacion
	//Query a la tabla de integrantes_organizacion con filtro id_usuario
	connection.query("SELECT * FROM app.integrantes_organizacion WHERE (`id_usuario` = '"+req.session.userID+"')", (err, rows) => {
		//Se verifica que el usuario de la peticion pertenezca a una organizacion
		if(rows.length!=0){
			//Se verifica que el usuario de la peticion tenga el grado requerido 
			if(rows[0].rol=="Lider" || rows[0].rol=="Dueño"){
				//Query a la tabla de integrantes_organizacion (reduciendo el rol del usuario)
				let sql= "UPDATE `app`.`integrantes_organizacion` SET `rol` = 'Administrador:1' WHERE (`id_usuario` = '"+req.body.id+"')"
				connection.query(sql, function (err, result) {
					//Se redirecciona a organizacion
					res.redirect('/organizacion')
					});
			}else{
				//En caso de que el usuario de la peticion no tenga el grado requerido se redirecciona a inicio
				res.redirect('/inicio')
				}
		}else{
			//En caso de que el usuario de la peticion no pertenezca a una organizacion se redirecciona a inicio
			res.redirect('/inicio')
		}
	});
});
app.post('/plus_user',auth ,function(req,res) {
	//MEJORAR
	//Aumentar rol en la organizacion
	//Query a la tabla de integrantes_organizacion con filtro id_usuario
	connection.query("SELECT * FROM app.integrantes_organizacion WHERE (`id_usuario` = '"+req.session.userID+"')", (err, rows) => {
		//Se verifica que el usuario de la peticion pertenezca a una organizacion
		if(rows.length!=0){
			//Se verifica que el usuario de la peticion tenga el rol requerido
			if(rows[0].rol=="Administrador:2" || rows[0].rol=="Lider" || rows[0].rol=="Dueño"){
				//Query a la tabla de integrantes_organizacion
				let sql= "UPDATE `app`.`integrantes_organizacion` SET `rol` = 'Administrador:2' WHERE (`id_usuario` = '"+req.body.id+"')"
				connection.query(sql, function (err, result) {
					//Se redirecciona a organizacion
					res.redirect('/organizacion')
					});
			}else{
				//En caso de que el usuario de la peticion no tenga el rol requerido se redirecciona a inicio
				res.redirect('/inicio') 
				}
		}else{
			//En caso de que el usuario de la peticion no pertenezca a una organizacion se redirecciona a inicio
			res.redirect('/inicio')
		}
	});
});
app.post('/eliminar_user_org',auth ,function(req,res) {
	//MEJORAR
	//Eliminar usuario de organizacion
	//Query a la tabla de integrantes_organizacion con filtro id_usuario
	connection.query("SELECT * FROM app.integrantes_organizacion WHERE (`id_usuario` = '"+req.session.userID+"')", (err, rows) => {
		//Se verifica que el usuario de la peticion tenga el rol requerio para la peticion
		if(rows[0].rol=="Administrador:2" || rows[0].rol=="Lider" || rows[0].rol=="Dueño"){
			//Query a la tabla de integrantes_organizacion con filtro id_usuario
			connection.query("SELECT * FROM app.integrantes_proyectos WHERE (`id_usuario` = '"+req.body.id+"')", (err, rows2) => {
				let temp=1,band=0
				if(rows2.length!=0){
					temp=rows2[rows2.length-1].id_proyecto
					band=1
				}
				connection.query("SELECT * FROM app.proyecto WHERE (`id` = '"+temp+"')", (err, rows3) => {
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
						connection.query("DELETE FROM app.integrantes_organizacion WHERE (`id_usuario` = '"+req.body.id+"')", (err, rows4) => {
							connection.query(sql,[values], function (err, result) {
								res.redirect('/organizacion')
								});
							});
					}else{
						connection.query("DELETE FROM app.integrantes_organizacion WHERE (`id_usuario` = '"+req.body.id+"')", (err, rows4) => {
							connection.query("DELETE FROM app.integrantes_proyectos WHERE (`id` = '"+rows2[rows2.length-1].id+"')", (err, rows5) => {
								connection.query(sql,[values], function (err, result) {
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

app.post('/getout_org', auth ,function(req,res) {
	if(req.body.band==1){
		connection.query("SELECT * FROM app.integrantes_organizacion WHERE (`id_usuario` = '"+req.session.userID+"')", (err, rows) => {
			connection.query("SELECT * FROM app.organizacion WHERE (`id` = '"+rows[0].id_organizacion+"')", (err2, rows2) => {
				connection.query("DELETE FROM app.integrantes_organizacion WHERE (`id_usuario` = '"+req.session.userID+"')", (err3, rows3) => {
					connection.query("DELETE FROM app.integrantes_proyectos WHERE  (`id_usuario` = '"+req.session.userID+"')", (err4, rows4) => {
						let d = new Date(),dia=ajuste(d.getDate())+"/"+ajuste((d.getMonth()+1))+"/"+ajuste(d.getFullYear()),hora=ajuste(d.getHours())+":"+ajuste(d.getMinutes())
						let sql = "INSERT INTO `app`.`notificaciones` (`id_user_emisor`,`nombre_emisor`, `id_user_receptor`,`nombre_receptor`, `tipo`, `status`, `fecha`, `hora`) VALUES ?";
						let values=[[req.session.userID,req.session.names,req.session.userID,req.session.names,8,0,dia,hora]]
						connection.query(sql,[values], function (err, result) {
							if(rows2[0].id_jefe==req.session.userID){
								connection.query("SELECT * FROM app.integrantes_organizacion WHERE (`id_organizacion` = '"+rows[0].id_organizacion+"')", (err, rows6) => {
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
										connection.query(sql, function (err, result) {
											d = new Date(),dia=ajuste(d.getDate())+"/"+ajuste((d.getMonth()+1))+"/"+ajuste(d.getFullYear()),hora=ajuste(d.getHours())+":"+ajuste(d.getMinutes())
											sql = "INSERT INTO `app`.`notificaciones` (`id_user_emisor`,`nombre_emisor`, `id_user_receptor`,`nombre_receptor`, `tipo`, `status`, `fecha`, `hora`) VALUES ?";
											values=[[req.session.userID,req.session.names,temp.id_usuario,temp.nombres,9,0,dia,hora]]
											connection.query(sql,[values], function (err, result) {
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
				connection.query(sql,[values], function (err, result) {
					connection.query("SELECT * FROM app.organizacion WHERE (`nombre` = '"+req.body.name+"')", (err, rows2) => {
						let sql = "INSERT INTO `app`.`integrantes_organizacion` (`id_usuario`, `nombres`,`id_organizacion`,`rol`,`activo`) VALUES ?";
						let values=[[req.session.userID,req.session.names,rows2[0].id,"Dueño",1]]
						connection.query(sql,[values], function (err, result) {
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
	let values=[[req.session.userID,45,45,45,45,45,req.body.exp_python,req.body.exp_java,
		req.body.exp_c++,req.body.exp_php,req.body.exp_c,req.body.exp_ruby,req.body.exp_objective,
		req.body.exp_go,req.body.exp_visual,req.body.exp_scala,req.body.exp_sql,req.body.exp_nosql,
		req.body.exp_kotlin ,req.body.exp_r,req.body.exp_swift,req.body.exp_clojure,req.body.exp_perl,
		req.body.exp_rust,req.body.exp_html_css]]
	connection.query(sql,[values], function (err, result) {
		sql= "UPDATE `app`.`usuario` SET `inicializado` = '1' WHERE (`id` = '"+req.session.userID+"')"
			connection.query(sql, function (err, result) {
				req.session.act=1
				res.redirect('/inicio')
			});
		});
});
/* /Metodos POST*/
/* * */
app.get('/*', auth ,function(req,res) {
	//Redirecciona al login
	res.redirect('/login')
});
//Define el puerto de la plataforma
app.set('port', (process.env.PORT || 5000));
app.listen(app.get('port'), function () {
	//Comienza a ejecutar la plataforma
	console.log('App listening on port '+app.get('port'));
	  });
function ajuste(data){
	if(data<10){
		return "0"+data
	}else{
		return data
	}
}
/* /* */