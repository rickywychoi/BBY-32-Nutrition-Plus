/**
 * Obtains a grocery item from the USDA FDC API based on the user's search query
 * and creates a page with the item details. 
 * 
 * Uses React Bootstrap Accordion to create a collapsable menu, Button for 'back',
 * and 'Add to My Meals', Card for expandable header, Form to get inputs of item quantity,
 * and Popover and OverlayTrigger to display quantity selection of item.
 * 
 * Accordion
 * @see https://react-bootstrap.github.io/components/accordion/
 * 
 * Button
 * @see https://react-bootstrap.github.io/components/buttons/
 * 
 * Card
 * @see https://react-bootstrap.github.io/components/cards/
 * 
 * Popover, OverlayTrigger
 * @see https://react-bootstrap.github.io/components/overlays/#popovers
 * 
 * Form
 * @see https://react-bootstrap.github.io/components/forms/
 */

import { useRouter } from 'next/router'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { Button, Accordion, Card, OverlayTrigger, Popover, Form } from 'react-bootstrap'
import { MdArrowBack } from 'react-icons/md'
import { connect } from 'react-redux'
import axios from 'axios'
import firebase from 'firebase'
import firebaseConfig from '../../firebaseConfig'
import { USDA_API_KEY } from '../../apiKey'
import detailStyles from '../../styles/ItemDetailsPage.module.css'
import buttonStyles from '../../styles/buttons.module.css'

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
let db = firebase.firestore()

