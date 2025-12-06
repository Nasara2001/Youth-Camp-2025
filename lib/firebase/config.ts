// Firebase configuration
import { initializeApp, getApps, FirebaseApp } from "firebase/app"
import { getFirestore, Firestore, enableIndexedDbPersistence } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAqqWKCDzau29mSZ7sq_4LHFKrNU9cIIUY",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "youth-camp-2025-reg.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "youth-camp-2025-reg",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "youth-camp-2025-reg.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "670277155060",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:670277155060:web:7aaa8659202862fe8906a1",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-BC0HJQDC16",
}

// Initialize Firebase (only on client side)
let app: FirebaseApp | undefined
let db: Firestore | undefined

if (typeof window !== "undefined") {
  try {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig)
      console.log("Firebase initialized successfully")
    } else {
      app = getApps()[0]
      console.log("Using existing Firebase app")
    }
    
    // Initialize Firestore
    db = getFirestore(app)
    console.log("Firestore initialized successfully", { projectId: firebaseConfig.projectId })
    
    // Enable offline persistence
    enableIndexedDbPersistence(db).catch((err) => {
      if (err.code === "failed-precondition") {
        console.warn("Multiple tabs open, persistence can only be enabled in one tab at a time.")
      } else if (err.code === "unimplemented") {
        console.warn("The current browser does not support all of the features required for persistence.")
      } else {
        console.warn("Error enabling offline persistence:", err)
      }
    })
  } catch (error) {
    console.error("Error initializing Firebase:", error)
  }
}

export { db }
export default app

