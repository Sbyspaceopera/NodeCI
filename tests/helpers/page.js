//Here we using javascript Porxy for customize the puppeteer Page class
const puppeteer = require('puppeteer')
const sessionFactory = require('../factories/sessionFactory')
const userFactory =  require('../factories/userFactory')

//CustomPage name is using for clarity purposes, better call it Page for projects
class CustomPage {
    static async build(){
        const browser = await puppeteer.launch({
            headless: true,
            args:['--no-sandbox']
        });

        const page = await browser.newPage()

        const customPage = new CustomPage(page)

        return new Proxy(customPage, {
            get: function(target, property){
                //Proxy's properties will be use in the order of that return statement (in this case customPage then browser and finally page)
                return customPage[property] ||  browser[property] || page[property]
            }
        })
    }

    constructor(page){
        this.page = page
    }

    async login() {
        //Create a cookie based session (look the facotories files for more details)
        const user = await userFactory()
        const {session, sig} = sessionFactory(user)
        
        const cookies = [{name: 'express:sess', value: session},{name: 'express:sess.sig', value: sig}]
        await this.page.setCookie(...cookies)       
        await this.page.goto('http://localhost:3000/blogs')
        // The test run for selecting the 'a[href="/auth/logout"]', it doesn't exist yet in the 'browser'. So we call the waitFor function for pausing the test until the element appear
        await this.page.waitFor('a[href="/auth/logout"]')
    }

    //Customize function for get contents
    async getContentsOf(selector){
        return this.page.$eval(selector, el => el.innerHTML)
    }

    get(path){
        return this.page.evaluate(
            (_path) => {
                return fetch(_path, {
                    method: 'GET',
                    credential: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then(res => res.json())
            },
            path
        )
    }

    post(path, data){
        return this.page.evaluate(
            (_path, _data) => {
                return fetch(_path, {
                    method: 'POST',
                    credential: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(_data)
                }).then(res => res.json())
            },
            path, data
        )
    }

    //This method take the 'actions' in 'blog.test.js' and execute all the request for us.
    execRequests(actions) {
        //Promise.all will return an array composed by the results of our requests.
        return Promise.all(
          actions.map(({ method, path, data }) => {
              //Magic here, we call the 'method' we define in our array (corresponding to this class) with some arguments. No matter if some arguments are not used in some methods
            return this[method](path, data);
          })
        );
      }
}

module.exports = CustomPage;