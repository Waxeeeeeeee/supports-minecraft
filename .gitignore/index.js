//Lien : https://discordapp.com/oauth2/authorize?client_id=481237610866540554&scope=bot&permissions=8

const Discord = require('discord.js')
const client = new Discord.Client()
const fs = require('fs')
const ms = require('ms')
let votechannels = JSON.parse(fs.readFileSync('votechannels.json'))

const channels = {
    "bienvenue": '480102028085821451'
}

const roles = {
    "joueur": '481536625797758976'
}

client.on('ready', () => {
    console.log('Bot démarré')
})

client.login('NDgxMjM3NjEwODY2NTQwNTU0.Dl66zw.fDIN9_3rvTMHeBnLhqud6fZsbrU')

client.on('guildMemberAdd', function (member) {
    member.guild.channels.get(channels.bienvenue).send('Bienvenue à toi ' +  member + ' sur Supports-Minecraft !\n        ──────────────────────\n        Supports-Minecraft est un serveur basé \n        sur la communauté, de Minecraft !\n        ──────────────────────\n\n        Cordialement\n        :tools: Supports-Minecraft :tools:')
})

client.on('guildMemberRemove', function (member) {
    member.guild.channels.get(channels.bienvenue).send(member + ' a quitté Supports-Minecraft\n    ────────────────────\n    Bonne continuation a toi !\n    ────────────────────\n    Cordialement\n    :tools: Supports-Minecraft :tools:')
})

const events = {
	MESSAGE_REACTION_ADD: 'messageReactionAdd',
	MESSAGE_REACTION_REMOVE: 'messageReactionRemove',
}

client.on('raw', async event => {
	if (!events.hasOwnProperty(event.t)) return
    const {d: data} = event
    const user = client.users.get(data.user_id)
    const channel = client.channels.get(data.channel_id)
    if (channel.messages.has(data.message_id)) return
    const message = await channel.fetchMessage(data.message_id)
    const emojiKey = (data.emoji.id) ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name
    const reaction = message.reactions.get(emojiKey)
    client.emit(events[event.t], reaction, user)
})

client.on('messageReactionAdd', function (reaction, user) {
    if (!reaction.message.guild) return
    if (user.bot) return
    if (user.id === client.user.id) return
    if (reaction.message.id === '481910495356518440') {
        let member = reaction.message.guild.member(user)
        if (reaction.emoji.name === '🛠') {
            if (!member.roles.has(roles.joueur)) member.addRole(roles.joueur)
        }
        else reaction.remove(member)
    }
})

