let available_developers;

const vm = new Vue({
    el: '#projects',
    data: {
        type:2,
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
        javascript: 0
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
        sidebar(){
            $("#wrapper").toggleClass("toggled");
        },
        filterReqs(){
            let reqs = [];
            reqs.push(
                this.python, this.java, this.cpp, this.php, this.c, this.ruby, this.objective, this.golang, this.visual,
                this.scala, this.sql, this.nosql, this.kotlin, this.r, this.swift, this.clojure, this.perl, this.rust,
                this.javascript
            );
            let filtered = reqs.filter((value, index, arr)=>{
                return value >= 5
            });
            let sum = 0;
            for (let i = 0; i < filtered.length; i++) {
                sum += parseInt(filtered[i])
            }
            return sum / filtered.length;
        },

        checkDevelopers(){
            return available_developers.apt[0]

        },
        createProject(){

            console.log(this.checkDevelopers())
        }
    },
    created(){
        let currenObj=this
        axios.get('/dev_data', {
        }).then(function (response) {
            available_developers = response.data;
            currenObj.$data.type=response.data.type
            console.log("ok")
        }).catch(function (error) {
                console.log(error)
            });

    }
});
