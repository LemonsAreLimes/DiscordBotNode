var https = require('https');
var xmltojson = require('xml-js')
const deepai = require('deepai')
const { exec } = require("child_process");
const { keys, file_locations } = require('../config.json')

class apis {

    constructor(){
        this.return_data = null
    }

    
    rule34(query){
    
        this.return_data = null

        https.get(`https://api.rule34.xxx//index.php?page=dapi&s=post&q=index&tags=${query}`, (res) => {
        
            //i just folowed a tutorial i dont exactly know what this does, it works tho!
            let data = ''
            res.on('data', (chunk) => {data += chunk});

            //when the response is done
            res.on('end', () => {
            
                //parse out the response
                let post_list = xmltojson.xml2js(data).elements[0].elements

                //extract image links
                let images = []
                for (let post in post_list){ images.push(post_list[post].attributes.file_url) }  

                //set as return data bc callback hell
                this.return_data = images
            });
        });
    }
    e621(query){

        this.return_data = null
        const path = '/posts.json?tags='+ query

        const options = {
            hostname: 'e621.net',
            path: path,
            method: 'GET',
            headers: {'User-Agent': 'roboAPI/1.0 robocough'}
          };

        https.get(options, (res) => {
        
            let data = ''
            res.on('data', (chunk) => { data += chunk });
            
            res.on('end', () => {

                let post_list = JSON.parse(data).posts
                let images = []
                for (let post in post_list){ 
                    if (post_list[post].file.url != null){
                        images.push(post_list[post].file.url) 
                    }
                }

                //set as return data bc callback hell
                this.return_data = images
            });
        });
    }
    async deepDream(url){

        console.log('called')

        this.return_data = null

        deepai.setApiKey(keys.GoogleApiKey)
        var res = await deepai.callStandardApi("deepdream", {image:url})

        return res.output_url
    }

    async kcGetRequest(request_id, value=null){

        //read file
        const KC_log = require(file_locations.KimCartoon_log)

        //find the request id
        for ( let i in KC_log ){

            //find the value
            if (KC_log[i].id == request_id){

                if (value != null){
                    return KC_log[i].data[value].link
                } else {
                    return KC_log[i].data
                }
                
            }


        }

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

module.exports = {apis}

// function sleep(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms));
// }

// //r34 tags: spaces to differ
// //e621 tags: + to differ


// async function caller(){
    
//     const api = new apis
//     api.e621('gay+cum')

//     await sleep(1500)
//     console.log(api.return_data)
// }

// caller()



