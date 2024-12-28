const {EmbedBuilder} = require("discord.js")

function buildembed(title,user,description,color){
    const embed = new EmbedBuilder()
        .setTitle(title)
        .setAuthor({name: user})
        .setDescription(description)
        .setColor(color)
    return embed
}
module.exports = buildembed;