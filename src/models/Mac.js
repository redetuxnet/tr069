exports.get = async function getMac(mac) {
    console.log(mac)
    const conectbd = require('../bd/hubsoft/db')
    // Consulta de avaliação por media por dia do técnico
    const query_avaliacao = `
    SELECT produto_item.mac_address AS mac_address, cliente_servico_autenticacao.login AS login, cliente_servico_autenticacao.password AS password, cliente.nome_razaosocial AS nome_razaosocial
    FROM produto_item
    LEFT JOIN produto_item_usuario ON produto_item.id_produto_item = produto_item_usuario.id_produto_item
    LEFT JOIN ordem_servico_reserva ON produto_item_usuario.id_usuario = ordem_servico_reserva.id_usuario 
    LEFT JOIN ordem_servico ON ordem_servico_reserva.id_ordem_servico = ordem_servico.id_ordem_servico 
    LEFT JOIN cliente_servico ON ordem_servico.id_cliente_servico = cliente_servico.id_cliente_servico
    LEFT JOIN cliente_servico_autenticacao ON cliente_servico.id_cliente_servico = cliente_servico_autenticacao.id_cliente_servico 
    LEFT JOIN cliente ON cliente_servico.id_cliente = cliente.id_cliente
    WHERE produto_item.mac_address = '${mac}'
       AND ordem_servico_reserva.desreservada = FALSE 
       AND ordem_servico_reserva.servico_iniciado = TRUE 
       AND ordem_servico.status = 'pendente'
    `
    let response = await conectbd.bdhub(query_avaliacao)
        .then(data => {
            return data
            })
        .catch(err => {
            console.log(err)
        })
    console.log(response)
    return response
}
