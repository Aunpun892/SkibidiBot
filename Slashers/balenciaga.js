const { initializeApp } = require("firebase/app")
const { getFirestore,collection, where, addDoc,query,getDocs } = require("firebase/firestore")

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
  const balenciagaRef = collection(db,"balenciaga")
async function balenciaga(user){
    const q = query(balenciagaRef, where("member", "==", user));
            const querySnapshot = await getDocs(q)
            let docu = []
            querySnapshot.forEach((doc) => {
                docu.push(doc.id);
            });
    
           
            if (docu.length > 0)   { //already have
                return 1
            
            } else {//doesnt currently have
                return 0
            }
}

module.exports = balenciaga