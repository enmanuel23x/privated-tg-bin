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
var auth = function(req, res, next) {
	if (req.session.userID!=undefined){
		if(req.session.act==0 && req.session.type==1 && (req.originalUrl=="/inicio" || req.originalUrl=="/proyectos" || req.originalUrl=="/organizacion" || req.originalUrl=="/perfil")){
			res.redirect('/aptitudes')
		}else{
			return next();
		}
  }else{
    return res.redirect('/login')
  }
};
var configStats = function(req, res, next) {
	MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    const db = client.db(dbName);
    getConfig(db,req,res,next, function() {
      client.close();
    });
  });
	};
const MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
const assert = require('assert');
const url = 'mongodb+srv://root:uJLzJOjlONYVVZJV@cluster0-m5ujz.mongodb.net/test';
const dbName = 'devology';
/*  /Utilidades y librerias*/
/* Conexiones a mongoDB */
const getConfig = function(db,req,res,next, callback) {
  // Get the documents collection
  const collection = db.collection('config');
  // Find some documents
  collection.find({}).toArray(function(err, rows) {
    assert.equal(err, null);
    if(rows[0].status==1){
      return next();
      callback(rows);
    }else{
      console.log(rows[0].status)
      res.render(__dirname+'/src/login',{err:3,mail:"",msg:undefined});
      callback(rows);
    }
  });
}
const insertUser = function(db,req,res,type, callback) {
  // Get the documents collection
  const collection = db.collection('usuario');
  // Insert some documents
  collection.find({correo:req.body.user}).toArray(function(err, rows) {
    assert.equal(err, null);
    if(rows.length==0){
      collection.insertMany([
        {nombres:req.body.name,apellidos:req.body.name2,correo:req.body.user,contraseña:req.body.pass,rol:type,inicializado:0}
      ], function(err, result) {
        assert.equal(null, err);
        //Creacion de session
          req.session.userID = result.ops[0]._id;req.session.names = req.body.name + " " + req.body.name2;
          req.session.type=type;req.session.act=0;
        callback(result);
      });
    }else{
      res.render(__dirname+'/src/login',{err:2,mail:req.body.user,msg:undefined});
    }
  });
}
const getusers = function(db,req,res, callback) {
  // Get the documents collection
  const collection = db.collection('usuario');
  // Find some documents
  collection.find({}).toArray(function(err, rows) {
    assert.equal(err, null);
    //Variables
	let band=0
	//Variables del formulario
	let pass = req.body.pass,user= req.body.user
    for (i = 0; i < rows.length; i++) {
			if (rows[i].correo == user && rows[i].contraseña == pass) {
				//Creacion de session
				req.session.userID = rows[i]._id
				req.session.names = rows[i].nombres + " " + rows[i].apellidos
				req.session.type=rows[i].rol
        req.session.act=rows[i].inicializado
				//Redireccion a inicio
				res.redirect('/inicio');
				band=1;break;
				}else if(rows[i].correo == user && rows[i].contraseña != pass){
          res.render(__dirname+'/src/login',{err:1,mail:req.body.user,msg:"Contraseña incorrecta"});
          band=1;break;
          }
			}
			//Si los datos de inicio de sesion no coinciden con ningun usuario
			if(band==0){
				res.render(__dirname+'/src/login',{err:1,mail:req.body.user,msg:"Correo no registrado"});
      }
    callback(rows);
  });
}
const getInicio = function(db,req,res, callback) {
  // Get the documents collection
  const collection = db.collection('notificaciones');
  // Find some documents
  collection.find({$and:[{tipo:{$ne:1}},{$or:[{id_user_emisor:req.session.userID},{id_user_receptor:req.session.userID}]}]}).toArray(function(err, rows) {
    assert.equal(err, null);
    res.render(__dirname+'/src/home',{type:req.session.type,rows:rows,id:req.session.userID});
    callback(rows);
  });
}
const getPerfil = function(db,req,res, callback) {
  // Get the documents collection
  const collection = db.collection('usuario');
  // Find some documents
  collection.find({_id:ObjectID(req.session.userID)}).toArray(function(err, rows) {
    assert.equal(err, null);
    console.log(rows)
    res.render(__dirname+'/src/profile',{rows: rows,type:req.session.type});
    callback(rows);
  });
}
const getAptitudes = function(db,req,res, callback) {
  // Get the documents collection
  const collection = db.collection('aptitudes');
  // Find some documents
  collection.find({id_usuario:req.session.userID}).toArray(function(err, rows) {
    assert.equal(err, null);
    if(rows.length!=0){
			//Aptitudes inicializadas
			//Renderizado de aptitudes con atributos
			res.render(__dirname+'/src/aptitudes',{rows: rows[0],type:req.session.type});
		}else{
			//Aptitudes no inicializadas
			//Renderizado de aptitudes con atributos (aptitudes indefinidas)
			res.render(__dirname+'/src/aptitudes',{rows: undefined,type:req.session.type});
		}
    callback(rows);
  });
}
const insertAPT= function(db,req,res, callback) {
  const collection = db.collection('aptitudes');
  collection.insertMany([
    {id_usuario:req.session.userID,dev_quality:45,dev_exp:45,dev_on_time:45,team_chemistry:45,dev_errors:45,
      exp_python:req.body.exp_python,exp_java:req.body.exp_java,exp_cpp:req.body.exp_cpp,exp_php:req.body.exp_php,
      exp_c:req.body.exp_c,exp_ruby:req.body.exp_ruby,exp_objective:req.body.exp_objective,
      exp_go:req.body.exp_go,exp_visual:req.body.exp_visual,exp_scala:req.body.exp_scala,exp_sql:req.body.exp_sql,
      exp_nosql:req.body.exp_nosql,exp_kotlin:req.body.exp_kotlin,exp_r:req.body.exp_r,exp_swift:req.body.exp_swift,
      exp_clojure:req.body.exp_clojure,exp_perl:req.body.exp_perl,exp_rust:req.body.exp_rust,exp_html_css:req.body.exp_html_css}
  ], function(err, result) {
    assert.equal(null, err);
   db.collection('usuario').updateOne({ _id: ObjectID(req.session.userID) },{ $set:{inicializado:1}}, function(err, result) {
    if (err) throw err;
    res.redirect('/inicio')
    callback(result);
    });
  });
}
const insertOrg = function(db,req,res, callback) {
  // Get the documents collection
  let collection = db.collection('organizacion');
  // Find some documents
  collection.find({nombre:ObjectID(req.body.name)}).toArray(function(err, rows) {
    assert.equal(err, null);
			if(rows.length==0){
        collection.insertMany([
          {nombre:req.body.name,id_jefe:ObjectID(req.session.userID) }], function(err, result) {
          assert.equal(null, err);
          collection.find({nombre:ObjectID(req.body.name)}).toArray(function(err, rows2) {
            collection = db.collection('integrantes_organizacion');
            collection.insertMany([{id_usuario:ObjectID(req.session.userID),nombres:req.session.names,
              id_organizacion:rows2[0].id,rol:1,activo:1}], function(err, result2) {
                res.redirect('/organizacion')
                callback(result2);
              });
          });
        });
			}else{
        res.render(__dirname+'/src/new_org',{status:"0",name:req.body.name})
        callback(rows);
			}
  });
}
const newOrg = function(db,req,res, callback) {
  // Get the documents collection
  const collection = db.collection('integrantes_organizacion');
  // Find some documents
  collection.find({id_usuario:ObjectID(req.session.userID)}).toArray(function(err, rows) {
    assert.equal(err, null);
    if(rows.length!=0){
      res.render(__dirname+'/src/new_org',{status:"1",name:""})
    }else{
      res.redirect('/inicio')
    }
    callback(rows);
  });
}
const Org = function(db,req,res, callback) {
  db.collection('integrantes_organizacion').find({id_usuario:ObjectID(req.session.userID)}).toArray(function(err, rows) {
    assert.equal(err, null);
    db.collection('notificaciones').find({$and:[{id_user_receptor:ObjectID(req.session.userID)},{status:1}]}).toArray(function(err, rows2) {
      assert.equal(err, null);
      let temp=1,band=0
      //Verificacion de que el usuario pertenezaca a una organizacion (Si=>band=1) o (No=>band=0)
      if(rows.length!=0){
        temp=rows[0].id_organizacion
        band=1
        }
      db.collection('integrantes_organizacion').find({id_organizacion:ObjectID(temp)}).toArray(function(err, rows3) {
        assert.equal(err, null);
          db.collection('organizacion').find({_id:ObjectID(temp)}).toArray(function(err, rows4) {
            assert.equal(err, null);
            let name,grade=undefined
					  if(band==0){
						  //Si el usuario no pertence a una organizacion envia las matrices vacias
						  rows3=[]
						  rows4=[]
						  name=undefined
					  }else{
						  //Si el usuario pertence a una organizacion verifica el grado dentro de la misma
							grade=rows[0].rol
						  //Variable de nombre de organizacion
						  name=rows4[0].nombre
              }
              db.collection('usuario').find({}).toArray(function(err, rows5) {
                assert.equal(err, null);
                let l=[]
                for(i=0;i<rows3.length;i++){
                  for(j=0;j<rows5.length;j++){
                    if(rows3[i].id_usuario==rows5[j]._id){
                      l.push({"id_usuario": rows3[i].id_usuario,"nombres": rows3[i].nombres,"rol": rows3[i].rol,"correo": rows5[j].correo})
                    }
                    }
                  }
                //Renderizado de platilla orgs con atributos
                //rows: rows3 integrantes de la organizacion
                //rows2 notificaciones
                //rows
					      res.render(__dirname+'/src/orgs',{rows: l,rows2: rows2,type:req.session.type,name:name,grade:grade,id:req.session.userID});
                callback(rows);
                });
            });
        });
      });
    });
					
}
const addUser2Org = function(db,req,res, callback) {
  //Verificacion de tipo de usuario
	if(req.session.type==2){
    //Query a la tabla de integrantes de organizacion
    const collection = db.collection('integrantes_organizacion');
      collection.find({id_usuario:ObjectID(req.session.userID)}).toArray(function(err, rows) {
        assert.equal(err, null);
        //Verificacion de que el usuario pertenezca a una organizacion
			  if(rows.length!=0){
          db.collection('integrantes_organizacion').find({id_organizacion:ObjectID(rows[0].id_organizacion)}).toArray(function(err, rows2) {
            assert.equal(err, null);
            db.collection('usuario').find({}).toArray(function(err, rows3) {
              assert.equal(err, null);
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
              callback(rows);
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
}
const rechazar_org= function(db,req,res, callback) {
  db.collection('notificaciones').find({_id:ObjectID(req.body.id)}).toArray(function(err, rows) {
    assert.equal(err, null);
    if(rows.length!=0){
			//Query a la tabla de notificaciones con cambio en el status y con filtro id
			db.collection('notificaciones').updateOne({ _id: ObjectID(req.body.id) },{ $set:{status:0}}, function(err, result) {
        if (err) throw err;
				//Query a la tabla de notificaciones (notificacion de rechazo de solicitud de organizacion)
				let d = new Date(),dia=ajuste(d.getDate())+"/"+ajuste((d.getMonth()+1))+"/"+ajuste(d.getFullYear()),hora=ajuste(d.getHours())+":"+ajuste(d.getMinutes())
        db.collection('notificaciones').insertMany([{id_user_emisor:ObjectID(req.session.userID),nombre_emisor:req.session.names,
          id_user_receptor:ObjectID(rows[0].id_user_emisor),nombre_receptor:rows[0].nombre_emisor,tipo:3,status:0,fecha:dia,hora:hora}], function(err, result) {
          assert.equal(null, err);
					//Redirecciona a organizacion
          res.redirect('/organizacion')
          callback(rows);
					});
				});
		}else{
			//En caso de no existir notificaciones se redirecciona a inicio
      res.redirect('/inicio')
      callback(rows);
			}
  });
}
const aceptar_org= function(db,req,res, callback) {
  db.collection('notificaciones').find({_id:ObjectID(req.body.id)}).toArray(function(err, rows) {
    assert.equal(err, null);
    //Verificacion de existencia de notificaciones
		if(rows.length!=0){
			//Query a la tabla de notificaciones con cambio en el status y con filtro id
			db.collection('notificaciones').updateOne({ _id: ObjectID(req.body.id) },{ $set:{status:0}}, function(err, result) {
        if (err) throw err;
				//Query a la tabla de notificaciones (notificacion de aceptacion de solicitud de organizacion)
				let d = new Date(),dia=ajuste(d.getDate())+"/"+ajuste((d.getMonth()+1))+"/"+ajuste(d.getFullYear()),hora=ajuste(d.getHours())+":"+ajuste(d.getMinutes())
				let values=[[req.session.userID,req.session.names,rows[0].id_user_emisor,rows[0].nombre_emisor,2,0,dia,hora]]
				db.collection('notificaciones').insertMany([{id_user_emisor:ObjectID(req.session.userID),nombre_emisor:req.session.names,
          id_user_receptor:ObjectID(rows[0].id_user_emisor),nombre_receptor:rows[0].nombre_emisor,tipo:2,status:0,fecha:dia,hora:hora}], function(err, result) {
          assert.equal(null, err);
					//Query a la tabla de integrantes_organizacion con filtro id_usuario, para obtener id de organizacion
            db.collection('integrantes_organizacion').find({id_usuario:ObjectID(rows[0].id_user_emisor)}).toArray(function(err, rows2) {
              assert.equal(err, null);
						//Query a la tabla de notificaciones (añadir integrante a la organizacion organizacion)
						let type=4
						if(req.session.type==2){type=3}
            db.collection('integrantes_organizacion').insertMany([{id_usuario:ObjectID(req.session.userID),nombres:req.session.names,
              id_organizacion:ObjectID(rows2[0].id_organizacion),rol:type,activo:1}], function(err, result) {
              assert.equal(null, err);
							//Redirecciona a organizacion
              res.redirect('/organizacion')
              callback(rows);
							});
						});
					
					});
				});
		}else{
			//En caso de no existir notificaciones se redirecciona a inicio
      res.redirect('/inicio')
      callback(rows);
			}
  });
};
const anadir_usuario= function(db,req,res, callback) {
  if(req.session.type==2){
    //Se verifica el tipo de usuario
    //Query a la tabla de integrantes_organizacion con filtro id_usuario
    db.collection('integrantes_organizacion').find({id_usuario:ObjectID(req.session.userID)}).toArray(function(err, rows) {
      assert.equal(err, null);
      //Se verifica que el usuario de la peticion pertenezca a una organizacion
			if(rows.length!=0){
        //Query a la tabla de integrantes_organizacion con filtro id_organizacion
        db.collection('integrantes_organizacion').find({id_organizacion:ObjectID(rows[0].id_organizacion)}).toArray(function(err, rows2) {
          assert.equal(null, err);
          //Query a la tabla de usuario
          db.collection('usuario').find({}).toArray(function(err, rows3) {
            assert.equal(null, err);
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
                callback(rows);
								}else{
                  //Query a la tabla de notificaciones (notificacion de invitacion de organizacion)
									let d = new Date(),dia=ajuste(d.getDate())+"/"+ajuste((d.getMonth()+1))+"/"+ajuste(d.getFullYear()),hora=ajuste(d.getHours())+":"+ajuste(d.getMinutes())
									db.collection('notificaciones').insertMany([{id_user_emisor:ObjectID(req.session.userID),nombre_emisor:req.session.names,
                    id_user_receptor:ObjectID(temp.id),nombre_receptor:temp.nombres+" "+temp.apellidos,tipo:1,status:1,fecha:dia,hora:hora}], function(err, result) {
                    assert.equal(null, err);
										//Redirecciona a organizacion
                    res.redirect('/organizacion')
                    callback(rows);
									});
								}
						});
					});
			}else{
				//En caso de que el usuario de la peticion no pertenezca a una organizacion se redirecciona a inicio
        res.redirect('/inicio')
        callback(rows);
			}
      });
	}else{
		//En caso de que el usuario de la peticion no sea de tipo administrador se redirecciona a inicio
    res.redirect('/inicio')
    callback(res);
	}
}
const minus_user= function(db,req,res, callback) {
  //MEJORAR
	//Disminuir rol en la organizacion
	//Query a la tabla de integrantes_organizacion con filtro id_usuario
  db.collection('integrantes_organizacion').find({id_usuario:ObjectID(req.session.userID)}).toArray(function(err, rows) {
    assert.equal(err, null);
    //Se verifica que el usuario de la peticion pertenezca a una organizacion
		if(rows.length!=0){
			//Se verifica que el usuario de la peticion tenga el grado requerido 
			if(rows[0].rol==1){
        //Query a la tabla de integrantes_organizacion con filtro id_usuario
        db.collection('integrantes_organizacion').find({id_usuario:ObjectID(req.body.id)}).toArray(function(err, rows2) {
          assert.equal(err, null);
          let role=rows2[0].rol
          if(role==3){
            role+=1;
            }
            //Query a la tabla de integrantes_organizacion (reduciendo el rol del usuario)
				    db.collection('integrantes_organizacion').updateOne({ id_usuario: ObjectID(req.body.id) },{ $set:{rol:role}}, function(err, result) {
              if (err) throw err;
              //Se redirecciona a organizacion
              res.redirect('/organizacion')
              callback(rows);
					    });
          });
			}else{
				//En caso de que el usuario de la peticion no tenga el grado requerido se redirecciona a inicio
        res.redirect('/inicio')
        callback(rows);
				}
		}else{
			//En caso de que el usuario de la peticion no pertenezca a una organizacion se redirecciona a inicio
      res.redirect('/inicio')
      callback(rows);
		}
  });
}
const plus_user= function(db,req,res, callback) {
  //MEJORAR
	//Disminuir rol en la organizacion
	//Query a la tabla de integrantes_organizacion con filtro id_usuario
  db.collection('integrantes_organizacion').find({id_usuario:ObjectID(req.session.userID)}).toArray(function(err, rows) {
    assert.equal(err, null);
    //Se verifica que el usuario de la peticion pertenezca a una organizacion
		if(rows.length!=0){
			//Se verifica que el usuario de la peticion tenga el grado requerido 
			if(rows[0].rol==1){
        //Query a la tabla de integrantes_organizacion con filtro id_usuario
        db.collection('integrantes_organizacion').find({id_usuario:ObjectID(req.body.id)}).toArray(function(err, rows2) {
          assert.equal(err, null);
          let role=rows2[0].rol
          if(role==3){
            role-=1;
            }
            //Query a la tabla de integrantes_organizacion (reduciendo el rol del usuario)
				    db.collection('integrantes_organizacion').updateOne({ id_usuario: ObjectID(req.body.id) },{ $set:{rol:role}}, function(err, result) {
              if (err) throw err;
              //Se redirecciona a organizacion
              res.redirect('/organizacion')
              callback(rows);
					    });
          });
			}else{
				//En caso de que el usuario de la peticion no tenga el grado requerido se redirecciona a inicio
        res.redirect('/inicio')
        callback(rows);
				}
		}else{
			//En caso de que el usuario de la peticion no pertenezca a una organizacion se redirecciona a inicio
      res.redirect('/inicio')
      callback(rows);
		}
  });
}
const eliminar_user_org= function(db,req,res, callback) {
  //MEJORAR
	//Eliminar usuario de organizacion
	//Query a la tabla de integrantes_organizacion con filtro id_usuario
  db.collection('integrantes_organizacion').find({id_usuario:ObjectID(req.session.userID)}).toArray(function(err, rows) {
    assert.equal(err, null);
		//Se verifica que el usuario de la peticion tenga el rol requerio para la peticion
		if(rows[0].rol==2 || rows[0].rol==1){
			//Query a la tabla de integrantes_organizacion con filtro id_usuario
      db.collection('integrantes_proyectos').find({id_usuario:ObjectID(req.body.id)}).toArray(function(err, rows2) {
        assert.equal(err, null);
				let temp=1,band=0
				if(rows2.length!=0){
					temp=rows2[rows2.length-1].id_proyecto
					band=1
				}
        db.collection('proyecto').find({_id:ObjectID(temp)}).toArray(function(err, rows3) {
          assert.equal(err, null);
					if(band!=0){
						band=false
						if(rows3[0].status==0 || rows3.length==0){
							band=true
						}
					}else{
						band=true
					}
					let d = new Date(),dia=ajuste(d.getDate())+"/"+ajuste((d.getMonth()+1))+"/"+ajuste(d.getFullYear()),hora=ajuste(d.getHours())+":"+ajuste(d.getMinutes())
          db.collection('notificaciones').insertMany([{id_user_emisor:ObjectID(req.session.userID),nombre_emisor:req.session.names,
            id_user_receptor:ObjectID(req.body.id),nombre_receptor:"",tipo:5,status:0,fecha:dia,hora:hora}], function(err, result) {
            assert.equal(null, err);
            db.collection("integrantes_organizacion").deleteOne({id_usuario:ObjectID(req.body.id)}, function(err, obj) {
              if (err) throw err;
              if(band){
                res.redirect('/organizacion')
                callback(rows);
              }else{
                    db.collection("integrantes_organizacion").deleteOne({_id:ObjectID(rows2[rows2.length-1].id)}, function(err, obj2) {
                    res.redirect('/organizacion')
                    callback(rows);
                    });
              }
              });
            });
					});
				});
			}else{
        res.redirect('/inicio')
        callback(rows);
				}
  });
}
const getout_org= function(db,req,res, callback) {
  if(req.body.band==1){
    db.collection('integrantes_organizacion').find({id_usuario:ObjectID(req.session.userID)}).toArray(function(err, rows) {
      assert.equal(err, null);
      db.collection('organizacion').find({_id:ObjectID(rows[0].id_organizacion)}).toArray(function(err, rows2) {
        assert.equal(err, null);
        db.collection("integrantes_organizacion").deleteOne({id_usuario:ObjectID(req.session.userID)}, function(err, obj) {
          if (err) throw err;
          db.collection("integrantes_proyectos").deleteOne({id_usuario:ObjectID(req.session.userID)}, function(err, obj2) {
            if (err) throw err;
            let d = new Date(),dia=ajuste(d.getDate())+"/"+ajuste((d.getMonth()+1))+"/"+ajuste(d.getFullYear()),hora=ajuste(d.getHours())+":"+ajuste(d.getMinutes())
						db.collection('notificaciones').insertMany([{id_user_emisor:ObjectID(req.session.userID),nombre_emisor:req.session.names,
              id_user_receptor:ObjectID(req.session.userID),nombre_receptor:req.session.names,tipo:8,status:0,fecha:dia,hora:hora}], function(err, result) {
              assert.equal(null, err);
							if(rows2[0].id_jefe==req.session.userID){
                db.collection('integrantes_organizacion').find({id_organizacion:ObjectID(rows[0].id_organizacion)}).toArray(function(err, rows6) {
                  assert.equal(err, null);
									if(rows6.length!=0){
										let temp,band=0,grade=[1,2,3,4]
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
										db.collection('integrantes_organizacion').updateOne({ id_usuario: ObjectID(temp.id_usuario) },{ $set:{rol:1}}, function(err, result) {
                      if (err) throw err;
											d = new Date(),dia=ajuste(d.getDate())+"/"+ajuste((d.getMonth()+1))+"/"+ajuste(d.getFullYear()),hora=ajuste(d.getHours())+":"+ajuste(d.getMinutes())
											db.collection('notificaciones').insertMany([{id_user_emisor:ObjectID(req.session.userID),nombre_emisor:req.session.names,
                        id_user_receptor:ObjectID(temp.id_usuario),nombre_receptor:temp.nombres,tipo:9,status:0,fecha:dia,hora:hora}], function(err, result) {
                        assert.equal(null, err);
                        res.redirect('/organizacion')
                        callback(rows);
												});
											});
										}
									});
							}else{
                res.redirect('/inicio')
                callback(rows);
							}
							});
            });
          });
        });
      });
  }else{
    res.redirect('/inicio')
    }
}
app.get('/login',function(req,res) {
	//Renderiza la plantilla Login-Register
	res.render(__dirname+'/src/login',{err:0,mail:"",msg:undefined});
});
app.post('/log',configStats,function(req,res) {
//Verificacion de los datos para iniciar sesion
	//Variables
	let band=0
	//Variables del formulario
	let pass = req.body.pass,user= req.body.user
  //Query a la tabla usuario
  MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    const db = client.db(dbName);
    getusers(db,req,res, function() {
      client.close();
    });
  });
});
app.post('/reg',configStats,function(req,res){
	//Registro de  usuario
	//Variable del formulario tipo de usuario
	let type
	if(req.body.type=="Desarrollador"){
		type=1
	}else{
		type=2
	}
	//Query para insertaral usuario 
	MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    const db = client.db(dbName);
    insertUser(db,req,res,type, function() {
			//Redireccion a inicio
      res.redirect('/inicio');
      client.close();
    });
  });
});
app.get('/logout',function(req,res) {
	//Se destruye la sesion y se redirige al login
	req.session.destroy();
	res.redirect('/login');
});
/* /Login-Register */
/* GET METHODS */
app.get('/inicio',configStats, auth ,function(req,res) {
	MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    const db = client.db(dbName);
    getInicio(db,req,res, function() {
      client.close();
    });
  });
});
app.get('/perfil',configStats, auth ,function(req,res) {
	MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    const db = client.db(dbName);
    getPerfil(db,req,res, function() {
      client.close();
    });
  });
});
app.get('/aptitudes',configStats, auth ,function(req,res) {
	MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    const db = client.db(dbName);
    getAptitudes(db,req,res, function() {
      client.close();
    });
  });
});

