devs= [
    {
      _id: "5e2e47c2f955e6375c1b863e",
      id_usuario: "5e2deed5ab99350b1072e784",
      nombres: 'Enmanuel Jose Dev',
      id_organizacion: "5e2dea08ab99350b1072e782",
      rol: 4,
      activo: 1
    },
    {
      _id: "5e2e55b61e86f02cec7dcd3c",
      id_usuario: "5e2e35abe3c151362cc7e3c1",
      nombres: 'Jose Manuel Lopez Blanco',
      id_organizacion: "5e2dea08ab99350b1072e782",
      rol: 4,
      activo: 1
    }
  ]
ID_devs = [
    [
      {
        _id: "5e2f9e8723b8002e04fae18f",
        id_usuario: "5e2deed5ab99350b1072e784",
        dev_quality: 45,
        dev_exp: 45,
        dev_on_time: 45,
        team_chemistry: 45,
        dev_errors: 45,
        exp_python: '55',
        exp_java: '69',
        exp_cpp: '45',
        exp_php: '20',
        exp_c: '38',
        exp_ruby: '2',
        exp_objective: '10',
        exp_go: '20',
        exp_visual: '49',
        exp_scala: '10',
        exp_sql: '68',
        exp_nosql: '64',
        exp_kotlin: '45',
        exp_r: '0',
        exp_swift: '0',
        exp_clojure: '0',
        exp_perl: '15',
        exp_rust: '0',
        exp_html_css: '60',
        exp_js: '78'
      }
    ],
    [
      {
        _id: "5e2ec9632a531c016441b70f",
        id_usuario: "5e2ec9482a531c016441b70e",
        dev_quality: 45,
        dev_exp: 45,
        dev_on_time: 45,
        team_chemistry: 45,
        dev_errors: 45,
        exp_python: '39',
        exp_java: '30',
        exp_cpp: '0',
        exp_php: '0',
        exp_c: '0',
        exp_ruby: '0',
        exp_objective: '0',
        exp_go: '90',
        exp_visual: '0',
        exp_scala: '0',
        exp_sql: '0',
        exp_nosql: '58',
        exp_kotlin: '0',
        exp_r: '0',
        exp_swift: '0',
        exp_clojure: '0',
        exp_perl: '0',
        exp_rust: '63',
        exp_html_css: '81',
        exp_js: '70'
      }
    ],
    [
      {
        _id: "5e2e55ab1e86f02cec7dcd38",
        id_usuario: "5e2e35abe3c151362cc7e3c1",
        dev_quality: 45,
        dev_exp: 50,
        dev_on_time: 45,
        team_chemistry: 45,
        dev_errors: 45,
        exp_python: '62',
        exp_java: '0',
        exp_cpp: '0',
        exp_php: '0',
        exp_c: '0',
        exp_ruby: '0',
        exp_objective: '0',
        exp_go: '0',
        exp_visual: '0',
        exp_scala: '0',
        exp_sql: '0',
        exp_nosql: '0',
        exp_kotlin: '0',
        exp_r: '0',
        exp_swift: '66',
        exp_clojure: '0',
        exp_perl: '0',
        exp_rust: '0',
        exp_html_css: '75',
        exp_js: '55'
      }
    ]
  ]
let ID_devs2 = []
  for(let i = 0; i<devs.length;i++){
    for(let j = 0; j<ID_devs.length;j++){
      if(ID_devs[j][0].id_usuario == devs[i].id_usuario){
        ID_devs2.push(ID_devs[j][0])
      }
    }
  }
  console.log("-------------------------------")
  console.log(ID_devs2)