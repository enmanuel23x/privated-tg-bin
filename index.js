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
//Validadores de sesion
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
    return res.redirect('/inicio')
  }
};
var isAdmin = function(req, res, next) {
	if(req.session.type==2){
    return next();
  }else{
    return res.redirect('/inicio')
  }
};
//Estado del servidor
var configStats = function(req, res, next) {
	MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    const db = client.db(dbName);
    getConfig(db,req,res,next, function() {
      client.close();
    });
  });
  };
  /* Conexiones a mongoDB */
const MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
const assert = require('assert');
const url = 'mongodb+srv://root:uJLzJOjlONYVVZJV@cluster0-m5ujz.mongodb.net/test';
const dbName = 'devology';
//Validacion de estado del servidor
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
    res.json({type:req.session.type,rows:rows,id:req.session.userID});
    callback(rows);
  });
}
const getPerfil = function(db,req,res, callback) {
  // Get the documents collection
  const collection = db.collection('usuario');
  // Find some documents
  collection.find({_id:ObjectID(req.session.userID)}).toArray(function(err, rows) {
    assert.equal(err, null);
    res.json({rows: rows,type:req.session.type});
    callback(rows);
  });
}
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
app.get('/Datainicio',configStats, auth ,function(req,res) {
	MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    const db = client.db(dbName);
    getInicio(db,req,res, function() {
      client.close();
    });
  });
});
app.get('/inicio',configStats, auth ,function(req,res) {
  res.sendFile(__dirname+'/src/home.html')
});
app.get('/dataPerfil',configStats, auth ,function(req,res) {
	MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    const db = client.db(dbName);
    getPerfil(db,req,res, function() {
      client.close();
    });
  });
});
app.get('/perfil',configStats, auth ,function(req,res) {
  res.sendFile(__dirname+'/src/profile.html')
});
app.get('/aptitudes',configStats, auth , isDev,function(req,res) {
	res.sendFile(__dirname+'/src/aptitudes.html');
});
app.get('/get_aptitudes',configStats, isDev,function(req,res) {
	MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    const db = client.db(dbName);
    mongoUtil.getPersonalApt(db,req,res, function() {
    });
  });
});
app.get('/test',configStats, auth ,function(req,res) {
	res.sendFile(__dirname+'/src/exampleVue.html');
});
app.get('/proyectos',configStats, auth ,function(req,res) {
	res.sendFile(__dirname+'/src/projects.html');
});
app.get('/tabs',configStats ,function(req,res) {
	res.sendFile(__dirname+'/src/tabs.html');
});
app.get('/detalles*',configStats ,function(req,res) {
	res.sendFile(__dirname+'/src/detalles.html');
});
app.get('/organizacion', configStats, auth ,function(req,res) {
	res.sendFile(__dirname+'/src/orgs.html');
});
app.get('/dev_data',configStats,function(req,res) {
	MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    const db = client.db(dbName);
    mongoUtil.getDev(db,req,res, function() {
    });
  });
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
app.post('/apt',configStats , isDev ,function(req,res) {
	MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    const db = client.db(dbName);
    mongoUtil.insertAPT(db,req,res, function() {
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
app.set('port', (process.env.PORT || 8888));
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
