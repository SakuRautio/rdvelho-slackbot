const SlackBot = require('slackbots');
const request = require('request');
const dotenv = require('dotenv');
dotenv.config();

const bot = new SlackBot({
  token: `${process.env.BOT_TOKEN}`,
  name: `rdvelhobot`
});

bot.on('start', () => {
	console.log("Bot start");
});

bot.on('error', (err) => {
  console.log(err);
});

function sendMeme(channel, meme) {
    bot.postMessage(
        channel,
        "Here's a meme for you",
        {
		"attachments": [
			meme
		]
	}
    );
};

function sendError(channel, error) {
    bot.postTo(
        channel,
        "Error: " + error,
        {}
    );
    console.log(error);
};

function handleMessage(channel, message) {
    if (message.includes('!meme')) {
        request({
            url: 'https://www.reddit.com/r/dankmemes/top.json?limit=100',
            method: "GET",
            json: true
        }, function (err, res, body) {
            if (err) {
                console.log(err);
                sendError(channel, err);
                return;
            }
            var allowed = body.data.children;
            allowed = allowed.filter(post => !post.data.over_18);
            if (!allowed.length) {
                console.log("Empty allowed list");
                sendError(channel, 'Meme time is over kids!');
                return;
            }
            console.log("Allowed size: " + allowed.length);
            const randomnumber = Math.floor(Math.random() * allowed.length);
            console.log("Allowed random: " + JSON.stringify(allowed[randomnumber]));
            let meme = {
                "title": allowed[randomnumber].data.title,
                "image_url": allowed[randomnumber].data.url
            };
            sendMeme(channel, meme);
        });
    }
};

bot.on('message', (data) => {
	if (data.type !== 'message') {
		return;
	}
	console.log("Data: " + JSON.stringify(data));
	handleMessage(data.channel, data.text);
});
