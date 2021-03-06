const Logs = require('../modules/logs');
const DB = require('../modules/db')
const bcrypt = require('bcrypt-nodejs');

function showSuccess(player) {
    const str = "showSuccess();";
    player.call("cInjectCefLogin", [str]);
}

function showError(player) {
    let str = "showError();";
    if (player.name === "WeirdNewbie") str += "showDefNameError();"
    player.call("cInjectCefLogin", [str]);
}

module.exports = {
    'sTryLogin' : (player, pass, email) => {
        DB.Handle.query(`SELECT password,email,id,name from server_players WHERE email = "${email}"`, function(e, result) {
            if(e) return console.log("SQL Error: " + e);
            if (!bcrypt.compareSync(pass, result[0]['password'])) {
                Logs.Insert(`${player.name} entered wrong password!`);
                return showError(player);
            }
            else if (!result[0]['email']) {
                Logs.Insert(player.name + "entered wrong email!");
                return showError(player);
            } else {
                player.info = {};
                player.info.email = result[0]['email'];
                player.info.sqlid = result[0]['id'];
                player.MPname = player.name;
                player.name = result[0]['name'];

                showSuccess(player); 
                setTimeout(function() {
                    Logs.Insert("Player " + player.name + " logged in.");
                    player.call("cCloseCefAndDestroyCam");
                    mp.events.call('loadPlayer', player);
                }, 2000);
            }
        });
    }
}