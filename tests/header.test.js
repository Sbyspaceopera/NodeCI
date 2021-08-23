// CLASSICAL APPROACH FOR INTEGRATION TESTING
// 1) Launch application
// 2) Navigate to app
// 3) Click on stuff on screen
// 4) Use a DOM selector to retrieve the content of an element
// 5) Write assertion to make sure content is correct
// 6) Repeat
const mongoose = require('mongoose')
const Page = require('./helpers/page')
jest.setTimeout(50000)
let page;

//will be executed before each test
beforeEach(async () => {
    //1
    page = await Page.build()
    //2
    await page.goto('http://localhost:3000')
})

//will be executed after each test
afterEach(async () => {
    await page.close()
})

//will be executed after all test
afterAll( () => {
    mongoose.connection.close()
    }
)

test('Logo has the correct text', async () => {
    //Don't need the 3 phase for this test
    //4
    //Puppeteer style commented, using a customize for clear reading/writing purposes
    //const text = await page.$eval('a.left.brand-logo', el => el.innerHTML)
    const text = await page.getContentsOf('a.left.brand-logo')

    expect(text).toEqual('Blogster')
})

test('clicking login start oAuth flow', async () => {
    const login = await page.click('.right a')
    const url = await page.url()

    expect(url).toMatch(/accounts\.google\.com/)
})

test('When signed in, shows logout button', async () =>{
    //See 'page.js' in the 'helpers' folder
    await page.login()
    //Now we really testing the logout
    const text = await page.$eval('a[href="/auth/logout"]', el => el.innerHTML)

    expect(text).toEqual('Logout')

})
