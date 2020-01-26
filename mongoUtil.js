const assert = require('assert');
module.exports = {
    insertOrg: function(db,req,res, callback) {
        let collection = db.collection('organizacion');
        collection.find({nombre:req.body.name}).toArray(function(err, rows) {
          assert.equal(err, null);
                  if(rows.length==0){
              collection.insertMany([
                {nombre:req.body.name,id_jefe:ObjectID(req.session.userID) }], function(err, result) {
                assert.equal(null, err);
                collection.find({nombre:req.body.name}).toArray(function(err, rows2) {
                  collection = db.collection('integrantes_organizacion');
                  collection.insertMany([{id_usuario:ObjectID(req.session.userID),nombres:req.session.names,
                    id_organizacion:ObjectID(rows2[0]._id),rol:1,activo:1}], function(err, result2) {
                      res.send("0")
                    });
                });
              });
                  }else{
              //Error nombre en uso
              res.send("1")
                  }
        });
      },
    getData: function(db,req,res, callback) {
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
                          if(rows3[i].id_usuario.equals(rows5[j]._id)){
                            l.push({"id_usuario": rows3[i].id_usuario,"nombres": rows3[i].nombres,"rol": rows3[i].rol,"correo": rows5[j].correo})
                            }
                          }
                        }
                      //Renderizado de platilla orgs con atributos
                      //rows: rows3 integrantes de la organizacion
                      //rows2 notificaciones
                      //rows
                      role=4
                      if(rows.length!=0){
                        role=rows[0].rol
                      }
                                res.json({rows: l,rows2: rows2,type:req.session.type,name:name,grade:grade,id:req.session.userID,rol:role});
                      });
                  });
              });
            });
          });
                          
      },
    rechazar_org: function(db,req,res, callback) {
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
                res.send("0")
                          });
                      });
              }else{
                  //En caso de no existir notificaciones se redirecciona a inicio
            res.send("1")
                  }
        });
      },
    aceptar_org: function(db,req,res, callback) {
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
                  //Elimina al usuario de la organizacion a la que pertenece si pertenece a una
                  db.collection('integrantes_organizacion').deleteOne({id_usuario:ObjectID(req.session.userID)}, function(err, obj) {
                    if (err) throw err;
                    //Se inserta a la nueva organizacion
                  db.collection('integrantes_organizacion').insertMany([{id_usuario:ObjectID(req.session.userID),nombres:req.session.names,
                    id_organizacion:ObjectID(rows2[0].id_organizacion),rol:type,activo:1}], function(err, result) {
                    assert.equal(null, err);
                    //Query a la tabla organizacion con filtro id_jefe
                    db.collection('organizacion').find({id_jefe:ObjectID(req.session.userID)}).toArray(function(err, org) {
                      assert.equal(err, null);
                      //Verifica que no sea jefe de una organizacion
                      if(org.length!=0){
                        db.collection('integrantes_organizacion').find({id_organizacion:ObjectID(org[0]._id)}).toArray(function(err, org2) {
                          assert.equal(err, null);
                          if(org2.length!=0){
                            //Si la organizacion no esta vacia
                                                let temp,band=0,grade=[1,2,3,4]
                                                for(j=0;j<grade.length;j++){
                                                    for(i=0;i<org2.length;i++){
                                                        if(grade[j]==org2[i].rol){
                                                            temp=org2[i]
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
                              //Despues de asignar otro jefe
                              res.send("2")
                                                      });
                                                  });
                            }else{
                              //Eliminar organizacion vacia Revisar
                              db.collection("organizacion").deleteOne({_id:ObjectID(org[0]._id)}, function(err, obj) {
                                if (err) throw err;
                                //Redirecciona a organizacion
                                res.send("1")
                                });
                              }
                            });
                      }else{
                        //Redirecciona a organizacion
                        res.send("0")
                      }
                      
                      });
                    });
                  });
                              });
                          
                          });
                      });
              }else{
                  //En caso de no existir notificaciones se redirecciona a inicio
            res.send("3")
                  }
        });
      },
    anadir_usuario: function(db,req,res, callback) {
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
                                  if(rows2[i].id_usuario.equals(rows3[j]._id)){
                                              rows3.splice(j, 1);
                                          }
                    }}
                  //Generacion de lista solo con correos de usuarios no pertenecientes a la organizacion
                              let list=[]
                              for(j=0;j<rows3.length;j++){
                                  list.push(rows3[j].correo)
                    }
                              let band=0,temp
                              //Verifica que el correo seleccionado esta registrado (band=1)
                              for(j=0;j<rows3.length;j++){
                                  if(req.body.email==rows3[j].correo){temp=rows3[j];band=1;break;}
                    }
                              if(band==0){
                                  //Renderiza add_org_user con error en correo ingresado y lista de usuarios
                    res.send("1")
                                  }else{
                        //Query a la tabla de notificaciones (notificacion de invitacion de organizacion)
                                          let d = new Date(),dia=ajuste(d.getDate())+"/"+ajuste((d.getMonth()+1))+"/"+ajuste(d.getFullYear()),hora=ajuste(d.getHours())+":"+ajuste(d.getMinutes())
                                          db.collection('notificaciones').insertMany([{id_user_emisor:ObjectID(req.session.userID),nombre_emisor:req.session.names,
                          id_user_receptor:ObjectID(temp._id),nombre_receptor:temp.nombres+" "+temp.apellidos,tipo:1,status:1,fecha:dia,hora:hora}], function(err, result) {
                          assert.equal(null, err);
                                              //Redirecciona a organizacion
                          res.send("0")
                                          });
                                      }
                              });
                          });
                  }else{
                      //En caso de que el usuario de la peticion no pertenezca a una organizacion
              res.send("2")
                  }
            });
          }else{
              //En caso de que el usuario de la peticion no sea de tipo administrador
          res.send("3")
          }
      },
    minus_user: function(db,req,res, callback) {
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
                if(role==2){
                  role+=1;
                  }
                  //Query a la tabla de integrantes_organizacion (reduciendo el rol del usuario)
                          db.collection('integrantes_organizacion').updateOne({ id_usuario: ObjectID(req.body.id) },{ $set:{rol:role}}, function(err, result) {
                    if (err) throw err;
                    //Se redirecciona a organizacion
                    res.send("0")
                              });
                });
                  }else{
                      //En caso de que el usuario de la peticion no tenga el grado requerido se redirecciona a inicio
              res.send("1")
                      }
              }else{
                  //En caso de que el usuario de la peticion no pertenezca a una organizacion se redirecciona a inicio
            res.send("2")
              }
        });
      },
    plus_user: function(db,req,res, callback) {
        //MEJORAR
          //Aumentar rol en la organizacion
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
                if(role==3 || role==2){
                  role-=1;
                  }
                  //Query a la tabla de integrantes_organizacion (reduciendo el rol del usuario)
                          db.collection('integrantes_organizacion').updateOne({ id_usuario: ObjectID(req.body.id) },{ $set:{rol:role}}, function(err, result) {
                    if (err) throw err;
                    //Se verifica si el usuario pasa a ser el dueño de la organizacion
                    if(role==1){
                      db.collection('integrantes_organizacion').updateOne({ id_usuario: ObjectID(req.session.userID) },{ $set:{rol:2}}, function(err, result) {
                        if (err) throw err;
                        db.collection('organizacion').updateOne({ _id: ObjectID(rows2[0].id_organizacion) },{ $set:{id_jefe:ObjectID(req.body.id)}}, function(err, result) {
                          if (err) throw err;
                          res.send("0")
                        });
                      });
                    }else{
                      //Si no pasa a serlo se redirecciona
                      res.send("1")
                      }
                              });
                });
                  }else{
                      //En caso de que el usuario de la peticion no tenga el grado requerido se redirecciona a inicio
              res.send("2")
                      }
              }else{
                  //En caso de que el usuario de la peticion no pertenezca a una organizacion se redirecciona a inicio
            res.send("3")
              }
        });
      },
    eliminar_user_org: function(db,req,res, callback) {
          //Eliminar usuario de organizacion
        //Query a la tabla de integrantes_organizacion con filtro id_usuario
        db.collection('integrantes_organizacion').find({id_usuario:ObjectID(req.session.userID)}).toArray(function(err, rows) {
          assert.equal(err, null);
              //Se verifica que el usuario de la peticion tenga el rol requerio para la peticion
              if(rows[0].rol==2 || rows[0].rol==1){
            //Query a la tabla de integrantes_organizacion con filtro id_usuario
            db.collection('integrantes_organizacion').find({id_usuario:ObjectID(req.body.id)}).toArray(function(err, rows2) {
              assert.equal(err, null);
              //Se verificar que no se eliminen los mas altos roles
              if((rows2[0].rol!=1 && rows2[0].rol!=2) || (rows[0].rol==1 && rows2[0].rol==2)){
                let d = new Date(),dia=ajuste(d.getDate())+"/"+ajuste((d.getMonth()+1))+"/"+ajuste(d.getFullYear()),hora=ajuste(d.getHours())+":"+ajuste(d.getMinutes())
                db.collection('notificaciones').insertMany([{id_user_emisor:ObjectID(req.session.userID),nombre_emisor:req.session.names,
                  id_user_receptor:ObjectID(req.body.id),nombre_receptor:"",tipo:5,status:0,fecha:dia,hora:hora}], function(err, result) {
                  assert.equal(null, err);
                  db.collection("integrantes_organizacion").deleteOne({id_usuario:ObjectID(req.body.id)}, function(err, obj) {
                    if (err) throw err;
                      db.collection("integrantes_proyectos").deleteMany({$and:[{id_usuario:ObjectID(req.body.id)},{status:1}]}, function(err, obj2) {
                        res.send("0")
                        });
                    });
                  });
                }else{
                  res.send("1")
                  }
              });
                  }else{
              res.send("2")
                      }
        });
      },
    getout_org: function(db,req,res, callback) {
        //Mejorar
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
                                  if(rows2[0].id_jefe.equals(req.session.userID)){
                      db.collection('integrantes_organizacion').find({id_organizacion:ObjectID(rows[0].id_organizacion)}).toArray(function(err, rows6) {
                        assert.equal(err, null);
                                          if(rows6.length!=0){
                          //Si la organizacion no esta vacia
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
                              //Despues de asignar otro jefe
                              res.send("0")
                                                      });
                                                  });
                                              }else{
                            //Elimina la organizacion si esta vacia
                            db.collection("organizacion").deleteOne({id_jefe:ObjectID(req.session.userID)}, function(err, obj3) {
                              if (err) throw err;
                              //Despues de eliminar la organizacion
                              res.send("2")
                            });
                          }
                                          });
                                  }else{
                      //Si no es el jefe
                      res.send("0")
                                  }
                                  });
                  });
                });
              });
            });
        }else{
          //No invocado convencionalmente
          res.send("1")
          }
      },
    RegUser: function(db,req,res, callback) {
        // Get the documents collection
        const collection = db.collection('usuario');
        // Insert some documents
        collection.find({correo:req.body.email}).toArray(function(err, rows) {
          assert.equal(err, null);
          if(rows.length==0){
            let type
              if(req.body.type=="Desarrollador"){type=1}else{type=2}
            collection.insertMany([
              {nombres:req.body.name,apellidos:req.body.name2,correo:req.body.email,contraseña:req.body.pass,rol:type,inicializado:0}
            ], function(err, result) {
              assert.equal(null, err);
              //Creacion de session
                req.session.userID = result.ops[0]._id;req.session.names = req.body.name + " " + req.body.name2;
                req.session.type=type;req.session.act=0;
                res.send("0");
            });
          }else{
            res.send("1");
          }
        });
      },
    getLogin: function(db,req,res, callback) {
        db.collection('usuario').find({}).toArray(function(err, rows) {
          assert.equal(err, null);
          //Variables
            let band=0
            //Variables del formulario
          let pass = req.body.password,user= req.body.email
          for (i = 0; i < rows.length; i++) {
                  if (rows[i].correo == user && rows[i].contraseña == pass) {
                      //Creacion de session
                      req.session.userID = rows[i]._id
                      req.session.names = rows[i].nombres + " " + rows[i].apellidos
                      req.session.type=rows[i].rol
              req.session.act=rows[i].inicializado
                      //Redireccion a inicio
                      res.send("1");
                      band=1;break;
                      }else if(rows[i].correo == user && rows[i].contraseña != pass){
                res.send("2");
                band=1;break;
                }
                  }
              //Si los datos de inicio de sesion no coinciden con ningun usuario
              if(band==0){
            res.send("3");
            }
        });
      }
}