const {google} = require('googleapis');


const credentials = require('../googleAPI/credentials.json');

const scopes = [
    'https://www.googleapis.com/auth/drive'
];
const auth = new google.auth.JWT(
    credentials.client_email, null,
    credentials.private_key, scopes
);
const drive = google.drive({version: "v3", auth});

async function listFiles() {
    const drive = await google.drive({version: 'v3', auth});
    const day = 'Jan 01'
    let res = await drive.files.list({
        q: `name = "${day}"`,
        pageSize: 10,
        fields: 'files(name, id)',
        orderBy: 'createdTime desc'
    });

    const id = await res.data.files[0].id;

    let dayFiles = await drive.files.list({
        q: `"${id}" in parents`,
        fields: 'files(name, webViewLink, webContentLink, id)',

    })


    for (let i = 0; i < dayFiles.data.files.length; i++) {
        dayFiles.data.files[i].webContentLink = dayFiles.data.files[i].webContentLink.slice(0, -16);
    }


    console.log(res.data);

    console.log(dayFiles.data);

}

listFiles();