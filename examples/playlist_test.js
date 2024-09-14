const ytcog = require('../lib/index');
const ut = require('../lib/ut')();
const fs = require('fs');

// User editable data:
let app = {
    // logged-in cookie string
    cookie: '',
    // browser user agent
    userAgent: '',
    // proxy agent string
    proxy: '', // Changed from the cookie duplication
    // info fields to ignore
    ignore: ['cookie', 'userAgent', 'options', 'sapisid', 'status', 'reason', 
             'cancelled', 'canEmbed', 'isLive', 'debugOn'],
    test_options: {
        // Playlist ID (ensure a valid playlist ID is provided)
        id: 'PLQ_voP4Q3cffatM_zKUO5-woz34KyLrPL',
        // Number of results to fetch initially
        quantity: 100,
    },
};

async function run() {
    let session = new ytcog.Session(app.cookie, app.userAgent, app.proxy); // Corrected third argument to proxy
    await session.fetch();
    console.log(`Session status: ${session.status} (${session.reason})`);
    
    if (session.status === 'OK') {
        let playlist = new ytcog.Playlist(session, app.test_options);
        playlist.debugOn = true;
        console.log('\nFetching Playlist videos...');
        await playlist.fetch();
        console.log(`Playlist status: ${playlist.status} (${playlist.reason})`);
        
        if (playlist.status === 'OK') {
            console.log(`\nLoaded ${playlist.results.length} videos from "${playlist.title}"`);
            console.log('Continuing to fetch more videos...');
            await playlist.continued(); // Fetch more videos if available
            
            console.log(`Playlist status after continuation: ${playlist.status} (${playlist.reason})`);
            if (playlist.status === 'OK') {
                console.log(`\nTotal videos fetched: ${playlist.results.length} from "${playlist.title}"`);
                console.log('\nSaving playlist info and results to ./examples/playlist_results.json');
                
                let output = {
                    playlist: playlist.info(app.ignore),
                    results: playlist.results.map(video => video.info(app.ignore)), // Simplified array building
                };
                
                fs.writeFileSync('./examples/playlist_results.json', ut.jsp(output), 'utf8');
                console.log('Raw playlist data saved to ./examples/playlist.json');
                fs.writeFileSync('./examples/playlist.json', ut.jsp(playlist.data), 'utf8');
            } else {
                console.log('Failed to continue. Saving raw playlist data.');
                fs.writeFileSync('./examples/playlist.json', ut.jsp(playlist.data), 'utf8');
            }
        } else {
            console.log('Failed to fetch playlist. Saving raw playlist data.');
            fs.writeFileSync('./examples/playlist.json', ut.jsp(playlist.data), 'utf8');
        }
    }
}

// Command-line argument handling
if (process.argv.length === 2) {
    run();
} else if (process.argv.length === 3) {
    app.test_options.id = process.argv[2]; // Update playlist ID from command-line argument
    run();
} else {
    console.log('usage: >node playlist_test [id]');
}

