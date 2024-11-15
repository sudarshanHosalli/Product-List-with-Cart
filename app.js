import data from "./data.json" with { type: "json" };
const card = document.querySelector(".card-list")
const cardContainer = document.querySelector(".cart-item-container")

function formatPrice(price) {
   return parseFloat(price).toFixed(2);
 }

 function totalCal(price, quantity) {
  const result = Number(price) * Number(quantity);
  return result;
}

function toSlug(text) {
  return text
    .normalize("NFD")                
    .replace(/[\u0300-\u036f]/g, "")     
    .replace(/[^a-zA-Z0-9 ]/g, "")     
    .trim()                             
    .replace(/\s+/g, "-")               
    .toLowerCase();                      
}

function dessertsList () {
  cardContainer.innerHTML = "";
  let image;

  data.map((e, idx) => {
    const getImageSrc = () => {
      if (window.matchMedia("(min-width: 1024px)").matches) {
        return image = e.image.desktop;
      } else if (window.matchMedia("(min-width: 768px)").matches) {
        return image = e.image.tablet;
      } else {
        return image = e.image.mobile;
      }
    }
  
    getImageSrc()
    cardContainer.innerHTML += `
          <article class="cart-item">
         <figure class="img-container">
           <img
             class="card-image"
             src="${image}"
             alt=${e.name}
           />
 
           <button class="add-to-cart-btn"  data-index="${idx}">
             <img
               src="./assets/images/icon-add-to-cart.svg"
               alt="Add to Cart"
               class="cart-icon"
               aria-hidden="true"
               
             />
             Add to Cart
           </button>
 
 
         </figure>
         <div class="item-info">
           <span class="category">${e.category}</span>
           <h2 class="name">${e.name}</h2>
           <p class="price">$${formatPrice(e.price)}</p>
 
         </div>
       </article>
    `
 })
}

dessertsList ()

const cartItems = document.querySelectorAll(".cart-item")
const cartBtns = document.querySelectorAll(".add-to-cart-btn");
const itemName =  document.querySelectorAll(".name")
const itemPrice =  document.querySelectorAll(".price")
const itemcategory = document.querySelectorAll(".category")

let cartState = JSON.parse(localStorage.getItem("cartState")) || [];

function updateLocalStorage(idx, isActive, quantity, name, price, total, category) {
  const existingItemIndex = cartState.findIndex(item => item.idx === idx);

  if (existingItemIndex !== -1) {
    cartState[existingItemIndex] = { idx, isActive, quantity, name, price, total, category };
  } else {
    cartState.push({ idx, isActive, quantity, name, price,total, category });
  }
  cartState =  cartState.filter(item => item.isActive)
  localStorage.setItem("cartState", JSON.stringify(cartState));
}

function attachAddToCartEventListeners() {
  const cartBtns = document.querySelectorAll(".add-to-cart-btn");
  cartBtns.forEach((cartBtn, idx) => {
    const itemData = data[idx];
    cartBtn.addEventListener("click", () => {
      const total = totalCal(itemData.price, 1);
      cartBtn.style.display = "none";
      updateLocalStorage(idx, true, 1, itemData.name, itemData.price, total, itemData.category);
      renderQuantityBtn(idx, cartBtn, 1);
      yourCart();
      orderTotal();
      toggleMsgTotalConfirmBtn();
    });
  });
}

