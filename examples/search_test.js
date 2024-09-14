// Required modules
const ytcog = require('../lib/index');
const fs = require('fs'); // Remove the duplicate declaration of 'fs'
const ut = require('../lib/ut')();

// User editable data
let app = {
    // logged-in cookie string
    cookie: '',
    // browser user agent
    userAgent: '',
    // proxy agent string
    proxy: '',
    // info fields to ignore
    ignore: ['cookie', 'userAgent', 'debugOn', 'options', 'sapisid', 'commentOptions', 'commentOrder', 'status', 'reason', 'cancelled', 'periodExceeded'],
    // Search options
    test_options: {
        // any search term
        query: 'soccer',
        // any, videos, channels, playlists, movies
        items: 'any',
        // relevance, age, views, rating
        order: 'relevance',  // Changed semicolon to comma
        // any, hour, day, week, month, year
        period: 'week',
        // any, short, medium, long
        duration: 'any',
        // number of results to fetch
        quantity: 100,
        // features: live, 4k, hd, subtitles, cc, etc.
        features: '',
    }
};

// Fetch and save search data for videos
async function runVideos(search) {
    console.log(`\n\nSearch for ${app.test_options.quantity} videos with query: "${app.test_options.query}"`);
    await search.fetch();
    console.log('Raw search JSON saved to ./examples/searchVideos.json');
    fs.writeFileSync('./examples/searchVideos.json', ut.jsp(search.data), 'utf8');
    console.log(`\nSearch status: ${search.status} (${search.reason})`);
    if (search.status === 'OK') {
        console.log(`Found ${search.results.length} videos for "${search.options.query}"`);
        let output = {
            search: search.info(app.ignore),
            videos: search.results.map(item => item.info(app.ignore)),
        };
        fs.writeFileSync('./examples/search_videos.json', ut.jsp(output), 'utf8');
    }
}

// Fetch and save search data for playlists
async function runPlaylists(search) {
    console.log('\n\nSearch for 30 playlists');
    await search.fetch({ items: 'playlists', quantity: 30 });
    console.log('Raw search JSON saved to ./examples/searchPlaylists.json');
    fs.writeFileSync('./examples/searchPlaylists.json', ut.jsp(search.data), 'utf8');
    console.log(`\nSearch status: ${search.status} (${search.reason})`);
    if (search.status === 'OK') {
        console.log(`Found ${search.results.length} playlists for "${search.options.query}"`);
        let output = {
            search: search.info(app.ignore),
            playlists: search.playlists.map(item => item.info(app.ignore)),
        };
        fs.writeFileSync('./examples/search_playlists.json', ut.jsp(output), 'utf8');
    }
}

// Fetch and save search data for channels
async function runChannels(search) {
    console.log('\n\nSearch for 50 channels');
    await search.fetch({ items: 'channels', quantity: 50 });
    console.log('Raw search JSON saved to ./examples/searchChannels.json');
    fs.writeFileSync('./examples/searchChannels.json', ut.jsp(search.data), 'utf8');
    console.log(`\nSearch status: ${search.status} (${search.reason})`);
    if (search.status === 'OK') {
        console.log(`Found ${search.results.length} channels for "${search.options.query}"`);
        let output = {
            search: search.info(app.ignore),
            channels: search.results.map(item => item.info(app.ignore)),
        };
        fs.writeFileSync('./examples/search_channels.json', ut.jsp(output), 'utf8');
    }
}

// Main function to run all the searches
async function run() {
    let session = new ytcog.Session(app.cookie, app.userAgent, app.proxy);
    await session.fetch();
    console.log(`Session status: ${session.status} (${session.reason})`);
    if (session.status === 'OK') {
        let search = new ytcog.Search(session, app.test_options);
        search.debugOn = true;
        await runVideos(search);
        await runPlaylists(search);
        await runChannels(search);
        console.log('Session complete.');
    } else {
        console.log('Session failed.');
    }
}

// Command-line argument handling for query
if (process.argv.length === 2) {
    run();
} else if (process.argv.length === 3) {
    app.test_options.query = process.argv[2];
    run();
} else {
    console.log('usage: >node search_test [search_query]');
}
