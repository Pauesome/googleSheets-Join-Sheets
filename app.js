import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
// import 'swiper/css/navigation';
import 'swiper/css/pagination';

// import 'liquid-ajax-cart';
// import { configureCart } from 'liquid-ajax-cart';

import '../css/tailwind.css'
import '../css/app.css'

/* Mini cart global configs */
// configureCart('addToCartCssClass', 'js-my-cart-open');

// configureCart('messageBuilder', messages => {
//   let result = '<ul>';
//   messages.forEach( element => {
//     result += `<li class="my-message my-message--${ element.type }">${ element.text }</li>`;
//   })
//   result += '</ul>'
//   return result;
// })

  //--------- SLIDER IN SINGLE COLLECTIONS
  const closedSlider = document.querySelector('#closed-slider');
  const openedSlider = document.querySelector('#open-slider');
  const closeButton = document.querySelector('#close');

  if(!!closedSlider && !!openedSlider){
    let initedSwiper = false;
  
    const swiper = new Swiper(openedSlider.querySelector('.swiper'), {
      modules: [Navigation, Pagination],
      pagination: {
        el: '.swiper-pagination',
        type: 'fraction'
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      init: false,
      on: {
        init: () => {
          initedSwiper = true;
        }
      }
    });
    
    if(!!closeButton){
      closeButton.addEventListener('click', () => {
        openedSlider.classList.toggle('hidden')
      });
    }
    closedSlider.querySelectorAll('img').forEach(img => {
      img.addEventListener('click', e => {
        if(!initedSwiper) swiper.init();
  
        const index = img.getAttribute('id');
        swiper.slideTo(index - 1)
        openedSlider.classList.toggle('hidden');
      })
    })
  }
  // ---------- END - SLIDER IN SINGLE COLLECTIONS

  //----- ORDER BUTTON COLLECTIONS
  const orderButton = document.querySelector('#order-collections');
  const collections = document.querySelector('.featured-collection');
  let newest = true;

  if(!!orderButton){
    orderButton.addEventListener('click', () => {
      newest = !newest;
      console.log({newest})
      const collecs = Array.from(collections.children);
      console.log({collecs})
      collecs.sort(function(a, b) {
        const yearA = parseInt(a.dataset.year);
        const yearB = parseInt(b.dataset.year);
        return newest ? yearB - yearA : yearA - yearB;
      });
    
      // Vaciar la lista original
      while (collections.firstChild) {
        collections.removeChild(collections.firstChild);
      }
    
      // Agregar los elementos ordenados a la lista
      collecs.forEach((el) => {
        collections.appendChild(el);
      });
    
      // Update text button
      orderButton.innerHTML = newest 
      ? 'Sort by: <span class="italic capitalize">Oldest</span>' 
      : 'Sort by: <span class="italic capitalize">Newest</span>';
    })
  }
  // ----- END ORDER BUTTON COLLECTIONS


  //-------- FULLSCREEN LINK AND MEDIA (COMPONENT)
  const mediaSliders = document.querySelectorAll('.swiper-fullscreen-media');

  mediaSliders.forEach(slider => {
    const mediaSwiper = new Swiper(slider, {
      modules: [Navigation, Pagination],
      containerModifierClass: "swiper-fullscreen-media",
      pagination: {
        el: '.swiper-pagination',
        type: 'bullets'
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      loop: true,
      on: {
        init: (e) => {
          // console.log({e}, e.slides[e.activeIndex])
          const active = slider.querySelector('.centered-box .active-slide');
          if(!!e.slides[e.activeIndex].dataset.name) active.querySelector('p').innerText = e.slides[e.activeIndex].dataset.name;
          if(!!e.slides[e.activeIndex].dataset.price) active.querySelector('span').innerText = e.slides[e.activeIndex].dataset.price;
        },
        slideChange: (e) => {
          // console.log({e}, e.slides[e.activeIndex])
          const active = slider.querySelector('.centered-box .active-slide');
          if(!!e.slides[e.activeIndex].dataset.name) active.querySelector('p').innerText = e.slides[e.activeIndex].dataset.name;
          if(!!e.slides[e.activeIndex].dataset.price) active.querySelector('span').innerText = e.slides[e.activeIndex].dataset.price;
        }
      }
    })
  })
  //-------- END FULLSCREEN LINK AND MEDIA (COMPONENT)


  //-------- PLAYABLE VIDEOS
  document.querySelectorAll('.playable-video').forEach(vid => {
    vid.addEventListener('click', () => {
      if(vid.paused) vid.play()
      else vid.pause();
    })
  })
  //--------END PLAYABLE VIDEOS




console.log("Write your theme's script in src/js/app.js");  

