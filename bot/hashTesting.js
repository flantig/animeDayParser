const imghash = require('imghash');

async function hasher() {
    const hash1 = await imghash.hash('D:/Pictures/anime shit/puckog.png', 4, 'binary');
    console.log(hash1);

    const hash2 = await imghash.hash('D:/Pictures/anime shit/Screenshot_48.png', 4, 'binary');
    console.log(hash2);

    const hash3 = await imghash.hash('D:/Pictures/anime shit/woollie.png', 4, 'binary');
    console.log(hash3);
}

hasher();