app.get('/new_org',configStats, auth ,function(req,res) {
	//Renderizado de new_org con status 1 (Sin errores)
	MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    const db = client.db(dbName);
    newOrg(db,req,res, function() {
      client.close();
    });
  });
});
app.get('/proyectos',configStats, auth ,function(req,res) {
	//Renderizado de platilla projects con atributos
	res.render(__dirname+'/src/projects',{type:req.session.type});
});
app.get('/organizacion', auth ,function(req,res) {
	MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    const db = client.db(dbName);
    Org(db,req,res, function() {
      client.close();
    });
  });
});
app.get('/anadir_usuario', auth ,function(req,res) {
	MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    const db = client.db(dbName);
    addUser2Org(db,req,res, function() {
      client.close();
    });
  });
});
/* /GET METHODS */
/* POST METHODS */
app.post('/add_org',configStats, auth ,function(req,res) {
	if(req.session.type==2){
		MongoClient.connect(url, function(err, client) {
      assert.equal(null, err);
      const db = client.db(dbName);
      insertOrg(db,req,res, function() {
        client.close();
      });
    });
	}
});
app.post('/apt',configStats, auth ,function(req,res) {
	MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    const db = client.db(dbName);
    insertAPT(db,req,res, function() {
      client.close();
    });
  });
});
app.post('/rechazar_org',auth ,function(req,res) {
	MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    const db = client.db(dbName);
    rechazar_org(db,req,res, function() {
      client.close();
    });
  });
});
app.post('/aceptar_org',auth ,function(req,res) {
	MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    const db = client.db(dbName);
    aceptar_org(db,req,res, function() {
      client.close();
    });
  });
});
app.post('/anadir_usuario', auth ,function(req,res) {
	MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    const db = client.db(dbName);
    anadir_usuario(db,req,res, function() {
      client.close();
    });
  });
});
app.post('/minus_user',auth ,function(req,res) {
	MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    const db = client.db(dbName);
    minus_user(db,req,res, function() {
      client.close();
    });
  });
});
app.post('/plus_user',auth ,function(req,res) {
	MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    const db = client.db(dbName);
    plus_user(db,req,res, function() {
      client.close();
    });
  });
});
app.post('/eliminar_user_org',auth ,function(req,res) {
	MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    const db = client.db(dbName);
    eliminar_user_org(db,req,res, function() {
      client.close();
    });
  });
});

app.post('/getout_org', auth ,function(req,res) {
	MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    const db = client.db(dbName);
    getout_org(db,req,res, function() {
      client.close();
    });
  });
});
/* /POST METHODS */
app.get('/*', function(req,res) {
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