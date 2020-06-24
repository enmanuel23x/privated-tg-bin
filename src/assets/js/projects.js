let available_developers;

let jokes = [];
let dev_names = [];


async function f(url) {
    let respuesta = await fetch(url)
    let json = await respuesta.json();

    return  json
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
        python: 0,
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

        org_id: "",

        project_name: "",
        project_desc : ""


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
            let skill_names = ["python", "java", "cpp", "php", "c", "ruby", "objective", "golang", "visual",
                "scala", "sql", "nosql", "kotlin", "r", "swift", "clojure", "perl", "rust"]
            let success = [], evalued=[];
            let res_info = await this.connectionToAPI();
            console.log(res_info)
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
            console.log(evalued)
            console.log("Poject created button pressed")
            for (let i = 0; i < available_developers.length; i++) {
                vm.$data.dev_ids.push(available_developers.devs[i].id_usuario)
            }
            vm.$data.org_id = available_developers.devs[0].id_organizacion


            // Dev IDS
            console.log(vm.$data.dev_ids)
            // Org ID
            console.log(vm.$data.org_id)


            let metrics = this.getProjectReqs();
            let indexes = [];
            for (let i = 0; i < metrics.length; i++) {
                if (metrics[i] !== 0){
                    indexes.push(i)
                }
            }
            console.log(indexes)
            let reqs = []
            for (let i = 0; i < indexes.length; i++) {
                reqs.push([skill_names[indexes[i]], metrics[indexes[i]]])
            }
            console.log(reqs)



        },

        testing(){
            console.log("ok")
            // console.log(vm.$data.selected)
            console.log(vm.$data.rows)
        },

        testing2(){

            // Nombre y descripcion obtenida
            console.log(vm.$data.project_name)
            console.log(vm.$data.project_desc)
        }

    },
    created(){
        let timerInterval
        Swal.fire({
            title: 'Espera un segundo',
            html: ' Buscando desarrolladores diponibles...',
            timer: 5000,
            timerProgressBar: true,
            onBeforeOpen: () => {
                let currenObj = this;
                axios.get('/dev_data', {
                }).then(function (response) {
                    available_developers = response.data;
                    currenObj.$data.type=response.data.type;
                    currenObj.$data.admin_id=response.data.admin_id;
                    console.log("ok")
                    console.log(available_developers)
                    console.log(vm.$data.dev_ids)
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
                console.log('I was closed by the timer')
            }
        })
    }
});
