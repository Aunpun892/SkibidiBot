const { Client, SlashCommandBuilder, Events, EmbedBuilder, GatewayIntentBits } = require("discord.js");
const { token } = require("./config.json");
const modifybalance = require("./Functions/ModifiyBalance")
const  buildembed = require("./Functions/BuilderEmbed")
const  balenciaga = require("./Slashers/balenciaga")
const { initializeApp } = require("firebase/app")
const { getFirestore,collection, where, addDoc,query,getDocs,doc,getDoc,deleteDoc } = require("firebase/firestore");// TODO: Add SDKs for Firebase products that you want to use
const hasbalanceornot = require("./Functions/hasBalanceOrnot");
const loanornot = require("./Functions/hasLoanOrnot")
const firebaseConfig = {
  apiKey: "AIzaSyBMVisMD7ldCJztCQbTQsOsBBlzL1BA2nM",
  authDomain: "skibidibot-8c47f.firebaseapp.com",
  projectId: "skibidibot-8c47f",
  storageBucket: "skibidibot-8c47f.firebasestorage.app",
  messagingSenderId: "425486930975",
  appId: "1:425486930975:web:03f5bdc46beb151e15712a",
  measurementId: "G-35LSYJDYDY"
};
const cooldowns = new Map();
 const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const client = new Client({ intents: [GatewayIntentBits.Guilds,GatewayIntentBits.GuildMembers] });
const jobRef = collection(db, "job");
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
client.once(  Events.ClientReady,   async  () => {
     
    console.log("logged")

    const loan = new SlashCommandBuilder()
        .setName("loan")
        .setDescription("Take out a loan to get moeny but you have to pay back (กู้เงิน)")
        .addStringOption(option =>
            option
                .setName('money')
                .setDescription('Enter how much money you are loaning')
                .setRequired(true))
    const GetEmployed = new SlashCommandBuilder()
        .setName("get-a-job")
        .setDescription("Get a Job.")
        .addStringOption((option) =>
            option
                .setName("job")
                .setDescription("Choose your job")
                .setRequired(true)
                .addChoices(
                    { name: "farmer", value: "farmer" },
                    { name: "fisherman", value: "fisherman" },
                    { name: "merchant", value: "merchant" },
                    { name: "miner", value: "miner" },
                )
        );
    const work = new SlashCommandBuilder()
        .setName("work")
        .setDescription("Do your job to get money.")
     

    const balance = new SlashCommandBuilder()
        .setName("balance")
        .setDescription("Check how much money you have")
    const gamble = new SlashCommandBuilder()
        .setName("gamble")
        .setDescription("1 in 10 chance to 3.2 time your money")
        .addStringOption(option =>
            option
                .setName('money')
                .setDescription('Enter how much money you are gambling')
                .setRequired(true))
    const invest = new SlashCommandBuilder()
            .setName("invest")
            .setDescription("In vest in the stock market at a chance of getting more money.")
            .addStringOption(option =>
                option.setName('money')
                    .setDescription('How much do you want to invest')
                    .setRequired(true)
            )
            .addStringOption((option) =>
                option
                    .setName("type")
                    .setDescription("Choose your type")
                    .setRequired(true)
                    .addChoices(
                        { name: "Index fund (กองทุนดัชนี)", value: "index" },
                        {name:"Managed fund (กองทุนที่มีการจัดการ)", value: "managed"}             
                    )
            );
    const quitJob = new SlashCommandBuilder()
            .setName("quit")
            .setDescription("Quit your job.")
    const brainrot = new SlashCommandBuilder()
            .setName("brainrot")
            .setDescription("This command rots your brain.")

    //command plaza
    client.application.commands.create(brainrot)
    client.application.commands.create(loan)
    client.application.commands.create(quitJob);          
    client.application.commands.create(GetEmployed);
    client.application.commands.create(work);
    client.application.commands.create(balance);
    client.application.commands.create(gamble);
    client.application.commands.create(invest)
});

