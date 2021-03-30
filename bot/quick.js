global.fetch = require("node-fetch");
const anilist = require('anilist-node');
const al = require("anilist-wrapper");
const aniday = require('../aniday.json');

async function test() {
    const Anilist = new anilist();
    const response = await fetch("https://trace.moe/api/search?url=https://drive.google.com/uc?id=1CqxYPdtHSoHqQhftm29MafcYnMVVvOZ8");
    let data = await response.json()
    //console.log(data);


    const respAni = await Anilist.media.anime(data.docs[0].anilist_id);
    console.log(respAni);
    //console.log(respAni)
}

const fetchPlus = (url, options = {}, retries) =>
    fetch(url, options)
        .then(res => {
            if (res.ok) {
                return res.json()
            }
            if (retries > 0) {
                return fetchPlus(url, options, retries - 1)
            }
            throw new Error(res.status)
        })
        .catch(error => console.error(error.message))

test()

//console.log(aniday[0]);

// fetchPlus(`https://trace.moe/api/search?url=https://aniday.s3.amazonaws.com/Months/August/Aug 20/fU7Ppou.jpg`, {}, 3).then(res => {
//     const Anilist = new anilist();
//     Anilist.media.anime(res.docs[0].anilist_id).then(data => {
//         console.log(data);
//         console.log(data.title.userPreferred);
//         console.log(data.status)
//         console.log(data.episodes)
//         console.log(data.genres)
//         console.log(data.averageScore)
//         //This is really important due to the regex cleaning it up, console.log(data.description.replace(/<br>/g,''));
//     }).catch(err => { console.log(`This is the first catch: ${err}`)})
// }).catch(err => {
//     console.log("It didn't pan out chief...")
//     console.log("All retries have been used...")
//     console.log(err);
// })




