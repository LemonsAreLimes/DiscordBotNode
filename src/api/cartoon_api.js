const { exec } = require("child_process");


class KimCartoonApi {

    constructor(){
        this.return_data
        this.isBigList
    }

    async get_search_results(query){

        console.log('called')

        exec(`python -c "import kimcartoon; kimcartoon.get_search_results('${query}')"`, (a, res, c) => {

            const data = JSON.parse(res)
            this.return_data = data
        })
     
    }
    
    async get_episodes(season){
    
        exec(`python -c "import kimcartoon; kimcartoon.get_episodes('${season}')"`, (a, res, c) => {
    
            this.return_data = JSON.parse(res)

        })
    
    }
    
    async video_link(episode){
    
        exec(`python -c "import kimcartoon; kimcartoon.get_video('${episode}')"`, (a, res, c) => {
    
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