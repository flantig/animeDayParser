const fetch = require('node-fetch');

const grabDays = async () => {
    await fetch("http://www.animetodayme.me/todayAll")
        .then(async response => await response.json())
        .then(out => out.posts.forEach(x => console.log(x.imgUrl)))
}

grabDays();
