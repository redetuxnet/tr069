exports.get = async function getMac(mac) {
    const conectbd = require('../bd/hubsoft/db')
    // Consulta de avaliação por media por dia do técnico
    const query_avaliacao = `
    SELECT cliente_servico_autenticacao.login AS login, cliente_servico_autenticacao.mac_addr AS mac_addr, cliente_servico_autenticacao.password AS password, cliente.nome_razaosocial AS nome
    FROM cliente_servico
    LEFT JOIN cliente_servico_autenticacao ON cliente_servico.id_cliente_servico = cliente_servico_autenticacao.id_cliente_servico
    LEFT JOIN cliente ON cliente_servico.id_cliente = cliente.id_cliente
    WHERE (cliente_servico.id_servico_status = 11
        OR cliente_servico.id_servico_status = 14)
       AND cliente_servico_autenticacao.mac_addr = '${mac}'
    `
    let response = await conectbd.bdhub(query_avaliacao)
        .then(data => {
            if(data.length != 0){
                return data
            }
            else{
                arry = [{
                    status: 404,
                    error: "Equipamento não encontrado"
                }]
                return arry
            }
            })
        .catch(err => {
            console.log(err)
        })
    console.log(response)
    return response
}
