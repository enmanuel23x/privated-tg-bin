let available_developers;

let jokes = [];
let dev_names = [];


async function f(url) {
    let respuesta = await axios.get(url)

    return  respuesta.data
}


const vm = new Vue({
    el: '#projects',
    components: {
        'carousel': VueCarousel.Carousel,
        'slide': VueCarousel.Slide
      },
    data: {
        admin_id: 0,
        rows:[],
        type:null,
        // Automatic or manually
        mode: null,
        // Languages
        python: 10,
        java: 0,
        cpp: 0,
        php: 0,
        c: 0,
        ruby: 0,
        objective: 0,
        golang: 0,
        visual: 0,
        scala: 0,
        sql: 0,
        nosql: 0,
        kotlin: 0,
        r: 0,
        swift: 0,
        clojure: 0,
        perl: 0,
        rust: 0,
        javascript: 0,
        html_css: 0,
        info: [],
        showModal: false,
        test:[],
        selected: [],
        dev_ids: [],
        userID: 0,
        org_id: "",

        project_name: "",
        project_desc : "",
        id_organizacion: "",
        projectsRows: [],
        global_reqs: [],

        radio_btn1: false,
        radio_btn2: false,
        radio_btn3: false,
        devs:[]


    },
    mounted(){
        const settings={
            fill: '#1abc9c',
            background: '#d7dcdf'
            }
        const sliders = document.querySelectorAll('.range-slider');
        Array.prototype.forEach.call(sliders,(slider)=>{
            slider.querySelector('input').addEventListener('input', (event)=>{
                slider.querySelector('span').innerHTML = event.target.value;
                applyFill(event.target);
                });
            applyFill(slider.querySelector('input'));
            });
        function applyFill(slider) {
            const percentage = 100*(slider.value-slider.min)/(slider.max-slider.min);
            const bg = `linear-gradient(90deg, ${settings.fill} ${percentage}%, ${settings.background} ${percentage+0.1}%)`;
            slider.style.background = bg;
            }
    },
    methods: {
        overlayActivator(n){
            if(n==1){
              document.getElementById("Nooverlay").style.opacity = "0.3";
              document.getElementById("overlay").style.opacity = "1";
              document.getElementById("Nooverlay").style.pointerEvents = "none";
              document.getElementById("overlay").style.pointerEvents= "auto";
            }else{
              document.getElementById("Nooverlay").style.opacity = "1";
              document.getElementById("overlay").style.opacity = "0";
              document.getElementById("Nooverlay").style.pointerEvents = "auto";
              document.getElementById("overlay").style.pointerEvents= "none";
            }
          },
        sidebar(){
            $("#wrapper").toggleClass("toggled");
        },


        getNotZerosIndex(arr){
            let indexes = [];
            for (let i = 0; i < arr.length ; i++) {
                if (arr[i] !== 0) {
                    indexes.push(i)
                }
            }
            // console.log(arr)
            // console.log(indexes)
            return indexes
        },


        getDevSkills(skills){
            let sk = [];
            let sum = 0;
            let indexes = this.getNotZerosIndex(this.getProjectReqs());
            // console.log(skills)
            for (let i in indexes) {
                sk.push(skills[i]);
                sum += parseInt(skills[i]);
            }
            return sum / sk.length
        },


        getProjectReqs(){
            let arr = [];

            // Aqui quedaste alejandro, recuerda terminar de modificar esta funcion


            arr.push(
                this.python, this.java, this.cpp, this.php, this.c, this.ruby, this.objective, this.golang, this.visual,
                this.scala, this.sql, this.nosql, this.kotlin, this.r, this.swift, this.clojure, this.perl, this.rust
            );
            return arr
        },

        filterReqs(arr){
            let filtered = arr.filter((value, index, arr)=>{
                return value >= 5
            });
            let sum = 0;
            for (let i = 0; i < filtered.length; i++) {
                sum += parseInt(filtered[i])
            }
            return sum / filtered.length;
        },


        checkDevelopers(){
            let dev_apt = [];
            let apt_req = [];
            let dev_exp = []
            for (let i = 0; i < available_developers.devs.length ; i++) {
                console.log(available_developers)
                let skill = available_developers.apt[i][0];
                vm.$data.dev_ids.push(available_developers.devs[i].id_usuario)

                dev_exp.push(
                    skill.exp_python, skill.exp_java, skill.exp_cpp, skill.exp_php, skill.exp_c, skill.exp_ruby,
                    skill.exp_objective, skill.exp_go, skill.exp_visual, skill.exp_scala, skill.exp_sql,
                    skill.exp_nosql, skill.exp_kotlin, skill.exp_r, skill.exp_swift,
                    skill.exp_clojure, skill.exp_perl, skill.exp_rust, skill.exp_html_css
                );

                dev_names.push(available_developers.devs[i].nombres);
                dev_apt.push([
                    available_developers.apt[i][0].dev_quality,
                    available_developers.apt[i][0].dev_on_time,
                    available_developers.apt[i][0].team_chemistry,
                    this.getDevSkills(dev_exp),
                    this.filterReqs(this.getProjectReqs()),


                ]);
                dev_exp = []
            }

            apt_req.push(dev_apt);
            return apt_req
        },
        async connectionToAPI(){
            let info_devs = this.checkDevelopers()[0];
            jokes= [];
            // console.log(info_devs.length)
            for (let i = 0; i < info_devs.length; i++) {
                let qy = info_devs[i][0];
                let tms = info_devs[i][1];
                let tch = info_devs[i][2];
                let sk = info_devs[i][3];
                let rqs = info_devs[i][4];
                let url = "https://cors-anywhere.herokuapp.com/http://dev-performance.herokuapp.com/?model=1&arg1="+qy+"&arg2="+tms+"&arg3="+tch+"&arg4="+sk+"&arg5="+rqs+"&arg6="+i+"";
                jokes.push(await f(url))
            }
            return jokes
        },
        async createProject(){
            vm.$data.project_desc = ""
            vm.$data.project_name = ""
            let skill_names = ["python", "java", "cpp", "php", "c", "ruby", "objective", "golang", "visual",
                "scala", "sql", "nosql", "kotlin", "r", "swift", "clojure", "perl", "rust"]
            let success = [], evalued=[];
            let res_info = await this.connectionToAPI();
            //console.log(res_info)
            for (let i = 0; i < res_info.length ; i++) {
                evalued.push({name:dev_names[i], status:res_info[i].result})
                if (res_info[i].result === "1"){
                    success.push({name:dev_names[i], status:res_info[i].result})
                }
            }
            vm.$data.rows=evalued
            // vm.overlayActivator(1)
            vm.$data.showModal = true;
            this.test = evalued
            //console.log(evalued)
            //console.log("Poject created button pressed")
            for (let i = 0; i < available_developers.length; i++) {
                vm.$data.dev_ids.push(available_developers.devs[i].id_usuario)
            }


            // Dev IDS
            //console.log(vm.$data.dev_ids)
            // Org ID
            //console.log(vm.$data.org_id)


            let metrics = this.getProjectReqs();
            let indexes = [];
            for (let i = 0; i < metrics.length; i++) {
                if (metrics[i] !== 0){
                    indexes.push(i)
                }
            }
            //console.log(indexes)
            let reqs = []
            for (let i = 0; i < indexes.length; i++) {
                reqs.push([skill_names[indexes[i]], metrics[indexes[i]]])
            }
            vm.$data.global_reqs = reqs
            //console.log(reqs)



        },

        predictSuccess(){
            Swal.mixin({
                input: 'text',
                confirmButtonText: 'Next &rarr;',
                showCancelButton: true,
                progressSteps: ['1', '2', '3']
            }).queue([
                {
                    title: 'Experiencia',
                    text: 'Experiencia de Manager del equipo',
                    input: 'select',
                    inputOptions: {
                        1: 'Muy Baja',
                        2: 'Baja',
                        3: 'Media',
                        4: 'Alta',
                        5: 'Muy Alta',
                        }
                },
                {
                    title: 'Duración del proyecto',
                    text: 'Estimación de la duración del proyecto en dias',
                    input: 'number',
                    inputValue: 0
                },
                {
                    title: 'Entidades',
                    text: 'Estimación de entidades en la base de datos (En el caso de existencia)',
                    input: 'number',
                    inputValue: 0
                },

            ]).then(async (result) => {
                if (result.value) {
                    vm.progress();
                    const answers = result.value
                    const devs = vm.$data.selected.map( (el)=> vm.$data.dev_ids[el])
                    let experience = [];
                    for (let i = 0; i < available_developers.apt.length; i++) {
                        for (let j = 0; j < devs.length; j++) {
                            if (devs[j] === available_developers.apt[i][0].id_usuario){
                               experience.push(available_developers.apt[i][0].dev_exp)
                            }
                        }
                    }
                    let mgr_exp = 0
                    if (answers[0] === "1"){
                        mgr_exp = 5
                    } else if (answers[0] === "2"){
                        mgr_exp = 10
                    } else if (answers[0] === "3"){
                        mgr_exp = 25
                    } else if (answers[0] === "4"){
                        mgr_exp = 35
                    } else if (answers[0] === "5") {
                        mgr_exp = 50

                    }

                    // console.log(experience)
                    // console.log(answers[1])
                    // console.log(answers[2])
                    // console.log(vm.$data.radio_btn1)
                    // console.log(vm.$data.radio_btn2)
                    // console.log(vm.$data.radio_btn3)

                    if (vm.$data.radio_btn1 === null){
                        answers[1] = answers[1] * 1.1
                    }  else if (vm.$data.radio_btn3 === null){
                        answers[1] = answers[1] * 0.9

                    }


                    let total = 0;
                    for (let i = 0; i < experience.length; i++) {
                        total += experience[i];
                    }
                    let avg = total / experience.length;
                    let avg2 = 0;
                    for(let i = 0; i<vm.$data.global_reqs.length;i++){
                        avg2+=vm.$data.global_reqs[i][1];
                    }
                    avg2 = avg2/vm.$data.global_reqs.length
                    let url = "https://cors-anywhere.herokuapp.com/http://dev-performance.herokuapp.com/?model=2&arg1="+avg2+"&arg2="+mgr_exp+"&arg3="+(answers[1]/365)+"&arg4="+answers[2]+"&arg5="+avg+"";
                    let json = await f(url)
                    //Se estimo que el proyecto tendría una duración de 538 horas, contando con los 2 desarrolladores trabajando 8h al dia se estiman 34 dias apox
                    Swal.fire({
                        title: 'Se estima un exito',
                        html: `La duracion estimada del proyecto por el usuario es ${answers[1]} dias y el valor predicho es ${json.result} horas,
                        teniendo en cuenta que se tienen ${experience.length} desarrolladores se tardarian ${Math.round(((json.result/8)/experience.length) * 100) / 100} dias.
                        Esto basado en el estandar de 8 horas de trabajo al dia.
                        `,
                        showCancelButton: true,
                        confirmButtonText: 'Crear proyecto',
                        cancelButtonText: 'Cancelar'
                    }).then( (res)=>{
                        if (res.value) {
                            vm.insert()
                        }
                    });


                }
            })
        },

        testing(){
            if(vm.mode=='auto'){
                Swal.fire({
                    title: "Alerta",
                      text: "¿Quiere realizar una prediccion del exito del proyecto?",
                      icon: "warning",
                      showCancelButton: true,
                      confirmButtonText: 'Realizar prediccion',
                      cancelButtonText: 'No realizar prediccion'
                }).then((result) => {
                    if (result.value) {
                        //vm.progress();
                        this.predictSuccess()
                            //Primero funcion de prediccion
                            //Aqui modal con la predicion xd
                            //Recuerda dar la opcion de cancelar, que cierre el modal nada mas  ya los datos se reinician

                    }else{
                        vm.insert()
                    }
                  });
            }else{
                vm.insert()
            }
        },
        insert(){
            vm.progress();
            const devs = JSON.stringify(vm.$data.selected.map( (el)=> vm.$data.dev_ids[el]))
            const reqs =JSON.stringify ({python: vm.$data.python, java: vm.$data.java, cpp: vm.$data.cpp,
                        php: vm.$data.php, c: vm.$data.c, ruby: vm.$data.ruby, objective: vm.$data.objective,
                        golang: vm.$data.golang, visual: vm.$data.visual, scala: vm.$data.scala,
                        sql: vm.$data.sql, nosql: vm.$data.nosql, kotlin: vm.$data.kotlin,
                        r: vm.$data.r, swift: vm.$data.swift, clojure: vm.$data.clojure,
                        perl: vm.$data.perl, rust: vm.$data.rust, javascript: vm.$data.javascript, html_css: vm.$data.javascript});
            axios.post('/insertProject', {adminID: vm.$data.admin_id,DevsIDs: devs,name:vm.$data.project_name, description: vm.$data.project_desc, Requeriments: reqs, OrgID:vm.$data.id_organizacion})
                .then((res)=>{
                    Swal.fire({title:"Exito!",text:"Proyecto inicializado con exito",icon:"success"})
                    vm.fillData();
                })
        },
        progress(){
            Swal.fire({
                title: 'Espera un segundo',
				html: 'Procesando...',
				showCancelButton: false,
				showConfirmButton: false,
                timer: 5000,
                timerProgressBar: true
                })
        },
        fillData(){
            let timerInterval
        Swal.fire({
            title: 'Espera un segundo',
            html: 'Evaluando la informacion diponible...',
            timer: 5000,
            timerProgressBar: true,
            onBeforeOpen: () => {
                let currenObj = this;
                axios.get('/dev_data', {
                }).then(function (response) {
                    available_developers = response.data;
                    currenObj.$data.devs = response.data.devs
                    currenObj.$data.type=response.data.type;
                    currenObj.$data.admin_id=response.data.admin_id;
                    currenObj.$data.id_organizacion= response.data.id_organizacion
                    currenObj.$data.userID = response.data.userID
                    axios.get('/getProjects', {
                    }).then(function (res) {
                        vm.$data.projectsRows = res.data.projects;
                    });
                }).catch(function (error) {
                    console.log(error)
                });
                Swal.showLoading()
                timerInterval = setInterval(() => {
                    const content = Swal.getContent()
                    if (content) {
                        const b = content.querySelector('b')
                        if (b) {
                            b.textContent = Swal.getTimerLeft()
                        }
                    }
                }, 250)
            },
            onClose: () => {
                clearInterval(timerInterval)
            }
        }).then((result) => {
            /* Read more about handling dismissals below */
            if (result.dismiss === Swal.DismissReason.timer) {
                //console.log('I was closed by the timer')
            }
        })
        },
        viewProject(project){
            let band = false;
            const keys = Object.keys(JSON.parse(project.Requisitos));
            const ColabsArr = JSON.parse(project.Desarrolladores);
            let Colabs = [];
            for (i=0;i<ColabsArr.length;i++) {
                Colabs.push(available_developers.allDevs.filter( (el)=> el.id_usuario == ColabsArr[i])[0])
            }
            const ReqsArr = JSON.parse(project.Requisitos);
            let Reqs = [];
            for (let [key, value] of Object.entries(ReqsArr)) {
                Reqs.push([key,value])
            }
            Reqs = Reqs.filter( (el)=> el[1]!=0);
            
            const tableColabs = Colabs.map( (el)=> '<tr scope="row"><td>'+el.nombres+'</td></tr>')
            const tableReqs = Reqs.map( (el)=> '<tr scope="row"><td>'+el[0]+'</td><td>'+el[1]+'</td></tr>')
            const tHead1= '<table class="table-hover" style="border:2px solid #545454;margin:auto"><thead  style="border:2px solid #545454;"><tr>',tHead2= '</tr></thead><tbody>',tEnd= '</tbody></table>'
            if(ColabsArr.includes(vm.$data.userID) || project.admin == vm.$data.admin_id){
                band= true;
            }
            Swal.mixin({
                confirmButtonText: 'Siguiente &rarr;',
                showCancelButton: true,
                cancelButtonText: "Cerrar",
                progressSteps: ['1', '2']
              }).queue([
                {
                  title: 'Requisitos',
                  html: tHead1+'<th scope="col">Nombre</th><th scope="col">Nivel(%)</th>'+tHead2+tableReqs+tEnd
                },
                {
                  title: 'Integrantes',
                  html: tHead1+'<th scope="col">Nombre</th>'+tHead2+tableColabs+tEnd,
                  confirmButtonText: 'Ver mas &rarr;'
                }
              ]).then((result) => {
                if (result.value) {
                    if(band){
                        window.location.href = "/detalles/"+project._id
                    }else{
                        Swal.fire({title:"Advertencia",text:"No pertences a este proyecto,\npor lo tanto no tienes acceso a la\nla informacion interna del proyecto",icon:"warning"})
                    }
                }
              })
        },viewProject2(project){
            let band = false;
            const keys = Object.keys(JSON.parse(project.Requisitos));
            const ColabsArr = JSON.parse(project.Desarrolladores);
            let Colabs = [];
            for (i=0;i<ColabsArr.length;i++) {
                Colabs.push(available_developers.allDevs.filter( (el)=> el.id_usuario == ColabsArr[i])[0])
            }
            const ReqsArr = JSON.parse(project.Requisitos);
            let Reqs = [];
            for (let [key, value] of Object.entries(ReqsArr)) {
                Reqs.push([key,value])
            }
            Reqs = Reqs.filter( (el)=> el[1]!=0);
            const tableColabs = Colabs.map( (el)=> '<tr scope="row"><td>'+el.nombres+'</td></tr>')
            const tableReqs = Reqs.map( (el)=> '<tr scope="row"><td>'+el[0]+'</td><td>'+el[1]+'</td></tr>')
            const tHead1= '<table class="table-hover" style="border:2px solid #545454;margin:auto"><thead  style="border:2px solid #545454;"><tr>',tHead2= '</tr></thead><tbody>',tEnd= '</tbody></table>'
            if(ColabsArr.includes(vm.$data.admin_id) || project.admin == vm.$data.admin_id){
                band= true;
            }
            Swal.mixin({
                confirmButtonText: 'Siguiente &rarr;',
                showCancelButton: true,
                cancelButtonText: "Cerrar",
                progressSteps: ['1', '2','3']
              }).queue([
                {
                  title: 'Requisitos',
                  html: tHead1+'<th scope="col">Nombre</th><th scope="col">Nivel(%)</th>'+tHead2+tableReqs+tEnd
                },
                {
                  title: 'Integrantes',
                  html: tHead1+'<th scope="col">Nombre</th>'+tHead2+tableColabs+tEnd,
                  confirmButtonText: 'Ver mas &rarr;'
                },
                {
                  title: 'Total de tareas',
                  text: project.tareas,
                  showCancelButton: false,
                  confirmButtonText: 'Cerrar'
                }
              ])
        }

    },
    created(){
        this.fillData();
    }
});
