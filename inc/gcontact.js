module.exports = {
    contactAll: async function (message, messageContent) {
        const reactionsArray = message.reactions.array();
        let usersArray = [];
        for (const reactionItem of reactionsArray) {
            await reactionItem.fetchUsers();//populate the user array
            if (reactionItem._emoji !== undefined) {
                for(const u of reactionItem.users.array()){
                    if (u !== undefined && !usersArray.includes(u.id)) {
                        u.send(messageContent);
                        usersArray.push(u.id);
                    }
                }
            }
        }
    },
};