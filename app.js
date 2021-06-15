//---- IMPORTS -----

// Import express and axios packages
const express = require('express')
const axios = require('axios')
// Import dotenv to read environment variables from .env file
require('dotenv').config() 
// Import customer.io package for the Track API
const CIO = require('customerio-node');
const { RegionUS } = require("customerio-node/regions");
// Creating new instance of Customer IO and passing in the API key and site ID as environment variables
const cio = new CIO(process.env.TRACK_API_SITE_ID, process.env.TRACK_API_KEY, { region: RegionUS });
//Importing attributes structure 
const attributes_structure = require('./attributes.js');

//------ APP -------

app = express(); //Creating new Express app
app.use(require('sanitize').middleware); // Sanitize middleware for user form input values
app.set('view engine', 'ejs'); //EJS: Templating language to build dynamic front-end
app.use(express.json()); //Used to parse JSON bodies
app.use(express.urlencoded()); //Parse URL-encoded bodies

//---- FUNCTIONS ----

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function wait_for_update (customerId, attributes){

    let wait_for_update = []
    
    do {

        wait_for_update = []

        // call customer io to retrieve user attributes with this email
        const customerio_attributes = await axios({
            method: 'get',
            url: `https://beta-api.customer.io/v1/api/customers/${customerId}/attributes`,
            headers: {
                "Authorization": `Bearer ${process.env.APP_API_KEY}`
                // make sure that the API keys of customer io are environment variables
            }
        })// add error handling to all api requests
        let data = customerio_attributes.data.customer.attributes

        for (item in attributes) {
            if(attributes[item] != data[item]){
                wait_for_update.push(item)
            }
        }

        await sleep(1000);

    } while(wait_for_update.length != 0)
}

// ----- ROUTES ------

// Subscription settings main page
app.get('/', async (req,res) => {

    // Retrieving and sanitizing the request query values
    let customerId = req.queryString('customerId')
    let deliveryId = req.queryString('deliveryId')

    try {
        // Generating a new attributes structure array and creating a new map from it
        let structure = attributes_structure()
        let attributes = new Map(structure);
        
        // Retrieve customer attributes from customer.io profile
        const customerio_attributes = await axios({
            method: 'get',
            url: `https://beta-api.customer.io/v1/api/customers/${customerId}/attributes`,
            headers: {
                "Authorization": `Bearer ${process.env.APP_API_KEY}`
            }
        }).catch((error) => {
            throw 'axios() -> ' + error
        })
        // Accessing the actual attribute values from the response data of the request
        let attribute_values = customerio_attributes.data.customer.attributes

        // Adding the retrieved attribute values to the attributes map (only the ones that have been defined in the attribute structure)
        for (key in attribute_values){
            if(attributes.has(key)){
                attributes.get(key).value = attribute_values[key]
            }
        }

        // Adding the meta data attributes values to the attributes map
        attributes.set('customerId', customerId)
        attributes.set('deliveryId', deliveryId)
        attributes.set('unsubscribed', attribute_values.unsubscribed)

        // Creating an array with all the different sections that the landing page with include
        let sections = []
        for (value of attributes.keys()){
            let section = attributes.get(value)
            // Only adding a section value for the attributes that have a defined section in attributes.js
            if ((section != undefined) && (section.section != undefined)){
                if(!sections.includes(section.section)){
                    sections.push(section.section)
                }
            }
        }
        
        //Rendering the 'index.ejs' page and providing the attribute and section values
        return res.render('index', { attributes:attributes, sections:sections })

    } catch (error) {
        // Console log the error received
        console.log('Error: -> GET / ' + error)
        // Redirect user to the error page
        return res.redirect('/update/error')
    } 

})

// Subscription update POST route
app.post('/update', async (req,res) => {

    // Retrieving the data from the request body
    let received_data = req.body

    //Creating variables for the meta data values
    let customerId = received_data.customerId
    let deliveryId = received_data.deliveryId
    let unsubscribed = received_data.unsubscribed

    // Generating a new attributes structure array and creating a new map from it
    let structure = attributes_structure()
    let attributes = new Map(structure);

    // Object that will store the key:value pairs that will be sent to customer.io to update the customer attributes
    let attributesObject = {}

    // Iterating over the attributes map entries 
    for(let [key, value] of attributes.entries()){
        // Checking that the form input field value that has the same key name as the current map key in the iterator, is not equal to undefined 
        if (received_data[key] != undefined){
            // Changing the checkbox field values from 'on' to 'true'
            if (value.type == 'checkbox' && received_data[key] == 'on'){
                attributesObject[key] = 'true'
            } else {
                attributesObject[key] = received_data[key]
            }
        // If the form field value is equal to undefined then its key inside the attributes object will be equal to null
        } else {
            attributesObject[key] = null
        }
    }

    try {
        //Conditional statement to either unsubscribe or re-subscribe a customer
        if (unsubscribed == 'on'){
            // If 'unsubscribed'checkbox is checked unsubscribe the customer
            await axios({
                method: 'post',
                url: `https://track.customer.io/unsubscribe/${deliveryId}`,
                headers: {
                    "Authorization": "Bearer 5178047e48ac17bc1e772a5bb6c09a36"
                },
                data:{
                    unsubscribe: true
                }
            }).catch((error) => {
                throw 'axios() unsubscribe -> ' + error
            })
            // Update customer attributes on customer.io profile
            await cio.identify(customerId, attributesObject).catch((error) => {
                throw 'cio.identify() unsubscribe -> ' + error
            })

            // Wait for the attribute values to be successfully updated before redirecting the user
            await wait_for_update(customerId, attributesObject).catch((error) => {
                throw 'wait_for_update() -> ' + error
            })

            // Redirect user to unsubscribed success page
            return res.redirect(`/update/unsubscribed?customerId=${customerId}&deliveryId=${deliveryId}`)

        } else {
            // If 'unsubscribed'checkbox is not checked, re-subscribe the customer by setting the 'unsubscribed' attribute to null
            attributesObject.unsubscribed = null
        }

        // Update customer attributes on customer.io profile
        await cio.identify(customerId, attributesObject).catch((error) => {
            throw 'cio.identify() -> ' + error
        })

        // Wait for the attribute values to be successfully updated before redirecting the user
        await wait_for_update(customerId, attributesObject).catch((error) => {
            throw 'wait_for_update() -> ' + error
        })

        // Redirect user to update success page
        return res.redirect(`/update/success?customerId=${customerId}&deliveryId=${deliveryId}`)

    } catch (error){
        // Console log the error received
        console.log('Error: -> POST /update ' + error)
        // Redirect user to the error page
        return res.redirect('/update/error')
    }

})

// Render update success page
app.get('/update/success', async (req,res) => {
    let customerId = req.query.customerId
    let deliveryId = req.query.deliveryId
    res.render('updated', {customerId: customerId, deliveryId: deliveryId})
})

// Render unsubscribed success page
app.get('/update/unsubscribed', async (req,res) => {
    let customerId = req.query.customerId
    let deliveryId = req.query.deliveryId
    res.render('unsubscribed', {customerId: customerId, deliveryId: deliveryId})
})

// Render error page
app.get('/update/error', async (req,res) => {
    res.render('error')
})

// ----- SERVER ------

// Listen for requests on specified port
app.listen(8080, () => {
    console.log(`App listening at port 8080`)
})
