module.exports = {
    /**
     * This function will take the hot posts of a subreddit and return post objects from it. Based on the input params,
     * the function that return either one single post or multiple post objects.
     * @param subreddit             The designated subreddit defined in calling file.
     * @param selectedHighestVoted  Boolean to determine whether the top post is selected. Default: false
     * @param counter               I honestly have no clue what this is for, ask Franklin.
     * @param today                 The current date.
     * @param grabAll               Boolean used to determine whether or not to return a single post or array of posts.
     * @returns {Promise<{}|[]>}    If grabAll=true, will send an array of post objects, else a single post object.
     */
    getImgUrl: async (subreddit, selectedHighestVoted, counter, today, grabAll) => {
        let returnVal = {};
        let returnVals = [];
        await subreddit.getHot({time: 'day', limit: 10}).forEach((post) => {
            if (post.title.includes(today.toString()) && !selectedHighestVoted) {
                grabAll ? returnVals.push(post) : returnVal = post;
                selectedHighestVoted = !grabAll;
                counter++;
            } else if (!selectedHighestVoted && counter === 10) {
                returnVal = "Couldn't find an Ani-rific day for you, sorry!";
            }
        });
        if (grabAll) {
            return returnVals
        } else {
            return returnVal
        }
    },
    /**
     * This function takes in an array of discord embeds and displays them through dynamic pagination. This is done
     * through the Discord.js reaction collector, which listens for two specific reactions to take place, forward or
     * backward. When the reaction is collected, it updates the message to either display the next array element or
     * previous array element.
     * @param msg           The message that is spawning this paginated view.
     * @param pages         The array of discord embeds to generate the display from.
     * @param emojiList     The next and previous buttons: defaulted to rewind and fastforward emojis.
     * @param timeout       The time allotted for the reaction collector to collect reactions. defaulted to 120000ms
     * @returns Message     Returns a discord message which is continually edited as the collector picks up reactions.
     */
    paginationEmbed: async function (msg, pages, emojiList = ['⏪', '⏩'], timeout = 120000) {
        if (!msg && !msg.channel) throw new Error('Channel is inaccessible.');
        if (!pages) throw new Error('Pages are not given.');
        if (emojiList.length !== 2) throw new Error('Need two emojis.');
        let page = 0;
        const curPage = await msg.channel.send(pages[page].setFooter(`Page ${page + 1} / ${pages.length}`));
        for (const emoji of emojiList) await curPage.react(emoji);
        const reactionCollector = curPage.createReactionCollector(
            (reaction, user) => emojiList.includes(reaction.emoji.name) && !user.bot,
            {time: timeout}
        );
        reactionCollector.on('collect', reaction => {
            // reaction.remove(msg.author);
            switch (reaction.emoji.name) {
                case emojiList[0]:
                    page = page > 0 ? --page : pages.length - 1;
                    break;
                case emojiList[1]:
                    page = page + 1 < pages.length ? ++page : 0;
                    break;
                default:
                    break;
            }
            curPage.edit(pages[page].setFooter(`Page ${page + 1} / ${pages.length}`));
        });
        reactionCollector.on('end', function () {
                curPage.reactions.removeAll();
                curPage.edit(pages[page].setFooter("Re-search to see the other pages again."));
            }
        );
        return curPage;
    },
};
