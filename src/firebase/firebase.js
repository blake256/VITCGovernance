import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  onSnapshot,
} from 'firebase/firestore'
import { getAuth, signInWithCustomToken } from 'firebase/auth'
import { initializeApp } from 'firebase/app'
import firebaseCredentials from './credentials/firebaseCredentials'
import eventBus from '@/utils/events/eventBus'

// Firebase app
const app = initializeApp(firebaseCredentials.config)

// Firebase auth
export const firestoreAuth = getAuth(app)
let currentUserToken = null

// Firestore db ref
const firestoreDB = getFirestore()

// Firestore proposals collections and snapshot listener
export const proposalsFirestore = collection(firestoreDB, 'proposals')
export const proposalsMapDocID = 'proposals-map'
onSnapshot(doc(proposalsFirestore, proposalsMapDocID), docSnap => {
  if (docSnap) {
    eventBus.$emit('proposals-map-updated', docSnap.data())
    // console.log('proposals-map-updated', docSnap.data())
  }
})

// Firestore proposal stats doc ref and snapshot
export const statsFirestore = collection(firestoreDB, 'stats')
export const proposalsStatsDocID = 'proposal-stats'
onSnapshot(doc(statsFirestore, proposalsStatsDocID), docSnap => {
  if (docSnap) {
    eventBus.$emit('proposal-stats-updated', docSnap.data())
    // console.log('proposal-stats-updated', docSnap.data())
  }
})

// Firestore voting map ref and snapshot
export const votesFirestore = collection(firestoreDB, 'voting')
export const votingMapDocID = 'voting-map'
onSnapshot(doc(votesFirestore, votingMapDocID), docSnap => {
  if (docSnap) {
    eventBus.$emit('voting-map-updated', docSnap.data())
    // console.log('voting-map-updated', docSnap.data())
  }
})

// Firestore user map ref and snapshot
export const usersFirestore = collection(firestoreDB, 'users')
export const userMapDocID = 'user-map'

/**
 *
 */
export async function getAllData(storeCollection) {
  return getDocs(storeCollection)
}

/**
 *
 */
export async function getDataById(storeCollection, docID) {
  return getDoc(doc(storeCollection, docID))
}

/**
 *
 */
export async function getSnapshot(storeCollection, docID, eventName) {
  return onSnapshot(doc(storeCollection, docID), docSnap => {
    if (docSnap) {
      eventBus.$emit(eventName.toString, docSnap.data())
    }
  })
}

/**
 *
 */
export async function getCurrentUser() {
  return new Promise((resolve, reject) => {
    const unsubscribe = firestoreAuth.onAuthStateChanged(user => {
      unsubscribe()
      resolve(user)
    }, reject)
  })
}

/**
 *
 */
export function isUserAdmin() {
  return currentUserToken.claims.whitelisted
}

/**
 *
 */
export async function signInByToken(token) {
  await signInWithCustomToken(firestoreAuth, token)
  currentUserToken = await firestoreAuth.currentUser.getIdTokenResult(true)

  return currentUserToken
}

/**
 *
 */
export async function signOutCurrentUser() {
  currentUserToken = null

  return firestoreAuth.signOut()
}

/**
 *
 */
export async function hasUserVotedByID(proposalID) {
  const votingMap = (await getDataById(votesFirestore, votingMapDocID)).data()
  if (votingMap && firestoreAuth && firestoreAuth.currentUser) {
    if (firestoreAuth.currentUser.uid) {
      const uid = firestoreAuth.currentUser.uid.toString()
      if (uid.length > 0) {
        if (votingMap[`${proposalID}`] && votingMap[`${proposalID}`].voterList) {
          return votingMap[`${proposalID}`].voterList.includes(uid)
        }
      }
    }
  }

  return true
}