client.on(Events.InteractionCreate, async (interaction) => {
        if (!interaction.isCommand()) return;
    let username = interaction.user.username
    if (interaction.commandName === "get-a-job") {
        let jobs_ = [];
        const q = query(jobRef, where("member", "==", interaction.user.username));
        const querySnapshot = await getDocs(q);
        const selectedJob = interaction.options.getString("job")
        querySnapshot.forEach((doc) => {
            jobs_.push(doc.id);
        });


        // Check if jobs_ is empty or not
        if (jobs_.length > 0) {
            interaction.reply({embeds:[buildembed("/get-a-job",username,`You already have a job! You must quit first.`,"Red")]})
       
        } else {
       
            await addDoc(jobRef,{ "member":interaction.user.username,"choice":selectedJob})
            interaction.reply({embeds:[buildembed("/get-a-job",username,`You now work as ${selectedJob}!`,"Green")]})
        }
    }
    const userId = interaction.user.id; // Use user ID for tracking cooldowns


    if (interaction.commandName === "work") {
        const now = Date.now();
        const cooldownAmount = 30 * 1000; // 30 seconds in milliseconds


        // Check if user is on cooldown
        if (cooldowns.has(userId)) {
            const expirationTime = cooldowns.get(userId) + cooldownAmount;


            if (now < expirationTime) {
                const timeLeft = ((expirationTime - now) / 1000).toFixed(1); // Calculate time left
                return interaction.reply({
                    embeds: [
                        buildembed(
                            "/work",
                            username,
                            `You must wait ${Math.round(timeLeft)} seconds before using /work again.`,
                            "Red"
                        ),
                    ],
                    ephemeral: true, // Make the message private
                });
            }
        }


        // Add or update the user's cooldown
        cooldowns.set(userId, now);
        let jobs_ = [];
        const q = query(jobRef, where("member", "==", interaction.user.username));
        const querySnapshot = await getDocs(q);
     
        querySnapshot.forEach((doc) => {
            jobs_.push(doc.data());
        });
        if (jobs_.length > 0) {
            const UserJob = jobs_[0].job
            if (UserJob == "farmer"){
                const gooney = getRandomNumber(532, 932)
                interaction.reply({embeds:[buildembed("/work",interaction.user.username,`You harvested crops and sold them and recived ${gooney} Skibidi coins!`,"Green")]})
                modifybalance(gooney,username)
            } else if (UserJob == "fisherman"){
                const moogey = getRandomNumber(532, 932)
                interaction.reply({embeds:[buildembed("/work",interaction.user.username,`You went fishing and sold your fish for ${moogey} Skibidi coins!`,"Green")]})
                modifybalance(moogey,username)
            } else if (UserJob == "merchant"){
                const edgey = getRandomNumber(532, 932)
                interaction.reply({embeds:[buildembed("/work",interaction.user.username,`You sold products for  ${edgey} Skibidi coins!`,"Green")]})
                modifybalance(edgey,username)
            } else if (UserJob == "miner"){
                const rizzy = getRandomNumber(532, 932)
                interaction.reply({embeds:[buildembed("/work",interaction.user.username,`You went mining and sold your ores for  ${rizzy} Skibidi coins!`,"Green")]})
                modifybalance(rizzy,username)
            }
        } else {
            interaction.reply({embeds:[buildembed("/work",username,`You are currently unemployed! Get a job.`,"Red")]})
           
        }
       
    }
    if (interaction.commandName === "balance"){
       
        const balenciagaRef = collection(db,"balenciaga")
           const hasornot = await balenciaga(username)
           const q = query(balenciagaRef, where("member", "==", username));
           const querySnapshot = await getDocs(q)
            let docu = []
            querySnapshot.forEach((doc) => {
                       docu.push(doc.id);
            });
         
                 
            if (docu.length > 0) {
                const balanceRef = doc(db, "balenciaga", docu[0]);
                const docSnap = await getDoc(balanceRef);
                const currentBalance = Number(docSnap.data().money)
                interaction.reply({embeds:[buildembed("/balance",interaction.user.username,`You have ${currentBalance} skibidi coins!`,"Green")]})


                } else {
                       await addDoc(balenciagaRef,{
                           "member": username,
                           "money": Number(0)
                           
                    })
     
                    interaction.reply({embeds:[buildembed("/balance",interaction.user.username,`You have 0 skibidi coins!`,"Green")]})


                }
       
    }
    if (interaction.commandName === "gamble"){
        const money = interaction.options.getString("money")
        const balance = await hasbalanceornot(username)
        const dbmoney = balance.money
        if (balance === 0){
            interaction.reply({embeds:[buildembed("/gamble",interaction.user.username,`You have no money!`,"Red")]})


        } else if (dbmoney < money){
           
            interaction.reply({embeds:[buildembed("/gamble",interaction.user.username,`You don't enough have money to gamble that much!`,"Red")]})


        } else if (dbmoney >= money){
            const odd = getRandomNumber(1,10)
            console.log(odd)
            const winnings = money * 3.2
            if (odd === 1){
                modifybalance(winnings,username)
               
                interaction.reply({embeds:[buildembed("/gamble",interaction.user.username,`You won ${winnings}!`,"Green")]})
            }else {
                modifybalance(-money,username)
                 
                interaction.reply({embeds:[buildembed("/gamble",interaction.user.username,`You lost ${money}!`,"Red")]})


            }
        }
       
    }
    if (interaction.commandName == "invest"){
        const type = interaction.options.getString("type")
        const money = interaction.options.getString("money")
        const balance = await hasbalanceornot(username)
        const dbmoney = balance.money
        if (balance === 0){
            interaction.reply({embeds:[buildembed("/invest",interaction.user.username,`You have no money!`,"Red")]})


        } else if (dbmoney < money){
           
            interaction.reply({embeds:[buildembed("/invest",interaction.user.username,`You don't enough have money to gamble that much!`,"Red")]})


        } else if (dbmoney >= money){
            const now = Date.now();
        const cooldownAmount = 30 * 1000; // 30 seconds in milliseconds


        // Check if user is on cooldown
        if (cooldowns.has(userId)) {
            const expirationTime = cooldowns.get(userId) + cooldownAmount;


            if (now < expirationTime) {
                const timeLeft = ((expirationTime - now) / 1000).toFixed(1); // Calculate time left
                return interaction.reply({
                    embeds: [
                        buildembed(
                            "/invest",
                            username,
                            `You must wait ${Math.round(timeLeft)} seconds before using /invest again.`,
                            "Red"
                        ),
                    ],
                    ephemeral: true, // Make the message private
                });
            }
        }


        // Add or update the user's cooldown
        cooldowns.set(userId, now);
            if (type == "index"){
                const winnings = money * 2
                const odd = getRandomNumber(1,2)
                if (odd == 1){
                    modifybalance(winnings,username)
                    interaction.reply({embeds:[buildembed("/invest",interaction.user.username,`You doubled your money and got ${winnings}!`,"Green")]})


                } else {
                    modifybalance(-money,username)


                    interaction.reply({embeds:[buildembed("/invest",interaction.user.username,`You  lost money. You  lost ${money}!`,"Red")]})
                }
            } else if (type == "managed"){
                const odd = getRandomNumber(1,6)
                const winnings = money * 4
                if (odd == 1){
                    modifybalance(winnings,username)
                    interaction.reply({embeds:[buildembed("/invest",interaction.user.username,`You quadrupled your money and got ${winnings}!`,"Green")]})


                } else {
                    modifybalance(-money,username)


                    interaction.reply({embeds:[buildembed("/invest",interaction.user.username,`You  lost money. You  lost ${money}!`,"Red")]})
                }
            }
    }
}
if (interaction.commandName == "quit"){
    let jobs_ = [];
    const q = query(jobRef, where("member", "==", interaction.user.username));
    const querySnapshot = await getDocs(q);
 
    querySnapshot.forEach((doc) => {
        jobs_.push(doc.id);
    });
    if (jobs_.length > 0) {
        await deleteDoc(doc(db, "job", jobs_[0]));
        interaction.reply({embeds:[buildembed("/quit",username,`You quitted your job!`,"Green")]})


    } else {
        interaction.reply({embeds:[buildembed("/quit",username,`You are currently unemployed! Get a job.`,"Red")]})
       
    }
   
   
}
if (interaction.commandName == "loan") {
    const loanStat = await loanornot(username)
    const balance = await hasbalanceornot(username);
    const money = parseFloat(interaction.options.getString("money")); // Convert money to a number
    const debtRef = collection(db, "debt")
    if (money > 1000000){
        interaction.reply({ embeds: [buildembed("/loan", username, "You must loan less than 1 million skibidi coins.", "Red")]})


    } else {
        if (balance == 0) {
            interaction.reply({
                embeds: [buildembed("/loan", username, "You must work at least 1 time before loaning.", "Red")]
            });
        } else {
            if (loanStat == 1){
                interaction.reply({
                    embeds: [buildembed("/loan", username, "You must pay off your last loan first.", "Red")]
                });
            }else {
                const interest = money * (7 / 100);
                const totalLoan = money + interest;
                const loanDate = new Date();  // Get the current date


                // Modify the balance and reply with the total amount owed
                modifybalance(totalLoan, username);
                await addDoc(debtRef, {
                    "member": username,
                    "money": totalLoan.toFixed(0),
                    "loanDate": loanDate.toISOString() // Store the loan date
                });
                interaction.reply({
                    embeds: [buildembed("/loan", username, `You now owe ${totalLoan.toFixed(0)} (+7% interest). You must pay your loan back in 7 days. if you dont pay back your the amount you have to pay will increase by 10% every week`, "Green")]
                });
            }


            // Calculate the interest and the total loan
        }}}   

        if (interaction.commandName === "brainrot"){
            const randomnum = getRandomNumber(1,3)
            if (randomnum == 1){
                interaction.reply({
                    embeds: [buildembed("/brainrot", username, `Bro thought he could become the next rizz king by doing the uncanny ankha zone dance like a sussy baka in ohio💀dont bro know quandale dingle already did the forgis on the jeep thug shaker banban style with baller💀bro aint ever making it out of oklahoma the ocky way💀 that shit just plain uncanny like skibidi toilet bro💀 bro got negative infinity morbin chill bill pizza tower barbenheimer rizz bro💀bro got that nathaniel b ahh griddy bro💀bro really thought he had that rise of gru grimace shake 1 2 buckle my shoe spiderverse whopper rizz bro💀bro got that canon event baby gronk waffle house monday left me broken ahh drip in ohio bro💀 we aint ever makin it out of ohio with bros goofy ahh dj khaled mr chedda sisyphus toxic gossip train pikmin 4 ahh rizz bro💀 that aint even elephant mario titanic submarine god tier rizz bro💀thats just uncanny like shadow wizard money gang ambatukam twitter x bro💀fr bro💀 like bro lets go golfing in ohio kumalala savesta sbidi toiledt`, "Green")]
                });
            } else if (randomnum == 2){
                interaction.reply({
                    embeds: [buildembed("/brainrot", username, "As I sat in the midst of my ohio rizz class, sipping on my grimace shake from the skibidi cafe, the ALPHA SIGMA level 800 gyatt student skibidied by. It was a moment of sheer sigmaness as I witnessed this ohio of a figure skibidi past my classroom, his aura exuding an otherworldly charm, as if he had rizzed up ohio and baby gronk. Meanwhile, the professor skibidied on about the alpha sigma grindset and sussy amongus, but my gyatt was rizzed by the sigmaness skibidiing before me. It felt like I was caught in a surreal blend of looksmaxxing and fanum taxing, akin to a scene from a true omega sigma. In that instant, I felt a surge of THE SKIBIDI SIGMA coursing through my gyatt, as if I had tapped into some hidden sigmaness of being alpha. And in a sudden burst of rizz, I couldn't help but unbetafy by doing the ohio and say, 'Behold, the majestic gyatt in all his bomboclat glory!", "Green")]
                });
            } else if (randomnum == 3){
                interaction.reply({
                    embeds: [buildembed("/brainrot", username, "Feastbeals+ KSI music + Noradrenaline + Stillwater + Mango + Jonkler Laugh + Talk Tuah + Jamaican Smile + German Stare+ English or Spanish + Winter Arc + Lunchly+ Anger issues + Pakistani sitting= 💀☠", "Green")]
                });
            }
        }
  
    
});
async function checkOverdueLoans() {
    const debtRef = collection(db, "debt");
    const querySnapshot = await getDocs(debtRef);

    querySnapshot.forEach(async (doc) => {
        const loanData = doc.data();
        const loanDate = new Date(loanData.loanDate);
        const currentDate = new Date();
        const diffTime = currentDate - loanDate; // Difference in milliseconds
        const diffDays = diffTime / (1000 * 3600 * 24); // Convert milliseconds to days

        if (diffDays >= 7) {
            const penalty = loanData.money * 0.1; // Apply a 10% penalty
            const newTotalLoan = loanData.money + penalty;

            // Update the loan with the penalty
            await updateDoc(doc.ref, {
                "money": newTotalLoan.toFixed(0)
            });

            // Notify the user about the penalty
            const user = loanData.member;
            modifybalance(penalty, user); // Add penalty to user balance
            client.users.fetch(user).then((user) => {
                user.send(`Your loan has been overdue for more than 7 days, and a penalty of ${penalty} Skibidi coins has been applied.`);
            });
        }
    });
}
setInterval(() => {
    checkOverdueLoans()
}, 86400000); // Run every 24 hours (86400000 ms)

client.login(token);

