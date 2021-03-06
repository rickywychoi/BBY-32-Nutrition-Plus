/**
 * Your daily intake. Submits data from user-filled questionnaire and calculates
 * the user's required daily values. 
 * 
 * Uses React Bootstrap Form for each input form, and Button to submit/proceed.
 * 
 * Form
 * @see https://react-bootstrap.github.io/components/forms/
 * 
 * Button
 * @see https://react-bootstrap.github.io/components/buttons/
 * 
 * Uses React Icons to help customize design of buttons.
 * 
 * MdArrowBack from Material Design Icons library
 * @see http://google.github.io/material-design-icons/
 */


import { useState } from 'react'
import { Form, Button } from 'react-bootstrap'
import { MdArrowBack } from 'react-icons/md'
import PopOver from '../components/UI/PopOver'
import questionStyles from '../styles/Questionnaire.module.css'
import buttonStyles from '../styles/buttons.module.css'
import * as actions from '../store/actions'
import { connect } from 'react-redux'
import { useRouter } from 'next/router'

const Questionnaire = (props) => {
  const router = useRouter()

  // to check if the form is ready to be submitted
  const [validated, setValidated] = useState(false);
  // sets the details of user
  const [userInfo, setUserInfo] = useState({
    age: 0,
    gender: "male",
    pregnancy: "",
    lactation: "",
    weight: 0,
    isPounds: false,
    height: 0,
    isInches: false,
    physicalActivity: "",
    eer: 0
  })

  // checks if the form has valid information and submits
  const handleSubmit = (event) => {
    event.preventDefault()
    const form = event.currentTarget
    if (form.checkValidity() === false) {
      event.stopPropagation()
    }

    setValidated(true);
  };

  // sets the age of the user
  const handleAgeChange = e => {
    setUserInfo({ ...userInfo, age: e.target.value })
  }
  // sets the gender of the user
  const handleGenderChange = e => {
    setUserInfo({ ...userInfo, gender: e.target.value })
  }
  // sets if the user is pregnant (if gender is female)
  const handlePregnancyChange = e => {
    setUserInfo({ ...userInfo, pregnancy: e.target.value })
  }
  // sets the user's lactation (if gender is female)
  const handleLactationChange = e => {
    setUserInfo({ ...userInfo, lactation: e.target.value })
  }
  // sets the user's weight (kgs)
  const handleWeightChange = e => {
    setUserInfo({ ...userInfo, weight: e.target.value })
  }
  // sets the user's weight (lbs)
  const handlePoundsChange = e => {
    setUserInfo(prevState => ({
      ...prevState,
      isPounds: !prevState.isPounds
    }))
  }
  // sets the user's height (cm)
  const handleHeightChange = e => {
    setUserInfo({ ...userInfo, height: e.target.value })
  }
  // sets the user's height (inches)
  const handleInchesChange = e => {
    setUserInfo(prevState => ({
      ...prevState,
      isInches: !prevState.isInches
    }))
  }
  // sets the user's physical activity level
  const handleActivityChange = e => {
    setUserInfo({ ...userInfo, physicalActivity: e.target.value })
  }
  
  // sets the result to userInfo
  const showResult = () => {
    let eer, pa = 0
    let {
      age, 
      gender, 
      pregnancy, 
      lactation, 
      weight,
      isPounds, 
      height, 
      isInches,
      physicalActivity
    } = userInfo

    // unit conversion for weight and height
    if (isPounds) 
      weight *= 0.45359237
    if (isInches)
      height *= 2.54

    // default physical activity coefficients
    switch (physicalActivity) {
      case "sedentary":
        pa = 1.00
        break;
      case "lowActive":
        pa = 1.13
        break;
      case "active":
        pa = 1.26
        break;
      case "veryActive":
        pa = 1.42
        break;
      default:
        pa = 0
    }
    // physical activity coefficients for boys, girls, men, and wormen
    if (age <= 18 && gender.localeCompare("female") == 0 && pa == 1.13) 
      pa = 1.16
    else if (age > 18 && gender.localeCompare("male") == 0 && pa == 1.13)
      pa = 1.11
    else if (age > 18 && gender.localeCompare("female") == 0 && pa == 1.13)
      pa = 1.12
    else if (age <= 18 && gender.localeCompare("female") == 0 && pa == 1.26)
      pa = 1.31
    else if (age > 18 && gender.localeCompare("male") == 0 && pa == 1.26)
      pa = 1.25
    else if (age > 18 && gender.localeCompare("female") == 0 && pa == 1.26)
      pa = 1.27
    else if (age <= 18 && gender.localeCompare("female") == 0 && pa == 1.42)
      pa = 1.56
    else if (age > 18 && gender.localeCompare("male") == 0 && pa == 1.42)
      pa = 1.48
    else if (age > 18 && gender.localeCompare("female") == 0 && pa == 1.42)
      pa = 1.45

    // boys, girls, men, and women
    if (age >= 3 && age <= 8 && gender.localeCompare("male") == 0)
      eer = 88.5 - (61.9 * age) + pa * ((26.7 * weight) + (903 * height / 100)) + 20
    else if (age > 8 && age <= 18 && gender.localeCompare("male") == 0)
      eer = 88.5 - (61.9 * age) + pa * ((26.7 * weight) + (903 * height / 100)) + 25
    else if (age >= 3 && age <= 8 && gender.localeCompare("female") == 0)
      eer = 135.3 - (30.8 * age) + pa * ((10.0 * weight) + (934 * height / 100)) + 20
    else if (age > 8 && age <= 18 && gender.localeCompare("female") == 0)
      eer = 135.3 - (30.8 * age) + pa * ((10.0 * weight) + (934 * height / 100)) + 25
    else if (age > 18 && gender.localeCompare("male") == 0)
      eer = 662 - (9.53 * age) + pa * ((15.91 * weight) + (539.6 * height / 100))
    else if (age > 18 && gender.localeCompare("female") == 0)
      eer = 354 - (6.91 * age) + pa * ((9.36 * weight) + (726 * height / 100))

    // if a female is a pregnant
    if (gender.localeCompare("female") == 0 && pregnancy.localeCompare("trimester2") == 0)
      eer += 340
    else if (gender.localeCompare("female") == 0 && pregnancy.localeCompare("trimester3") == 0)
      eer += 452
    else if (gender.localeCompare("female") == 0 && lactation.localeCompare("postpartum1") == 0)
      eer = eer + 500 - 170 
    else if (gender.localeCompare("female") == 0 && lactation.localeCompare("postpartum2") == 0)
      eer = eer + 400

    setUserInfo({ ...userInfo, eer: Math.ceil(eer), pa: pa })

    // if the form is ready to be submitted, send user information to application's state and route to the result page
    if (validated) {
      props.onSubmitEntryUserInput(userInfo)
      router.push("/questionnaire/result")
    }
  }

  // goes back to previous screen
  const goBack = () => {
    router.back()
  }

  return (
    <div className={questionStyles.body}>
      <div className={questionStyles.header}>
        {
          !router.query.firsttime
            ?
          <Button variant="secondary" className={buttonStyles.button} onClick={goBack}><span><MdArrowBack /> Back</span></Button>
            :
          null
        }
        <h1 className={questionStyles.mainTitle}>We are retrieving some <br/>basic information from you.</h1>
      </div>

      {/* Form component from react-bootstrap */}
      <Form validated={validated} onSubmit={handleSubmit}>
        <Form.Group controlId="formBasicAge">
          <Form.Label>What is your age?</Form.Label>
          <Form.Control 
            required
            type="number" 
            min="0" 
            max="112" 
            placeholder="Your age (example: 19)"
            onChange={handleAgeChange} />
          <Form.Control.Feedback type="invalid">
            Please enter your age.
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group controlId="formBasicGender">
          <Form.Label>What is your gender?</Form.Label>
          <Form.Control required as="select" defaultValue="" onChange={handleGenderChange}>
            <option disabled value="">Select your gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </Form.Control>
          <Form.Control.Feedback type="invalid">
            Please select your age.
          </Form.Control.Feedback>
        </Form.Group>
        {
          // if the user is female - include pregnant/lactation option
          userInfo.gender.localeCompare("female") == 0
            ?
          (
            <>
              <hr />
              <div className={questionStyles.pregnantWrapper}>
                <h2 className={questionStyles.pregnantTitle}>If you are pregnant:</h2>
                <Form.Group controlId="formBasicPregnancy">
                  <Form.Label>What stage of pregnancy are you in?</Form.Label>
                  <Form.Control as="select" defaultValue="Select your trimester" onChange={handlePregnancyChange}>
                    <option disabled>Select your trimester</option>
                    <option value="trimester1">Trimester 1 (Week 1 - Week 12)</option>
                    <option value="trimester2">Trimester 2 (Week 13 - Week 28)</option>
                    <option value="trimester3">Trimester 3 (Week 29 - Week 40)</option>
                  </Form.Control>
                </Form.Group>
                <Form.Group controlId="formBasicLactation">
                  <Form.Label>How long have you been after childbirth? (Lactation)</Form.Label>
                  <Form.Control as="select" defaultValue="Select your period" onChange={handleLactationChange}>
                    <option disabled>Select your period</option>
                    <option value="postpartum1">0-6 months postpartum</option>
                    <option value="postpartum2">7-12 months postpartum</option>
                  </Form.Control>
                </Form.Group>
              </div>
              <hr />
            </>
          )
            :
          null
        }
        <Form.Group controlId="formBasicWeight">
          <Form.Label>What is your weight in <i>{userInfo.isPounds ? `pounds` : `kg`}</i>?</Form.Label>
          <Button 
            onClick={handlePoundsChange}
            className={questionStyles.weightUnitToggle}
            variant={userInfo.isPounds ? `success` : `warning`}
          >
            {userInfo.isPounds ? `kg?` : `pounds?`}
          </Button>
          <Form.Control 
            required
            type="number" 
            min="0" 
            max="1000" 
            placeholder="Your weight (example: 70 kg or 154 lb)"
            onChange={handleWeightChange} />
          <Form.Control.Feedback type="invalid">
            Please enter your weight.
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group controlId="formBasicHeight">
        <Form.Label>What is your height in <i>{userInfo.isInches ? `inches` : `cm`}</i>?</Form.Label>
          <Button 
            onClick={handleInchesChange}
            className={questionStyles.heightUnitToggle}
            variant={userInfo.isInches ? `success` : `warning`}
          >
            {userInfo.isInches ? `cm?` : `inches?`}
          </Button>
          <Form.Control 
            required
            type="number" 
            min="0" 
            max="250" 
            placeholder="Your height (example: 177 cm or 70 inches)" 
            onChange={handleHeightChange} />
          <Form.Control.Feedback type="invalid">
            Please enter your height.
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group controlId="formBasicPhysicalActivity">
          <Form.Label>What is your level of physical activity?</Form.Label>
          <PopOver />
          <Form.Control 
            required
            as="select"
            defaultValue="" 
            onChange={handleActivityChange}>
            <option disabled value="">Choose your level of physical activity</option>
            <option value="sedentary">Sedentary</option>
            <option value="lowActive">Low Active</option>
            <option value="active">Active</option>
            <option value="veryActive">Very Active</option>
          </Form.Control>
          <Form.Control.Feedback type="invalid">
            Please select your PAL.
          </Form.Control.Feedback>
        </Form.Group>
        <div className={questionStyles.wrapButton}>
          <Button 
            className="mt-3" 
            variant={!validated ? `primary`: `success`} 
            type="submit" 
            onClick={showResult}
          >
            {!validated ? `Submit` : `Proceed`}
          </Button>
        </div>
      </Form>
    </div>
  )
}

// contains the dispatch action to send details of health information to the application's state
const mapDispatchToProps = dispatch => {
  return {
    onSubmitEntryUserInput: (userInfo) => dispatch({type: actions.SUBMITENTRYUSERINPUT, payload: userInfo})
  }
}

export default connect(null, mapDispatchToProps)(Questionnaire)