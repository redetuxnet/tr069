# ATENÇÃO PARA OBTER O CÓDIGO FONTE ATUALIZADO - CONTATE-NOS
# Modulo de integração GenieACS + (Hubsoft)
Esse modulo de integração é integrada com o ERP Hubsoft, na qual contém a funcionalidade de auto configuração das CPE (roteador ou onu).</br>
A auto configuração é feita em dois casos:
- Roteadores novos (mac wan não vinculada ao serviço do cliente)
- Roteadores resetados (mac wan vinculado ao serviço do cliente)

</br>
Esse projeto permite a alteração dos seguintes campos de forma automatica:
</br>
</br>

- Usuario e senha do pppoe
- SSID e Senha do Wi-Fi 2.4Ghz e 5Ghz

</br>
Para esse projeto funcionar corretamente, quando o roteador novo estiver sendo instalado, é necessario que o Técnico esteja com a Ordem de Serviço em execução e o equipamento (CPE) no estoque do Técnico.</br>
Além disso todos as CPE precisa obrigatóriamente conter o MAC LAN do roteador *(É o mesmo mac que vem no fundo do Roteador e na caixa do equipamento)* dentro do campo mac do produto, que pode ser adicionado no momento do cadastro da compra do produto ou editado em estoque->itens de produto.</br>
Como também é necessario acesso ao banco de dados do sistema no modo leitura, devido que a API publica do ERP HUBSOFT não oferece a rota para consultar os dados do cliente via mac wan e nem mac lan.

--------

***ATENÇÃO***</br>
*DEIXAR OS DADOS EM UM SERVIDOR SEGURO PARA EVITAR VAZAMENTO DAS CRENDENCIAIS, PREFERENCIALMENTE INSTALE A API E O GENIEACS EM UM MESMO SERVIDOR LOCAL E IP PRIVADO E SOLICITE QUE LIBERE O ACESSO AO BANCO APENAS PARA O IP DO SERVIDOR PARA MAIOR SEGURANÇA*

--------------------
### Instalação GenieACS
O passo a passo de instalação está disponivel em https://blog.remontti.com.br/6001, os demais passos abaixo só devem ser feitas após a instalação.

## Instalando Back-end do projeto
Clone o projeto 
    
    cd /opt
    git clone https://github.com/jeffsoncavalcante/tr069.git
    cd /tr069
    npm install
    
Edite o arquivo .env</br>

    cd /opt/tr069/src
    vi .env

Dentro do arquivo se encontra as variáveis de ambiente da api</br>
os parametros que devem ser alterados são:</br>
1. TOKEN (Criar um hash forte para proteger a aplicação, o mesmo será usada no genieacs )
2. HUB_HOST (url do seu sistema)
3. HUB_USER (usuario de acesso ao banco)
4. HUB_PASSWORD (senha de acesso ao banco)
5. HUB_PORT (porta de acesso ao banco)
6. HUB_DATABASE (nome do banco de dados)

Após o arquivo .env configurado verique se a pasta ext se encontra criada no diretório.

    ls -l /opt/genieacs/

se não existir, crie a pasta e conceda a permissão para o usuario genieacs, criado no momento da instalação

    mkdir /opt/genieacs/ext
    chown genieacs. /opt/genieacs/ext -R
    chmod 600 /opt/genieacs/ext

Com a pasta criada, copie os arquivos localizado na pasta ext do projeto para a pasta ext do genieacs

    cp /opt/tr069/ext/getClientes /opt/genieacs/ext
    cp /opt/tr069/ext/getMacwan /opt/genieacs/ext
    chmod 600 /opt/genieacs/ext/getClientes
    chmod 600 /opt/genieacs/ext/getMacwan

Após isso acesse ambos arquivos, getClientes e getMacwan que copiamos, pois iremos adicionar o token que foi criado dentro do arquivo .env e adicionar o nome do provedor para concatenar com o SSSID e SENHA do wifi.</br>
O SSID do roteador é gerado usando a seguinte moneclatura </br></br> PRIMEIRONOMEDOCLIENTE_NOMEPROVEDOR_4DIGITOSFINAISDOMAC para o 2.4 </br>
*EXEMPLO: JEFFSON_PROVEDOR_44D0*</br> </br>
PRIMEIRONOMEDOCLIENTE_NOMEPROVEDOR_4DIGITOSFINAISDOMAC_5G para o 5GHZ</br>
*EXEMPLO: JEFFSON_PROVEDOR_44D0_5G*</br> </br>

