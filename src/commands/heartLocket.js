const fs = require('fs')
const fetch = require('node-fetch')
// const { request } = require('https')
const { By } = require('selenium-webdriver');
const webdriver = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const { file_locations } = require('../config.json')


function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

const txtInputTypeable = '/html/body/div[2]/div[1]/div/div[1]/div[2]/div/div/div/div/table/tbody/tr[2]/td[2]/div/div[1]/div[5]/textarea'                        //text input (w/o selector)
const txtInput = '//*[@id="add_text"]'                                                                                                                          //text input (w/  selector)
const addSelect = '/html/body/div[2]/div[1]/div/div[1]/div[2]/div/div/div/div/table/tbody/tr[1]/td[2]/div[1]/ul/li[1]/a'
const imgInput = '/html/body/div[2]/div[1]/div/div[1]/div[2]/div/div/div/div/table/tbody/tr[1]/td[2]/div[1]/div[1]/table/tbody/tr/td[1]'                        //img input (w/  selector) 

class heartLocket {

    constructor(){
        this.driver = new webdriver.Builder().forBrowser('firefox').setFirefoxOptions(new firefox.Options().headless(true)).build();
        //this.driver = new webdriver.Builder().forBrowser('firefox').build();
        this.site = this.driver.get('https://makesweet.com/my/heart-locket');
        this.path = ''
    }

    async convertArgs(ctx){

        await ctx.editReply('converting args...')

        //check if the arguments are used correctly
        const txt1 = ctx.options.getString('text')!=null
        const txt2 = ctx.options.getString('text2')!=null
        const img1 = ctx.options.getAttachment('image')!=null
        const img2 = ctx.options.getAttachment('image2')!=null
        const added = txt1+txt2+img1+img2

        //check if there is more then 2 args
        if( added >= 3 ){
            await ctx.editReply('you can only use 2 perameters!')
            return false
        } else {

            //parse out the args
            let return_data = []
            
            if(txt1){
                return_data.push({"txt":ctx.options.getString('text')})
            } 

            if(txt2){
                return_data.push({"txt":ctx.options.getString('text2')})
            }

            //download the images
            if(img1){

                const filetype = ctx.options.getAttachment('image').name.split('.')[1]

                const file_name = String(Math.round(Math.random() * 1000000)) + '.' +filetype 
                const download_path = file_locations.locketTempFolder + file_name

                fetch(ctx.options.getAttachment('image').url).then(res =>
                    res.body.pipe(fs.createWriteStream(download_path))
                )

                return_data.push({"img":download_path})
            }

            if(img2){
                const filetype = ctx.options.getAttachment('image2').name.split('.')[1]

                const file_name = String(Math.round(Math.random() * 1000000)) + '.' +filetype 
                const download_path = file_locations.locketTempFolder + file_name

                fetch(ctx.options.getAttachment('image2').url).then(res =>
                    res.body.pipe(fs.createWriteStream(download_path))
                )

                return_data.push({"img":download_path})
            }

            return return_data
        }


    }

    async makeLocket(ctx, convert){

        await ctx.editReply('making locket...')

        for( let i in convert ){
            const curr = convert[i]

            //check if its text
            if( curr.txt ){
                await ctx.editReply('adding text...')
                await this.addText(curr.txt)
            
            } else { //if its an image
                await ctx.editReply('adding image...')

                //replace all / with \\ (i do not like regex)
                let new_path = curr.img
                while( true ){
                    if(new_path.includes('/')){
                        new_path = new_path.replace('/', '\\')
                    } else {
                        await this.addImage(new_path)
                        break
                    }
                }
            }

        }

        await ctx.editReply('exporting... (this may take up to 30 seconds)')
        const url = await this.export()
        await ctx.editReply(url)
    }

    async addText(text){

        //check if the selector is there
        try {

            //if it is click the slector
            await this.driver.findElement(By.xpath(addSelect)).click()
            await sleep(1000)

            //then click the add text
            await this.driver.findElement(By.xpath(txtInput)).click()
            await sleep(1000)

            //add the text
            await this.driver.findElement(By.xpath(txtInputTypeable)).sendKeys(String(text))
            await sleep(1000)

        } catch {

            //click the add text button
            await this.driver.findElement(By.id('add_text')).click()
            await sleep(1000)

            //input the text
            await this.driver.findElement(By.xpath(txtInputTypeable)).sendKeys(String(text))

        }

    }

    async addImage(path){

        try {

            console.log('selector')

            //with selector
            await this.driver.findElement(By.xpath(addSelect)).click()
            await sleep(1000)

            console.log('selector2')
    
            //click file upload
            let file_upload = await this.driver.findElement(By.xpath(imgInput))
            await file_upload.findElement(By.id('files')).sendKeys(path)
    
        } catch {
            console.log('no selector')

            await sleep(1000)

            //without selector
            let x = await this.driver.findElement(By.xpath('/html/body/div[2]/div[1]/div/div[1]/div[2]/div/div/div/div/table/tbody/tr[1]/td[2]/div[1]/div[1]/table/tbody/tr/td[1]'))
            await x.findElement(By.id('files')).sendKeys(path)            

        }
    }

    async export(){

        //click buttons
        const x = await this.driver.findElement(By.id('wb-animate')).findElement(By.tagName('a'))
        await x.click()
        await sleep(1000)
        await this.driver.findElement(By.id('wb-make-gif')).click()

        //this is totally the most efficent way to check if the thing has rendered
        await sleep(15000)
        await this.driver.findElement(By.id('wb-upload')).click()
        await sleep(2000)

        //get the image from redirect
        const url_parent = await this.driver.findElement(By.xpath('/html/body/div[2]/div[1]/div/div/div[1]/div/div/div/a/img'))
        const url = await url_parent.getAttribute('src')
        this.driver.close()
        return url
    }

}


//there can only be text on both sides
//or
//text on the left image on the right

// async function main(){

//     const driver = new heartLocket(textFirst=true)
    
//     await sleep(4000)
//     // await driver.addText('this is a test')
//     // await driver.addText('this is a test')

//     await driver.addImage('C:\\Users\\USER\\visual_studio_code\\uhh\\chromeDriver\\toll.jpg')
//     // const x = await driver.export()
//     // console.log(x)

// }

module.exports = { heartLocket }