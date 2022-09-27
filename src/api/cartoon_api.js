var cmd = require('node-cmd');


class KimCartoonApi {

    constructor(){
        this.return_data
        this.isBigList
    }

    async get_search_results(query){

        cmd.run(`python -c "import kimcartoon; kimcartoon.get_search_results('${query}')"`, (a, res, c) => {

            const data = JSON.parse(res)

            //if the length is over 15 items
            if(data.length > 20){

                console.log('large response')

                //split the list up into x sets of 10 items
                let listy_data = []
                let temp_list = []
                let counter = 0

                for(let i in data){

                    if(counter >= 10){
                        listy_data.push(temp_list)
                        temp_list = []
                        counter = 0
                    }

                    temp_list.push(data[i])
                    counter++
                }

                this.isBigList = true
                this.return_data = listy_data
       
            } else {

                this.isBigList = false
                this.return_data = data

            }
        })
     
    }
    
    async get_episodes(season){
    
        cmd.run(`python -c "import kimcartoon; kimcartoon.get_episodes('${season}')"`, (a, res, c) => {
    
            this.return_data = JSON.parse(res)

        })
    
    }
    
    async video_link(episode){
    
        cmd.run(`python -c "import kimcartoon; kimcartoon.get_video('${episode}')"`, (a, res, c) => {
    
            this.return_data = res

        })
    
    }

}

module.exports = { KimCartoonApi }


// video_link('https://kimcartoon.li//Cartoon/Rick-and-Morty-Season-6/Episode-4?id=105945')
// get_episodes('https://kimcartoon.li/Cartoon/Rick-and-Morty-Season-6')

// function sleep(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms));
// }


// async function main(){
//     const KCapi = new KimCartoonApi()
//     await KCapi.get_search_results('rick and morty')
    
//     await sleep(5000)
//     console.log(KCapi.return_data)

// }

// main()