A senha do wifi do roteador é gerado usando a seguinte moneclatura NOMEPROVEDOR+senhadopppoe </br>
*EXEMPLO: Provedor2023*

    vi /opt/genieacs/ext/getClientes
    ## dentro da variavel token, adicione dentro das aspas duplas o token
    let token=""
    ## nome do provedor para o SSID EX: let ssid_nome_provedor = 'PROVEDOR'
    let ssid_nome_provedor = ' '
    ## nome do provedor para a Senha EX: let senha_nome_provedor = 'Provedor'
    let senha_nome_provedor = ' '
    
    vi /opt/genieacs/ext/getMacwan
    ## dentro da variavel token, adicione dentro das aspas duplas o token
    let token=""
    ## nome do provedor para o SSID EX: let ssid_nome_provedor = 'PROVEDOR'
    let ssid_nome_provedor = ' '
    ## nome do provedor para a Senha EX: let senha_nome_provedor = 'Provedor'
    let senha_nome_provedor = ' '
    
Agora precisamos rodar a aplicação para isso é simples. vamos criar um novo serviço no linux para a execução

    vi /etc/systemd/system/api-genieacs.service
    ## Copie o script abaixo e coloque no editor que foi aberto
    [Unit]
    Description=API GENIEACS HUB
    After=network.target
    [Service]
    User=genieacs
    WorkingDirectory=/opt/tr069/bin
    ExecStart=/usr/bin/node server.js
    [Install]
    WantedBy=default.target
    ## Habilite o servico e start logo em seguida
    systemctl enable api-genieacs.service
    systemctl start api-genieacs.service
    
A porta padrão da API é 3001

Após a conclusão do Back-end da aplicação, iremos configurar os parametros dentro do genieACS

## Parametrização GenieACS
Nessa parte iremos criar alguns parametros dentro do sistema para o funcionamento corretamente juntamente com a integração com o sistema

1. Acesse o sistema do GenieACS: http://ipdoservidor:3000
2. Acesse com as credenciais (padrão: admin, admin) 
3. Crie um novo usuario para o ser utilizado na configuração do roteador e outro pra o Hubsoft utilizar.</br> admin -> users (pode ser como admin "Não recomendavel")

### Editando os Provisions
Nessa etapa iremos criar dois provisions e editar dois dentro do sistema do GenieACS. </br>
Os provisions são responsáveis por executar os comandos de provisionamento, ou seja, podemos realizar as chamadas para alterar os parâmetros das cpe de forma automática e declarar os parâmetros para o sistema Genieacs consultar.</br>
Iremos editar duas provisions que são a default, inform e criar os preset_tr098 e preset_tr181</br>
O primeiro que iremos editar é o provision default

    ## Copie as informações que está no projeto dentro da pasta 
    /opt/tr069/GenieACS/provisions/default
    ## Dentro do GenieACS navegue até admin -> provisions 
    Clique em show no provision com o nome default e apague tudo que está dentro e cole o contéudo copiado do arquivo default do projeto
    
O segundo que iremos editar é o provision inform

    ## Copie as informações que está no projeto dentro da pasta 
    /opt/tr069/GenieACS/provisions/inform
    ## Dentro do GenieACS navegue até admin -> provisions
    Clique em show no provision com o nome inform e apague tudo que está dentro e cole o contéudo copiado do arquivo default do projeto

O primeiro que vamos criar é o provision preset_tr098

    ## Copie as informações que está no projeto dentro da pasta 
    /opt/tr069/GenieACS/provisions/preset_tr098
    ## Dentro do GenieACS navegue até admin -> provisions
    Clique em new no campo scritp coloque o codigo e no nome name coloque preset_tr098 e salve
    ## Após criar o provision vamos no Campo presets, onde vamos acionar nossos provisions admin -> presets
    Clique em new e prencha os dados conforme abaixo
        name: preset_tr098  
        channel: preset_tr098
        Weigth: 0
        Events: 1 BOOT (Recomendado - vai acionar quando o roteador reiniciar) ou Registered (vai acionar quando roteador conectar a primeira vez no genieacs)
        Precondition: VirtualParameters.pppoe_tr098 = "tr069"
        Provision: preset_tr098
        
