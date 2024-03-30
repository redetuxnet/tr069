exports.get = async function getMac(mac) {
    //console.log(mac)
    const conectbd = require('../bd/hubsoft/db')
    // Consulta de avaliação por media por dia do técnico
    const produto_item = `
    SELECT "movimento_estoque - id_movimento_estoque"."id_vinculo_destino" AS "id_vinculo_destino", "produto_item - id_produto_item"."mac_address" AS "mac_address"
    FROM "public"."movimento_estoque_produto_item"
    LEFT JOIN "public"."movimento_estoque_produto" AS "movimento_estoque_produto - id_movimento_estoque_produto" ON "public"."movimento_estoque_produto_item"."id_movimento_estoque_produto" = "movimento_estoque_produto - id_movimento_estoque_produto"."id_movimento_estoque_produto" LEFT JOIN "public"."movimento_estoque" AS "movimento_estoque - id_movimento_estoque" ON "movimento_estoque_produto - id_movimento_estoque_produto"."id_movimento_estoque" = "movimento_estoque - id_movimento_estoque"."id_movimento_estoque" LEFT JOIN "public"."produto_item" AS "produto_item - id_produto_item" ON "public"."movimento_estoque_produto_item"."id_produto_item" = "produto_item - id_produto_item"."id_produto_item"
    WHERE ("movimento_estoque_produto - id_movimento_estoque_produto"."tipo_utilizacao" = 'cliente_servico')
   AND ("movimento_estoque - id_movimento_estoque"."tipo" = 'saida') AND ("produto_item - id_produto_item"."mac_address" = '${mac}') AND ("movimento_estoque - id_movimento_estoque"."vinculo_destino" = 'users')
   order by "movimento_estoque - id_movimento_estoque"."data_movimento" desc
   limit 1
`
    let produto_item_response = await conectbd.bdhub(produto_item)
        .then(data => {
            return data
            })
        .catch(err => {
            console.log(err)
        })
    if(produto_item_response.length==0){
        console.log("Equipamento nao encontrado")
        return []
    }else{
    let id_vinculo_destino = produto_item_response[0].id_vinculo_destino
    let mac_address = produto_item_response[0].mac_address    
    const os = `
    SELECT cliente_servico_autenticacao.login AS login, cliente_servico_autenticacao.password AS password, cliente.nome_razaosocial AS nome_razaosocial
    from ordem_servico_reserva
    LEFT JOIN ordem_servico ON ordem_servico_reserva.id_ordem_servico = ordem_servico.id_ordem_servico
    LEFT JOIN cliente_servico ON ordem_servico.id_cliente_servico = cliente_servico.id_cliente_servico
    LEFT JOIN cliente_servico_autenticacao ON cliente_servico.id_cliente_servico = cliente_servico_autenticacao.id_cliente_servico
    LEFT JOIN cliente ON cliente_servico.id_cliente = cliente.id_cliente
    WHERE ordem_servico_reserva.desreservada = FALSE
       AND ordem_servico_reserva.servico_iniciado = TRUE
       AND ordem_servico.status = 'pendente'
       and ordem_servico_reserva.id_usuario = '${id_vinculo_destino}'
    `
    let os_response = await conectbd.bdhub(os)
        .then(data => {

            return data
            })
        .catch(err => {
            console.log(err)
        })
    if(os_response.length==0){
        console.log("O.S nao sendo executada")
        return []
    }else{
        let result = [{
            mac_address: mac_address,
            login: os_response[0].login,
            password: os_response[0].password,
            nome_razaosocial: os_response[0].nome_razaosocial
        }]
        console.log(result)
        return result
    }
    }
    
    
}