function renderQuantityBtn (idx, cartBtn, quantity) {
  const imgContainer = document.querySelectorAll (".img-container")
  let itemQuantity =  quantity;
  const  name = itemName[idx].textContent
const  price = parseFloat(itemPrice[idx].textContent.slice(1));
const  category = itemcategory[idx].textContent

  imgContainer[idx].style.outline = "3px solid hsl(14, 86%, 42%)"
  imgContainer[idx].style.borderRadius = "10px"

  const quantityDiv = document.createElement("button");
  quantityDiv.className = "quantity-btn";
  quantityDiv.setAttribute('data-index', idx);
  quantityDiv.innerHTML = `
    <div class="icon minus decrement-icon"></div>
    <span class="item-quantity">${itemQuantity}</span>
    <div  class="icon plus increment-icon"></div>
  `;

  imgContainer[idx].appendChild(quantityDiv);

  const quantityBtn = imgContainer[idx].querySelector(".quantity-btn");
  const decrementBtn = imgContainer[idx].querySelector(".decrement-icon");
  const incrementBtn = imgContainer[idx].querySelector(".increment-icon");
  const quantityDisplay = imgContainer[idx].querySelector(".item-quantity");

  decrementBtn.addEventListener("click", () => {
    if(itemQuantity === 1 ){
      cartBtn.style.display = "flex";
      quantityBtn.style.display = "none"
      quantityBtn?.remove(); 
      imgContainer[idx].style.outline = "none"
      const total = totalCal(price, itemQuantity);
      updateLocalStorage(idx, false, 0, name, price, total,  category );
      yourCart()
      orderTotal ()
      toggleMsgTotalConfirmBtn()
    }else{
     itemQuantity--
     quantityDisplay.textContent = itemQuantity;
     const total = totalCal(price, itemQuantity);
     updateLocalStorage(idx, true, itemQuantity, name, price, total,  category );
     yourCart()
     orderTotal ()
    }
  })

  incrementBtn.addEventListener("click", () => {
      itemQuantity++;
      quantityDisplay.textContent = itemQuantity;
      const total = totalCal(price, itemQuantity);
      updateLocalStorage(idx, true, itemQuantity, name, price,  total,  category );
      yourCart()
      orderTotal ()
  })
}

function yourCart() {
const cartItems = document.querySelector(".cart-items-container")
const cartQuantity = document.querySelector(".cart-quantity")
const imgTextContainer = document.querySelector(".img-text")


cartItems.innerHTML = "";

const totalQuantity = cartState.reduce((acc, item) => acc + item.quantity, 0)
if (cartQuantity !== 0) {
  cartQuantity.textContent = totalQuantity ;
  imgTextContainer.style.display = totalQuantity !== 0 ? "none" : "flex"
}

cartState.map((e) => {
cartItems.innerHTML += `
<div class="cart-items-list">
  <div class="cart-items-info-container">
       <h4 class="your-cart-heading">${e.name}</h4>

       <div class="quantity-price-container">
               <span class="quantity">${e.quantity}x</span>
          <div class="price-total-container">
          <span class="price">@${formatPrice(e.price)}</span>
          <span class="total">$${formatPrice(e.total)}</span>
          </div>
        </div>
      </div>

   <div data-index="${e.idx}" class="remove" ></div>
</div>
`
});

attachRemoveItemEventListeners()
}

function orderTotal () {
  const orderTotal = document.querySelector(".order-total")
  const orderconfirmedtotal = document.querySelector(".order-confirmed-total-para")
  const total = cartState.reduce((acc, item) => acc + item.total, 0)

  orderTotal.textContent = `$${formatPrice(total)}`
  orderconfirmedtotal ? orderconfirmedtotal.textContent = `$${formatPrice(total)}` : 0
}

function LocalcartState() {
  cartState.forEach((e) => {
    const  cartBtn =  cartBtns[e.idx]
   renderQuantityBtn (e.idx, cartBtn, e.quantity)
   yourCart(); 
 })
}

function attachRemoveItemEventListeners() { 
  const removeBtn = document.querySelectorAll(".remove")
  removeBtn.forEach((btn, idx) => {
    btn.addEventListener("click", () => {
      const target = event.target;
      const btnIdx = target.getAttribute('data-index');
      if (target.classList.contains('remove')) {
        removeItemsFromCart(btnIdx);
        removeQuantityBtn (btnIdx)
      }
    })
  })
}

function removeItemsFromCart(idx){
  cartState = cartState.filter(item => item.idx != idx)
  const cartBtn = document.querySelector(`.add-to-cart-btn[data-index="${idx}"]`);
  // const  cartBtn =  cartBtns[idx]
  if (cartBtn) {
    cartBtn.style.display = "flex";
  }
  updateLocalStorage(idx, false, 0, undefined, null, null, undefined );
  yourCart()
  toggleMsgTotalConfirmBtn()
}

function removeQuantityBtn (idx) {
  const quantityBtn = document.querySelectorAll(".quantity-btn")
  const imgContainer = document.querySelectorAll (".img-container")
  quantityBtn.forEach(qBtn => {
    const qBtnIndex = qBtn.getAttribute("data-index");
    if (parseInt(qBtnIndex) === parseInt(idx)) {
      qBtn.remove();
       imgContainer[qBtnIndex].style.outline = "none"
    }
  })
  orderTotal ()
  toggleMsgTotalConfirmBtn()
}

