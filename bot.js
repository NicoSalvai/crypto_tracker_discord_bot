require("dotenv").config();

const Discord = require("discord.js");
const client = new Discord.Client();
const https = require('https');

const coingecko_url = 'https://api.coingecko.com/api/v3/simple/price';
/*[
    {
        "name":'cryptoblades',
        "aliases":[
            'skill',
            'cryptoblades'
        ]
    },
    {
        "name":'usd',
        "aliases":[
            'usd',
            'usdt'
        ]
    }
]*/
  


client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);

    let channels = Array.from( client.channels.cache.values() );
    let crypto_channels = channels.filter(channel => channel.type == 'text' && channel.name.startsWith('c-'))

    setInterval(() => {
        crypto_channels.forEach(channel => {
            let coins_params = processChannelName(channel.name);
            let params = '?ids=' + coins_params.from + '&vs_currencies=' + coins_params.to;

            https.get(coingecko_url+params, (resp) => {
                let data = '';
            
                // A chunk of data has been received.
                resp.on('data', (chunk) => {
                    data += chunk;
                });
            
                // The whole response has been received. Print out the result.
                resp.on('end', () => {
                    var parsedData = JSON.parse(data);
                    channel.setName( "c-" +
                        channel.name.split("-")[1] + "-" +
                        channel.name.split("-")[2] + "-" + 
                        parsedData[coins_params.from][coins_params.to].toString().replace(".", "-"))
                    console.log(parsedData)
                });
            
            }).on("error", (err) => {
                console.log("Error: " + err.message);
            });
        })
    }, process.env.INTERVAL);
});




/*
client.on('message', msg => {
	if(msg.content === 'ping'){
        msg.reply('Pong!');
    }
});
*/

client.login(process.env.BOT_TOKEN);


function coinGecko(params){

}


function processChannelName(channel_name){
    let channel_name_array = channel_name.split("-");
    let main_coin = findNameForAlias(channel_name_array[1]);
    let sec_coin = findNameForAlias(channel_name_array[2]);

    let coins = {
        "from": main_coin,
        "to": sec_coin
    }
    
    return coins;
}

function findNameForAlias(alias){
    let crypto_aliases = JSON.parse(process.env.COINS)
    for (i = 0; i < crypto_aliases.length; i++) {
        for (j = 0; j < crypto_aliases[i].aliases.length; j++) {
            if(crypto_aliases[i].aliases[j] === alias)
                return crypto_aliases[i].name;
        }
    }
}