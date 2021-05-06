/**
 * Displays account info, such as name, email, and joined date.
 * 
 * Includes deleting account option.
 */

import { useState, useEffect } from 'react'
import DeleteAccount from '../../containers/DeleteAccount'
import accountStyles from '../../styles/AccountPage.module.css'
import firebase from 'firebase'
import firebaseConfig from '../../firebaseConfig'
import { connect } from 'react-redux'
import ErrorPage from '../../components/ErrorPage/ErrorPage'
import DateFormatter from '../../components/DateFormatter/DateFormatter'


// firebase settings
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

let db = firebase.firestore()

const AccountPage = (props) => {
  const [userName, setUserName] = useState("")
  
  useEffect(() => {

    // if the user is signed in
    if (props.currentUser) {

      // gets the name of the user from firebase
      db.collection('users').doc(props.currentUser.uid).get().then(userInfo => {
        setUserName(userInfo.data().name)
      })
    }
  }, [])

  return (
    // if the user is signed in
    props.currentUser
      ?
    <div className={accountStyles.mainBody}>
      <div className={accountStyles.contents}>
        <div className="accountPicWrapper">
          {
            props.currentUser.photoURL
              ?
            <img className={accountStyles.userImg} src={props.currentUser.photoURL} alt="user-profile-pic" />
              :
            <img className={accountStyles.userImg} src="./static/images/account-placeholder.jpg" alt="user-profile-pic" />
          }
        </div>
        <h3>{userName}</h3>
        <p className={accountStyles.userEmail}>{props.currentUser.email}</p>
        <p>Joined Date: <DateFormatter date={Date.parse(props.currentUser.metadata.creationTime)} /></p>
      </div>

      {/* Deleting account */}
      <DeleteAccount />
    </div>
      :
    <ErrorPage />
  )
}

const mapStateToProps = state => {
  return {
    currentUser: state.currentUser
  }
}

export default connect(mapStateToProps)(AccountPage)