function toggleMsgTotalConfirmBtn(){
const totalMsgButtonContainer = document.querySelector(".total-msg-button-container")

const cartIsEmpty = cartState.length === 0;

if(cartIsEmpty){
  totalMsgButtonContainer.classList.add("total-msg-button-container-hide")
}else{
  totalMsgButtonContainer.classList.remove("total-msg-button-container-hide")
}
}

const confirmBtn = document.querySelector(".confirm-order-btn")

function renderOrderConfirmedModal () {
  const cartItems = document.querySelector(".cart-items-container")
  const cartQuantity = document.querySelector(".cart-quantity")
  const imgTextContainer = document.querySelector(".img-text")
  const totalMsgButtonContainer = document.querySelector(".total-msg-button-container")
  const quantityBtn = document.querySelectorAll(".quantity-btn")

  const aside = document.createElement("aside");
  aside.className = "order-confirmed-modal";
  aside.innerHTML = `
 <div class="order-confirmed-modal-container">
   <header class="order-confirm-header">
          <img src="./assets/images/icon-order-confirmed.svg" alt="Order confirmed icon" />
          <h4 class="orderConfirmTitle">Order Confirmed</h4>
          <p class="orderConfirmDescription">We hope you enjoy your food!</p>
        </header>
      
        <section class="order-confirmed-list" aria-live="polite">
          <h5 class="visually-hidden">Order Items</h5>
          <article class="order-confirmed-item">

          </article>
          <div class="order-confirmed-total">
          <span>Order Total</span>
          <p class="order-confirmed-total-para">0</p>
          </div>
          </section>

  <div class="start-new-order-btn-container">
 <button class="Start-New-Order-btn">Start New Order</button>
 </div>
 </div>
  `;
  card.appendChild(aside);

  const orderConfirmedItem = document.querySelector(".order-confirmed-item")

  cartState.map((item) => {
    orderConfirmedItem.innerHTML += `
                <div class="order-confirmed-item-img-text-container">

              <div class="order-confirmed-item-img-text">
                <img src="./assets/images/image-${toSlug(item.category)}-thumbnail.jpg" alt="Pistachio Baklava thumbnail" />

                <div class="order-confirmed-item-name-quantity-price">
                  <p>${item.name}</p>
                  <div class="order-confirmed-item-quantity-price">
                    <span class="order-confirmed-item-quantity">${item.quantity}x</span>
                    <span class="order-confirmed-item-price">@ $${formatPrice(item.price)}</span>
                  </div>
                </div>
              </div>

              <p class="order-confirmed-total">$${formatPrice(item.total)}</p>
            </div>
    `
  })


  if(cartState.length > 1){
    orderConfirmedItem.style.height = "210px"
  }

  const StartNewOrderBtn = document.querySelector(".Start-New-Order-btn")

  StartNewOrderBtn.addEventListener("click", () => {
   let cartState = []; 
   localStorage.setItem("cartState", JSON.stringify(cartState));
   aside.remove();
   document.body.style.overflow = "auto";
   window.scroll({
    top: 0,
    behavior: 'smooth'
  })
  cartItems.innerHTML = "";
  const totalQuantity = cartState.reduce((acc, item) => acc + item.quantity, 0)
    cartQuantity.textContent = totalQuantity;
    imgTextContainer.style.display =  "flex"
    totalMsgButtonContainer.classList.add("total-msg-button-container-hide")

  quantityBtn.forEach(btn => {
  const index = btn.dataset.index;
    removeQuantityBtn (index)
    removeItemsFromCart(index)
});
  })
  orderTotal () 
}

confirmBtn.addEventListener("click", () => {
  document.body.style.overflow = "hidden";
  renderOrderConfirmedModal ()
})

window.addEventListener("resize", () => {
  dessertsList();
  attachAddToCartEventListeners();
  LocalcartState();
});


dessertsList();
attachAddToCartEventListeners();
LocalcartState();
yourCart();
orderTotal();
toggleMsgTotalConfirmBtn();
