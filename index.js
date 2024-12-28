const { Client, SlashCommandBuilder, Events, EmbedBuilder, GatewayIntentBits } = require("discord.js");
const { token } = require("./config.json");
const modifybalance = require("./Functions/ModifiyBalance")
const  buildembed = require("./Functions/BuilderEmbed")
const  balenciaga = require("./Slashers/balenciaga")
const { initializeApp } = require("firebase/app")
const { getFirestore,collection, where, addDoc,query,getDocs,doc,getDoc,deleteDoc } = require("firebase/firestore");// TODO: Add SDKs for Firebase products that you want to use
const hasbalanceornot = require("./Functions/hasBalanceOrnot");

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
            

    client.application.commands.create(quitJob);          
    client.application.commands.create(GetEmployed);
    client.application.commands.create(work);
    client.application.commands.create(balance);
    client.application.commands.create(gamble);
    client.application.commands.create(invest)
});

client.on(Events.InteractionCreate, async (interaction) => {
    console.log("logged");

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
}
       

);

client.login(token);

