exports.bdhub = function hubsoft(query) {
    require('dotenv').config()

    const { Client } = require('pg')
    const client = new Client({
        host: process.env.HUB_HOST,
        user: process.env.HUB_USER,
        password: process.env.HUB_PASSWORD,
        port: process.env.HUB_PORT,
        database: process.env.HUB_DATABASE

    })

    client.connect();

    const custompromise = new Promise((resolve, reject) => {
        var data
        client.query(query, (err, res) => {
            if (!err) {
                data = res.rows
                client.end()
                resolve(data)
            } else {
                client.end()
                resolve(err.message)
            }
        })
    })
    return custompromise


}