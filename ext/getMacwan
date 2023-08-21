const http = require("http");

function cliente(args, callback){
   //URL da API
   let urlbase = "http://localhost:3001"
   //Token gerado na api
   let token = "Z94k8opK3mlJhDLaWVN7Qhd6KPdYB087BeCty6teQyKLnK49BP"
    http
  .get(`${urlbase}/api/mac/${token}/macwan/${args[0]}`, (res) => {
      if (res.statusCode !== 200)
        return callback(
          new Error(`Request failed (status code: ${res.statusCode})`)
        );

        let rawData = "";
        res.on("data", (chunk) => (rawData += chunk));

      res.on("end", () => {
        let data = JSON.parse(rawData)
        if(data[0].status != 404 ){
            let ssid_nome_provedor = '_TUXNET_'
            let senha_nome_provedor = 'Tuxnet'
            let macfinal = data[0].mac_addr.split(':')
            let nome = data[0].nome.split(' ')
            let ssid = nome[0] + ssid_nome_provedor + macfinal[4] + macfinal[5]
            let ssid5g = nome[0] + ssid_nome_provedor + macfinal[4] + macfinal[5] + '_5G                                                                                                             '
            let password = senha_nome_provedor+data[0].password
            let result = {
                login: data[0].login,
                senha: data[0].password,
                ssid: ssid,
                ssid5g: ssid5g,
                password: password
                }
            //console.log(result)
            callback(null, result);
        }else{
            let result = {
                status: data[0].status
                }
            //console.log(result)
            callback(null, result);
        }

      });

    })

        .on("error", (err) => {
        callback(err);
        });
}

//cliente('58:10:8C:BD:28:CC',null)
exports.getMacwan = cliente;
