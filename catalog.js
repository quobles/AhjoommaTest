import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { db } from "./db.js";

async function testFirestore() {
  try {
    const snapshot = await getDocs(collection(db, "products"));
    if (snapshot.empty) {
      console.log("⚠️ No documents found in 'products' collection.");
    } else {
      snapshot.forEach(doc => {
        console.log("✅ Found doc:", doc.id, doc.data());
      });
    }
  } catch (err) {
    console.error("❌ Firestore error:", err);
  }
}

testFirestore();