const ItemDetailsPage = (props) => {
  const router = useRouter()
  const [itemName, setItemName] = useState("")
  const [result, setResult] = useState({})
  const [nutrients, setNutrients] = useState([])
  const [additionalNutrients, setAdditionalNutrients] = useState(null)
  const [calories, setCalories] = useState({})
  const [userDailyValue, setUserDailyValue] = useState([])
  const [quantity, setQuantity] = useState(0)
  const [qtyValidated, setQtyValidated] = useState(false)
  
  let FOOD_API_URL = `https://api.nal.usda.gov/fdc/v1/food/${router.query.fdcId}?API_KEY=${USDA_API_KEY}`

  // to get width of table
  const tableRef = useRef(null)
  let tableWidth
  if (tableRef.current) {
    tableWidth = tableRef.current.clientWidth
  }
  useEffect(() => {
    setItemName(router.query.itemname)
    
    // retrieve daily value of the user
    if (props.currentUser) {
      let userDV = []
      db.collection('users').doc(props.currentUser.uid).get().then(userInfo => {
        userInfo.data().healthInfo.dailyValue.forEach(nut => {
          userDV.push(nut)
        })
        setUserDailyValue(userDV)
        console.log("Getting User Daily Value Success")
      }).catch(error => {
        console.log(error)
      })
    }
    // GET request for Food api
    axios.get(FOOD_API_URL).then(res => {
      setResult(res.data)
      let newArray = []
      let extraArray = []
      res.data.foodNutrients.forEach(nut => {
        let myNutrient = nut.nutrient
        if (myNutrient.name.localeCompare("Energy") == 0 && myNutrient.unitName.localeCompare("kcal") == 0) {
          setCalories({
            id: myNutrient.id,
            amount: nut.amount,
            name: myNutrient.name,
            unitName: myNutrient.unitName,
            isExist: true,
            group: "calories"
          })
        }
        if ( myNutrient.name.localeCompare("Total lipid (fat)") == 0
          || myNutrient.name.localeCompare("Fatty acids, total saturated") == 0
          || myNutrient.name.localeCompare("Cholesterol") == 0
          || myNutrient.name.localeCompare("Sodium, Na") == 0
          || myNutrient.name.localeCompare("Carbohydrates") == 0
          || myNutrient.name.localeCompare("Fiber, total dietary") == 0
          || myNutrient.name.localeCompare("Sugars, total including NLEA") == 0
          || myNutrient.name.localeCompare("Protein") == 0
        ) {
          newArray.push({
            id: myNutrient.id,
            amount: nut.amount,
            name: myNutrient.name,
            unitName: myNutrient.unitName,
            isExist: true,
            group: "getLessOf"
          })
        } else if ( myNutrient.name.localeCompare("Vitamin D (D2 + D3)") == 0
          || myNutrient.name.localeCompare("Calcium, Ca") == 0
          || myNutrient.name.localeCompare("Iron, Fe") == 0
          || myNutrient.name.localeCompare("Potassium, K") == 0
        ) {
          newArray.push({
            id: myNutrient.id,
            amount: nut.amount,
            name: myNutrient.name,
            unitName: myNutrient.unitName,
            isExist: true,
            group: "getMoreOf"
          })
        } else if ( myNutrient.name.localeCompare("Vitamin A, RAE") == 0
        || myNutrient.name.localeCompare("Vitamin C, total ascorbic acid") == 0
        || myNutrient.name.localeCompare("Vitamin E (alpha-tocopherol)") == 0
        || myNutrient.name.localeCompare("Vitamin K (phylloquinone)") == 0
        || myNutrient.name.localeCompare("Thiamin") == 0
        || myNutrient.name.localeCompare("Riboflavin") == 0
        || myNutrient.name.localeCompare("Niacin") == 0
        || myNutrient.name.localeCompare("Vitamin B-6") == 0
        || myNutrient.name.localeCompare("Folate, DFE") == 0
        || myNutrient.name.localeCompare("Vitamin B-12") == 0
        || myNutrient.name.localeCompare("Choline, total") == 0
        || myNutrient.name.toLowerCase().includes("biotin")
        || myNutrient.name.localeCompare("Pantothenic acid") == 0
        || myNutrient.name.localeCompare("Phosphorus, P") == 0
        || myNutrient.name.localeCompare("Iodine, I") == 0
        || myNutrient.name.localeCompare("Magnesium, Mg") == 0
        || myNutrient.name.localeCompare("Zinc, Zn") == 0
        || myNutrient.name.localeCompare("Selenium, Se") == 0
        || myNutrient.name.localeCompare("Copper, Cu") == 0
        || myNutrient.name.localeCompare("Manganese, Mn") == 0
        || myNutrient.name.toLowerCase().includes("chromium")
        || myNutrient.name.localeCompare("Molybdenum, Mo") == 0
        || myNutrient.name.toLowerCase().includes("chlori")
        ) {
          extraArray.push({
            id: myNutrient.id,
            amount: nut.amount,
            name: myNutrient.name,
            unitName: myNutrient.unitName,
            isExist: true,
            group: "additional"
          })
        }
          
          // change each id corresponding to id from daily value
          newArray.forEach(nut => {
            if (nut.name.localeCompare("Total lipid (fat)") == 0)
              nut.id = "1"
            else if (nut.name.localeCompare("Fatty acids, total saturated") == 0)
              nut.id = "2"
            else if (nut.name.localeCompare("Fiber, total dietary") == 0)
              nut.id = "3"
            else if (nut.name.localeCompare("Sugars, total including NLEA") == 0)
              nut.id = "4"
            else if (nut.name.localeCompare("Cholesterol") == 0)
              nut.id = "5"
            else if (nut.name.localeCompare("Sodium, Na") == 0)
              nut.id = "6"
            else if (nut.name.localeCompare("Potassium, K") == 0)
              nut.id = "7"
            else if (nut.name.localeCompare("Calcium, Ca") == 0)
              nut.id = "8"
            else if (nut.name.localeCompare("Iron, Fe") == 0)
              nut.id = "9"
            else if (nut.name.localeCompare("Vitamin A, RAE") == 0)
              nut.id = "10"
            else if (nut.name.localeCompare("Vitamin C, total ascorbic acid") == 0)
              nut.id = "11"
            else if (nut.name.localeCompare("Vitamin D (D2 + D3)") == 0)
              nut.id = "12"
            else if (nut.name.localeCompare("Vitamin E (alpha-tocopherol)") == 0)
              nut.id = "13"
            else if (nut.name.localeCompare("Vitamin K (phylloquinone)") == 0)
              nut.id = "14"
            else if (nut.name.localeCompare("Thiamin") == 0)
              nut.id = "15"
            else if (nut.name.localeCompare("Riboflavin") == 0)
              nut.id = "16"
            else if (nut.name.localeCompare("Niacin") == 0)
              nut.id = "17"
            else if (nut.name.localeCompare("Vitamin B-6") == 0)
              nut.id = "18"
            else if (nut.name.localeCompare("Folate, DFE") == 0)
              nut.id = "19"
            else if (nut.name.localeCompare("Vitamin B-12") == 0)
              nut.id = "20"
            else if (nut.name.toLowerCase().includes("chlori"))
              nut.id = "21"
            else if (nut.name.toLowerCase().includes("biotin"))
              nut.id = "22"
            else if (nut.name.localeCompare("Pantothenic acid") == 0)
              nut.id = "23"
            else if (nut.name.localeCompare("Phosphorus, P") == 0)
              nut.id = "24"
            else if (nut.name.localeCompare("Iodine, I") == 0)
              nut.id = "25"
            else if (nut.name.localeCompare("Magnesium, Mg") == 0)
              nut.id = "26"
            else if (nut.name.localeCompare("Zinc, Zn") == 0)
              nut.id = "27"
            else if (nut.name.localeCompare("Selenium, Se") == 0)
              nut.id = "28"
            else if (nut.name.localeCompare("Copper, Cu") == 0)
              nut.id = "29"
            else if (nut.name.localeCompare("Manganese, Mn") == 0)
              nut.id = "30"
            else if (nut.name.toLowerCase().includes("chromium"))
              nut.id = "31"
            else if (nut.name.localeCompare("Molybdenum, Mo") == 0)
              nut.id = "32"
            else if (nut.name.toLowerCase().includes("chlori"))
              nut.id = "33"
          })

          // change each id corresponding to id from daily value
          extraArray.forEach(nut => {
            if (nut.name.localeCompare("Total lipid (fat)") == 0)
              nut.id = "1"
            else if (nut.name.localeCompare("Fatty acids, total saturated") == 0)
              nut.id = "2"
            else if (nut.name.localeCompare("Fiber, total dietary") == 0)
              nut.id = "3"
            else if (nut.name.localeCompare("Sugars, total including NLEA") == 0)
              nut.id = "4"
            else if (nut.name.localeCompare("Cholesterol") == 0)
              nut.id = "5"
            else if (nut.name.localeCompare("Sodium, Na") == 0)
              nut.id = "6"
            else if (nut.name.localeCompare("Potassium, K") == 0)
              nut.id = "7"
            else if (nut.name.localeCompare("Calcium, Ca") == 0)
              nut.id = "8"
            else if (nut.name.localeCompare("Iron, Fe") == 0)
              nut.id = "9"
            else if (nut.name.localeCompare("Vitamin A, RAE") == 0)
              nut.id = "10"
            else if (nut.name.localeCompare("Vitamin C, total ascorbic acid") == 0)
              nut.id = "11"
            else if (nut.name.localeCompare("Vitamin D (D2 + D3)") == 0)
              nut.id = "12"
            else if (nut.name.localeCompare("Vitamin E (alpha-tocopherol)") == 0)
              nut.id = "13"
            else if (nut.name.localeCompare("Vitamin K (phylloquinone)") == 0)
              nut.id = "14"
            else if (nut.name.localeCompare("Thiamin") == 0)
              nut.id = "15"
            else if (nut.name.localeCompare("Riboflavin") == 0)
              nut.id = "16"
            else if (nut.name.localeCompare("Niacin") == 0)
              nut.id = "17"
            else if (nut.name.localeCompare("Vitamin B-6") == 0)
              nut.id = "18"
            else if (nut.name.localeCompare("Folate, DFE") == 0)
              nut.id = "19"
            else if (nut.name.localeCompare("Vitamin B-12") == 0)
              nut.id = "20"
            else if (nut.name.toLowerCase().includes("chlori"))
              nut.id = "21"
            else if (nut.name.toLowerCase().includes("biotin"))
              nut.id = "22"
            else if (nut.name.localeCompare("Pantothenic acid") == 0)
              nut.id = "23"
            else if (nut.name.localeCompare("Phosphorus, P") == 0)
              nut.id = "24"
            else if (nut.name.localeCompare("Iodine, I") == 0)
              nut.id = "25"
            else if (nut.name.localeCompare("Magnesium, Mg") == 0)
              nut.id = "26"
            else if (nut.name.localeCompare("Zinc, Zn") == 0)
              nut.id = "27"
            else if (nut.name.localeCompare("Selenium, Se") == 0)
              nut.id = "28"
            else if (nut.name.localeCompare("Copper, Cu") == 0)
              nut.id = "29"
            else if (nut.name.localeCompare("Manganese, Mn") == 0)
              nut.id = "30"
            else if (nut.name.toLowerCase().includes("chromium"))
              nut.id = "31"
            else if (nut.name.localeCompare("Molybdenum, Mo") == 0)
              nut.id = "32"
            else if (nut.name.toLowerCase().includes("chlori"))
              nut.id = "33"
          })
      })

      setNutrients(newArray)
      setAdditionalNutrients(extraArray)
    })
  }, [])
  
  // changes to the previous page
  const goBack = () => {
    router.back()
  }

  // Triggers the overlay for cart
  const addToCart = () => {
    console.log("Added")
  }

  // increments the quantity by 1
  const incrementQuantity = () => {
    if (quantity < 99) {
      setQuantity(prevState => parseInt(prevState) + 1)
    }
  }

  // decrements the quantity by 1
  const decrementQuantity = () => {
    if (quantity > 0) {
      setQuantity(prevState => parseInt(prevState) - 1)
    }
  }

  // changes the quantity to user's manual input
  const handleQtyChange = e => {
    e.preventDefault()
    setQuantity(e.target.value)
  }

  // resets the quantity
  const resetQuantity = () => {
    setQuantity(0)
  }

  // checks if quantity is valid and sets it
  const handleSubmit = (event) => {
    event.preventDefault()
    const form = event.currentTarget
    if (form.checkValidity() === false) {
      event.preventDefault()
      event.stopPropagation()
    }

    setQtyValidated(true);
  };


  // adds the new item and its quantity to the cart
  const toMyCart = (e) => {
    if (props.currentUser) {
      db.collection('users').doc(props.currentUser.uid).get().then(userInfo => {
        // get user's cart from firestore
        let currentCart = []
        currentCart.push(...userInfo.data().cart)
        // add items into cart
        for (let i = 0; i < quantity; i++) {
          let addedItem = {
            itemAddedAt: new Date(),
            ...result
          }
          currentCart.unshift(addedItem)
        }
  
        // store user info object with updated cart in firestore
        db.collection('users').doc(props.currentUser.uid).update({
          cart: currentCart
        }).then(
          router.push("/mycart")
        ).catch(err => console.log(err))

      }).catch(err => console.log(err))
    }
  }

  const popover = (
    // Popover component from react-bootstrap
    <Popover id="popover-basic">
      <Popover.Title as="h3" className={detailStyles.popupTitle}>Quantity</Popover.Title>
      <Popover.Content>
        
        {/* Form component from react-bootstrap */}
        <Form noValidate validated={qtyValidated} onSubmit={handleSubmit}>
          <div className={detailStyles.quantityButtonWrapper}>
            <Button variant="outline-danger" onClick={decrementQuantity} className={detailStyles.decrement}>-</Button>
            <Form.Control className={detailStyles.quantityInput} size="sm" type="number" value={quantity} onChange={handleQtyChange} />
            <Form.Control.Feedback type="invalid">
              Please confirm the quantity.
            </Form.Control.Feedback>
            <Button variant="outline-primary" onClick={incrementQuantity} className={detailStyles.increment}>+</Button>
          </div>
          <Button variant="outline-danger" onClick={resetQuantity} className={detailStyles.reset}>Reset</Button>
          <button type="submit" onClick={toMyCart} className={detailStyles.checkoutButton}>Save item(s) to My Cart</button> 
        </Form>
      </Popover.Content>
    </Popover>
  );
  
  return (
    <div className={detailStyles.mainBody}>
      <div className={detailStyles.buttonWrapper}>
        <Button variant="secondary" className={buttonStyles.button} onClick={goBack}><span><MdArrowBack /> Back</span></Button>
        {
          // if the user is signed in
          props.currentUser
            ?
          (
            // OverlayTrigger component from react-bootstrap
            <OverlayTrigger trigger="click" placement="bottom" overlay={popover}>
              <Button variant="success" className={buttonStyles.button} onClick={addToCart}>Add to Cart</Button>
            </OverlayTrigger>
          )
            :
          null
        }
      </div>
      <div className={detailStyles.contents}>
        <h3>{router.query.itemname}</h3>
        <p><i>
          {Object.getOwnPropertyNames(result).map(property => {
            if (property.toLowerCase().includes("category")) {
              if (typeof result[property] == 'string' || result[property] instanceof String) {
                return result[property]
              } else if (typeof result[property] == 'object' || result[property] instanceof Object) {
                let categoryString
                Object.values(result[property]).forEach(val => {
                  if (isNaN(parseFloat(val))) {
                    categoryString = val
                  }
                })
                return categoryString
              }
            }
          })}
        </i></p>
        <div className={detailStyles.tableWrapper}>
          <table className={detailStyles.table} ref={tableRef}>
            <thead className={detailStyles.thead}>
              <tr className = {detailStyles.trow}>
                <th className = {detailStyles.nutritionFacts}>Nutrition Facts</th>
                <th></th>
              </tr>
              <tr> 
                <th className = {detailStyles.subHead}><strong>Servings:&nbsp;</strong>
                {Object.getOwnPropertyNames(result).map(property => {
                  if (property.localeCompare("servingSize") == 0) {
                    return result.householdServingFullText
                  } else if (property.localeCompare("foodPortions") == 0 && result[property] && result[property].length > 0) {
                    let portion = result[property][0]
                    return portion.amount ? portion.amount : portion.portionDescription
                  }
                })}
                </th>
                <th></th>
              </tr>
            </thead>
            <tbody className={detailStyles.tbody}>
              <tr>
                <td className = {detailStyles.subHead}>Amount per serving:&nbsp;
                {Object.getOwnPropertyNames(result).map(property => {
                  if (property.localeCompare("servingSize") == 0) {
                    return result.servingSize + result.servingSizeUnit
                  } else if (property.localeCompare("foodPortions") == 0 && result[property] && result[property].length > 0) {
                    let portion = result[property][0]
                    return portion.modifier ? portion.modifier + ", " + portion.gramWeight + "g" : portion.gramWeight + "g"  
                  }
                })}
                </td>
                <td>
                
                </td>
              </tr>
              <tr className = {detailStyles.nutrient}>
                <td className = {detailStyles.caloriesTitle}>Calories</td>
                <td className = {detailStyles.calories}><strong>{calories.amount}</strong></td>
              </tr>
              <tr className = {detailStyles.nutrient}>
                <td></td>
                <td className = {detailStyles.header}>% Daily Value*</td>
              </tr>
              {
                // Loops through nutrients array and displays each item
                nutrients.map(nut => {
                  return (
                    nut.group.localeCompare("getLessOf") == 0
                      ?
                      <tr key={nut.id}
                      className = {detailStyles.nutrient}>
                        <td>
                          <div>
                            <strong className={detailStyles.name}>{nut.name}</strong>
                            <strong className={detailStyles.amount}>{nut.amount}{nut.unitName}</strong>
                          </div>
                        </td>
                      <td className = {detailStyles.daily}>
                        {
                          nut.name.localeCompare("Protein") === 0 || nut.name.localeCompare("Sugars, total including NLEA") === 0
                          ?
                          ""
                          :
                          userDailyValue.map(dv => {
                            if (dv.id.localeCompare(nut.id) === 0) {
                              return Math.ceil(100 * nut.amount / dv.value) + "%"
                            }
                          })
                        }
                      </td>
                    </tr>
                      :
                      null
                      )
                })
              }
            </tbody>
            <tfoot>
            {
                // Loops through nutrients array and displays each item
                nutrients.map(nut => {
                  return (
                    nut.group.localeCompare("getMoreOf") == 0
                    ?
                    <tr key={nut.id}
                    className = {detailStyles.nutrient}>
                      <td>
                        <div>
                          <strong className={detailStyles.name}>{nut.name}</strong>
                          <strong className={detailStyles.amount}>{nut.amount}{nut.unitName}</strong>
                        </div>
                      </td>
                      <td className = {detailStyles.daily}>
                        {
                          userDailyValue.map(dv => {
                            if (dv.id.localeCompare(nut.id) === 0) {
                              return Math.ceil(100 * nut.amount / dv.value) + "%"
                            }
                          })
                        }
                      </td>
                    </tr>
                      :
                    null
                  )
                })
              }
            </tfoot>
          </table>
          {
            // if there are no additional nutrients in this item
            additionalNutrients === null || additionalNutrients.length == 0 
              ?
            null  
              :
            (
              <>
                {/* Accordion component from react-bootstrap */}
                <Accordion style={{width: `${tableWidth}px`, margin: "0 auto"}} defaultActiveKey="0">

                {/* Card component from react-bootstrap */}
                <Card>
                  <Card.Header>
                    <Accordion.Toggle as={Button} variant="link" eventKey="0">
                      Additional nutrients
                    </Accordion.Toggle>
                  </Card.Header>
                  <Accordion.Collapse eventKey="0">
                    <Card.Body style={{padding: "0"}}>
                    <table className={detailStyles.table2} >
                      <tbody className={detailStyles.tbody}>
                        {
                          // Loops through additionalNutrients array and displays each nutirent
                          additionalNutrients.map(nut => {
                            return (
                              nut.group.localeCompare("additional") == 0
                                ?
                                <tr key={nut.id}
                                className = {detailStyles.nutrient}>
                                  <td>
                                    <div>
                                      <strong className = {detailStyles.name}>{nut.name}</strong>
                                      <strong className = {detailStyles.amount}>{nut.amount}{nut.unitName}</strong>
                                    </div>
                                  </td>
                                  <td className = {detailStyles.daily}>
                                    {
                                      userDailyValue.map(dv => {
                                        if (dv.id.localeCompare(nut.id) === 0) {
                                          return Math.ceil(100 * nut.amount / dv.value) + "%"
                                        }
                                      })
                                    }
                                  </td>
                              </tr>
                                :
                              null
                            )
                          })
                        }
                        <tr>
                          <td className = {detailStyles.dv}>
                            *The % Daily Value (DV) tells you how much a nutrient in a food serving contributes to a daily diet. It is calculated using your required energy intake.<br/>If you can't see % Daily Value, visit <Link href="/questionnaire?firsttime=true"><a>here</a></Link> to get your daily value first.
                          </td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                    </Card.Body>
                  </Accordion.Collapse>
                </Card>
                </Accordion>
              </>
            )
          }
        </div>
      </div>
    </div>
  )
}

// contains the application's state - the current user object
const mapStateToProps = state => {
  return {
    currentUser: state.currentUser
  }
}

export default connect(mapStateToProps)(ItemDetailsPage)