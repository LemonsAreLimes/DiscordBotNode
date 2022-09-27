var https = require('https');
var xmltojson = require('xml-js')
const deepai = require('deepai')
const { GoogleApiKey } = require('../config.json')

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

        deepai.setApiKey(GoogleApiKey)
        var res = await deepai.callStandardApi("deepdream", {image:url})

        return res.output_url
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