O primeiro que vamos criar é o provision preset_tr181

    ## Copie as informações que está no projeto dentro da pasta 
    /opt/tr069/GenieACS/provisions/ppreset_tr181
    ## Dentro do GenieACS navegue até admin -> provisions
    Clique em new no campo scritp coloque o codigo e no nome name coloque preset_tr098 e salve
    ## Após criar o provision vamos no Campo presets, onde vamos acionar nossos provisions admin -> presets
    Clique em new e prencha os dados conforme abaixo
        name: preset_tr181  
        channel: preset_tr181
        Weigth: 0
        Events: 1 BOOT (Recomendado - vai acionar quando o roteador reiniciar) ou Registered (vai acionar quando roteador conectar a primeira vez no genieacs)
        Precondition: VirtualParameters.pppoe_tr181 = "tr069"
        Provision: preset_tr181

**Atenção** dentro do provision default existe uma variavel chamada 'default_user_pppoe' que é responsavel por identificar o pppoe padrão do preset, por padrão se encontra com o nome tr069 (que pode ser alterada caso julge necesssario), de qualquer forma esse usuario pppoe deve ser usado no roteador, para que o script identifique que esse roteador não está configurado. 

    let default_user_pppoe = 'tr069';

Portanto dentro do seu sistema Hubsoft, crie um serviço (plano) com o mesmo login para funcionar a internet, pois o roteador precisa de conexão para se conectar no GenieACS, a senha do pppoe pode ser usada a mesma que o sistema gera. </br>
O usuario e senha do pppoe é apenas provisiorio, pois logo que o roteador se conectar no GenieACS irá ser alterado para os dados do pppoe do cliente.
### Criando Virtual Parameters
Nesse momento iremos criar 4 virtuais parametros que irá auxiliar nos scritps e na integração com o Hubsoft. </br>
Os scripts dos Virutal Parametros estão localizado em /opt/tr069/GenieACS/virtual_parameters</br>
Dentro do GenieACS navegue até admin -> Virtual Parameters</br></br>

O primeiro Virtual Parametro que iremos criar é o MACAddress
1. Clique em new 
2. no campo name coloque o MACAddress
3. Copie o script dentro do arquivo MACAddress no diretório informado acima e cole dentro do campo Script no GenieACS

O segundo Virtual Parametro que iremos criar é o MAC
1. Clique em new 
2. no campo name coloque o MAC
3. Copie o script dentro do arquivo MAC no diretório informado acima e cole dentro do campo Script no GenieAC

O terceiro Virtual Parametro que iremos criar é o Ip
1. Clique em new 
2. no campo name coloque o Ip
3. Copie o script dentro do arquivo Ip no diretório informado acima e cole dentro do campo Script no GenieACS

O quarto Virtual Parametro que iremos criar é o ppp_username
1. Clique em new 
2. no campo name coloque o ppp_username
3. Copie o script dentro do arquivo ppp_username no diretório informado acima e cole dentro do campo Script no GenieACS

## Configuração GenieACS no Hubsoft
Dentro da wiki do hubsoft se encontra o precedimento para adicionar a integração do lado do ERP com o GenieACS e como definir os parametros customizados para cada tipo de roteador.</br>
Documentação para integração:
</br>
https://wiki.hubsoft.com.br/pt-br/modulos/configuracao/integracao/gerenciador_cpe/integrar-cpe </br>
Documentação parâmetro customizado: </br>
https://wiki.hubsoft.com.br/pt-br/atualizacoes/versao_1_94#h-22-melhorias-na-integra%C3%A7%C3%A3o-genieacs

## Preset
Todos os roteadores que for ser utilizado é recomendo o uso do preset (firmware customizado), para adicionar o valores padrões.</br> cada fabricante tem um modo de subir o preset consulte seu fornecedor. </br>
lembre-se que no preset é necessário apenas os
- Usuario padrão "tr069" e a senha do pppoe.
- Dados do tr069 preenchidos.
- Senha padrão de acesso web.
- Se a empresa usar acesso remoto habilitar
-  Alterar porta padrão de acesso web. </br>
Dados do tr069 para ser prenchidos
- url (http://ipdoservidor:7547)
- nome de usuario (usuario que foi criado no genieacs)
- senha (senha que foi criada no genieacs)
- Informativos periódicos: Habilitado
- Intervalo de Informativos periódicos: 300
- Caminho: /tr069 (se houver)
- Porta: 7547
</br>
Lembrando que não pode possuir NAT e nem CGNAT entre o servidor e os roteadores.


## Contatos e Suporte
- E-mail: jeffsonvitor69@gmail.com
- Telegram: https://t.me/jeffsoncavalcante
