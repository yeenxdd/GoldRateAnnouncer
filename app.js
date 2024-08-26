require('dotenv').config();

const schedule = require('node-schedule');
const express = require('express');
const app = express();

const desiredValue = 2150;
const redColor = 16711680;
const greenColor = 65280;

// open time Sunday 6pm ET to Friday 5pm ET, with 60 minute break every day from 5pm ET to 6pm ET
//  translate time to GMT+8 = Monday 6am to Saturday 5am, break between 5am to 6am
// if market is open, schedule task every minute
const job = schedule.scheduleJob('*/2 6-23 ? * 1-5', scheduleTask);
const job2 = schedule.scheduleJob('*/2 0-4 ? * 2-6', scheduleTask)

function scheduleTask() {
    processGoldRate();
}

// middleware for request
async function processGoldRate() {
    const res = await fetchGoldPrice();
    const priceAtTime = await extractGoldPrice(res);
    const color = priceAtTime[0] <= desiredValue ? greenColor : redColor;
    pingDiscord(priceAtTime, color);
}

// fetch gold price
function fetchGoldPrice() {
    return fetch('https://data-asg.goldprice.org/dbXRates/USD');
}

async function extractGoldPrice(res) {
    const data = await res.json();

    return [data.items[0].xauPrice, data.date];
}

function pingDiscord(priceAtTime, color) {
    // prepare message
    payload = {
        "username": "test",     // agent username
        "embeds": [
            {   // agent content
                "title": `Price: ${priceAtTime[0]}\n Desired rate:${desiredValue} \n :clock1: ${priceAtTime[1]} \n Fired at ${new Date()}`,
                "color": `${color}`
            }
        ]
    }
    // post message
    fetch(process.env.webhook, {
        headers: { 'Content-Type': 'application/json' },
        method: "POST",
        body: JSON.stringify(payload)
    })
}
module.exports = app;