client.on('message', async function (message) {
    if (!message.guild) return
    if (message.author.bot) return
    if (message.author.id === client.user.id) return
    if (votechannels.includes(message.channel.id) && message.attachments.size >= 1) {
        message.react(message.guild.emojis.find('name', 'vert')).then(() => message.react(message.guild.emojis.find('name', 'rouge')))
    }
    if (message.content.toLowerCase().startsWith('^vote')) {
        if (!message.member.hasPermission('MANAGE_CHANNELS')) return message.channel.send('Vous n\'avez pas la permission d\'utiliser cette commande')
        let status = message.content.split(' ').slice('1').join(' ')
        if (status === 'on') {
            if (votechannels.includes(message.channel.id)) return message.channel.send('Les votes sont déjà activés dans ce salon')
            votechannels.push(message.channel.id)
            fs.writeFileSync('votechannels.json', JSON.stringify(votechannels))
            message.channel.send('Les votes sont maintenant activés dans ce salon :white_check_mark:')
        }
        else if (status === 'off') {
            if (!votechannels.includes(message.channel.id)) return message.channel.send('Les votes ne sont pas encore activés dans ce salon')
            votechannels.splice(votechannels.indexOf(message.channel.id), 1)
            fs.writeFileSync('votechannels.json', JSON.stringify(votechannels))
            message.channel.send('Les votes sont maintenant désactivés dans ce salon :white_check_mark:')
        }
        else return message.channel.send('Veuillez indiquer on ou off')
        return
    }
    else if (message.content.toLowerCase().startsWith('^supports-minecraft')) {
        if (!message.member.hasPermission('MANAGE_GUILD')) return message.channel.send('Vous n\'avez pas la permission d\'utiliser cette commande')
        let content = message.content.split(' ').slice('1').join(' ')
        if (!content) return message.channel.send('Veuillez indiquer un message à envoyer')
        message.channel.send(content)
        message.delete()
        return
    }
    else if (message.content.toLowerCase().startsWith('^clear')) {
        if (!message.member.hasPermission('MANAGE_MESSAGES')) return message.channel.send('Vous n\'avez pas la permission d\'utiliser cette commande')
        let count = message.content.split(' ').slice('1').join(' ')
        if (!count || isNaN(count)) return message.channel.send('Veuillez indiquer un nombre valide')
        if (count <= 0 || count > 100) return message.channel.send('Veuillez indiquer un nombre entre 1 et 100')
        message.channel.bulkDelete(parseInt(count) + 1)
        return
    }
    else if (message.content.toLowerCase().startsWith('^ban')) {
        if (!message.member.hasPermission('BAN_MEMBERS')) return message.channel.send('Vous n\'avez pas la permission d\'utiliser cette commande')
        let member = message.mentions.members.first()
        if (!member) return message.channel.send('Veuillez mentionner un utilisateur')
        if (member.highestRole.calculatedPosition > message.member.highestRole.calculatedPosition) return message.channel.send('Vous ne pouvez pas bannir cet utilisateur')
        if (!member.bannable) return message.channel.send('Je ne peux pas bannir cet utilisateur')
        message.guild.ban(member, {days: 7})
        message.channel.send('*' + member.user.username + '#' + member.user.discriminator + '* a été **banni** :white_check_mark:')
        return
    }
    else if (message.content.toLowerCase().startsWith('^kick')) {
        if (!message.member.hasPermission('KICK_MEMBERS')) return message.channel.send('Vous n\'avez pas la permission d\'utiliser cette commande')
        let member = message.mentions.members.first()
        if (!member) return message.channel.send('Veuillez mentionner un utilisateur')
        if (member.highestRole.calculatedPosition > message.member.highestRole.calculatedPosition) return message.channel.send('Vous ne pouvez pas exclure cet utilisateur')
        if (!member.kickable) return message.channel.send('Je ne peux pas exclure cet utilisateur')
        member.kick()
        message.channel.send('*' + member.user.username + '#' + member.user.discriminator + '* a été **exclu** :white_check_mark:')
        return
    }
    else if (message.content.toLowerCase().startsWith('^mute')) {
        if (!message.member.hasPermission('MANAGE_MESSAGES')) return message.channel.send('Vous n\'avez pas la permission d\'utiliser cette commande')
        let member = message.mentions.members.first()
        if (!member) return message.channel.send('Veuillez mentionner un utilisateur')
        let duration = message.content.split(' ').slice('2').join(' ')
        if (duration && !/^((?:\d+)?\-?\d?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(duration)) return message.channel.send('Veuillez indiquer une durée valide')
        if (member.highestRole.calculatedPosition > message.member.highestRole.calculatedPosition) return message.channel.send('Vous ne pouvez pas mute cet utilisateur')
        if (member.highestRole.calculatedPosition > message.guild.member(client.user).highestRole.calculatedPosition) return message.channel.send('Je ne peux pas mute cet utilisateur')
        let muterole = message.guild.roles.find('name', 'Muted')
        if (!muterole) {
            await message.guild.createRole({name: 'Muted', permissions: 0})
            message.guild.channels.forEach(function (channel) {
                if (channel.type === 'category') channel.overwritePermissions(message.guild.roles.find('name', 'Muted').id, {SEND_MESSAGES: false, CONNECT: false})
                if (channel.type === 'text') channel.overwritePermissions(message.guild.roles.find('name', 'Muted').id, {SEND_MESSAGES: false})
                if (channel.type === 'voice') channel.overwritePermissions(message.guild.roles.find('name', 'Muted').id, {CONNECT: false})
            })
        }
        member.addRole(message.guild.roles.find('name', 'Muted'))
        if (duration) {
            setTimeout(() => {
                if (member) member.removeRole(message.guild.roles.find('name', 'Muted'))
            }, ms(duration))
        }
        message.channel.send('*' + member.user.username + '#' + member.user.discriminator + '* a été **mute** ' + duration  + ' :white_check_mark:')
        return
    }
    else if (message.content.toLowerCase().startsWith('^unmute')) {
        if (!message.member.hasPermission('MANAGE_MESSAGES')) return message.channel.send('Vous n\'avez pas la permission d\'utiliser cette commande')
        let member = message.mentions.members.first()
        if (!member) return message.channel.send('Veuillez mentionner un utilisateur')
        if (member.highestRole.calculatedPosition > message.member.highestRole.calculatedPosition) return message.channel.send('Vous ne pouvez pas unmute cet utilisateur')
        if (member.highestRole.calculatedPosition > message.guild.member(client.user).highestRole.calculatedPosition) return message.channel.send('Je ne peux pas unmute cet utilisateur')
        member.removeRole(message.guild.roles.find('name', 'Muted'))
        message.channel.send('*' + member.user.username + '#' + member.user.discriminator + '* a été **unmute** :white_check_mark:')
        return
    }
})
