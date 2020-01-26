/*  Utilidades y librerias*/
var mongoUtil = require(__dirname+'/mongoUtil' );
var express = require('express'),app = express();
var session = require('express-session');
var bodyParser = require('body-parser')
var multer = require('multer');
var fs = require("fs");
var upload = multer({ dest: '/tmp' })
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine','ejs')
app.use('/css',express.static(__dirname+'/src/assets/css'));
app.use('/img',express.static(__dirname+'/src/assets/img'));
app.use('/js',express.static(__dirname+'/src/assets/js'));
app.use('/font',express.static(__dirname+'/src/assets/font-awesome-4.7.0/css'));
app.use(session({
	name: "not",
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: false,
  cookie: {name: "not",type:"" ,secure: false }
}))
var isSysAdmin = function(req, res, next) {
	if (req.session.userID!=undefined){
		if(req.session.type==0){
      return next();
		}else{
			res.redirect('/inicio')
		}
  }else{
    return res.redirect('/login')
  }
};
var auth = function(req, res, next) {
	if (req.session.userID!=undefined){
    if(req.session.type==0){
      res.redirect('/adminpanel')
    }else if(req.session.act==0 && req.session.type==1 && req.originalUrl!="/aptitudes"){
			res.redirect('/aptitudes')
		}else{
			return next();
		}
  }else{
    return res.redirect('/login')
  }
};
var isDev = function(req, res, next) {
	if(req.session.type==1){
    return next();
  }else{
    return res.redirect('/redirect')
  }
};
var isAdmin = function(req, res, next) {
	if(req.session.type==2){
    return next();
  }else{
    return res.redirect('/redirect')
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
  db.collection('config').find({}).toArray(function(err, rows) {
    assert.equal(err, null);
    if(rows[0].status==1){
      return next();
    }else if(req.session.type==0){
      return next();
    }else{
      res.redirect('/login')
    }
  });
}
const getInicio = function(db,req,res, callback) {
  db.collection('notificaciones').find({$and:[{tipo:{$ne:1}},{$or:[{id_user_emisor:ObjectID(req.session.userID)},{id_user_receptor:ObjectID(req.session.userID)}]}]}).sort({_id:-1}).toArray(function(err, rows) {
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
/* Ajustadas a vue */

/* /Ajustadas a vue */
/* Login-Register */
app.get('/login',function(req,res) {
	//Renderiza la plantilla Login-Register
  res.sendFile(__dirname+'/src/login.html')
});
app.post('/login', function(req,res) {
  //Verificacion de los datos para iniciar sesion
    MongoClient.connect(url, function(err, client) {
      assert.equal(null, err);
      const db = client.db(dbName);
      mongoUtil.getLogin(db,req,res, function() {
      });
    });
  });
app.post('/register',configStats,function(req,res){
	//Registro de  usuario
	//Query para insertaral usuario 
	MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    const db = client.db(dbName);
    mongoUtil.RegUser(db,req,res, function() {
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
app.get('/aptitudes',configStats, auth , isDev,function(req,res) {
	MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    const db = client.db(dbName);
    getAptitudes(db,req,res, function() {
      client.close();
    });
  });
});
app.get('/test',configStats, auth ,function(req,res) {
	//Renderizado de platilla projects con atributos
	res.sendFile(__dirname+'/src/exampleVue.html');
});
app.get('/redirect', auth ,function(req,res) {
  res.redirect('/inicio')
});
app.get('/proyectos',configStats, auth ,function(req,res) {
	//Renderizado de platilla projects con atributos
	res.sendFile(__dirname+'/src/projects.html');
});
app.get('/organizacion', configStats, auth ,function(req,res) {
	res.sendFile(__dirname+'/src/orgs.html');
});
app.get('/data_organizacion', configStats, auth ,function(req,res) {
	MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    const db = client.db(dbName);
    mongoUtil.getData(db,req,res, function() {
    });
  });
});
app.get('/data_panel', isSysAdmin ,function(req,res) {
	MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    const db = client.db(dbName);
    mongoUtil.getPanel(db,req,res, function() {
    });
  });
});
app.get('/adminpanel', isSysAdmin,function(req,res) {
  res.sendFile(__dirname+'/src/adminpanel.html');
});
/* /GET METHODS */
/* POST METHODS */
app.post('/add_org',configStats, auth , isAdmin ,function(req,res) {
	if(req.session.type==2){
		MongoClient.connect(url, function(err, client) {
      assert.equal(null, err);
      const db = client.db(dbName);
      mongoUtil.insertOrg(db,req,res, function() {
      });
    });
	}
});
app.post('/apt',configStats, auth , isDev ,function(req,res) {
	MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    const db = client.db(dbName);
    insertAPT(db,req,res, function() {
      client.close();
    });
  });
});
app.post('/rechazar_org', configStats, auth ,function(req,res) {
	MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    const db = client.db(dbName);
    mongoUtil.rechazar_org(db,req,res, function() {
    });
  });
});
app.post('/aceptar_org', configStats, auth ,function(req,res) {
	MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    const db = client.db(dbName);
    mongoUtil.aceptar_org(db,req,res, function() {
    });
  });
});
app.post('/anadir_usuario', configStats, auth , isAdmin ,function(req,res) {
	MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    const db = client.db(dbName);
    mongoUtil.anadir_usuario(db,req,res, function() {
    });
  });
});
app.post('/minus_user', configStats, auth , isAdmin ,function(req,res) {
	MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    const db = client.db(dbName);
    mongoUtil.minus_user(db,req,res, function() {
    });
  });
});
app.post('/plus_user', configStats, auth , isAdmin ,function(req,res) {
	MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    const db = client.db(dbName);
    mongoUtil.plus_user(db,req,res, function() {
    });
  });
});
app.post('/eliminar_user_org', configStats, auth , isAdmin ,function(req,res) {
	MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    const db = client.db(dbName);
    mongoUtil.eliminar_user_org(db,req,res, function() {
    });
  });
});
app.post('/change_status', isSysAdmin,function(req,res) {
  MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    const db = client.db(dbName);
    mongoUtil.change_status(db,req,res, function() {
    });
  });
});
app.post('/getout_org', configStats, auth ,function(req,res) {
	MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    const db = client.db(dbName);
    mongoUtil.getout_org(db,req,res, function() {
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